using EscapeRoom.Api.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EscapeRoom.Api.Controllers;

[ApiController]
[Route("api/modes")]
public class ModesController : ControllerBase
{
    private readonly AppDbContext _db;

    public ModesController(AppDbContext db) => _db = db;

  [HttpGet("{modeKey}/games")]
public async Task<IActionResult> GetGames(string modeKey)
{
    // 1. Hämta ENDAST aktiva spel från databasen
    var games = await _db.Games
        .Where(g => g.Mode != null && g.Mode.Key == modeKey && g.IsActive)
        .ToListAsync();

    // 2. Sortera listan baserat på siffran i titeln (t.ex. Game 6 vs Game 7)
    var sortedGames = games
        .OrderBy(g => {
            // Vi extraherar siffran ur titeln med Regex
            var match = System.Text.RegularExpressions.Regex.Match(g.Title, @"\d+");
            if (match.Success)
            {
                return int.Parse(match.Value);
            }
            // Om det är "Trafikverket (Gymnasium)" som saknar siffra, sätter vi den som 0 (först)
            return 0; 
        })
        .Select(g => new { g.Id, g.Title, g.MaxDurationSeconds })
        .ToList();

    return Ok(sortedGames);
}
    // GET /api/modes
    [HttpGet]
    public async Task<IActionResult> GetModes()
    {
        var modes = await _db.Modes
            .Select(m => new { m.Id, m.Key, m.Name })
            .ToListAsync();

        return Ok(modes);
    }
}