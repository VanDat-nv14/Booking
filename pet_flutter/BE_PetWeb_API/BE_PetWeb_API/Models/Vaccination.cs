using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_PetWeb_API.Models;

public partial class Vaccination
{
    [Key]
    public int VaccinationId { get; set; }

    [Required]
    [ForeignKey("Pet")]
    public int PetId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column(TypeName = "nvarchar(100)")]
    public string VaccineName { get; set; }

    [Required]
    public DateOnly VaccineDate { get; set; }

    public DateOnly? ExpiryDate { get; set; }

    [ForeignKey("AdministeredByNavigation")]
    public int? AdministeredBy { get; set; }

    public string? Notes { get; set; }

    public virtual Staff AdministeredByNavigation { get; set; }

    public virtual Pet Pet { get; set; }
}
