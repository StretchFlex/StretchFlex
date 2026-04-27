using Serilog;
using Serilog.Sinks.Elasticsearch;
using Microsoft.AspNetCore.Http.Features;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHttpContextAccessor();

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 104857600; // 100 MB
});

Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.Elasticsearch(new ElasticsearchSinkOptions(new Uri("http://elasticsearch:9200"))
    {
        AutoRegisterTemplate = true,
        IndexFormat = "stretchflex-logs-{0:yyyy.MM.dd}"
    })
    .CreateLogger();

builder.Host.UseSerilog();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapPost("/api/data/upload-csv", async (HttpRequest request) =>
{
    try
    {
        Log.Information("Upload request received.");

        if (!request.HasFormContentType)
        {
            Log.Warning("Not multipart.");
            return Results.BadRequest("Must be multipart/form-data");
        }

        var form = await request.ReadFormAsync();
        var file = form.Files["file"];

        if (file == null || file.Length == 0)
        {
            Log.Warning("File missing.");
            return Results.BadRequest("No file uploaded.");
        }

        using var reader = new StreamReader(file.OpenReadStream());

        var csv = await reader.ReadToEndAsync();
        var lines = csv.Split('\n', StringSplitOptions.RemoveEmptyEntries);

        if (lines.Length < 2)
            return Results.BadRequest("Invalid CSV");

        var cols = lines[0].Split(',');
        var vals = lines[1].Split(',');

        var idx = Array.IndexOf(cols, "PatientID");

        if (idx < 0)
            return Results.BadRequest("Missing PatientID");

        var patientId = vals[idx].Trim();

        Log.Information("Upload OK for {PatientId}", patientId);

        var dir = Path.Combine("/Data", "PatientData", patientId);

        Directory.CreateDirectory(dir);

        // Get date in YYYY_MM_DD format
        var dateStr = DateTime.Now.ToString("yyyy_MM_dd");
        
        // Find the highest existing session number for today
        var existingFiles = Directory.GetFiles(dir, $"{dateStr}_Session*.csv");
        int maxSession = 0;
        foreach (var existingFile in existingFiles)
        {
            var fileName = Path.GetFileNameWithoutExtension(existingFile);
            var match = System.Text.RegularExpressions.Regex.Match(fileName, @"Session(\d+)");
            if (match.Success && int.TryParse(match.Groups[1].Value, out int sessionNum))
            {
                maxSession = Math.Max(maxSession, sessionNum);
            }
        }
        
        // Increment to next session
        int nextSession = maxSession + 1;
        var sessionStr = nextSession.ToString("D4"); // format as 4 digits with leading zeros

        // Save original
        var originalFileName = $"{dateStr}_Session{sessionStr}.csv";
        var originalPath = Path.Combine(dir, originalFileName);
        using (var fs = File.Create(originalPath))
        {
            file.OpenReadStream().Position = 0; // reset stream
            await file.CopyToAsync(fs);
        }

        // Parse all rows into numeric matrix (columns C=index 2, E=index 4)
        var dataRows = new List<double[]>();
        var headerLine = lines[0];

        for (int i = 1; i < lines.Length; i++)
        {
            var parts = lines[i].Split(',');
            if (parts.Length < 5) continue;

            double xVal, yVal;
            // Column C = index 2 (time), Column E = index 4 (distance)
            bool xOk = double.TryParse(parts[2].Trim(), System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out xVal);
            bool yOk = double.TryParse(parts[4].Trim(), System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out yVal);

            if (xOk && yOk && !double.IsNaN(xVal) && !double.IsNaN(yVal))
                dataRows.Add(new double[] { i, xVal, yVal }); // store original line index, x, y
        }

        if (dataRows.Count == 0)
            return Results.Ok("Uploaded (no filterable data found)");

        var y = dataRows.Select(r => r[2]).ToArray();

        // --- Step 1: Spike removal via windowed MAD ---
        int spikeWindow = 5;
        double spikeThreshold = 6.0;
        int n = y.Length;
        var yClean = (double[])y.Clone();

        if (n > 1)
        {
            var medFiltered = new double[n];
            var madEstimate = new double[n];

            for (int i = 0; i < n; i++)
            {
                int lo = Math.Max(0, i - spikeWindow);
                int hi = Math.Min(n - 1, i + spikeWindow);
                var win = yClean[lo..(hi + 1)];
                var sortedWin = (double[])win.Clone();
                Array.Sort(sortedWin);
                medFiltered[i] = Median(sortedWin);
                var absDevs = win.Select(v => Math.Abs(v - medFiltered[i])).OrderBy(v => v).ToArray();
                madEstimate[i] = Median(absDevs);
            }

            var sigmaEst = madEstimate.Select(m => 1.4826 * m).ToArray();

            for (int i = 0; i < n; i++)
            {
                bool isSpike = sigmaEst[i] > 0 &&
                               Math.Abs(yClean[i] - medFiltered[i]) > spikeThreshold * sigmaEst[i];
                if (isSpike)
                    yClean[i] = medFiltered[i];
            }
        }

        // --- Step 2: Butterworth low-pass IIR filter (order 4, Wn=0.015) ---
        // Pre-computed coefficients for butter(4, 0.015, 'low') matching MATLAB output
        // These are fixed since fs=6, frac=0.015 are hardcoded constants.
        // Generated via: [b,a] = butter(4, 0.015)
        double[] b = { 2.90017034e-7, 1.16006813e-6, 1.74010220e-6, 1.16006813e-6, 2.90017034e-7 };
        double[] a = { 1.0, -3.87686487, 5.63811913, -3.64537711, 0.88412749 };

        var yFiltered = FiltFilt(b, a, yClean);

        // --- Write filtered CSV ---
        var filteredFileName = $"{dateStr}_Session{sessionStr}-filtered.csv";
        var filteredPath = Path.Combine(dir, filteredFileName);

        var filteredLines = new List<string> { headerLine };
        int filteredIdx = 0;
        for (int i = 1; i < lines.Length; i++)
        {
            var parts = lines[i].Split(',');
            if (parts.Length >= 5)
            {
                double xVal, yVal;
                bool xOk = double.TryParse(parts[2].Trim(), System.Globalization.NumberStyles.Any,
                    System.Globalization.CultureInfo.InvariantCulture, out xVal);
                bool yOk = double.TryParse(parts[4].Trim(), System.Globalization.NumberStyles.Any,
                    System.Globalization.CultureInfo.InvariantCulture, out yVal);

                if (xOk && yOk && !double.IsNaN(xVal) && !double.IsNaN(yVal) && filteredIdx < yFiltered.Length)
                {
                    parts[4] = yFiltered[filteredIdx++]
                        .ToString("G6", System.Globalization.CultureInfo.InvariantCulture);
                }
            }
            filteredLines.Add(string.Join(",", parts));
        }

        await File.WriteAllLinesAsync(filteredPath, filteredLines);
        Log.Information("Filtered CSV saved to {FilteredPath}", filteredPath);

        return Results.Ok("Uploaded and filtered");
    }
    catch (Exception ex)
    {
        Log.Fatal(ex, "UPLOAD FAILED");
        return Results.Problem(ex.Message);
    }
});

app.MapGet("/api/data/sessions", (string patientId) =>
{
    if (string.IsNullOrWhiteSpace(patientId))
        return Results.BadRequest("patientId is required");

    var dir = Path.Combine("/Data", "PatientData", patientId);
    if (!Directory.Exists(dir))
        return Results.Ok(Array.Empty<string>());

    var files = Directory.GetFiles(dir, "*-filtered.csv")
        .Select(Path.GetFileName)
        .OrderBy(name => name)
        .ToArray();

    return Results.Json(files);
});

app.MapGet("/api/data/session-file", async (string patientId, string fileName) =>
{
    if (string.IsNullOrWhiteSpace(patientId) || string.IsNullOrWhiteSpace(fileName))
        return Results.BadRequest("patientId and fileName are required");

    var dir = Path.Combine("/Data", "PatientData", patientId);
    if (!Directory.Exists(dir))
        return Results.NotFound("Patient directory not found");

    var safeName = Path.GetFileName(fileName);
    if (!safeName.EndsWith("-filtered.csv", StringComparison.OrdinalIgnoreCase))
        return Results.BadRequest("Only filtered session files can be requested");

    var filePath = Path.Combine(dir, safeName);
    if (!File.Exists(filePath))
        return Results.NotFound("File not found");

    var content = await File.ReadAllTextAsync(filePath);
    return Results.Text(content, "text/csv");
});

// --- Helper: median of a pre-sorted array ---
static double Median(double[] sorted)
{
    int n = sorted.Length;
    if (n == 0) return 0;
    return n % 2 == 1 ? sorted[n / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2.0;
}

// --- Helper: zero-phase forward/backward IIR filter (mimics MATLAB filtfilt) ---
static double[] FiltFilt(double[] b, double[] a, double[] x)
{
    int nfilt = Math.Max(a.Length, b.Length);
    int nfact = 3 * (nfilt - 1);

    if (x.Length <= nfact)
        throw new ArgumentException("Input data too short for filtfilt.");

    // --- 1. Mirror padding (MATLAB style) ---
    double[] front = new double[nfact];
    double[] back  = new double[nfact];

    for (int i = 0; i < nfact; i++)
    {
        front[i] = 2 * x[0] - x[nfact - i];
        back[i]  = 2 * x[^1] - x[x.Length - 2 - i];
    }

    double[] padded = front
        .Concat(x)
        .Concat(back)
        .ToArray();

    // --- 2. Compute initial conditions (MATLAB style) ---
    int len = padded.Length;
    int na = a.Length;
    int nb = b.Length;
    int n = Math.Max(na, nb);

    double[] zi = new double[n - 1];

    // Normalize coefficients
    double a0 = a[0];
    if (a0 != 1.0)
    {
        for (int i = 0; i < nb; i++) b[i] /= a0;
        for (int i = 0; i < na; i++) a[i] /= a0;
    }

    // Compute zi (initial state)
    for (int i = 1; i < n; i++)
    {
        double acc = 0;
        for (int j = 1; j < i; j++)
            acc += (a[j] * zi[i - j - 1]);

        zi[i - 1] = b[i] - acc;
    }

    // Scale zi by first input value
    for (int i = 0; i < zi.Length; i++)
        zi[i] *= padded[0];

    // --- 3. Forward filter ---
    double[] y = FilterWithState(b, a, padded, zi);

    // --- 4. Reverse ---
    Array.Reverse(y);

    // --- 5. Backward filter ---
    double[] y2 = FilterWithState(b, a, y, zi);

    // --- 6. Reverse back ---
    Array.Reverse(y2);

    // --- 7. Remove padding ---
    return y2[nfact..(nfact + x.Length)];
}

static double[] FilterWithState(double[] b, double[] a, double[] x, double[] zi)
{
    int n = x.Length;
    int nfilt = Math.Max(a.Length, b.Length);
    int nz = nfilt - 1;

    double[] z = (double[])zi.Clone();
    double[] y = new double[n];

    for (int i = 0; i < n; i++)
    {
        double acc = b[0] * x[i] + z[0];
        y[i] = acc;

        for (int j = 1; j < nz; j++)
            z[j - 1] = b[j] * x[i] - a[j] * acc + z[j];

        z[nz - 1] = b[nz] * x[i] - a[nz] * acc;
    }

    return y;
}


app.Run();