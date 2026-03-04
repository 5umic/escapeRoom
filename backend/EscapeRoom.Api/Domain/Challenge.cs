namespace EscapeRoom.Api.Domain;

public class Challenge
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid GameId { get; set; }

    public Game? Game { get; set; }

    public ChallengeType Type { get; set; }
    public string Prompt { get; set; } = "";
    public string? ImageUrl { get; set; }
    public string Answer { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public int TimeLimitSeconds { get; set; } = 60;
    public List<string> Options { get; set; } = new();
    public int CorrectOptionIndex { get; set; } = 0;
}