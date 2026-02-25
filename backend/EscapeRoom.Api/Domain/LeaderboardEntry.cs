public class LeaderboardEntry
{
    public int Id { get; set; }
    public string PlayerName { get; set; }
    public int TotalTimeSeconds { get; set; } 
    public DateTime PlayedAt { get; set; } = DateTime.UtcNow; // När de spelade
}