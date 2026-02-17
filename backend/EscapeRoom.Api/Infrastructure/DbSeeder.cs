using EscapeRoom.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace EscapeRoom.Api.Infrastructure;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        // 1. Om det redan finns mycket data, gör inget (snabb-check)
        if (await db.Challenges.CountAsync() > 5) return;

        // 2. Hämta eller skapa Mode (Gymnasium)
        var gymnasium = await db.Modes.FirstOrDefaultAsync(m => m.Key == "gymnasium");
        if (gymnasium == null)
        {
            gymnasium = new Mode { Key = "gymnasium", Name = "Gymnasium" };
            db.Modes.Add(gymnasium);
            await db.SaveChangesAsync(); // Spara mode direkt så vi har ett ID
        }

        // 3. Hämta eller skapa Game 1
        var game1 = await db.Games.FirstOrDefaultAsync(g => g.Title == "Trafikverket (Gymnasium)");
        if (game1 == null)
        {    
            game1 = new Game
            {
                Mode = gymnasium,
                Title = "Trafikverket (Gymnasium)", // OBS: Samma titel som vi söker på!
                MaxDurationSeconds = 600
            };
            db.Games.Add(game1);
        }

        // 4. Hämta eller skapa Game 2
        var game2 = await db.Games.FirstOrDefaultAsync(g => g.Title == "Risk & Säkerhet (Game 2)");
        if (game2 == null)
        {
             game2 = new Game
            {
                Mode = gymnasium,
                Title = "Risk & Säkerhet (Game 2)", // OBS: Samma titel som vi söker på!
                MaxDurationSeconds = 600
            };
            db.Games.Add(game2);
        }

        // Vi sparar spelen först så de får ID:n innan vi kopplar frågor
        await db.SaveChangesAsync();

        // --- Helper funktion ---
        Challenge CreateChallenge(Game game, string prompt, string answer, int time, List<string> options, ChallengeType type, string? img = null)
        {
            var index = options.IndexOf(answer);
            if (index == -1) throw new Exception($"Answer '{answer}' not found in options for '{prompt}'");

            return new Challenge
            {
                Game = game,
                Type = type,
                Prompt = prompt,
                Answer = answer,
                TimeLimitSeconds = time,
                Options = options,
                CorrectOptionIndex = index,
                ImageUrl = img
            };
        }

        var newChallenges = new List<Challenge>();

        // --- LÄGG TILL DATA FÖR GAME 1 ---
        // Kolla om Game 1 saknar frågor
        if (!await db.Challenges.AnyAsync(c => c.GameId == game1.Id))
        {
            // Mockup 1: Question
            newChallenges.Add(CreateChallenge(
                game1, // <--- HÄR SAKNADES "game1" I DIN KOD
                "Vilket är det säkraste sättet att färdas på?",
                "Flygplan",
                15,
                new List<string> { "Bil", "Cykel", "Flygplan", "Båt" },
                ChallengeType.Question
            ));

            // Mockup 2: Image
            newChallenges.Add(CreateChallenge(
                game1, // <--- HÄR SAKNADES "game1"
                "Vad betyder vägmärket på bilden?",
                "Huvudled",
                15,
                new List<string> { "Stop", "Huvudled", "Väjningsplikt", "Förbud mot infart" },
                ChallengeType.ImageQuestion,
                "/images/signs/huvudled.png"
            ));

            // Mockup 3: Riddle
            newChallenges.Add(CreateChallenge(
                game1, // <--- HÄR SAKNADES "game1"
                "Lös rebusen: 🛑 + 🚦 + 🚧 Vad blir ordet?",
                "Trafiksäkerhet", 
                20, 
                new List<string> { "Trafiksäkerhet", "Vägunderhåll", "Trafikstockning", "Vägarbete" },
                ChallengeType.Riddle
            ));
        }

        // --- LÄGG TILL DATA FÖR GAME 2 (MATCHNING) ---
        // Kolla om Game 2 saknar frågor
        if (!await db.Challenges.AnyAsync(c => c.GameId == game2.Id))
        {
            var matchingOptions = new List<string> 
            { 
                "Halt väglag", 
                "Järnvägskorsning", 
                "Skola" 
            };

            // Påstående 1
            newChallenges.Add(CreateChallenge(
                game2, 
                "Här har Trafikverket ansvar för att tekniken fungerar, men du har ansvar för att förstå att 100 km/h på räls inte går att diskutera med.", 
                "Järnvägskorsning", 
                20, 
                matchingOptions, 
                ChallengeType.Matching
            ));

            // Påstående 2
            newChallenges.Add(CreateChallenge(
                game2,
                "Vägen har blivit lika opålitlig ena sekunden ser det lugnt ut, nästa sekund tappar du kontrollen.",
                "Halt väglag",
                20,
                matchingOptions,
                ChallengeType.Matching
            ));

            // Påstående 3
            newChallenges.Add(CreateChallenge(
                game2,
                "Vi designar miljöer för de mest sårbara. Här handlar det om att sänka farten genom 'fysiska hinder' eftersom vi vet att människor gör misstag i trafiken.",
                "Skola",
                20,
                matchingOptions,
                ChallengeType.Matching
            ));
        }

        // Spara alla nya utmaningar om det finns några
        if (newChallenges.Count > 0)
        {    
            db.Challenges.AddRange(newChallenges);
            await db.SaveChangesAsync();
        }
    }
}