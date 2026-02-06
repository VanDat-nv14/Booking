using BE_PetWeb_API.Services.Interfaces;

namespace BE_PetWeb_API.Services.Implementations
{
    public class DateTimeService : IDateTimeService
    {
        private readonly TimeZoneInfo _vietnamTimeZone;

        public DateTimeService()
        {
            // Timezone Việt Nam (UTC+07:00)
            _vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
        }

        public DateTime Now => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _vietnamTimeZone);

        public DateTime UtcNow => DateTime.UtcNow;

        public DateTime ConvertToVietnamTime(DateTime utcTime)
        {
            if (utcTime.Kind == DateTimeKind.Utc)
            {
                return TimeZoneInfo.ConvertTimeFromUtc(utcTime, _vietnamTimeZone);
            }
            return utcTime;
        }

        public DateTime ConvertToUtc(DateTime vietnamTime)
        {
            if (vietnamTime.Kind == DateTimeKind.Unspecified)
            {
                return TimeZoneInfo.ConvertTimeToUtc(vietnamTime, _vietnamTimeZone);
            }
            return vietnamTime.ToUniversalTime();
        }

        public string GetVietnamTimeZoneId()
        {
            return _vietnamTimeZone.Id;
        }
    }
} 