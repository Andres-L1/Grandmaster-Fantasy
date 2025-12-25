import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create a global league
    const globalLeague = await prisma.league.upsert({
        where: { id: 'global-league' },
        update: {},
        create: {
            id: 'global-league',
            name: 'Liga Global',
            isPrivate: false
        }
    });

    console.log('✅ Created Global League');

    // Create sample users
    const users = await Promise.all([
        prisma.user.upsert({
            where: { id: 'user-1' },
            update: {},
            create: {
                id: 'user-1',
                username: 'ChessMaster',
                email: 'chessmaster@example.com',
                budget: 100000000,
                totalPoints: 0
            }
        }),
        prisma.user.upsert({
            where: { id: 'user-2' },
            update: {},
            create: {
                id: 'user-2',
                username: 'TacticKing',
                email: 'tacticking@example.com',
                budget: 95000000,
                totalPoints: 150
            }
        }),
        prisma.user.upsert({
            where: { id: 'user-3' },
            update: {},
            create: {
                id: 'user-3',
                username: 'EndgameExpert',
                email: 'endgame@example.com',
                budget: 80000000,
                totalPoints: 250
            }
        })
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Add users to global league
    for (const user of users) {
        await prisma.leagueMembership.upsert({
            where: {
                userId_leagueId: {
                    userId: user.id,
                    leagueId: globalLeague.id
                }
            },
            update: {},
            create: {
                userId: user.id,
                leagueId: globalLeague.id
            }
        });
    }

    // Create sample Grandmasters
    const grandmasters = [
        { name: 'Magnus Carlsen', fideId: '1503014', rank: 1, price: 50000000 },
        { name: 'Fabiano Caruana', fideId: '2020009', rank: 2, price: 45000000 },
        { name: 'Ding Liren', fideId: '8603677', rank: 3, price: 43000000 },
        { name: 'Ian Nepomniachtchi', fideId: '4168119', rank: 4, price: 42000000 },
        { name: 'Hikaru Nakamura', fideId: '2016192', rank: 5, price: 40000000 },
        { name: 'Alireza Firouzja', fideId: '12573981', rank: 6, price: 38000000 },
        { name: 'Wesley So', fideId: '5202213', rank: 7, price: 35000000 },
        { name: 'Levon Aronian', fideId: '13300474', rank: 8, price: 33000000 },
        { name: 'Anish Giri', fideId: '24116068', rank: 9, price: 32000000 },
        { name: 'Maxime Vachier-Lagrave', fideId: '623539', rank: 10, price: 30000000 },
        { name: 'Viswanathan Anand', fideId: '5000017', rank: 11, price: 28000000 },
        { name: 'Richard Rapport', fideId: '738590', rank: 12, price: 25000000 },
        { name: 'Shakhriyar Mamedyarov', fideId: '13401319', rank: 13, price: 24000000 },
        { name: 'Teimour Radjabov', fideId: '13400924', rank: 14, price: 23000000 },
        { name: 'Sergey Karjakin', fideId: '14109603', rank: 15, price: 22000000 }
    ];

    for (const gm of grandmasters) {
        await prisma.realPlayer.upsert({
            where: { fideId: gm.fideId },
            update: {},
            create: {
                name: gm.name,
                fideId: gm.fideId,
                positionRank: gm.rank,
                currentPrice: gm.price,
                basePrice: gm.price,
                averagePoints: 0
            }
        });
    }

    console.log(`✅ Created ${grandmasters.length} Grandmasters`);

    // Create sample tournament
    const tournament = await prisma.tournament.upsert({
        where: { id: 'tata-steel-2024' },
        update: {},
        create: {
            id: 'tata-steel-2024',
            name: 'Tata Steel Chess Tournament 2024',
            lichessId: 'tata-steel-2024',
            status: 'active',
            startDate: new Date('2024-01-12')
        }
    });

    console.log('✅ Created sample tournament');

    // Create a sample team for user-1
    const team = await prisma.fantasyTeam.upsert({
        where: {
            userId_tournamentId: {
                userId: 'user-1',
                tournamentId: tournament.id
            }
        },
        update: {},
        create: {
            userId: 'user-1',
            tournamentId: tournament.id,
            totalPoints: 0
        }
    });

    console.log('✅ Created sample team');

    console.log('\n🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
