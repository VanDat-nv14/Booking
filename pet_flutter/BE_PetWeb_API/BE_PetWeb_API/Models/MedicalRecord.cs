using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_PetWeb_API.Models;

public partial class MedicalRecord
{
    [Key]
    public int RecordId { get; set; }

    [Required]
    [ForeignKey("Pet")]
    public int PetId { get; set; }

    [ForeignKey("Staff")]
    public int? StaffId { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    [Column(TypeName = "datetime")]
    public DateTime? RecordDate { get; set; }

    [Required]
    public string Diagnosis { get; set; }

    public string? Treatment { get; set; }

    public string? Prescription { get; set; }

    public string? Notes { get; set; }

    public DateOnly? NextVisit { get; set; }

    public virtual Pet Pet { get; set; }

    public virtual Staff Staff { get; set; }
}
