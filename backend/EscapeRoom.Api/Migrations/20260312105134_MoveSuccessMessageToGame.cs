using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EscapeRoom.Api.Migrations
{
    /// <inheritdoc />
    public partial class MoveSuccessMessageToGame : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SuccessMessage",
                table: "Challenges");

            migrationBuilder.AddColumn<string>(
                name: "SuccessMessage",
                table: "Games",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SuccessMessage",
                table: "Games");

            migrationBuilder.AddColumn<string>(
                name: "SuccessMessage",
                table: "Challenges",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
