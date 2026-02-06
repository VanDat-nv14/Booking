using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_PetWeb_API.Models;

public partial class PetCareReminder
{
    [Key]
    public int ReminderId { get; set; }

    [Required]
    [ForeignKey("Pet")]
    public int PetId { get; set; }

    [Required]
    [MaxLength(20)]
    [Column(TypeName = "nvarchar(20)")]
    public string ReminderType { get; set; }

    [Required]
    [MaxLength(100)]
    [Column(TypeName = "nvarchar(100)")]
    public string Title { get; set; }

    public string? Description { get; set; }

    [Required]
    [Column(TypeName = "datetime")]
    public DateTime ReminderDate { get; set; }

    [Required]
    [MaxLength(20)]
    [Column(TypeName = "nvarchar(20)")]
    public string Frequency { get; set; } = "Once";

    [Required]
    [MaxLength(20)]
    [Column(TypeName = "nvarchar(20)")]
    public string Status { get; set; } = "Active";

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    [Column(TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    public virtual Pet Pet { get; set; }
}
