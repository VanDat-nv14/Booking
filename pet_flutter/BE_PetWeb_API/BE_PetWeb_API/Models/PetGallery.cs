using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_PetWeb_API.Models;

[Table("PetGallery")]
public partial class PetGallery
{
    [Key]
    public int GalleryId { get; set; }

    [Required]
    [ForeignKey("Pet")]
    public int PetId { get; set; }

    [Required]
    [MaxLength(255)]
    [Column(TypeName = "nvarchar(255)")]
    public string ImageUrl { get; set; }

    public string? Caption { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    [Column(TypeName = "datetime")]
    public DateTime? UploadDate { get; set; }

    public virtual Pet Pet { get; set; }
}
