using BCrypt.Net;
var builder = WebApplication.CreateBuilder(args);

var hash = BCrypt.Net.BCrypt.HashPassword("password");
Console.WriteLine(hash);

builder.Services.AddControllers();

builder.Services.AddSingleton<DbConnectionFactory>();
builder.Services.AddSingleton<TokenService>();
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<AuthService>();

var app = builder.Build();
app.MapControllers();
app.Run();