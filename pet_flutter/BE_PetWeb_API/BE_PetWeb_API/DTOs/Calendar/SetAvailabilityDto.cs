using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Calendar
{
    public class SetAvailabilityDto
    {
        public DateTime Date { get; set; }
        public bool IsWorking { get; set; } = true;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Notes { get; set; }
    }
}