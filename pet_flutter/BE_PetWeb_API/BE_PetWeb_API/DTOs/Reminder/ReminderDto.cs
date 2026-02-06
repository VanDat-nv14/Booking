using System;

namespace BE_PetWeb_API.DTOs.Reminder
{
    public class ReminderDto
    {
        public int ReminderId { get; set; }
        public int PetId { get; set; }
        public string PetName { get; set; }
        public string ReminderType { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime ReminderDate { get; set; }
        public string Frequency { get; set; }
        public string Status { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}