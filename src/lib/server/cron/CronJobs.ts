import cron from 'node-cron';
import { LichessService } from '../services/LichessService';
import { ScoringService } from '../services/ScoringService';
import { MarketService } from '../services/MarketService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CronJobs {
    /**
     * Initialize all cron jobs
     */
    static init() {
        console.log('⏰ Initializing cron jobs...');

        // Sync Lichess match results every 10 minutes
        cron.schedule('*/10 * * * *', async () => {
            console.log('🔄 Running Lichess sync cron job...');
            await LichessService.syncMatchResults();

            // Process match results for all active tournaments
            const activeTournaments = await prisma.tournament.findMany({
                where: { status: 'active' }
            });

            for (const tournament of activeTournaments) {
                await ScoringService.processMatchResults(tournament.id);
            }

            // Update player average points
            await ScoringService.updatePlayerAveragePoints();
        });

        // Update player prices daily at midnight
        cron.schedule('0 0 * * *', async () => {
            console.log('💰 Running daily price update cron job...');
            await MarketService.updateAllPrices();
        });

        console.log('✅ Cron jobs initialized');
        console.log('  - Lichess sync: every 10 minutes');
        console.log('  - Price update: daily at midnight');
    }

    /**
     * Manual trigger for testing
     */
    static async runLichessSync() {
        console.log('🔄 Manual Lichess sync triggered...');
        await LichessService.syncMatchResults();

        const activeTournaments = await prisma.tournament.findMany({
            where: { status: 'active' }
        });

        for (const tournament of activeTournaments) {
            await ScoringService.processMatchResults(tournament.id);
        }

        await ScoringService.updatePlayerAveragePoints();
    }

    static async runPriceUpdate() {
        console.log('💰 Manual price update triggered...');
        await MarketService.updateAllPrices();
    }
}
