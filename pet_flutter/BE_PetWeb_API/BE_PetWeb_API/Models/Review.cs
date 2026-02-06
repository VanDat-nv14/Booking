using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_PetWeb_API.Models;

public partial class Review
{
    [Key]
    public int ReviewId { get; set; }

    [Required]
    [ForeignKey("User")]
    public int UserId { get; set; }

    [ForeignKey("Service")]
    public int? ServiceId { get; set; }

    [ForeignKey("Product")]
    public int? ProductId { get; set; }

    [ForeignKey("Appointment")]
    public int? AppointmentId { get; set; }

    [ForeignKey("Order")]
    public int? OrderId { get; set; }

    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }

    public string? Comment { get; set; }

    [Column(TypeName = "nvarchar(max)")]
    public string? Images { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    [Column(TypeName = "datetime")]
    public DateTime? ReviewDate { get; set; }

    public virtual Appointment Appointment { get; set; }

    public virtual Order Order { get; set; }

    public virtual Product Product { get; set; }

    public virtual Service Service { get; set; }

    public virtual User User { get; set; }

    public virtual ICollection<ReviewReply> ReviewReplies { get; set; } = new List<ReviewReply>();
}
