using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_PetWeb_API.Models;

public partial class ReviewReply
{
    [Key]
    public int ReplyId { get; set; }

    [Required]
    [ForeignKey("Review")]
    public int ReviewId { get; set; }

    [Required]
    [ForeignKey("User")] // Admin user
    public int AdminUserId { get; set; }

    [Required]
    public string ReplyContent { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    [Column(TypeName = "datetime")]
    public DateTime? ReplyDate { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    [Column(TypeName = "datetime")]
    public DateTime? UpdatedAt { get; set; }

    public virtual Review Review { get; set; }

    public virtual User AdminUser { get; set; }
} 