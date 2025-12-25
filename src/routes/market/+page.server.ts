import type { PageServerLoad } from './$types';
import prisma from '$lib/server/services/MarketService';

export const load: PageServerLoad = async () => {
    const players = await prisma.realPlayer.findMany({
        orderBy: { positionRank: 'asc' }
    });

    return {
        players
    };
};
