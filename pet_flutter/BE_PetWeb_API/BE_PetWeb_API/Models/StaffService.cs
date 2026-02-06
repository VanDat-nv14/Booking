using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_PetWeb_API.Models;

public partial class StaffService
{
    [Key]
    public int StaffServiceId { get; set; }

    [Required]
    [ForeignKey("Staff")]
    public int StaffId { get; set; }

    [Required]
    [ForeignKey("Service")]
    public int ServiceId { get; set; }

    public virtual Service Service { get; set; }

    public virtual Staff Staff { get; set; }
}
