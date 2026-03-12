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

app.MapPost("/api/patient/create", async (HttpRequest request) =>
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
            INSERT INTO stretchflex_db.patients (first_name, last_name, email)
            VALUES (@firstName, @lastName, @email)
            RETURNING patient_id
            ";
        
        var patientId = await connection.ExecuteScalarAsync<int>(patientSQL, new
        {
            dto.firstName,
            dto.lastName,
            dto.email
        });

        var histroySql = @"
            INSERT INTO stretchflex_db.medical_history (patient_id, date_of_birth, sex, height_m, weight_kg, bmi)
            VALUES
            (@patientId, @dateOfBirth, @sex, @height, @mass, @bmi)
            ";

        await connection.ExecuteAsync(histroySql, new
        {
            patientId,
            dto.dateOfBirth,
            dto.sex,
            dto.height,
            dto.mass,
            dto.bmi
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

app.MapPost("/api/patient/medical-history", async (HttpRequest request, IConfiguration config) =>
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
            UPDATE stretchflex_db.medical_history SET
                history_of_pf = @HistoryOfPF,
                history_of_pf_right_foot = @RightFoot,
                history_of_pf_left_foot = @LeftFoot,
                history_of_pf_additional_notes = @AdditionalComments,
                right_foot_condition = @RightFootConditions,
                right_foot_condition_additional_notes = @RightFootConditionsAdditionalComments,
                left_foot_condition = @LeftFootConditions,
                left_foot_condition_additional_notes = @LeftFootConditionsAdditionalComments,
                surgery_right_foot = @SurgeryRight,
                surgery_right_foot_additional_notes = @SurgeryRightComment,
                surgery_left_foot = @SurgeryLeft,
                surgery_left_foot_additional_notes = @SurgeryLeftComment,
                treatments = @Treatments,
                treatments_comments = @TreatmentsComments,
                other_relevant_comments = @OtherRelevantComments
            WHERE patient_id = @PatientId";

        await connection.ExecuteAsync(histroySql, new
        {
            dto.PatientId,
            HistoryOfPF = dto.HistoryOfPF?.ResponseOfHistory,
            RightFoot = dto.HistoryOfPF?.RightFoot,
            LeftFoot = dto.HistoryOfPF?.LeftFoot,
            AdditionalComments = dto.HistoryOfPF?.AdditionalComments,
            RightFootConditions = dto.RightFootConditions?.Conditions,
            RightFootConditionsAdditionalComments = dto.RightFootConditions?.AdditionalComments,
            LeftFootConditions = dto.LeftFootConditions?.Conditions,
            LeftFootConditionsAdditionalComments = dto.LeftFootConditions?.AdditionalComments,
            SurgeryRight = dto.SurgeryRight?.SurgeryPerformed,
            SurgeryRightComment = dto.SurgeryRight?.AdditionalComments,
            SurgeryLeft = dto.SurgeryLeft?.SurgeryPerformed,
            SurgeryLeftComment = dto.SurgeryLeft?.AdditionalComments,
            Treatments = dto.Treatments?.Treatments,
            TreatmentsComments = dto.Treatments?.TreatmentsComments,
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

app.MapGet("/api/patient/find/id/{firstName}-{lastName}", async (string firstName, string lastName) =>
{
    try
    {
        using var connection = new Npgsql.NpgsqlConnection(connectionString);
        var sql = @"
            SELECT p.patient_id AS PatientId, 
                   p.first_name AS FirstName, 
                   p.last_name AS LastName, 
                   mh.date_of_birth AS DateOfBirth,
                   p.email AS Email
            FROM stretchflex_db.patients p
            JOIN stretchflex_db.medical_history mh ON p.patient_id = mh.patient_id
            WHERE LOWER(p.first_name) = LOWER(@firstName) AND LOWER(p.last_name) = LOWER(@lastName)";
        
        var patients = await connection.QueryAsync<PatientResponse>(sql, new { firstName, lastName });
        
        if (!patients.Any())
        {
            Log.Warning("Patient not found.");
            return Results.NotFound("Patient not found.");
        }

        return Results.Ok(patients);
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error processing request.");
        return Results.StatusCode(500);
    }
});

app.Run();