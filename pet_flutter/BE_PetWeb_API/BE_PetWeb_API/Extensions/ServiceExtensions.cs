using BE_PetWeb_API.Services;
using BE_PetWeb_API.Services.Implementations;
using BE_PetWeb_API.Services.Interfaces;

namespace BE_PetWeb_API.Extensions
{
    public static class ServiceExtensions
    {
        public static void RegisterServices(this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<IFileService, FileService>();
            services.AddScoped<IPetService, PetService>();
            services.AddScoped<IServiceService, ServiceService>();
            services.AddScoped<IAppointmentService, AppointmentService>();
            services.AddScoped<IStaffService, StaffService>();
            services.AddScoped<IAvailabilityService, AvailabilityService>();
            services.AddScoped<IOrderService, OrderService>();
            services.AddScoped<IPaymentService, PaymentService>();
            services.AddScoped<IMedicalRecordService, MedicalRecordService>();
            services.AddScoped<IReminderService, ReminderService>();
            services.AddScoped<IVaccinationService, VaccinationService>();
            services.AddScoped<IBlogPostService, BlogPostService>();
            services.AddScoped<ICommentService, CommentService>();
            services.AddScoped<IReviewService, ReviewService>();
            services.AddScoped<IReviewReplyService, ReviewReplyService>();
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<ICartService, CartService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IStaffScheduleService, StaffScheduleService>();
            services.AddScoped<IOneSignalChatService, OneSignalChatService>();
            services.AddScoped<IFirebaseMessagingService, FirebaseMessagingService>();
            services.AddSingleton<IDateTimeService, DateTimeService>();
            services.AddMemoryCache();
            services.AddTransient<IPasswordResetService, PasswordResetService>();
        }
    }
}