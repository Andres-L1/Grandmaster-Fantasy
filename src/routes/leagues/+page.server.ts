import type { PageServerLoad } from './$types';
import prisma from '$lib/server/services/MarketService';

export const load: PageServerLoad = async ({ url }) => {
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = 20;
    const skip = (page - 1) * pageSize;

    const [users, totalUsers] = await Promise.all([
        prisma.user.findMany({
            orderBy: { totalPoints: 'desc' },
            skip,
            take: pageSize,
            select: {
                id: true,
                username: true,
                totalPoints: true
            }
        }),
        prisma.user.count()
    ]);

    const totalPages = Math.ceil(totalUsers / pageSize);

    return {
        users,
        currentPage: page,
        totalPages,
        totalUsers
    };
};
