using EscapeRoom.Api.Infrastructure;
using EscapeRoom.Api.Domain; // Viktigt!
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EscapeRoom.Api.Controllers;

[ApiController]
[Route("api/games")]
public class GamesController : ControllerBase
{
    private readonly AppDbContext _db;

    public GamesController(AppDbContext db)
    {
        _db = db;
    }

    // 1. För spelaren
    [HttpGet("{gameId:guid}/challenges/random")]
    public async Task<IActionResult> GetRandomChallenge(Guid gameId)
    {
        var challenge = await _db.Challenges
            .Where(c => c.GameId == gameId && c.IsActive)
            .OrderBy(c => Guid.NewGuid())
            .FirstOrDefaultAsync();

        if (challenge is null)
            return NotFound("No challenges found for this game.");

        int calculatedIndex = challenge.Options.IndexOf(challenge.Answer);
        if (calculatedIndex == -1) calculatedIndex = 0; 

        return Ok(new 
        { 
            challenge.Id, 
            Type = challenge.Type.ToString(),
            challenge.Prompt, 
            challenge.ImageUrl, 
            challenge.Options, 
            challenge.TimeLimitSeconds, 
            CorrectOptionIndex = calculatedIndex,
            challenge.Answer
        });
    }

    // 2. Admin: Lista alla spel
    [HttpGet("list-all")]
    public async Task<IActionResult> GetAllGames()
    {
        var games = await _db.Games
            .Select(g => new { g.Id, g.Title, g.IsActive })
            .ToListAsync();
        return Ok(games);
    }

    // 3. Admin: Hämta alla utmaningar till ett spel
    [HttpGet("{gameId:guid}/challenges/all")]
    public async Task<IActionResult> GetAllChallengesForGame(Guid gameId)
    {
        var challenges = await _db.Challenges
            .Where(c => c.GameId == gameId)
            .OrderBy(c => c.Prompt)
            .ToListAsync();
        return Ok(challenges);
    }

    // 4. Admin: Uppdatera en specifik utmaning
    [HttpPut("challenges/{id:guid}")]
    public async Task<IActionResult> UpdateChallenge(Guid id, [FromBody] Challenge updatedChallenge)
    {
        var challenge = await _db.Challenges.FindAsync(id);
        if (challenge == null) return NotFound();

        challenge.Prompt = updatedChallenge.Prompt;
        challenge.Answer = updatedChallenge.Answer;
        challenge.Options = updatedChallenge.Options;
        challenge.ImageUrl = updatedChallenge.ImageUrl;
        challenge.TimeLimitSeconds = updatedChallenge.TimeLimitSeconds;

        await _db.SaveChangesAsync();
        return Ok(challenge);
    }

    // 5. Admin: Toggle
    [HttpPut("{id:guid}/toggle-active")]
    public async Task<IActionResult> ToggleGameActive(Guid id, [FromBody] bool isActive)
    {
        var game = await _db.Games.FindAsync(id);
        if (game == null) return NotFound();

        game.IsActive = isActive;
        await _db.SaveChangesAsync();
        return Ok(game);
    }
}