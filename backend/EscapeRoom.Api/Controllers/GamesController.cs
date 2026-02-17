using EscapeRoom.Api.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EscapeRoom.Api.Controllers;

[ApiController]
[Route("api/games")]
public class GamesController : ControllerBase
{
    private readonly AppDbContext _db;

    public GamesController(AppDbContext db) => _db = db;

    [HttpGet("{gameId:guid}/challenges/random")]
    public async Task<IActionResult> GetRandomChallenge(Guid gameId)
    {
        // 1. Hämta hela challenge-objektet först (utan .Select)
        var challenge = await _db.Challenges
            .Where(c => c.GameId == gameId && c.IsActive)
            .OrderBy(c => Guid.NewGuid())
            .FirstOrDefaultAsync();

        if (challenge is null)
            return NotFound("No challenges found for this game.");

        // 2. SÄKERHETSÅTGÄRD: Räkna ut indexet dynamiskt här.
        // Detta fixar problemet om databasen har fel index sparat.
        int calculatedIndex = challenge.Options.IndexOf(challenge.Answer);

        // Om svaret inte finns i listan (t.ex. stavfel i databasen), sätt till -1 eller 0
        if (calculatedIndex == -1) calculatedIndex = 0; 

        // 3. Skapa responsen manuellt
        var response = new 
        { 
            challenge.Id, 
            Type = challenge.Type.ToString(), // Konvertera Enum till sträng
            challenge.Prompt, 
            challenge.ImageUrl, 
            challenge.Options, 
            challenge.TimeLimitSeconds, 
            // Skicka det uträknade indexet istället för det lagrade
            CorrectOptionIndex = calculatedIndex 
        };

        return Ok(response);
    }
}