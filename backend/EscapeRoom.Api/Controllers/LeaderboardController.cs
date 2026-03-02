using EscapeRoom.Api.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EscapeRoom.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly AppDbContext _context; // Byt till ditt kontext-namn

    public LeaderboardController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/leaderboard - Hämtar Top 10 snabbaste tiderna
    [HttpGet]
    public async Task<IActionResult> GetTopScores()
    {
        var topScores = await _context.LeaderboardEntries
            .OrderBy(l => l.TotalTimeSeconds) // Sorterar från snabbast till långsammast
            .Take(10) // Hämtar bara top 10
            .ToListAsync();

        return Ok(topScores);
    }

    // POST: api/leaderboard - Sparar en ny tid
    [HttpPost]
    public async Task<IActionResult> SaveScore([FromBody] LeaderboardEntry newEntry)
    {
        if (string.IsNullOrWhiteSpace(newEntry.PlayerName))
        {
            newEntry.PlayerName = "Okänd Hacker";
        }

        newEntry.PlayedAt = DateTime.UtcNow;
        _context.LeaderboardEntries.Add(newEntry);
        await _context.SaveChangesAsync();

        return Ok(newEntry);
    }

    // Ta bort en specifik spelare
    [HttpDelete("scores/{id:guid}")]
    public async Task<IActionResult> DeleteScore([FromRoute] Guid id) 
    {
        var score = await _context.LeaderboardEntries.FindAsync(id);
        if (score == null) return NotFound();
        
        _context.LeaderboardEntries.Remove(score);
        await _context.SaveChangesAsync();
        return Ok();
    }

    // Töm hela leaderboarden
    [HttpDelete("scores/all")]
    public async Task<IActionResult> ClearLeaderboard() {
        var allScores = await _context.LeaderboardEntries.ToListAsync();
        _context.LeaderboardEntries.RemoveRange(allScores);
        await _context.SaveChangesAsync();
        return Ok();
    }
}