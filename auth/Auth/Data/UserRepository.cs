using System.Data;
using Dapper;

public class UserRepository(DbConnectionFactory dbFactory)
{
    private IDbConnection CreateConnection() => dbFactory.Create();

    public async Task<User?> GetByUsernameAsync(string username)
    {
        using var conn = CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<User>(@"
            SELECT 
                user_id AS UserId,
                username,
                password_hash AS PasswordHash,
                role,
                last_login AS LastLogin
            FROM stretchflex_db.users
            WHERE username = @Username
        ", new { Username = username });
    }

    public async Task UpdateLastLoginAsync(int userId)
    {
        using var conn = CreateConnection();
    
        await conn.ExecuteAsync(
            @"UPDATE stretchflex_db.users
              SET last_login = NOW()
              WHERE user_id = @UserId",
            new { UserId = userId }
        );
    }
}