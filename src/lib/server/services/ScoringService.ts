import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MatchPoints {
    playerId: string;
    points: number;
    isCaptain: boolean;
}

export class ScoringService {
    /**
     * Calculate points for a match result
     * Rules:
     * - Victory: +10
     * - Draw: +3
     * - Defeat: -2
     * - Black Victory Bonus: +2
     * - Winning Streak Bonus: +5 (3+ consecutive wins)
     * - Captain multiplier: 2x
     */
    static async calculateMatchPoints(
        matchResultId: string,
        playerId: string
    ): Promise<number> {
        const match = await prisma.matchResult.findUnique({
            where: { id: matchResultId },
            include: {
                whitePlayer: true,
                blackPlayer: true
            }
        });

        if (!match) return 0;

        let points = 0;
        const isWhitePlayer = match.whitePlayerId === playerId;
        const isBlackPlayer = match.blackPlayerId === playerId;

        if (!isWhitePlayer && !isBlackPlayer) return 0;

        // Base points from result
        if (match.result === '1-0') {
            points = isWhitePlayer ? 10 : -2; // White wins
        } else if (match.result === '0-1') {
            points = isBlackPlayer ? 10 : -2; // Black wins
            // Black victory bonus
            if (isBlackPlayer) points += 2;
        } else if (match.result === '1/2-1/2') {
            points = 3; // Draw
        }

        // Check winning streak
        const hasWinningStreak = await this.checkWinningStreak(playerId);
        if (hasWinningStreak) {
            points += 5;
        }

        return points;
    }

    /**
     * Check if player has a winning streak (3+ consecutive wins)
     */
    static async checkWinningStreak(playerId: string): Promise<boolean> {
        const recentMatches = await prisma.matchResult.findMany({
            where: {
                OR: [{ whitePlayerId: playerId }, { blackPlayerId: playerId }],
                processed: true
            },
            orderBy: { date: 'desc' },
            take: 3
        });

        if (recentMatches.length < 3) return false;

        // Check if all 3 are wins
        return recentMatches.every((match: { whitePlayerId: string; result: string }) => {
            if (match.whitePlayerId === playerId) {
                return match.result === '1-0';
            } else {
                return match.result === '0-1';
            }
        });
    }

    /**
     * Process unprocessed match results and update team scores
     */
    static async processMatchResults(tournamentId: string): Promise<void> {
        try {
            const unprocessedMatches = await prisma.matchResult.findMany({
                where: {
                    tournamentId: tournamentId,
                    processed: false
                },
                include: {
                    whitePlayer: true,
                    blackPlayer: true
                }
            });

            console.log(`Processing ${unprocessedMatches.length} matches for tournament ${tournamentId}`);

            for (const match of unprocessedMatches) {
                // Get all teams in this tournament that have these players
                const teamsWithWhite = await prisma.fantasyTeam.findMany({
                    where: {
                        tournamentId: tournamentId,
                        players: {
                            some: { playerId: match.whitePlayerId }
                        }
                    },
                    include: { players: true }
                });

                const teamsWithBlack = await prisma.fantasyTeam.findMany({
                    where: {
                        tournamentId: tournamentId,
                        players: {
                            some: { playerId: match.blackPlayerId }
                        }
                    },
                    include: { players: true }
                });

                // Calculate points for white player
                const whitePoints = await this.calculateMatchPoints(match.id, match.whitePlayerId);
                // Update teams with white player
                for (const team of teamsWithWhite) {
                    const isCaptain = team.captainId === match.whitePlayerId;
                    const finalPoints = isCaptain ? whitePoints * 2 : whitePoints;
                    await prisma.fantasyTeam.update({
                        where: { id: team.id },
                        data: { totalPoints: { increment: finalPoints } }
                    });
                }

                // Calculate points for black player
                const blackPoints = await this.calculateMatchPoints(match.id, match.blackPlayerId);
                // Update teams with black player
                for (const team of teamsWithBlack) {
                    const isCaptain = team.captainId === match.blackPlayerId;
                    const finalPoints = isCaptain ? blackPoints * 2 : blackPoints;
                    await prisma.fantasyTeam.update({
                        where: { id: team.id },
                        data: { totalPoints: { increment: finalPoints } }
                    });
                }

                // Mark match as processed
                await prisma.matchResult.update({
                    where: { id: match.id },
                    data: { processed: true }
                });
            }

            // Update user total points based on all their teams
            await this.updateUserTotalPoints();

            console.log(`✅ Processed ${unprocessedMatches.length} matches`);
        } catch (error) {
            console.error('❌ Error processing match results:', error);
        }
    }

    /**
     * Update total points for all users based on their teams
     */
    static async updateUserTotalPoints(): Promise<void> {
        const users = await prisma.user.findMany({
            include: {
                teams: true
            }
        });

        for (const user of users) {
            const totalPoints = user.teams.reduce((sum: number, team: { totalPoints: number }) => sum + team.totalPoints, 0);
            await prisma.user.update({
                where: { id: user.id },
                data: { totalPoints }
            });
        }
    }

    /**
     * Update player average points (for price calculation)
     */
    static async updatePlayerAveragePoints(): Promise<void> {
        const players = await prisma.realPlayer.findMany({
            include: {
                whiteMatches: { where: { processed: true } },
                blackMatches: { where: { processed: true } }
            }
        });

        for (const player of players) {
            const allMatches = [...player.whiteMatches, ...player.blackMatches];
            let totalPoints = 0;

            for (const match of allMatches) {
                const points = await this.calculateMatchPoints(match.id, player.id);
                totalPoints += points;
            }

            const averagePoints = allMatches.length > 0 ? totalPoints / allMatches.length : 0;

            await prisma.realPlayer.update({
                where: { id: player.id },
                data: { averagePoints }
            });
        }
    }
}

export default prisma;
