public class AuthService(UserRepository repo, TokenService tokens)
{
    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var user = await repo.GetByUsernameAsync(request.Username);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        await repo.UpdateLastLoginAsync(user.UserId);

        return new LoginResponse(
            AccessToken: tokens.GenerateAccessToken(user),
            RefreshToken: tokens.GenerateRefreshToken(),
            Role: user.Role,
            ExpiresInSeconds: 3600
        );
    }
}