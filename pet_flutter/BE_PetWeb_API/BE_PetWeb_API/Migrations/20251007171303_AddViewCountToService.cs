using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BE_PetWeb_API.Migrations
{
    /// <inheritdoc />
    public partial class AddViewCountToService : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ViewCount",
                table: "Services",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ViewCount",
                table: "Services");
        }
    }
}
