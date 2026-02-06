using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_PetWeb_API.Models;

public partial class Appointment
{
    [Key]
    public int AppointmentId { get; set; }

    [Required]
    [ForeignKey("User")]
    public int UserId { get; set; }

    [Required]
    [ForeignKey("Pet")]
    public int PetId { get; set; }

    [Required]
    [ForeignKey("Service")]
    public int ServiceId { get; set; }

    [ForeignKey("Staff")]
    public int? StaffId { get; set; }

    [Required]
    [Column(TypeName = "datetime")]
    public DateTime AppointmentDate { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? EndTime { get; set; }

    [Required]
    [MaxLength(20)]
    [Column(TypeName = "nvarchar(20)")]
    public string Status { get; set; } = "Scheduled";

    public string? Notes { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    [Column(TypeName = "datetime")]
    public DateTime? UpdatedAt { get; set; }

    public virtual Pet Pet { get; set; }

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual Service Service { get; set; }

    public virtual Staff Staff { get; set; }

    public virtual User User { get; set; }
}
