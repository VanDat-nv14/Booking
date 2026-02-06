namespace BE_PetWeb_API.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body, bool isHtml = true);

        Task SendAppointmentConfirmationEmail(string email, string userName, DateTime appointmentDate, string serviceName, string staffName, int appointmentId);
        Task SendAppointmentUpdateEmail(string email, string userName, DateTime appointmentDate, string serviceName, string staffName, int appointmentId, string status);
        Task SendAppointmentCancellationEmail(string email, string userName, DateTime appointmentDate, string serviceName, int appointmentId, string reason = null);
    }
}
