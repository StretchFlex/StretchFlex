public class User
{
    public int UserId { get; set; }
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Role { get; set; } = "";
    public DateTime? LastLogin { get; set; }
}

public record LoginRequest(string Username, string Password);

public record LoginResponse(
    string AccessToken,
    string RefreshToken,
    string Role,
    int ExpiresInSeconds
);

public record TokenValidationResult(bool Valid, string? Username, string? Role);