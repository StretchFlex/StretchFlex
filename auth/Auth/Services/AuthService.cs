public class AuthService(UserRepository repo, TokenService tokens)
{
public async Task<LoginResponse?> LoginAsync(LoginRequest request)
{
    try
    {
        var user = await repo.GetByUsernameAsync(request.Username);
        if (user is null)
            return null;

        if (string.IsNullOrWhiteSpace(user.PasswordHash))
            return null;

        bool validPassword;
        try
        {
            validPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        }
        catch
        {
            return null;
        }

        if (!validPassword)
            return null;

        // THIS IS WHERE THE ERROR IS NOW
        await repo.UpdateLastLoginAsync(user.UserId);

        var access = tokens.GenerateAccessToken(user);
        var refresh = tokens.GenerateRefreshToken();

        return new LoginResponse(
            AccessToken: access,
            RefreshToken: refresh,
            Role: user.Role,
            ExpiresInSeconds: 3600
        );
    }
    catch (Exception ex)
    {
        Console.WriteLine("LOGIN ERROR: " + ex);
        throw;
    }
}


}