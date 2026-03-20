namespace EscapeRoom.Api.Domain;

public class HogskolaInfoContent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string GameKey { get; set; } = "";
    public string Heading { get; set; } = "";
    public string Body { get; set; } = "";
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}