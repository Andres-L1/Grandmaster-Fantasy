// LocalStorage Service - Centralized storage management
const STORAGE_KEYS = {
    USER: 'gl_user', // Renamed for Grandmaster Legends
    COLLECTION: 'gl_collection', // Array of player IDs
} as const;

export interface User {
    username: string;
    coins: number;
    seenOnboarding: boolean;
    lastDailyPackClaim?: number; // Timestamp of last daily pack claim
}

// Default user data
const DEFAULT_USER: User = {
    username: 'Rookie Collector',
    coins: 0, // Starts at 0 to force selling the starter pack duplicate
    seenOnboarding: false,
    lastDailyPackClaim: 0 // Never claimed
};

class LocalStorageService {
    // Get user data
    getUser(): User {
        const data = localStorage.getItem(STORAGE_KEYS.USER);
        if (data) {
            const parsed = JSON.parse(data);
            // Migration check: if old "budget" exists but no "coins", migrate logic could be here
            // For now, simpler to just checking defaults or forcing reset if schema changed drastically
            if (parsed.coins === undefined) {
                return DEFAULT_USER;
            }
            return parsed;
        }
        return DEFAULT_USER;
    }

    // Save user data
    saveUser(user: User): void {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }

    // Get collected card IDs
    getCollection(): string[] {
        const data = localStorage.getItem(STORAGE_KEYS.COLLECTION);
        return data ? JSON.parse(data) : [];
    }

    // Save collected card IDs
    saveCollection(ids: string[]): void {
        localStorage.setItem(STORAGE_KEYS.COLLECTION, JSON.stringify(ids));
    }

    // Reset all data
    resetAll(): void {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.COLLECTION);
    }

    // Initialize with defaults if needed
    initialize(): void {
        // If no user exists, create one
        if (!localStorage.getItem(STORAGE_KEYS.USER)) {
            this.saveUser(DEFAULT_USER);
        }
    }
}

export const storageService = new LocalStorageService();
