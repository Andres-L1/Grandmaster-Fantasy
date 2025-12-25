import { writable, derived } from 'svelte/store';
import { storageService, type User } from './localStorage';
import { browser } from '$app/environment';

// Initialize storage on browser
if (browser) {
    storageService.initialize();
}

// Create writable store for user data
function createUserStore() {
    const initialUser: User = browser ? storageService.getUser() : { username: 'Guest Player', budget: 100000000, totalPoints: 0, seenOnboarding: false };
    const { subscribe, set, update } = writable<User>(initialUser);

    return {
        subscribe,
        updateBudget: (amount: number) => {
            update(user => {
                const newUser = { ...user, budget: user.budget + amount };
                if (browser) storageService.saveUser(newUser);
                return newUser;
            });
        },
        addPoints: (points: number) => {
            update(user => {
                const newUser = { ...user, totalPoints: user.totalPoints + points };
                if (browser) storageService.saveUser(newUser);
                return newUser;
            });
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
            const defaultUser = { username: 'Guest Player', budget: 100000000, totalPoints: 0, seenOnboarding: false };
            set(defaultUser);
            if (browser) storageService.saveUser(defaultUser);
        }
    };
}

export const user = createUserStore();
