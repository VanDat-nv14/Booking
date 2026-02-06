namespace BE_PetWeb_API.Services.Interfaces
{
    public interface IDateTimeService
    {
        DateTime Now { get; }
        DateTime UtcNow { get; }
        DateTime ConvertToVietnamTime(DateTime utcTime);
        DateTime ConvertToUtc(DateTime vietnamTime);
        string GetVietnamTimeZoneId();
    }
} 