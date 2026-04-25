using System.Data;
using Npgsql;

public class DbConnectionFactory
{
    private readonly string _connectionString;

    public DbConnectionFactory()
    {
        var dbUser = File.ReadAllText("/run/secrets/db_user").Trim();
        var dbPassword = File.ReadAllText("/run/secrets/db_password").Trim();

        _connectionString =
            $"Host=postgres;Database=patient_database;Username={dbUser};Password={dbPassword}";
    }

    public IDbConnection Create() => new NpgsqlConnection(_connectionString);
}