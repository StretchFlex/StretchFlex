using System.Data;
using Dapper;
using Npgsql;
using Microsoft.Extensions.Configuration;

public class UserRepository(IConfiguration config)
{
    private IDbConnection CreateConnection() =>
        new NpgsqlConnection(config.GetConnectionString("Postgres"));

    public async Task<User?> GetByUsernameAsync(string username)
    {
        using var conn = CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<User>(
            "SELECT * FROM stretchflex_db.\"Users\" WHERE \"Username\" = @Username AND \"IsActive\" = TRUE",
            new { Username = username });
    }

public async Task UpdateLastLoginAsync(int userId)
{
    using var conn = CreateConnection();
    await conn.ExecuteAsync(
        "UPDATE stretchflex_db.\"Users\" SET \"LastLogin\" = NOW() WHERE \"UserId\" = @UserId",
        new { UserId = userId }
    );
}

}