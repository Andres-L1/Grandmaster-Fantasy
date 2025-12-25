// LocalStorage Service - Centralized storage management
const STORAGE_KEYS = {
    USER: 'gf_user',
    OWNED_PLAYERS: 'gf_owned_players',
    PLAYER_CLAUSES: 'gf_player_clauses',
    CURRENT_TEAM: 'gf_current_team',
    CAPTAIN: 'gf_captain'
} as const;

export interface User {
    username: string;
    budget: number;
    totalPoints: number;
}

export interface Player {
    id: string;
    name: string;
    username: string;
    rating: number;
    price: number;
    position: number;
    photoUrl: string;
    country?: string;
}

// Default user data
const DEFAULT_USER: User = {
    username: 'Chess Fan',
    budget: 100000000, // 100M initial budget
    totalPoints: 0
};

class LocalStorageService {
    // Get user data
    getUser(): User {
        const data = localStorage.getItem(STORAGE_KEYS.USER);
        return data ? JSON.parse(data) : DEFAULT_USER;
    }

    // Save user data
    saveUser(user: User): void {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }

    // Get owned player IDs
    getOwnedPlayerIds(): string[] {
        const data = localStorage.getItem(STORAGE_KEYS.OWNED_PLAYERS);
        return data ? JSON.parse(data) : [];
    }

    // Save owned player IDs
    saveOwnedPlayerIds(ids: string[]): void {
        localStorage.setItem(STORAGE_KEYS.OWNED_PLAYERS, JSON.stringify(ids));
    }

    // Get player clauses
    getPlayerClauses(): Record<string, number> {
        const data = localStorage.getItem(STORAGE_KEYS.PLAYER_CLAUSES);
        return data ? JSON.parse(data) : {};
    }

    // Save player clauses
    savePlayerClauses(clauses: Record<string, number>): void {
        localStorage.setItem(STORAGE_KEYS.PLAYER_CLAUSES, JSON.stringify(clauses));
    }

    // Get current team lineup (max 5 players)
    getCurrentTeam(): string[] {
        const data = localStorage.getItem(STORAGE_KEYS.CURRENT_TEAM);
        return data ? JSON.parse(data) : [];
    }

    // Save current team lineup
    saveCurrentTeam(playerIds: string[]): void {
        localStorage.setItem(STORAGE_KEYS.CURRENT_TEAM, JSON.stringify(playerIds.slice(0, 5)));
    }

    // Get captain ID
    getCaptain(): string | null {
        return localStorage.getItem(STORAGE_KEYS.CAPTAIN);
    }

    // Save captain ID
    saveCaptain(playerId: string | null): void {
        if (playerId) {
            localStorage.setItem(STORAGE_KEYS.CAPTAIN, playerId);
        } else {
            localStorage.removeItem(STORAGE_KEYS.CAPTAIN);
        }
    }

    // Reset all data
    resetAll(): void {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.OWNED_PLAYERS);
        localStorage.removeItem(STORAGE_KEYS.PLAYER_CLAUSES);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_TEAM);
        localStorage.removeItem(STORAGE_KEYS.CAPTAIN);
    }

    // Initialize with defaults if needed
    initialize(): void {
        if (!localStorage.getItem(STORAGE_KEYS.USER)) {
            this.saveUser(DEFAULT_USER);
        }
        if (!localStorage.getItem(STORAGE_KEYS.OWNED_PLAYERS)) {
            this.saveOwnedPlayerIds([]);
        }
        if (!localStorage.getItem(STORAGE_KEYS.PLAYER_CLAUSES)) {
            this.savePlayerClauses({});
        }
        if (!localStorage.getItem(STORAGE_KEYS.CURRENT_TEAM)) {
            this.saveCurrentTeam([]);
        }
    }
}

export const storageService = new LocalStorageService();
