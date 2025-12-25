import type { PageServerLoad } from './$types';
import prisma from '$lib/server/services/MarketService';

export const load: PageServerLoad = async () => {
    // TODO: Get user from session
    const mockUserId = 'user-1';

    // Get user's teams with players
    const teams = await prisma.fantasyTeam.findMany({
        where: { userId: mockUserId },
        include: {
            tournament: true,
            players: true
        }
    });

    // Get full player details
    const teamsWithPlayerDetails = await Promise.all(
        teams.map(async (team: { players: Array<{ playerId: string }>;[key: string]: any }) => {
            const playerDetails = await Promise.all(
                team.players.map(async (tp: { playerId: string }) => {
                    return await prisma.realPlayer.findUnique({
                        where: { id: tp.playerId }
                    });
                })
            );

            return {
                ...team,
                playerDetails: playerDetails.filter((p: any) => p !== null)
            };
        })
    );

    const user = await prisma.user.findUnique({
        where: { id: mockUserId }
    });

    return {
        teams: teamsWithPlayerDetails,
        user
    };
};
