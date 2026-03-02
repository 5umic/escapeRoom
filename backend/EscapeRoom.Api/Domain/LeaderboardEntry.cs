using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class LeaderboardEntry
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.None)] 
    public Guid Id { get; set; } = Guid.NewGuid();    
    public string? PlayerName { get; set; }
    public int TotalTimeSeconds { get; set; } 
    public DateTime PlayedAt { get; set; } = DateTime.UtcNow; // När de spelade
}