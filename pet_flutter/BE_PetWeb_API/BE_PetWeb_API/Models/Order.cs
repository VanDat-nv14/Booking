using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_PetWeb_API.Models;

// Enum cho trạng thái đơn hàng
public enum OrderStatus
{
    ChoXuLy = 0,          // Pending - Chờ xử lý
    DangXuLy = 1,         // Processing - Đang xử lý
    DaXacNhan = 2,        // Confirmed - Đã xác nhận
    DangGiaoHang = 3,     // Shipped - Đang giao hàng
    DaGiaoHang = 4,       // Delivered - Đã giao hàng
    HoanThanh = 5,        // Completed - Hoàn thành
    DaHuy = 6             // Cancelled - Đã hủy
}

// Enum cho trạng thái thanh toán
public enum PaymentStatus
{
    ChoThanhToan = 0,     // Pending - Chờ thanh toán
    DaThanhToan = 1,      // Paid - Đã thanh toán
    DaHuy = 2             // Cancelled - Đã hủy thanh toán
}

public partial class Order
{
    [Key]
    public int OrderId { get; set; }

    [Required]
    [ForeignKey("User")]
    public int UserId { get; set; }

    [Required]
    [MaxLength(100)]
    public string RecipientName { get; set; }

    [Required]
    [MaxLength(20)]
    public string RecipientPhone { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    [Column(TypeName = "datetime")]
    public DateTime? OrderDate { get; set; }

    [Required]
    [Column(TypeName = "decimal(10, 2)")]
    public decimal TotalAmount { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal ShippingFee { get; set; } = 0;

    [Required]
    [MaxLength(20)]
    [Column(TypeName = "nvarchar(20)")]
    public string Status { get; set; } = OrderStatus.ChoXuLy.ToString();

    [Required]
    public string ShippingAddress { get; set; }

    [Required]
    [MaxLength(20)]
    [Column(TypeName = "nvarchar(20)")]
    public string PaymentMethod { get; set; }

    [Required]
    [MaxLength(20)]
    [Column(TypeName = "nvarchar(20)")]
    public string PaymentStatus { get; set; } = Models.PaymentStatus.ChoThanhToan.ToString();

    public string? Notes { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    [Column(TypeName = "datetime")]
    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual User User { get; set; }
}
