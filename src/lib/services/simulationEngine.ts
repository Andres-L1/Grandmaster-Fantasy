import type { CompetitionTeam, MatchResult } from "../types/competition";

export class SimulationEngine {

    // Generate Bot Teams with varied difficulty
    static generateBots(): CompetitionTeam[] {
        const botNames = [
            { name: "Magnus FC", rating: 2800 },
            { name: "Hikaru Knights", rating: 2750 },
            { name: "Nepo Gambit", rating: 2700 },
            { name: "Ding United", rating: 2650 },
            { name: "Fabi Stars", rating: 2600 },
            { name: "Gukesh Generation", rating: 2550 },
            { name: "Pragg Power", rating: 2500 },
            { name: "Giri Draws", rating: 2450 },
            { name: "Levon Artists", rating: 2400 }
        ];

        return botNames.map((bot, index) => ({
            id: `bot-${index}`,
            name: bot.name,
            isUser: false,
            rating: bot.rating,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            points: 0,
            gf: 0,
            ga: 0
        }));
    }

    // Simulate score based on Elo difference
    // Returns [homeScore, awayScore]
    static simulateMatch(homeRating: number, awayRating: number): [number, number] {
        const ratingDiff = homeRating - awayRating;

        // Base probability boosted by home advantage (+50 Elo equivalent)
        const winProbability = 1 / (1 + Math.pow(10, (-ratingDiff - 50) / 400));

        // Random rolls
        const roll = Math.random();

        let homeScore = 0;
        let awayScore = 0;

        // Determine Winner first
        if (roll < winProbability - 0.15) {
            // Home Win
            homeScore = Math.floor(Math.random() * 3) + 1; // 1 to 3
            awayScore = Math.floor(Math.random() * homeScore); // Less than home
        } else if (roll > winProbability + 0.15) {
            // Away Win
            awayScore = Math.floor(Math.random() * 3) + 1;
            homeScore = Math.floor(Math.random() * awayScore);
        } else {
            // Draw
            const drawScore = Math.floor(Math.random() * 3);
            homeScore = drawScore;
            awayScore = drawScore;
        }

        // Logic check to prevent negative (shouldn't happen with math.floor but strictness helps)
        return [Math.max(0, homeScore), Math.max(0, awayScore)];
    }
}
