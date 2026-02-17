namespace EscapeRoom.Api.Domain;

public class Game
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ModeId { get; set; }

    public Mode? Mode { get; set; }

    public string Title { get; set; } = "";
    public int MaxDurationSeconds { get; set; } = 600;

    public List<Challenge> Challenges { get; set; } = new();
}