using EscapeRoom.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace EscapeRoom.Api.Infrastructure;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        // 1. Om det redan finns mycket data, gör inget
        if (await db.Challenges.CountAsync() > 20) return;

        // ---------------------------------------------------
        // SKAPA MODE OCH SPEL
        // ---------------------------------------------------

        var gymnasium = await db.Modes.FirstOrDefaultAsync(m => m.Key == "gymnasium");
        if (gymnasium == null)
        {
            gymnasium = new Mode { Key = "gymnasium", Name = "Gymnasium" };
            db.Modes.Add(gymnasium);
            await db.SaveChangesAsync();
        }

        var game1 = await db.Games.FirstOrDefaultAsync(g => g.Title == "Trafikverket (Gymnasium)") ?? new Game { Mode = gymnasium, Title = "Trafikverket (Gymnasium)", MaxDurationSeconds = 600 };
        var game2 = await db.Games.FirstOrDefaultAsync(g => g.Title == "Risk & Säkerhet (Game 2)") ?? new Game { Mode = gymnasium, Title = "Risk & Säkerhet (Game 2)", MaxDurationSeconds = 600 };
        var game3 = await db.Games.FirstOrDefaultAsync(g => g.Title == "Digital Säkerhet (Game 3)") ?? new Game { Mode = gymnasium, Title = "Digital Säkerhet (Game 3)", MaxDurationSeconds = 600 };
        var game4 = await db.Games.FirstOrDefaultAsync(g => g.Title == "Pixeljakten (Game 4)") ?? new Game { Mode = gymnasium, Title = "Pixeljakten (Game 4)", MaxDurationSeconds = 600 };
        var game5 = await db.Games.FirstOrDefaultAsync(g => g.Title == "Sortera Rätt (Game 5)") ?? new Game { Mode = gymnasium, Title = "Sortera Rätt (Game 5)", MaxDurationSeconds = 600 };
        var game6 = await db.Games.FirstOrDefaultAsync(g => g.Title == "Bilda Ordet (Game 6)") ?? new Game { Mode = gymnasium, Title = "Bilda Ordet (Game 6)", MaxDurationSeconds = 600 };

        if (game1.Id == Guid.Empty) db.Games.Add(game1);
        if (game2.Id == Guid.Empty) db.Games.Add(game2);
        if (game3.Id == Guid.Empty) db.Games.Add(game3);
        if (game4.Id == Guid.Empty) db.Games.Add(game4);
        if (game5.Id == Guid.Empty) db.Games.Add(game5);
        if (game6.Id == Guid.Empty) db.Games.Add(game6);

        await db.SaveChangesAsync();

        // ---------------------------------------------------
        // HELPER FUNKTION (FIXAD FÖR BÅDE GAME 5 OCH GAME 6)
        // ---------------------------------------------------
        Challenge CreateChallenge(Game game, string prompt, string answer, int time, List<string> options, ChallengeType type, string? img = null)
        {
            int index = -1;

            // VIKTIG FIX: Hoppa över indexkoll för BÅDE Sorting (Game 5) och WordAssembly (Game 6)
            if (type != ChallengeType.Sorting && type != ChallengeType.WordAssembly)
            {
                index = options.IndexOf(answer);
                if (index == -1) throw new Exception($"Answer '{answer}' not found in options for '{prompt}'");
            }
            else
            {
                // För JSON-svar struntar vi i indexet, frontend löser logiken
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

        // ---------------------------------------------------
        // GAME 1 DATA
        // ---------------------------------------------------
        if (!await db.Challenges.AnyAsync(c => c.GameId == game1.Id))
        {
            newChallenges.Add(CreateChallenge(game1, "Vilket är det säkraste sättet att färdas på?", "Flygplan", 15, new List<string> { "Bil", "Cykel", "Flygplan", "Båt" }, ChallengeType.Question));
            newChallenges.Add(CreateChallenge(game1, "Vad betyder vägmärket på bilden?", "Huvudled", 15, new List<string> { "Stop", "Huvudled", "Väjningsplikt", "Förbud mot infart" }, ChallengeType.ImageQuestion, "/images/signs/huvudled.png"));
            newChallenges.Add(CreateChallenge(game1, "Lös rebusen: 🛑 + 🚦 + 🚧 Vad blir ordet?", "Trafiksäkerhet", 20, new List<string> { "Trafiksäkerhet", "Vägunderhåll", "Trafikstockning", "Vägarbete" }, ChallengeType.Riddle));
        }

        // ---------------------------------------------------
        // GAME 2 DATA
        // ---------------------------------------------------
        if (!await db.Challenges.AnyAsync(c => c.GameId == game2.Id))
        {
            var matchingOptions = new List<string> { "Halt väglag", "Järnvägskorsning", "Skola" };
            newChallenges.Add(CreateChallenge(game2, "Här har Trafikverket ansvar för att tekniken fungerar, men du har ansvar för att förstå att 100 km/h på räls inte går att diskutera med.", "Järnvägskorsning", 20, matchingOptions, ChallengeType.Matching));
            newChallenges.Add(CreateChallenge(game2, "Vägen har blivit lika opålitlig ena sekunden ser det lugnt ut, nästa sekund tappar du kontrollen.", "Halt väglag", 20, matchingOptions, ChallengeType.Matching));
            newChallenges.Add(CreateChallenge(game2, "Vi designar miljöer för de mest sårbara. Här handlar det om att sänka farten genom 'fysiska hinder' eftersom vi vet att människor gör misstag i trafiken.", "Skola", 20, matchingOptions, ChallengeType.Matching));
        }

        // ---------------------------------------------------
        // GAME 3 DATA
        // ---------------------------------------------------
        if (!await db.Challenges.AnyAsync(c => c.GameId == game3.Id))
        {
            var tfOptions = new List<string> { "Sant", "Falskt" };
            newChallenges.Add(CreateChallenge(game3, "Backup av data gör att system aldrig kan få problem.", "Falskt", 15, tfOptions, ChallengeType.TrueFalse));
            newChallenges.Add(CreateChallenge(game3, "Trafikinformation som visas för allmänheten bygger ofta på realtidsdata.", "Sant", 15, tfOptions, ChallengeType.TrueFalse));
            newChallenges.Add(CreateChallenge(game3, "IT-problem kan få konsekvenser även om inga vägar är avstängda.", "Sant", 15, tfOptions, ChallengeType.TrueFalse));
        }

        // ---------------------------------------------------
        // GAME 4 DATA
        // ---------------------------------------------------
        if (!await db.Challenges.AnyAsync(c => c.GameId == game4.Id))
        {
            newChallenges.Add(CreateChallenge(game4, "Vad döljer sig bakom pixlarna?", "Snabbtåg", 30, new List<string> { "Godståg", "Snabbtåg", "Spårvagn" }, ChallengeType.PixelHunt, "/images/pixel/train.jpg"));
            newChallenges.Add(CreateChallenge(game4, "Vilken teknisk utrustning ser du?", "Fartkamera", 30, new List<string> { "Gatubelysning", "Fartkamera", "Trafikljus" }, ChallengeType.PixelHunt, "/images/pixel/camera.jpg"));
            newChallenges.Add(CreateChallenge(game4, "Vad är detta för objekt?", "Vägkon", 30, new List<string> { "Vägkon", "Hinder", "Stolpe" }, ChallengeType.PixelHunt, "/images/pixel/cone.jpg"));
        }

        // ---------------------------------------------------
        // GAME 5 DATA
        // ---------------------------------------------------
        if (!await db.Challenges.AnyAsync(c => c.GameId == game5.Id))
        {
            var allWords = new List<string> 
            { 
                "Serverhall", "Fiberkabel", "Databas",
                "Vägräcke", "Signalsystem", "Asfalt",
                "Viltstängsel", "Bullerplank", "Ecoduct",
                "Kaffemaskin", "Semester", "Hundvalp"
            };

            string jsonAnswer = "{\"IKT\":[\"Serverhall\",\"Fiberkabel\",\"Databas\"], \"Trafik\":[\"Vägräcke\",\"Signalsystem\",\"Asfalt\"], \"Miljö\":[\"Viltstängsel\",\"Bullerplank\",\"Ecoduct\"]}";

            newChallenges.Add(CreateChallenge(
                game5, "Sortera begreppen till rätt avdelning på Trafikverket. Se upp för ord som inte hör hemma någonstans!",
                jsonAnswer, 60, allWords, ChallengeType.Sorting
            ));
        }

        // ---------------------------------------------------
        // GAME 6 DATA (NYTT)
        // ---------------------------------------------------
        if (!await db.Challenges.AnyAsync(c => c.GameId == game6.Id))
        {
            newChallenges.Add(CreateChallenge(game6, "Dra rutorna så de bildar ett korrekt sammansatt ord.",
                "[\"Trafik\", \"Informations\", \"System\"]", 30, 
                new List<string> { "Trafik", "Informations", "System" }, ChallengeType.WordAssembly));

            newChallenges.Add(CreateChallenge(game6, "Dra rutorna så de bildar ett korrekt sammansatt ord.",
                "[\"Utsläpps\", \"Minsknings\", \"Strategi\"]", 30, 
                new List<string> { "Utsläpps", "Minsknings", "Strategi" }, ChallengeType.WordAssembly));

            newChallenges.Add(CreateChallenge(game6, "Dra rutorna så de bildar ett korrekt sammansatt ord.",
                "[\"Effektiv\", \"Kostnads\", \"Planering\"]", 30, 
                new List<string> { "Effektiv", "Kostnads", "Planering" }, ChallengeType.WordAssembly));

            newChallenges.Add(CreateChallenge(game6, "Dra rutorna så de bildar ett korrekt sammansatt ord.",
                "[\"IT\", \"Säkerhets\", \"Hantering\"]", 30, 
                new List<string> { "IT", "Säkerhets", "Hantering" }, ChallengeType.WordAssembly));
        }

        if (newChallenges.Count > 0)
        {    
            db.Challenges.AddRange(newChallenges);
            await db.SaveChangesAsync();
        }
    }
}