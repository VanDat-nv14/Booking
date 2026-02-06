using System;

namespace BE_PetWeb_API.DTOs.Appointment
{
    public class AppointmentDto
    {
        public int AppointmentId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public int PetId { get; set; }
        public string PetName { get; set; }
        public int ServiceId { get; set; }
        public string ServiceName { get; set; }
        public decimal ServicePrice { get; set; }
        public int? StaffId { get; set; }
        public string StaffName { get; set; }
        public DateTime AppointmentDate { get; set; }
        public DateTime? EndTime { get; set; }
        public string Status { get; set; }
        public string Notes { get; set; }
        public string CancellationReason { get; set; }
    }
}