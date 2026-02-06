using System;
using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Reminder
{
    public class CreateReminderDto
    {
        [Required]
        public int PetId { get; set; }

        [Required]
        public string ReminderType { get; set; }

        [Required]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required]
        public DateTime ReminderDate { get; set; }

        public string Frequency { get; set; } = "Once";

        public string Status { get; set; } = "Active";
    }
}