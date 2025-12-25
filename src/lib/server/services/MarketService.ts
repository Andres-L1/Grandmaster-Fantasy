import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MarketService {
    /**
     * Calculate new price for a player based on recent performance
     * Formula: newPrice = basePrice + (averagePoints * hypeMultiplier)
     */
    static calculateNewPrice(
        basePrice: number,
        averagePoints: number,
        hypeMultiplier: number = 1000000
    ): number {
        const newPrice = Math.floor(basePrice + averagePoints * hypeMultiplier);
        // Minimum price: 1M, Maximum price: 500M
        return Math.max(1000000, Math.min(500000000, newPrice));
    }

    /**
     * Update all player prices based on recent performance
     * Should run daily via cron job
     */
    static async updateAllPrices(): Promise<void> {
        try {
            const players = await prisma.realPlayer.findMany();

            for (const player of players) {
                const newPrice = this.calculateNewPrice(player.basePrice, player.averagePoints);

                await prisma.realPlayer.update({
                    where: { id: player.id },
                    data: { currentPrice: newPrice }
                });
            }

            console.log(`✅ Updated prices for ${players.length} players`);
        } catch (error) {
            console.error('❌ Error updating prices:', error);
        }
    }

    /**
     * Check if user can afford a player
     */
    static async canAffordPlayer(userId: string, playerId: string): Promise<boolean> {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const player = await prisma.realPlayer.findUnique({ where: { id: playerId } });

        if (!user || !player) return false;

        return user.budget >= player.currentPrice;
    }

    /**
     * Acquire a player for a team
     */
    static async acquirePlayer(
        userId: string,
        playerId: string,
        teamId: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            const player = await prisma.realPlayer.findUnique({ where: { id: playerId } });
            const team = await prisma.fantasyTeam.findUnique({
                where: { id: teamId },
                include: { players: true }
            });

            if (!user || !player || !team) {
                return { success: false, message: 'Usuario, jugador o equipo no encontrado' };
            }

            // Check budget
            if (user.budget < player.currentPrice) {
                return { success: false, message: 'Presupuesto insuficiente' };
            }

            // Check team size (max 5 players)
            if (team.players.length >= 5) {
                return { success: false, message: 'Equipo completo (máximo 5 jugadores)' };
            }

            // Check if player already in team
            const alreadyInTeam = team.players.some((p: { playerId: string }) => p.playerId === playerId);
            if (alreadyInTeam) {
                return { success: false, message: 'Jugador ya está en el equipo' };
            }

            // Add player to team and deduct budget
            await prisma.$transaction([
                prisma.teamPlayer.create({
                    data: {
                        teamId: teamId,
                        playerId: playerId
                    }
                }),
                prisma.user.update({
                    where: { id: userId },
                    data: { budget: user.budget - player.currentPrice }
                })
            ]);

            return {
                success: true,
                message: `${player.name} fichado exitosamente por ${player.currentPrice.toLocaleString()}`
            };
        } catch (error) {
            console.error('Error acquiring player:', error);
            return { success: false, message: 'Error al fichar jugador' };
        }
    }

    /**
     * Sell a player from team (returns 80% of current price)
     */
    static async sellPlayer(
        userId: string,
        playerId: string,
        teamId: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            const player = await prisma.realPlayer.findUnique({ where: { id: playerId } });

            if (!user || !player) {
                return { success: false, message: 'Usuario o jugador no encontrado' };
            }

            const sellPrice = Math.floor(player.currentPrice * 0.8);

            // Remove player from team and return budget
            await prisma.$transaction([
                prisma.teamPlayer.deleteMany({
                    where: {
                        teamId: teamId,
                        playerId: playerId
                    }
                }),
                prisma.user.update({
                    where: { id: userId },
                    data: { budget: user.budget + sellPrice }
                })
            ]);

            return {
                success: true,
                message: `${player.name} vendido por ${sellPrice.toLocaleString()}`
            };
        } catch (error) {
            console.error('Error selling player:', error);
            return { success: false, message: 'Error al vender jugador' };
        }
    }
}

export default prisma;
