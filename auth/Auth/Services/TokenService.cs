using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;

public class TokenService(IConfiguration config)
{
    private readonly byte[] _secretBytes = BuildSecretKey(File.ReadAllText("/run/secrets/jwt_secret").Trim());
    private readonly string _issuer = config["Jwt:Issuer"]!;
    private readonly string _audience = config["Jwt:Audience"]!;
    private readonly int _accessExpiry = int.Parse(config["Jwt:AccessTokenExpiryMinutes"]!);

    private static byte[] BuildSecretKey(string secret)
    {
        var secretBytes = Encoding.UTF8.GetBytes(secret);
        if (secretBytes.Length >= 32)
            return secretBytes;

        // HS256 requires at least a 256-bit key. If the secret is shorter, derive a fixed 256-bit key.
        return SHA256.HashData(secretBytes);
    }

    public string GenerateAccessToken(User user)
    {
        var key = new SymmetricSecurityKey(_secretBytes);
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("uid", user.UserId.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_accessExpiry),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

    public TokenValidationResult ValidateAccessToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        var key = new SymmetricSecurityKey(_secretBytes);
        try
        {
            var principal = handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateAudience = true,
                ValidAudience = _audience,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out _);

            var username = principal.FindFirstValue(JwtRegisteredClaimNames.Sub);
            var role = principal.FindFirstValue(ClaimTypes.Role);
            return new TokenValidationResult(true, username, role);
        }
        catch
        {
            return new TokenValidationResult(false, null, null);
        }
    }
}