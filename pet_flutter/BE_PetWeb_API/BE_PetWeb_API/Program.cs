using BE_PetWeb_API.Extensions;
using BE_PetWeb_API.Middleware;
using BE_PetWeb_API.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình logging chi tiết hơn
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();
builder.Logging.SetMinimumLevel(LogLevel.Information);

// Add services to the container.
// Cập nhật phần này để đảm bảo serialization các thuộc tính read-only
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Cấu hình JsonSerializer để đảm bảo các thuộc tính chỉ đọc được serialized
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true;
        options.JsonSerializerOptions.IncludeFields = true;

        // Cho phép System.Text.Json serialize các thuộc tính chỉ đọc
        options.JsonSerializerOptions.IgnoreReadOnlyProperties = false;

        // Nếu cần deserialize từ camelCase sang PascalCase và ngược lại
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// Add DbContext
builder.Services.AddDbContext<PetWebContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("PetWebConnection")));

builder.Services.AddAuthentication()
    .AddGoogle(options =>
    {
        options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
        options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
        options.CallbackPath = "/api/auth/google-callback";
    });

// Add HttpClient for OneSignal and other services
builder.Services.AddHttpClient();

// Register all application services using the extension method
builder.Services.RegisterServices();

// Add SignalR with enhanced configuration
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true; // Enable detailed errors for development
});

// Add Background Service for cleanup
builder.Services.AddHostedService<BE_PetWeb_API.Services.Implementations.ReservationCleanupService>();

// Tăng kích thước tối đa của request để hỗ trợ file lớn
builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = 30 * 1024 * 1024; // 30 MB
});

builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = 30 * 1024 * 1024; // 30 MB
});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 30 * 1024 * 1024; // 30 MB
    options.ValueLengthLimit = 30 * 1024 * 1024; // 30 MB
});

// Add JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JWT:Issuer"],
            ValidAudience = builder.Configuration["JWT:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"]))
        };
        
        // Allow SignalR connections with token from query string
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/slotHub"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

// Add CORS - Cập nhật phần này
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader());

    options.AddPolicy("AllowLocalhost",
        builder => builder
            .WithOrigins("http://localhost:3000", "https://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .WithExposedHeaders("Content-Disposition")
            .SetIsOriginAllowed(origin => true) // Cho phép tất cả origin trong môi trường dev
            .AllowCredentials()); // Required for SignalR
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Pet Web API",
        Version = "v1",
        Description = "API for Pet Web Application"
    });
    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Configure Kestrel to listen on all network interfaces
builder.WebHost.UseUrls("https://0.0.0.0:7164", "http://0.0.0.0:5181");

var app = builder.Build();

try
{
    // Đảm bảo thư mục uploads tồn tại
    var uploadsPath = Path.Combine(app.Environment.WebRootPath, "uploads");
    if (!Directory.Exists(uploadsPath))
    {
        Directory.CreateDirectory(uploadsPath);
        app.Logger.LogInformation($"Created directory: {uploadsPath}");
    }

    var petsPath = Path.Combine(uploadsPath, "pets");
    if (!Directory.Exists(petsPath))
    {
        Directory.CreateDirectory(petsPath);
        app.Logger.LogInformation($"Created directory: {petsPath}");
    }

    var avatarsPath = Path.Combine(uploadsPath, "avatars");
    if (!Directory.Exists(avatarsPath))
    {
        Directory.CreateDirectory(avatarsPath);
        app.Logger.LogInformation($"Created directory: {avatarsPath}");
    }

    // Thêm thư mục products
    var productsPath = Path.Combine(uploadsPath, "products");
    if (!Directory.Exists(productsPath))
    {
        Directory.CreateDirectory(productsPath);
        app.Logger.LogInformation($"Created directory: {productsPath}");
    }

    // Thêm thư mục services
    var servicesPath = Path.Combine(uploadsPath, "services");
    if (!Directory.Exists(servicesPath))
    {
        Directory.CreateDirectory(servicesPath);
        app.Logger.LogInformation($"Created directory: {servicesPath}");
    }

    // Thêm thư mục reviews
    var reviewsPath = Path.Combine(uploadsPath, "reviews");
    if (!Directory.Exists(reviewsPath))
    {
        Directory.CreateDirectory(reviewsPath);
        app.Logger.LogInformation($"Created directory: {reviewsPath}");
    }
}
catch (Exception ex)
{
    // Log lỗi nhưng không làm crash ứng dụng
    app.Logger.LogError(ex, "Error creating uploads directories");
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Pet Web API v1");
    });
}

//app.UseHttpsRedirection();

// Thêm middleware xử lý CORS cho StaticFiles
app.Use(async (context, next) =>
{
    // Thêm header CORS cho các request tới uploads
    if (context.Request.Path.StartsWithSegments("/uploads"))
    {
        context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
        context.Response.Headers.Add("Access-Control-Allow-Methods", "GET");
        context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type");

        // Nếu là OPTIONS request (preflight), trả về ngay
        if (context.Request.Method == "OPTIONS")
        {
            context.Response.StatusCode = 200;
            return;
        }
    }

    await next();
});

// Serve static files from wwwroot folder (for images and other assets)
app.UseStaticFiles();
app.UseExceptionHandlingMiddleware();
// Cập nhật phần này - Sử dụng chính sách CORS đã cập nhật
app.UseCors("AllowLocalhost");

// Add Authentication middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map SignalR Hub with CORS
app.MapHub<BE_PetWeb_API.Hubs.TimeSlotSharingHub>("/timeSlotHub").RequireCors("AllowLocalhost");

app.Run();