using Serilog;
using Serilog.Sinks.Elasticsearch;
using Microsoft.AspNetCore.Http.Features;
using Dapper;
using Npgsql;
using System.Security.Cryptography.X509Certificates;
using System.Runtime.CompilerServices;

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

Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;

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

        using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();

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

app.MapPost("/api/patient/medical-history/create", async (HttpRequest request, IConfiguration config) =>
{
    try
    {
        var dto = await request.ReadFromJsonAsync<CreateMedicalHistoryDto>();
        if (dto == null)
        {
            Log.Warning("Invalid JSON.");
            return Results.BadRequest("Invalid JSON.");
        }

        using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();

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
        await connection.OpenAsync();

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


app.MapGet("/api/patient/personal/{id}", async (int id) =>
{
    try
    {
        using var connection = new Npgsql.NpgsqlConnection(connectionString);
        await connection.OpenAsync();

        var sql = @"
            SELECT 
                p.first_name,
                p.last_name,
                p.email,
                CAST(mh.date_of_birth AS DATE)::text AS date_of_birth,
                mh.sex,
                mh.height_m,
                mh.weight_kg,
                mh.bmi
            FROM stretchflex_db.patients p
            INNER JOIN stretchflex_db.medical_history mh 
                ON p.patient_id = mh.patient_id
            WHERE p.patient_id = @id
        ";

        var patient = await connection.QuerySingleOrDefaultAsync<PatientPersonalInfoResponseDto>(sql, new { id });

        if (patient == null)
        {
            Log.Warning("Patient with ID {PatientId} not found.", id);
            return Results.NotFound($"Patient with ID {id} not found.");
        }

        Log.Information("Patient personal info with ID {PatientId} retrieved.", id);
        return Results.Ok(patient);
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error retrieving patient.");
        return Results.StatusCode(500);
    }
});

app.MapGet("/api/patient/medical-history/{id}", async (int id) =>
{
    try
    {
        using var connection = new Npgsql.NpgsqlConnection(connectionString);
        await connection.OpenAsync();

        var sql = @"
            SELECT
                mh.history_of_pf,
                mh.history_of_pf_right_foot,
                mh.history_of_pf_left_foot,
                mh.history_of_pf_additional_notes,
                mh.right_foot_condition,
                mh.right_foot_condition_additional_notes,
                mh.left_foot_condition,
                mh.left_foot_condition_additional_notes,
                mh.surgery_right_foot,
                mh.surgery_right_foot_additional_notes,
                mh.surgery_left_foot,
                mh.surgery_left_foot_additional_notes,
                mh.treatments,
                mh.treatments_comments,
                mh.other_relevant_comments
            FROM stretchflex_db.medical_history mh
            WHERE mh.patient_id = @id";

        var row = await connection.QuerySingleOrDefaultAsync<MedicalHistoryRow>(sql, new { id });

        if (row == null)
        {
            Log.Warning("Patient with ID {PatientId} not found.", id);
            return Results.NotFound($"Patient with ID {id} not found.");
        }

        var response = new PatientMedicalInfoResponseDto
        {
            PatientId = id,
            HistoryOfPF = new HistoryOfPF
            {
                ResponseOfHistory = row.history_of_pf,
                RightFoot = row.history_of_pf_right_foot,
                LeftFoot = row.history_of_pf_left_foot,
                AdditionalComments = row.history_of_pf_additional_notes
            },
            RightFootConditions = new FootConditions
            {
                Conditions = row.right_foot_condition,
                AdditionalComments = row.right_foot_condition_additional_notes
            },
            LeftFootConditions = new FootConditions
            {
                Conditions = row.left_foot_condition,
                AdditionalComments = row.left_foot_condition_additional_notes
            },
            SurgeryRight = new Surgery
            {
                SurgeryPerformed = row.surgery_right_foot,
                AdditionalComments = row.surgery_right_foot_additional_notes
            },
            SurgeryLeft = new Surgery
            {
                SurgeryPerformed = row.surgery_left_foot,
                AdditionalComments = row.surgery_left_foot_additional_notes
            },
            Treatments = new OtherTreatments
            {
                Treatments = row.treatments,
                TreatmentsComments = row.treatments_comments
            },
            OtherRelevantComments = row.other_relevant_comments
        };

        Log.Information("Patient medical info with ID {PatientId} retrieved.", id);
        return Results.Ok(response);
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error retrieving patient.");
        return Results.StatusCode(500);
    }
});

app.MapPut("/api/patient/personal-info/update/{id}", async (int id, PatientPersonalInfoUpdateDto updateDto) =>
{
    try
    {
        using var connection = new Npgsql.NpgsqlConnection(connectionString);
        await connection.OpenAsync();

        var sql = @"
                UPDATE stretchflex_db.patients
                SET
                    first_name = @FirstName,
                    last_name = @LastName,
                    email = @Email
                WHERE patient_id = @Id;
                UPDATE stretchflex_db.medical_history
                SET
                    date_of_birth = @DateOfBirth,
                    sex = @Sex,
                    height_m = @HeightM,
                    weight_kg = @WeightKg,
                    bmi = @Bmi
                WHERE patient_id = @Id;
                ";

        var affected = await connection.ExecuteAsync(sql, new
        {
            Id          = id,
            updateDto.FirstName,
            updateDto.LastName,
            updateDto.Email,
            updateDto.DateOfBirth,
            updateDto.Sex,
            updateDto.HeightM,
            updateDto.WeightKg,
            updateDto.Bmi
        });

        if (affected == 0)
        {
            Log.Warning("Patient with ID {PatientId} not found for personal info update.", id);
            return Results.NotFound($"Patient with ID {id} not found.");
        }

        Log.Information("Patient personal info with ID {PatientId} updated.", id);
        return Results.NoContent();
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error updating patient personal info.");
        return Results.StatusCode(500);
    }
});

app.MapPut("/api/patient/update/medical-history/{id}", async (int id, PatientMedicalInfoUpdateDto updateDto) =>
{
    try
    {
        using var connection = new Npgsql.NpgsqlConnection(connectionString);
        await connection.OpenAsync();

        var sql = @"
            UPDATE stretchflex_db.medical_history
            SET
                history_of_pf = @HistoryOfPf,
                history_of_pf_right_foot = @HistoryOfPfRightFoot,
                history_of_pf_left_foot = @HistoryOfPfLeftFoot,
                history_of_pf_additional_notes = @HistoryOfPfAdditionalNotes,
                right_foot_condition = @RightFootCondition,
                right_foot_condition_additional_notes = @RightFootConditionAdditionalNotes,
                left_foot_condition = @LeftFootCondition,
                left_foot_condition_additional_notes = @LeftFootConditionAdditionalNotes,
                surgery_right_foot = @SurgeryRightFoot,
                surgery_right_foot_additional_notes = @SurgeryRightFootAdditionalNotes,
                surgery_left_foot = @SurgeryLeftFoot,
                surgery_left_foot_additional_notes = @SurgeryLeftFootAdditionalNotes,
                treatments = @Treatments,
                treatments_comments = @TreatmentsComments,
                other_relevant_comments = @OtherRelevantComments
            WHERE patient_id = @Id
        ";

        var affected = await connection.ExecuteAsync(sql, new
        {
            Id = id,
            HistoryOfPf = updateDto.HistoryOfPF.ResponseOfHistory,
            HistoryOfPfRightFoot = updateDto.HistoryOfPF.RightFoot,
            HistoryOfPfLeftFoot = updateDto.HistoryOfPF.LeftFoot,
            HistoryOfPfAdditionalNotes = updateDto.HistoryOfPF.AdditionalComments,
            RightFootCondition = updateDto.RightFootConditions.Conditions,
            RightFootConditionAdditionalNotes = updateDto.RightFootConditions.AdditionalComments,
            LeftFootCondition = updateDto.LeftFootConditions.Conditions,
            LeftFootConditionAdditionalNotes = updateDto.LeftFootConditions.AdditionalComments,
            SurgeryRightFoot = updateDto.SurgeryRight.SurgeryPerformed,
            SurgeryRightFootAdditionalNotes = updateDto.SurgeryRight.AdditionalComments,
            SurgeryLeftFoot = updateDto.SurgeryLeft.SurgeryPerformed,
            SurgeryLeftFootAdditionalNotes = updateDto.SurgeryLeft.AdditionalComments,
            Treatments = updateDto.Treatments.Treatments,
            TreatmentsComments = updateDto.Treatments.TreatmentsComments,
            OtherRelevantComments = updateDto.OtherRelevantComments
        });

        if (affected == 0)
        {
            Log.Warning("Patient with ID {PatientId} not found for medical history update.", id);
            return Results.NotFound($"Patient with ID {id} not found.");
        }

        Log.Information("Patient medical history with ID {PatientId} updated.", id);
        return Results.NoContent();
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error updating patient medical history.");
        return Results.StatusCode(500);
    }
});

app.MapGet("/api/patient/list", async () =>
{
    try
    {
        using var connection = new Npgsql.NpgsqlConnection(connectionString);
        await connection.OpenAsync();

        var sql = @"
            SELECT patient_id
            FROM stretchflex_db.medical_history
            ORDER BY patient_id";

        var patientList = await connection.QueryAsync<int>(sql);

        if (!patientList.Any())
        {
            Log.Warning("No Patients");
            return Results.Ok("No patients found.");
        }

        Log.Information("Returning list of all patient IDs.");
        return Results.Ok(patientList);
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error retrieving patients.");
        return Results.StatusCode(500);
    }
});

app.Run();