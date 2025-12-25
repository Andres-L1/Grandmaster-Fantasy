import type { Handle } from '@sveltejs/kit';
import { CronJobs } from '$lib/server/cron/CronJobs';

// Initialize cron jobs when server starts
CronJobs.init();

export const handle: Handle = async ({ event, resolve }) => {
    const response = await resolve(event);
    return response;
};
