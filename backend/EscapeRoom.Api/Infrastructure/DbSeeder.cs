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

        var game3 = await db.Games.FirstOrDefaultAsync(g => g.Title == "Digital Säkerhet (Game 3)");
        if (game3 == null)
        {
             game3 = new Game
            {
                Mode = gymnasium,
                Title = "Digital Säkerhet (Game 3)",
                MaxDurationSeconds = 600
            };
            db.Games.Add(game3);
        }

        var game4 = await db.Games.FirstOrDefaultAsync(g => g.Title == "Pixeljakten (Game 4)");
        if (game4 == null)
        {
             game4 = new Game
            {
                Mode = gymnasium,
                Title = "Pixeljakten (Game 4)",
                MaxDurationSeconds = 600
            };
            db.Games.Add(game4);
        }

        var game5 = await db.Games.FirstOrDefaultAsync(g => g.Title == "Sortera Rätt (Game 5)");
        if (game5 == null)
        {
             game5 = new Game
            {
                Mode = gymnasium,
                Title = "Sortera Rätt (Game 5)",
                MaxDurationSeconds = 600
            };
            db.Games.Add(game5);
        }

        // 👆 SLUT PÅ DET SAKNADE BLOCKET 👆

        // Vi sparar spelen först så de får ID:n innan vi kopplar frågor
        await db.SaveChangesAsync();

        // --- Helper funktion ---
        Challenge CreateChallenge(Game game, string prompt, string answer, int time, List<string> options, ChallengeType type, string? img = null)
        {
            var index = options.IndexOf(answer);

            if (type != ChallengeType.Sorting)
            {
                index = options.IndexOf(answer);    
                if (index == -1) throw new Exception($"Answer '{answer}' not found in options for '{prompt}'");
            }
            else
            {
                index = 0;
            }
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

        if (!await db.Challenges.AnyAsync(c => c.GameId == game3.Id))
        {
            var tfOptions = new List<string> { "Sant", "Falskt" };

            // Fråga 1: Backup
            newChallenges.Add(CreateChallenge(
                game3,
                "Backup av data gör att system aldrig kan få problem.", // Påstående
                "Falskt", // Rätt svar
                10,      // Tid (kortare för snabba frågor)
                tfOptions,
                ChallengeType.TrueFalse
            ));

            // Fråga 2: Trafikinformation
            newChallenges.Add(CreateChallenge(
                game3,
                "Trafikinformation som visas för allmänheten bygger ofta på realtidsdata.",
                "Sant",
                10,
                tfOptions,
                ChallengeType.TrueFalse
            ));

            // Fråga 3: IT-problem
            newChallenges.Add(CreateChallenge(
                game3,
                "IT-problem kan få konsekvenser även om inga vägar är avstängda.",
                "Sant",
                10,
                tfOptions,
                ChallengeType.TrueFalse
            ));
        }

        if (!await db.Challenges.AnyAsync(c => c.GameId == game4.Id))
        {
            // Exempel 1: Ett tåg
            newChallenges.Add(CreateChallenge(
                game4,
                "Vad döljer sig bakom pixlarna?",
                "Snabbtåg",
                30, // Lite mer tid för att hinna klicka
                new List<string> { "Godståg", "Snabbtåg", "Spårvagn" },
                ChallengeType.PixelHunt,
                "/images/pixel/train.jpg" // Se till att denna bild finns!
            ));

            // Exempel 2: En övervakningskamera
            newChallenges.Add(CreateChallenge(
                game4,
                "Vilken teknisk utrustning ser du?",
                "Fartkamera",
                30,
                new List<string> { "Gatubelysning", "Fartkamera", "Trafikljus" },
                ChallengeType.PixelHunt,
                "/images/pixel/camera.jpg"
            ));

            // Exempel 3: En vägkon
            newChallenges.Add(CreateChallenge(
                game4,
                "Vad är detta för objekt?",
                "Vägkon",
                30,
                new List<string> { "Vägkon", "Hinder", "Stolpe" },
                ChallengeType.PixelHunt,
                "/images/pixel/cone.jpg"
            ));
        }

        if (!await db.Challenges.AnyAsync(c => c.GameId == game5.Id))
        {
            // Vi skapar en lista med alla ord
            var allWords = new List<string> 
            { 
                // IKT Ord
                "Serverhall", "Fiberkabel", "Databas",
                // Trafik Ord
                "Vägräcke", "Signalsystem", "Asfalt",
                // Miljö Ord
                "Viltstängsel", "Bullerplank", "Ecoduct",
                // Felaktiga ord (Distractors)
                "Kaffemaskin", "Semester", "Hundvalp"
            };

            // Vi skapar facit manuellt som en JSON-sträng
            // OBS: Vi använder enkla citattecken inuti strängen för att slippa escape:a allt
            string jsonAnswer = "{\"IKT\":[\"Serverhall\",\"Fiberkabel\",\"Databas\"], \"Trafik\":[\"Vägräcke\",\"Signalsystem\",\"Asfalt\"], \"Miljö\":[\"Viltstängsel\",\"Bullerplank\",\"Ecoduct\"]}";

            newChallenges.Add(CreateChallenge(
                game5,
                "Sortera begreppen till rätt avdelning på Trafikverket. Se upp för ord som inte hör hemma någonstans!",
                jsonAnswer, // Här skickar vi JSON-facit
                60, 
                allWords, // Alla ord blandade
                ChallengeType.Sorting
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