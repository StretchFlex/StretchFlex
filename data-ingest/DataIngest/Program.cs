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

        var path = Path.Combine(
            dir,
            $"{DateTime.Now:yyyyMMdd_HHmmss}_{file.FileName}"
        );

        using var fs = File.Create(path);

        await file.CopyToAsync(fs);

        return Results.Ok("Uploaded");
    }
    catch (Exception ex)
    {
        Log.Fatal(ex, "UPLOAD FAILED");
        return Results.Problem(ex.Message);
    }
});

app.Run();