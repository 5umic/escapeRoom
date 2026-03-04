using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EscapeRoom.Api.Migrations
{
    public partial class ResetLeaderboardToGuid : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Ta bort tabellen som har fel ID-typ (int/identity)
            migrationBuilder.DropTable(
                name: "LeaderboardEntries");

            // 2. Skapa tabellen på nytt med Guid (uuid) som primärnyckel
            migrationBuilder.CreateTable(
                name: "LeaderboardEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PlayerName = table.Column<string>(type: "text", nullable: true),
                    TotalTimeSeconds = table.Column<int>(type: "integer", nullable: false),
                    PlayedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaderboardEntries", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Om vi ångrar oss raderar vi bara tabellen (den gamla med int går ej att få tillbaka automatiskt)
            migrationBuilder.DropTable(
                name: "LeaderboardEntries");
        }
    }
}