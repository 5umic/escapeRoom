using EscapeRoom.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace EscapeRoom.Api.Infrastructure;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        // 1. Om det redan finns mycket data, gör inget
        if (await db.Challenges.CountAsync() > 20)
        {
            await SeedHogskolaInfoContentAsync(db);
            return;
        }

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
        var game7 = await db.Games.FirstOrDefaultAsync(g => g.Title == "Hänga Gubbe (Game 7)") ?? new Game { Mode = gymnasium, Title = "Hänga Gubbe (Game 7)", MaxDurationSeconds = 600 };

        if (game1.Id == Guid.Empty) db.Games.Add(game1);
        if (game2.Id == Guid.Empty) db.Games.Add(game2);
        if (game3.Id == Guid.Empty) db.Games.Add(game3);
        if (game4.Id == Guid.Empty) db.Games.Add(game4);
        if (game5.Id == Guid.Empty) db.Games.Add(game5);
        if (game6.Id == Guid.Empty) db.Games.Add(game6);
        if (game7.Id == Guid.Empty) db.Games.Add(game7);

        await db.SaveChangesAsync();

        // ---------------------------------------------------
        // HELPER FUNKTION (FIXAD FÖR BÅDE GAME 5 OCH GAME 6)
        // ---------------------------------------------------
        Challenge CreateChallenge(Game game, string prompt, string answer, int time, List<string> options, ChallengeType type, string? img = null)
        {
            int index = -1;

            // VIKTIG FIX: Hoppa över indexkoll för BÅDE Sorting (Game 5) och WordAssembly (Game 6)
            if (type != ChallengeType.Sorting && type != ChallengeType.WordAssembly && type != ChallengeType.Hangman)
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

        // ---------------------------------------------------
        // GAME 7 DATA (HANGMAN)
        // ---------------------------------------------------
        if (!await db.Challenges.AnyAsync(c => c.GameId == game7.Id))
        {
            newChallenges.Add(CreateChallenge(game7, 
                "Gissa ordet! (En svensk myndighet)", 
                "TRAFIKVERKET", // Svaret (Viktigt med stora bokstäver)
                120, 
                new List<string> { "TRAFIKVERKET" }, // Behövs bara för databasstrukturen
                ChallengeType.Hangman));
        }

        if (newChallenges.Count > 0)
        {    
            db.Challenges.AddRange(newChallenges);
            await db.SaveChangesAsync();
        }

        await SeedHogskolaInfoContentAsync(db);
    }

    private static async Task SeedHogskolaInfoContentAsync(AppDbContext db)
    {
        var defaults = new Dictionary<string, (string heading, string body)>
        {
            ["game1"] = (
                "HÄRLIGT!",
                "Inom Trafikverket står IKT för Informations- och Kommunikationsteknik. Det omfattar hela infrastrukturen för dataöverföring, IT-system och kommunikationslösningar som används för att styra och övervaka Sveriges transportinfrastruktur.\n\n" +
                "Trafikverket hanterar omfattande IKT-system för järnvägstrafikledning och vägtrafikinformation - allt från skyltar och kameror till avancerade övervakningssystem. IKT-säkerhet är en kritisk del av verksamheten där vi arbetar kontinuerligt med att skydda våra system mot cyberattacker och säkerställa att transportsystemet fungerar utan avbrott.\n\n" +
                "Genom digitalisering använder Trafikverket IKT för att effektivisera underhåll av vägar och järnvägar. Med hjälp av sensorer och realtidsdata (IoT) kan vi förutse behov och agera innan problem uppstår."
            ),
            ["game2"] = (
                "Du är helt grym!",
                "\"Alla kommer fram smidigt, grönt och tryggt\" - detta är en av Trafikverkets kärnvärden när det gäller trafikplanering och infrastruktur.\n\n" +
                "Smidighet i trafikflöden, gröna hållbara lösningar och trygghet för alla trafikanter är grundläggande principer i vårt arbete. Som IT-utvecklare på Trafikverket bidrar du till att skapa system som hjälper till att uppnå dessa mål.\n\n" +
                "Genom att utveckla intelligenta trafikstyrningssystem, realtidsövervakning och dataanalys hjälper vi till att göra Sveriges vägar och järnvägar säkrare och mer effektiva."
            ),
            ["game3"] = (
                "Fantastiskt!",
                "Du har visat god kunskap om trafiksäkerhet. Varje år skadas och dör människor i trafiken på grund av misstag som kunde undvikas. Genom att följa säkerhetsrutiner, anpassa hastigheten och vara uppmärksam räddar du liv - både ditt eget och andras.\n\n" +
                "På Trafikverket arbetar vi kontinuerligt med att förbättra trafiksäkerheten genom utbildning, infrastruktur och smarta IT-lösningar. Varje decision vi tar i vårt arbete kan bidra till att göra Sveriges vägar och järnvägar säkrare för alla."
            ),
            ["game4"] = (
                "UTMÄRKT!",
                "Vår logotyp symboliserar det ansvar vi bär och den service vi levererar till svenska folket varje dag. Vi är stolta över att representera Trafikverket och att vara en del av Sveriges infrastruktur. Genom vårt arbete bidrar vi till ett samhälle där människor kan resa säkert, hållbart och effektivt - det är ett uppdrag vi tar på största allvar och utför med stolthet.\n\n" +
                "Trafikverket är en myndighet under Infrastrukturdepartementet med ansvar för långsiktig planering av transportsystemet för vägtrafik, järnvägstrafik, sjöfart och luftfart. Vi ansvarar för byggande, drift och underhåll av statliga vägar och järnvägar.\n\n" +
                "Vårt uppdrag är att svara för den samlade sektorsuppföljningen och för samordning, planering och samverkan för att nå målen i transportpolitiken. Vi arbetar för ett tillgängligt Sverige med en hållbar och jämlik transportförsörjning där hänsyn tas till människors säkerhet och miljön.\n\n" +
                "Genom innovation och digitalisering utvecklar vi smarta lösningar för framtidens transporter. IKT och cybersäkerhet är centrala delar i denna utveckling där vi kontinuerligt arbetar med att skydda våra system samtidigt som vi gör dem mer effektiva och tillgängliga."
            ),
            ["game5"] = (
                "UTMÄRKT!",
                "Varje symbol i detta memory-spel representerar en viktig del av vårt transportsystem. Från bilar och bussar till tåg och järnvägar - allt är sammankopplat i ett komplext nätverk som Trafikverket ansvarar för att planera, bygga och underhålla.\n\n" +
                "Trafikmärken och vägskyltar är centrala för trafiksäkerheten. De kommunicerar snabbt och tydligt med alla trafikanter, oavsett språk. Att förstå och respektera dessa symboler är avgörande för ett säkert transportsystem.\n\n" +
                "Som IT-specialist på Trafikverket kan du arbeta med digitala lösningar för allt från trafikstyrning och vägväder till reseinformation och järnvägssignaler. Våra system hanterar miljontals datapunkter varje dag för att hålla Sverige i rörelse."
            ),
            ["game6"] = (
                "SUPER BRA!",
                "Säkerhet är en central del av Trafikverkets IT-verksamhet. Varje dag arbetar vi med att skydda känslig information och säkerställa att våra system är robusta mot hot.\n\n" +
                "Genom att använda webbläsarens utvecklarverktyg kan du inspektera hur webbsidor fungerar \"bakom kulisserna\". Detta är viktiga verktyg för utvecklare, men också för att förstå säkerhetsaspekter. Att kunna granska nätverkstrafik, läsa konsolmeddelanden och inspektera källkod är grundläggande färdigheter inom säker webbutveckling.\n\n" +
                "På Trafikverket använder vi dessa verktyg dagligen för att säkerställa att vår kod är säker och att inga känsliga uppgifter exponeras oavsiktligt."
            ),
            ["game7"] = (
                "Otroligt bra!",
                "Du har framgångsrikt kartlagt nätverksarkitekturen. I moderna system följer data en logisk väg från klient till server, genom säkerhetslager och cache-system, innan den slutligen når databaser och lagring.\n\n" +
                "På Trafikverket arbetar vi med komplexa nätverksarkitekturer för att säkerställa att våra system är både säkra och snabba. Varje komponent i kedjan har sin specifika roll - från lastbalansering till autentisering och caching.\n\n" +
                "Genom att förstå hur data flödar genom systemen kan vi bygga robusta lösningar som hanterar Sveriges transportinfrastruktur dygnet runt."
            ),
        };

        var existingKeys = await db.HogskolaInfoContents
            .Select(c => c.GameKey)
            .ToListAsync();

        var now = DateTime.UtcNow;
        foreach (var entry in defaults)
        {
            if (existingKeys.Contains(entry.Key)) continue;

            db.HogskolaInfoContents.Add(new HogskolaInfoContent
            {
                GameKey = entry.Key,
                Heading = entry.Value.heading,
                Body = entry.Value.body,
                UpdatedAtUtc = now,
            });
        }

        await db.SaveChangesAsync();
    }
}