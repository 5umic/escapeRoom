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

    // 1. Admin: Skapa spel och utmaningar
    [HttpPost("challenges")]
    public async Task<IActionResult> CreateChallenge([FromBody] Challenge challenge)
    {
        if (challenge == null) return BadRequest();

        // Säkerställ att ID nollställs så databasen kan generera ett nytt GUID
        challenge.Id = Guid.NewGuid();

        _db.Challenges.Add(challenge);
        await _db.SaveChangesAsync();

        return Ok(challenge);
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

    // 6. Ta bort en specifik utmaning
    [HttpDelete("challenges/{id}")]
    public async Task<IActionResult> DeleteChallenge(Guid id)
    {
        var challenge = await _db.Challenges.FindAsync(id);
        if (challenge == null)
        {
            return NotFound();
        }

        _db.Challenges.Remove(challenge);
        await _db.SaveChangesAsync();

        return Ok();
    }

    // 7. Admin: Hämta info om ett specifikt spel
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetGame(Guid id)
    {
        var game = await _db.Games
            .Select(g => new { g.Id, g.Title, g.IsActive })
            .FirstOrDefaultAsync(g => g.Id == id);

        if (game == null) return NotFound();
        return Ok(game);
    }

    // 8. Högskola: Hämta infotext för ett spel
    [HttpGet("hogskola-info/{gameKey}")]
    public async Task<IActionResult> GetHogskolaInfo(string gameKey)
    {
        var normalizedKey = gameKey.Trim().ToLowerInvariant();
        var info = await _db.HogskolaInfoContents
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.GameKey == normalizedKey);

        if (info == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            info.Id,
            info.GameKey,
            info.Heading,
            info.Body,
            info.UpdatedAtUtc
        });
    }

    public sealed class UpdateHogskolaInfoRequest
    {
        public string Heading { get; set; } = "";
        public string Body { get; set; } = "";
    }

    // 9. Högskola: Uppdatera infotext för ett spel
    [HttpPut("hogskola-info/{gameKey}")]
    public async Task<IActionResult> UpdateHogskolaInfo(string gameKey, [FromBody] UpdateHogskolaInfoRequest request)
    {
        if (request == null) return BadRequest();

        var normalizedKey = gameKey.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(normalizedKey)) return BadRequest("Ogiltig gameKey.");

        var heading = request.Heading?.Trim() ?? "";
        var body = request.Body?.Trim() ?? "";
        if (string.IsNullOrWhiteSpace(heading) || string.IsNullOrWhiteSpace(body))
        {
            return BadRequest("Heading och Body är obligatoriska.");
        }

        var info = await _db.HogskolaInfoContents
            .FirstOrDefaultAsync(c => c.GameKey == normalizedKey);

        if (info == null)
        {
            info = new HogskolaInfoContent
            {
                GameKey = normalizedKey,
                Heading = heading,
                Body = body,
                UpdatedAtUtc = DateTime.UtcNow
            };
            _db.HogskolaInfoContents.Add(info);
        }
        else
        {
            info.Heading = heading;
            info.Body = body;
            info.UpdatedAtUtc = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            info.Id,
            info.GameKey,
            info.Heading,
            info.Body,
            info.UpdatedAtUtc
        });
    }

    // 10. Högskola: Lista alla infotexter för admin
    [HttpGet("hogskola-info")]
    public async Task<IActionResult> GetAllHogskolaInfo()
    {
        var all = await _db.HogskolaInfoContents
            .AsNoTracking()
            .OrderBy(c => c.GameKey)
            .Select(c => new
            {
                c.Id,
                c.GameKey,
                c.Heading,
                c.Body,
                c.UpdatedAtUtc
            })
            .ToListAsync();

        return Ok(all);
    }

    // 11. Admin: Ladda upp en bild
    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage([FromForm] IFormFile file, [FromForm] string folder)
    {
        if (file == null || file.Length == 0) return BadRequest("Ingen fil vald.");

        var normalizedFolder = (folder ?? string.Empty).Trim().ToLowerInvariant() switch
        {
            "pixels" => "pixel",
            "pixel" => "pixel",
            "signs" => "signs",
            "logos" => "logos",
            _ => "minigame-assets"
        };

        // Store uploads in canonical frontend assets location.
        var rootPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "public", "assets", "images", normalizedFolder);

        // Skapa mappen om den inte finns (viktigt!)
        if (!Directory.Exists(rootPath))
        {
            Directory.CreateDirectory(rootPath);
        }

        var fileName = Path.GetFileName(file.FileName);
        var filePath = Path.Combine(rootPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var imageUrl = $"/assets/images/{normalizedFolder}/{fileName}";
        
        return Ok(new { url = imageUrl });
    }
}
