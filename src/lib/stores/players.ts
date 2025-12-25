import { writable, derived, get } from 'svelte/store';
import { lichessApi, type Player } from '$lib/services/lichessApi';
import { storageService } from './localStorage';
import { browser } from '$app/environment';
import { user } from './user';

// Extended Player interface with Clause data
export interface OwnedPlayer extends Player {
    clause: number;
}

// Store for all available players from Lichess API
const availablePlayersStore = writable<Player[]>([]);

// Loading state
export const playersLoading = writable<boolean>(true);

// Initialize players from Lichess API
if (browser) {
    lichessApi.getTopPlayers(50).then(players => {
        availablePlayersStore.set(players);
        playersLoading.set(false);
    }).catch(err => {
        console.error('Failed to load players:', err);
        playersLoading.set(false);
    });
}

// Store for player clauses
function createPlayerClausesStore() {
    const initialClauses = browser ? storageService.getPlayerClauses() : {};
    const { subscribe, set, update } = writable<Record<string, number>>(initialClauses);

    return {
        subscribe,
        setClause: (playerId: string, amount: number) => {
            update(clauses => {
                const newClauses = { ...clauses, [playerId]: amount };
                if (browser) storageService.savePlayerClauses(newClauses);
                return newClauses;
            });
        },
        removeClause: (playerId: string) => {
            update(clauses => {
                const { [playerId]: _, ...rest } = clauses;
                if (browser) storageService.savePlayerClauses(rest);
                return rest;
            });
        },
        reset: () => {
            set({});
            if (browser) storageService.savePlayerClauses({});
        }
    };
}

export const playerClauses = createPlayerClausesStore();

// Create writable store for owned player IDs
function createOwnedPlayersStore() {
    const initialIds = browser ? storageService.getOwnedPlayerIds() : [];
    const { subscribe, set, update } = writable<string[]>(initialIds);

    return {
        subscribe,
        buyPlayer: (playerId: string, price: number): { success: boolean; message: string } => {
            let result = { success: false, message: '' };
            const allPlayers = get(availablePlayersStore);

            update(ownedIds => {
                const player = allPlayers.find(p => p.id === playerId);
                if (!player) {
                    result = { success: false, message: 'Jugador no encontrado' };
                    return ownedIds;
                }

                if (ownedIds.includes(playerId)) {
                    result = { success: false, message: 'Ya tienes este jugador' };
                    return ownedIds;
                }

                if (ownedIds.length >= 15) {
                    result = { success: false, message: 'Roster completo (máximo 15 jugadores)' };
                    return ownedIds;
                }

                // Check budget via user store
                const currentUser = get(user);
                if (currentUser.budget < price) {
                    result = { success: false, message: 'Presupuesto insuficiente' };
                    return ownedIds;
                }

                // Deduct budget
                user.updateBudget(-price);

                // Add player
                const newIds = [...ownedIds, playerId];
                if (browser) storageService.saveOwnedPlayerIds(newIds);

                // Set initial clause equal to price
                playerClauses.setClause(playerId, price);

                result = { success: true, message: `${player.name} fichado exitosamente` };
                return newIds;
            });

            return result;
        },
        sellPlayer: (playerId: string): { success: boolean; message: string } => {
            let result = { success: false, message: '' };
            const allPlayers = get(availablePlayersStore);

            update(ownedIds => {
                if (!ownedIds.includes(playerId)) {
                    result = { success: false, message: 'No tienes este jugador' };
                    return ownedIds;
                }

                const player = allPlayers.find(p => p.id === playerId);
                if (!player) {
                    result = { success: false, message: 'Jugador no encontrado' };
                    return ownedIds;
                }

                // Return 80% of price
                const refund = Math.floor(player.price * 0.8);
                user.updateBudget(refund);

                // Remove player
                const newIds = ownedIds.filter(id => id !== playerId);
                if (browser) storageService.saveOwnedPlayerIds(newIds);

                // Remove clause
                playerClauses.removeClause(playerId);

                result = { success: true, message: `${player.name} vendido por ${(refund / 1000000).toFixed(0)}M` };
                return newIds;
            });

            return result;
        },
        increaseClause: (playerId: string, newClause: number): { success: boolean; message: string } => {
            const clauses = get(playerClauses);
            const currentClause = clauses[playerId] || 0;

            if (newClause <= currentClause) {
                return { success: false, message: 'La nueva cláusula debe ser mayor que la actual' };
            }

            // Cost is 10% of the increase
            const increaseAmount = newClause - currentClause;
            const cost = Math.floor(increaseAmount * 0.10);

            const currentUser = get(user);
            if (currentUser.budget < cost) {
                return { success: false, message: `Necesitas ${(cost / 1000000).toFixed(1)}M para blindar (10% del aumento)` };
            }

            // Pay cost
            user.updateBudget(-cost);

            // Update clause
            playerClauses.setClause(playerId, newClause);

            return { success: true, message: `Cláusula aumentada a ${(newClause / 1000000).toFixed(0)}M` };
        },
        reset: () => {
            set([]);
            if (browser) storageService.saveOwnedPlayerIds([]);
            playerClauses.reset();
        }
    };
}

export const ownedPlayerIds = createOwnedPlayersStore();

// Derived store for owned player objects WITH CLAUSE included
export const ownedPlayers = derived(
    [ownedPlayerIds, availablePlayersStore, playerClauses],
    ([$ownedIds, $allPlayers, $clauses]) => {
        return $allPlayers
            .filter(p => $ownedIds.includes(p.id))
            .map(p => ({
                ...p,
                clause: $clauses[p.id] || p.price
            }));
    }
);

// Derived store for available (not owned) players
export const availablePlayers = derived(
    [ownedPlayerIds, availablePlayersStore],
    ([$ownedIds, $allPlayers]) => {
        return $allPlayers.filter(p => !$ownedIds.includes(p.id));
    }
);

// All players (for use in components)
export const allPlayers = availablePlayersStore;
