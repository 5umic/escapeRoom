using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EscapeRoom.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddChallengeTimeLimit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TimeLimitSeconds",
                table: "Challenges",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TimeLimitSeconds",
                table: "Challenges");
        }
    }
}
