import { writable, derived } from 'svelte/store';
import { storageService, type User } from './localStorage';
import { browser } from '$app/environment';

// Initialize storage on browser
if (browser) {
    storageService.initialize();
}

// Create writable store for user data
function createUserStore() {
    const initialUser: User = browser ? storageService.getUser() : { username: 'Rookie Collector', coins: 1000, seenOnboarding: false };
    const { subscribe, set, update } = writable<User>(initialUser);

    return {
        subscribe,
        update, // Expose update for custom updates
        addCoins: (amount: number) => {
            update(user => {
                const newUser = { ...user, coins: user.coins + amount };
                if (browser) storageService.saveUser(newUser);
                return newUser;
            });
        },
        spendCoins: (amount: number) => {
            let success = false;
            update(user => {
                if (user.coins >= amount) {
                    const newUser = { ...user, coins: user.coins - amount };
                    if (browser) storageService.saveUser(newUser);
                    success = true;
                    return newUser;
                }
                return user; // Insufficient funds
            });
            return success;
        },
        setUsername: (username: string) => {
            update(user => {
                const newUser = { ...user, username };
                if (browser) storageService.saveUser(newUser);
                return newUser;
            });
        },
        completeOnboarding: () => {
            update(user => {
                const newUser = { ...user, seenOnboarding: true };
                if (browser) storageService.saveUser(newUser);
                return newUser;
            });
        },
        reset: () => {
            const defaultUser = { username: 'Rookie Collector', coins: 0, seenOnboarding: false, lastDailyPackClaim: 0 };
            set(defaultUser);
            if (browser) {
                storageService.resetAll();
                storageService.initialize();
            }
        }
    };
}

export const user = createUserStore();
