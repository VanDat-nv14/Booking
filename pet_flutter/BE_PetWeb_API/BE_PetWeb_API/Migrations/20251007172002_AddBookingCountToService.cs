using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BE_PetWeb_API.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingCountToService : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BookingCount",
                table: "Services",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BookingCount",
                table: "Services");
        }
    }
}
