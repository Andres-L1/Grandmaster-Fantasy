import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface LichessBroadcast {
    id: string;
    name: string;
    description: string;
}

interface LichessGame {
    id: string;
    white: { name: string; fideId?: string };
    black: { name: string; fideId?: string };
    result?: string; // "1-0", "0-1", "1/2-1/2"
    status: string;
}

export class LichessService {
    private static readonly LICHESS_API_URL = 'https://lichess.org/api';

    /**
     * Fetch active broadcasts (tournaments) from Lichess
     */
    static async fetchActiveTournaments(): Promise<LichessBroadcast[]> {
        try {
            const response = await fetch(`${this.LICHESS_API_URL}/broadcast`, {
                headers: {
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Lichess API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.active || [];
        } catch (error) {
            console.error('❌ Error fetching Lichess broadcasts:', error);
            return [];
        }
    }

    /**
     * Fetch games from a specific tournament broadcast
     */
    static async fetchTournamentGames(broadcastId: string): Promise<LichessGame[]> {
        try {
            const response = await fetch(`${this.LICHESS_API_URL}/broadcast/${broadcastId}/pgn`, {
                headers: {
                    Accept: 'application/x-chess-pgn'
                }
            });

            if (!response.ok) {
                throw new Error(`Lichess API error: ${response.statusText}`);
            }

            const pgnData = await response.text();
            return this.parsePGN(pgnData);
        } catch (error) {
            console.error(`❌ Error fetching games for broadcast ${broadcastId}:`, error);
            return [];
        }
    }

    /**
     * Parse PGN data to extract game results
     */
    static parsePGN(pgn: string): LichessGame[] {
        const games: LichessGame[] = [];
        const gameBlocks = pgn.split('\n\n\n').filter((block) => block.trim());

        for (const block of gameBlocks) {
            const lines = block.split('\n');
            let white = '';
            let black = '';
            let result = '';
            let whiteFideId = '';
            let blackFideId = '';

            for (const line of lines) {
                if (line.startsWith('[White "')) {
                    white = line.match(/\[White "(.+?)"\]/)?.[1] || '';
                } else if (line.startsWith('[Black "')) {
                    black = line.match(/\[Black "(.+?)"\]/)?.[1] || '';
                } else if (line.startsWith('[Result "')) {
                    result = line.match(/\[Result "(.+?)"\]/)?.[1] || '';
                } else if (line.startsWith('[WhiteFideId "')) {
                    whiteFideId = line.match(/\[WhiteFideId "(.+?)"\]/)?.[1] || '';
                } else if (line.startsWith('[BlackFideId "')) {
                    blackFideId = line.match(/\[BlackFideId "(.+?)"\]/)?.[1] || '';
                }
            }

            if (white && black && result && result !== '*') {
                games.push({
                    id: `${whiteFideId}-${blackFideId}-${Date.now()}`,
                    white: { name: white, fideId: whiteFideId },
                    black: { name: black, fideId: blackFideId },
                    result,
                    status: 'finished'
                });
            }
        }

        return games;
    }

    /**
     * Find player by FIDE ID or name
     */
    static async findPlayer(fideId?: string, name?: string) {
        if (fideId) {
            return await prisma.realPlayer.findUnique({ where: { fideId } });
        } else if (name) {
            // Fuzzy match by name
            return await prisma.realPlayer.findFirst({
                where: {
                    name: {
                        contains: name,
                        mode: 'insensitive'
                    }
                }
            });
        }
        return null;
    }

    /**
     * Sync match results from Lichess to database
     * This should run every 10 minutes via cron
     */
    static async syncMatchResults(): Promise<void> {
        try {
            console.log('🔄 Starting Lichess sync...');

            // Get active tournaments from our DB
            const activeTournaments = await prisma.tournament.findMany({
                where: { status: 'active' }
            });

            for (const tournament of activeTournaments) {
                console.log(`📊 Syncing tournament: ${tournament.name}`);

                // Fetch games from Lichess
                const games = await this.fetchTournamentGames(tournament.lichessId);

                for (const game of games) {
                    // Find players in our database
                    const whitePlayer = await this.findPlayer(game.white.fideId, game.white.name);
                    const blackPlayer = await this.findPlayer(game.black.fideId, game.black.name);

                    if (!whitePlayer || !blackPlayer) {
                        console.log(
                            `⚠️ Players not found: ${game.white.name} or ${game.black.name}`
                        );
                        continue;
                    }

                    // Check if match already exists
                    const existingMatch = await prisma.matchResult.findFirst({
                        where: {
                            tournamentId: tournament.id,
                            whitePlayerId: whitePlayer.id,
                            blackPlayerId: blackPlayer.id,
                            result: game.result
                        }
                    });

                    if (!existingMatch) {
                        // Create new match result
                        await prisma.matchResult.create({
                            data: {
                                tournamentId: tournament.id,
                                whitePlayerId: whitePlayer.id,
                                blackPlayerId: blackPlayer.id,
                                result: game.result || '1/2-1/2',
                                processed: false
                            }
                        });

                        console.log(
                            `✅ New match: ${whitePlayer.name} vs ${blackPlayer.name} - ${game.result}`
                        );
                    }
                }
            }

            console.log('✅ Lichess sync completed');
        } catch (error) {
            console.error('❌ Error syncing Lichess data:', error);
        }
    }
}

export default prisma;
