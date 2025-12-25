import type { Handle } from '@sveltejs/kit';
// import { CronJobs } from '$lib/server/cron/CronJobs';

// Initialize cron jobs when server starts
// Commented out for static GitHub Pages build
// CronJobs.init();

export const handle: Handle = async ({ event, resolve }) => {
    const response = await resolve(event);
    return response;
};
