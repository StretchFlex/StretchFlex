using Serilog;
using Serilog.Sinks.Elasticsearch;
using Microsoft.AspNetCore.Http.Features;
using Dapper;
using Npgsql;

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

var dbUser = File.ReadAllText("/run/secrets/db_user").Trim();
var dbPassword = File.ReadAllText("/run/secrets/db_password").Trim();
var connectionStringTemplate = builder.Configuration.GetConnectionString("Postgres");
var connectionString = string.Format(connectionStringTemplate, dbUser, dbPassword);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapPost("/api/data/create", async (HttpRequest request) =>
{
    try
    {
        var dto = await request.ReadFromJsonAsync<CreatePatientDto>();
        if (dto == null)
        {
            Log.Warning("Invalid JSON.");
            return Results.BadRequest("Invalid JSON.");
        }

        using var connection = new Npgsql.NpgsqlConnection(connectionString);

        var patientSQL = @"
            INSERT INTO patients (first_name, last_name)
            VALUES (@firstName, @lastName)
            RETURNING patient_id
            ";
        
        var patientId = await connection.ExecuteScalarAsync<int>(patientSQL, new
        {
            dto.firstName,
            dto.lastName
        });

        var histroySql = @"
            INSERT INTO medical_history (patient_id, date_of_birth, sex, height_m, weight_kg, BMI)
            VALUES
            (@patientId, @DateOfBirth, @Sex, @Height, @Mass, @BMI)
            ";

        await connection.ExecuteAsync(histroySql, new
        {
            patientId,
            dto.DateOfBirth,
            dto.Sex,
            dto.Height,
            dto.Mass,
            dto.BMI
        });

        Log.Information("Patient created with ID {PatientId}", patientId);
        return Results.Ok(new { PatientId = patientId });
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error processing request.");
        return Results.StatusCode(500);
    }
});

app.MapPost("/api/patient/medial-history", async (HttpRequest request, IConfiguration config) =>
{
    try
    {
        var dto = await request.ReadFromJsonAsync<CreateMedicalHistoryDto>();
        if (dto == null)
        {
            Log.Warning("Invalid JSON.");
            return Results.BadRequest("Invalid JSON.");
        }

        using var connection = new Npgsql.NpgsqlConnection(connectionString);

        var histroySql = @"
            UPDATE medical_history SET
                history_of_pf = @HistoryOfPF,
                history_of_pf_right_foot = @RightFoot,
                history_of_pf_left_foot = @LeftFoot,
                history_of_pf_additional_comments = @AdditionalComments,
                right_foot_conditions = @RightFootCondtions,
                right_foot_conditions_additional_comments = @RightFootCondtionsAddionalComments,
                left_foot_conditions = @LeftFootCondtions,
                left_foot_conditions_additional_comments = @LeftFootCondtionsAddionalComments,
                surgery_right = @SurgeryRight,
                surgery_right_comment = @SurgeryRightComment,
                surgery_left = @SurgeryLeft,
                surgery_left_comment = @SurgeryLeftComment,
                treatments = @Treatments,
                treatments_comments = @TreatmentsComments,
                other_relevant_comments = @OtherRelevantComments
            WHERE patient_id = @PatientId";
        
        await connection.ExecuteAsync(histroySql, new
        {
            dto.PatientId,
            HistoryOfPF = dto.HistoryOfPF.ResponseOfHistory,
            RightFoot = dto.HistoryOfPF.RightFoot,
            LeftFoot = dto.HistoryOfPF.LeftFoot,
            AdditionalComments = dto.HistoryOfPF.AdditionalComments,
            RightFootCondtions = dto.RightFootCondtions.Condtions,
            RightFootCondtionsAddionalComments = dto.RightFootCondtions.AddionalComments,
            LeftFootCondtions = dto.LeftFootCondtions.Condtions,
            LeftFootCondtionsAddionalComments = dto.LeftFootCondtions.AddionalComments,
            SurgeryRight = dto.SurgeryRight,
            SurgeryRightComment = dto.SurgeryRightComment,
            SurgeryLeft = dto.SurgeryLeft,
            SurgeryLeftComment = dto.SurgeryLeftComment,
            Treatments = dto.Treatments,
            TreatmentsComments = dto.TreatmentsComments,
            OtherRelevantComments = dto.OtherRelevantComments
        });

        Log.Information("Medical history updated for patient ID {PatientId}", dto.PatientId);
        return Results.Ok("Medical history updated.");
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error processing request.");
        return Results.StatusCode(500);
    }
});

app.Run();