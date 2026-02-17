namespace EscapeRoom.Api.Domain;

public class Mode
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Key { get; set; } = "";
    public string Name { get; set; } = "";
    public bool IsActive { get; set; } = true;

    public List<Game> Games { get; set; } = new();
}