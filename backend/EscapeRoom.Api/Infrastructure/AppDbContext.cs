using EscapeRoom.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace EscapeRoom.Api.Infrastructure;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Mode> Modes => Set<Mode>();
    public DbSet<Game> Games => Set<Game>();
    public DbSet<Challenge> Challenges => Set<Challenge>();
    public DbSet<LeaderboardEntry> LeaderboardEntries { get; set; }
      protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Challenge>()
            .Property(c => c.Options)
            .HasColumnType("jsonb")
            .HasDefaultValueSql("'[]'::jsonb");
    }
}