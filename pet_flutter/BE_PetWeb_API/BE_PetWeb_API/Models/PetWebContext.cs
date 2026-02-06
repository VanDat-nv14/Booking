using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace BE_PetWeb_API.Models;

public class PetWebContext : DbContext
{
    public PetWebContext(DbContextOptions<PetWebContext> options)
        : base(options)
    {
    }
    
    public DbSet<Category> Categories { get; set; }
    public DbSet<StaffSchedule> StaffSchedules { get; set; }
    public DbSet<Appointment> Appointments { get; set; }
    public DbSet<BlogPost> BlogPosts { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<MedicalRecord> MedicalRecords { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }    public DbSet<Pet> Pets { get; set; }
    public DbSet<PetCareReminder> PetCareReminders { get; set; }
    public DbSet<PetGallery> PetGalleries { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<ProductImage> ProductImages { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<ReviewReply> ReviewReplies { get; set; }
    public DbSet<Service> Services { get; set; }
    public DbSet<Staff> Staff { get; set; }
    public DbSet<StaffService> StaffServices { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Vaccination> Vaccinations { get; set; }
    public DbSet<TemporaryReservation> TemporaryReservations { get; set; }
    public DbSet<Cart> Carts { get; set; }
    public DbSet<CartItem> CartItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      
 
        modelBuilder.Entity<User>()
            .HasIndex(e => e.Username)
            .IsUnique();
            
        modelBuilder.Entity<User>()
            .HasIndex(e => e.Email)
            .IsUnique();
            
        modelBuilder.Entity<Staff>()
            .HasIndex(e => e.UserId)
            .IsUnique();
            
        modelBuilder.Entity<StaffService>()
            .HasIndex(e => new { e.StaffId, e.ServiceId })
            .IsUnique();

        // Default values that can't be set with Data Annotations
        modelBuilder.Entity<User>()
            .Property(e => e.CreatedAt)
            .HasDefaultValueSql("(getdate())");
            
        modelBuilder.Entity<User>()
            .Property(e => e.UpdatedAt)
            .HasDefaultValueSql("(getdate())");
            
        modelBuilder.Entity<User>()
            .Property(e => e.IsActive)
            .HasDefaultValue(true);
            
        modelBuilder.Entity<User>()
            .Property(e => e.Role)
            .HasDefaultValue("Customer");

        modelBuilder.Entity<Pet>()
            .Property(e => e.CreatedAt)
            .HasDefaultValueSql("(getdate())");
            
        modelBuilder.Entity<Pet>()
            .Property(e => e.UpdatedAt)
            .HasDefaultValueSql("(getdate())");
            
        modelBuilder.Entity<Pet>()
            .Property(e => e.IsActive)
            .HasDefaultValue(true);

        modelBuilder.Entity<Staff>()
            .Property(e => e.CreatedAt)
            .HasDefaultValueSql("(getdate())");
            
        modelBuilder.Entity<Staff>()
            .Property(e => e.UpdatedAt)
            .HasDefaultValueSql("(getdate())");
            
        modelBuilder.Entity<Staff>()
            .Property(e => e.IsActive)
            .HasDefaultValue(true);
            
        modelBuilder.Entity<Staff>()
            .Property(e => e.Rating)
            .HasDefaultValue(0m);

        modelBuilder.Entity<Service>()
            .Property(e => e.CreatedAt)
            .HasDefaultValueSql("(getdate())");
            
        modelBuilder.Entity<Service>()
            .Property(e => e.UpdatedAt)
            .HasDefaultValueSql("(getdate())");
            
        modelBuilder.Entity<Service>()
            .Property(e => e.IsActive)
            .HasDefaultValue(true);

        modelBuilder.Entity<Product>()
            .Property(e => e.CreatedAt)
            .HasDefaultValueSql("(getdate())");
            
        modelBuilder.Entity<Product>()
            .Property(e => e.UpdatedAt)
            .HasDefaultValueSql("(getdate())");
            
        modelBuilder.Entity<Product>()
            .Property(e => e.IsActive)
            .HasDefaultValue(true);

        modelBuilder.Entity<Appointment>()
            .Property(e => e.CreatedAt)
            .HasDefaultValueSql("(getdate())");
            
        modelBuilder.Entity<Appointment>()
            .Property(e => e.UpdatedAt)
            .HasDefaultValueSql("(getdate())");
            
        modelBuilder.Entity<Appointment>()
            .Property(e => e.Status)
            .HasDefaultValue("Scheduled");

        modelBuilder.Entity<Order>()
            .Property(e => e.OrderDate)
            .HasDefaultValueSql("(getdate())");
            
        modelBuilder.Entity<Order>()
            .Property(e => e.UpdatedAt)
            .HasDefaultValueSql("(getdate())");
            
        modelBuilder.Entity<Order>()
            .Property(e => e.Status)
            .HasDefaultValue("Pending");
            
        modelBuilder.Entity<Order>()
            .Property(e => e.PaymentStatus)
            .HasDefaultValue("Pending");

        modelBuilder.Entity<BlogPost>()
            .Property(e => e.PublishDate)
            .HasDefaultValueSql("(getdate())");
            
        modelBuilder.Entity<BlogPost>()
            .Property(e => e.UpdatedAt)
            .HasDefaultValueSql("(getdate())");
            
        modelBuilder.Entity<BlogPost>()
            .Property(e => e.Status)
            .HasDefaultValue("Draft");
            
        modelBuilder.Entity<BlogPost>()
            .Property(e => e.ViewCount)
            .HasDefaultValue(0);

        modelBuilder.Entity<Comment>()
            .Property(e => e.CommentDate)
            .HasDefaultValueSql("(getdate())");
            
        modelBuilder.Entity<Comment>()
            .Property(e => e.IsApproved)
            .HasDefaultValue(true);

        modelBuilder.Entity<MedicalRecord>()
            .Property(e => e.RecordDate)
            .HasDefaultValueSql("(getdate())");

        modelBuilder.Entity<Review>()
            .Property(e => e.ReviewDate)
            .HasDefaultValueSql("(getdate())");

        modelBuilder.Entity<ReviewReply>()
            .Property(e => e.ReplyDate)
            .HasDefaultValueSql("(getdate())");
            
        modelBuilder.Entity<ReviewReply>()
            .Property(e => e.UpdatedAt)
            .HasDefaultValueSql("(getdate())");

        modelBuilder.Entity<Notification>()
            .Property(e => e.CreatedAt)
            .HasDefaultValueSql("(getdate())");
            
        modelBuilder.Entity<Notification>()
            .Property(e => e.IsRead)
            .HasDefaultValue(false);

        modelBuilder.Entity<PetCareReminder>()
            .Property(e => e.CreatedAt)
            .HasDefaultValueSql("(getdate())");
            
        modelBuilder.Entity<PetCareReminder>()
            .Property(e => e.Frequency)
            .HasDefaultValue("Once");
            
        modelBuilder.Entity<PetCareReminder>()
            .Property(e => e.Status)
            .HasDefaultValue("Active");

        modelBuilder.Entity<PetGallery>()
            .Property(e => e.UploadDate)
            .HasDefaultValueSql("(getdate())");

        // One-to-One relationship
        modelBuilder.Entity<Staff>()
            .HasOne(d => d.User)
            .WithOne(p => p.Staff)
            .HasForeignKey<Staff>(d => d.UserId)
            .OnDelete(DeleteBehavior.ClientSetNull);

        // Foreign key behaviors (keep original behaviors)
        modelBuilder.Entity<Appointment>()
            .HasOne(d => d.Pet)
            .WithMany(p => p.Appointments)
            .HasForeignKey(d => d.PetId)
            .OnDelete(DeleteBehavior.ClientSetNull);
            
        modelBuilder.Entity<Appointment>()
            .HasOne(d => d.Service)
            .WithMany(p => p.Appointments)
            .HasForeignKey(d => d.ServiceId)
            .OnDelete(DeleteBehavior.ClientSetNull);
            
        modelBuilder.Entity<Appointment>()
            .HasOne(d => d.User)
            .WithMany(p => p.Appointments)
            .HasForeignKey(d => d.UserId)
            .OnDelete(DeleteBehavior.ClientSetNull);

        modelBuilder.Entity<BlogPost>()
            .HasOne(d => d.User)
            .WithMany(p => p.BlogPosts)
            .HasForeignKey(d => d.UserId)
            .OnDelete(DeleteBehavior.ClientSetNull);

        modelBuilder.Entity<Comment>()
            .HasOne(d => d.Post)
            .WithMany(p => p.Comments)
            .HasForeignKey(d => d.PostId)
            .OnDelete(DeleteBehavior.ClientSetNull);
            
        modelBuilder.Entity<Comment>()
            .HasOne(d => d.User)
            .WithMany(p => p.Comments)
            .HasForeignKey(d => d.UserId)
            .OnDelete(DeleteBehavior.ClientSetNull);

        modelBuilder.Entity<MedicalRecord>()
            .HasOne(d => d.Pet)
            .WithMany(p => p.MedicalRecords)
            .HasForeignKey(d => d.PetId)
            .OnDelete(DeleteBehavior.ClientSetNull);

        modelBuilder.Entity<Notification>()
            .HasOne(d => d.User)
            .WithMany(p => p.Notifications)
            .HasForeignKey(d => d.UserId)
            .OnDelete(DeleteBehavior.ClientSetNull);

        modelBuilder.Entity<Order>()
            .HasOne(d => d.User)
            .WithMany(p => p.Orders)
            .HasForeignKey(d => d.UserId)
            .OnDelete(DeleteBehavior.ClientSetNull);

        modelBuilder.Entity<OrderItem>()
            .HasOne(d => d.Order)
            .WithMany(p => p.OrderItems)
            .HasForeignKey(d => d.OrderId)
            .OnDelete(DeleteBehavior.ClientSetNull);
            
        modelBuilder.Entity<OrderItem>()
            .HasOne(d => d.Product)
            .WithMany(p => p.OrderItems)
            .HasForeignKey(d => d.ProductId)
            .OnDelete(DeleteBehavior.ClientSetNull);

        modelBuilder.Entity<Pet>()
            .HasOne(d => d.User)
            .WithMany(p => p.Pets)
            .HasForeignKey(d => d.UserId)
            .OnDelete(DeleteBehavior.ClientSetNull);

        modelBuilder.Entity<PetCareReminder>()
            .HasOne(d => d.Pet)
            .WithMany(p => p.PetCareReminders)
            .HasForeignKey(d => d.PetId)
            .OnDelete(DeleteBehavior.ClientSetNull);

        modelBuilder.Entity<PetGallery>()
            .HasOne(d => d.Pet)
            .WithMany(p => p.PetGalleries)
            .HasForeignKey(d => d.PetId)
            .OnDelete(DeleteBehavior.ClientSetNull);

        modelBuilder.Entity<Review>()
            .HasOne(d => d.User)
            .WithMany(p => p.Reviews)
            .HasForeignKey(d => d.UserId)
            .OnDelete(DeleteBehavior.ClientSetNull);

        modelBuilder.Entity<ReviewReply>()
            .HasOne(d => d.Review)
            .WithMany(p => p.ReviewReplies)
            .HasForeignKey(d => d.ReviewId)
            .OnDelete(DeleteBehavior.ClientSetNull);
            
        modelBuilder.Entity<ReviewReply>()
            .HasOne(d => d.AdminUser)
            .WithMany()
            .HasForeignKey(d => d.AdminUserId)
            .OnDelete(DeleteBehavior.ClientSetNull);

        modelBuilder.Entity<StaffService>()
            .HasOne(d => d.Service)
            .WithMany(p => p.StaffServices)
            .HasForeignKey(d => d.ServiceId)
            .OnDelete(DeleteBehavior.ClientSetNull);
            
        modelBuilder.Entity<StaffService>()
            .HasOne(d => d.Staff)
            .WithMany(p => p.StaffServices)
            .HasForeignKey(d => d.StaffId)
            .OnDelete(DeleteBehavior.ClientSetNull);

        modelBuilder.Entity<Vaccination>()
            .HasOne(d => d.Pet)
            .WithMany(p => p.Vaccinations)
            .HasForeignKey(d => d.PetId)
            .OnDelete(DeleteBehavior.ClientSetNull);

        // Cart configurations
        modelBuilder.Entity<Cart>()
            .Property(e => e.CreatedAt)
            .HasDefaultValueSql("(getdate())");
            
        modelBuilder.Entity<Cart>()
            .Property(e => e.UpdatedAt)
            .HasDefaultValueSql("(getdate())");

        modelBuilder.Entity<CartItem>()
            .Property(e => e.CreatedAt)
            .HasDefaultValueSql("(getdate())");
            
        modelBuilder.Entity<CartItem>()
            .Property(e => e.UpdatedAt)
            .HasDefaultValueSql("(getdate())");

        // Cart relationships
        modelBuilder.Entity<Cart>()
            .HasOne(d => d.User)
            .WithMany()
            .HasForeignKey(d => d.UserId)
            .OnDelete(DeleteBehavior.ClientSetNull);

        modelBuilder.Entity<CartItem>()
            .HasOne(d => d.Cart)
            .WithMany(p => p.CartItems)
            .HasForeignKey(d => d.CartId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CartItem>()
            .HasOne(d => d.Product)
            .WithMany()
            .HasForeignKey(d => d.ProductId)
            .OnDelete(DeleteBehavior.ClientSetNull);

        // Unique constraint for cart per user
        modelBuilder.Entity<Cart>()
            .HasIndex(e => e.UserId)
            .IsUnique();

        base.OnModelCreating(modelBuilder);
    }
}
