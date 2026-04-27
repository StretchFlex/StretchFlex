using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("auth")]
public class AuthController(AuthService auth, TokenService tokens) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await auth.LoginAsync(request);
        if (result is null)
            return Unauthorized(new { message = "Invalid credentials" });

        Response.Cookies.Append("refreshToken", result.RefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        });

        return Ok(result with { RefreshToken = "" });
    }

    [HttpGet("validate")]
    public IActionResult Validate()
    {
        var authHeader = Request.Headers.Authorization.ToString();
        if (!authHeader.StartsWith("Bearer "))
            return Unauthorized();

        var token = authHeader["Bearer ".Length..];
        var result = tokens.ValidateAccessToken(token);
        if (!result.Valid)
            return Unauthorized();

        Response.Headers["X-User"] = result.Username;
        Response.Headers["X-Role"] = result.Role;
        return Ok();
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("refreshToken");
        return NoContent();
    }
}