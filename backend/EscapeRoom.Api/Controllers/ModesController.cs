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
        var games = await _db.Games
            .Where(g => g.Mode != null && g.Mode.Key == modeKey)
            .Select(g => new { g.Id, g.Title, g.MaxDurationSeconds })
            .ToListAsync();

        return Ok(games);
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