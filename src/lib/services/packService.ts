import type { Player } from '$lib/data/players';

export type PackType = 'STARTER' | 'PAWN' | 'KNIGHT' | 'KING';

export interface PackConfig {
    id: PackType;
    name: string;
    price: number;
    cardCount: number;
    description: string;
    probabilities: {
        goat: number;      // 2700+ (New top tier)
        legendary: number; // 2660+
        epic: number;      // 2655-2659
        rare: number;      // 2650-2654
        common: number;    // <2650
    };
    image: string;
}

export const PACKS: Record<PackType, PackConfig> = {
    STARTER: {
        id: 'STARTER',
        name: 'Sobre Inicial',
        price: 0,
        cardCount: 3,
        description: 'Tu primer paso hacia la gloria. Incluye una lección sobre duplicados.',
        probabilities: { goat: 0, legendary: 0, epic: 0, rare: 0, common: 1 },
        image: '🎁'
    },
    PAWN: {
        id: 'PAWN',
        name: 'Sobre Peón',
        price: 100,
        cardCount: 3,
        description: '3 Cartas. Ideal para empezar.',
        // Very low chance for top tiers
        probabilities: { goat: 0.001, legendary: 0.01, epic: 0.09, rare: 0.30, common: 0.60 },
        image: '♟️'
    },
    KNIGHT: {
        id: 'KNIGHT',
        name: 'Sobre Caballo',
        price: 500,
        cardCount: 5,
        description: '5 Cartas. Mejores opciones.',
        // Decent chance for Epic/Legendary
        probabilities: { goat: 0.01, legendary: 0.05, epic: 0.25, rare: 0.40, common: 0.29 },
        image: '♞'
    },
    KING: {
        id: 'KING',
        name: 'Sobre Rey',
        price: 2000,
        cardCount: 10,
        description: '10 Cartas. La verdadera élite.',
        // Guaranteed quality, good shot at GOAT
        probabilities: { goat: 0.05, legendary: 0.20, epic: 0.40, rare: 0.25, common: 0.10 },
        image: '♚'
    }
};

export class PackService {
    openPack(packType: PackType, allPlayers: Player[]): Player[] {
        if (packType === 'STARTER') {
            return this.openStarterPack(allPlayers);
        }

        const config = PACKS[packType];
        const cards: Player[] = [];

        // Categorize players (Adjusted for 81-100 Rankings)
        const pools = {
            goat: allPlayers.filter(p => p.rating >= 2700),
            legendary: allPlayers.filter(p => p.rating >= 2660 && p.rating < 2700),
            epic: allPlayers.filter(p => p.rating >= 2655 && p.rating < 2660),
            rare: allPlayers.filter(p => p.rating >= 2650 && p.rating < 2655),
            common: allPlayers.filter(p => p.rating < 2650)
        };

        // Fallback checks to prevent empty pool crashes (cascade down)
        if (pools.goat.length === 0) pools.goat = pools.legendary;
        if (pools.legendary.length === 0) pools.legendary = pools.epic;
        if (pools.epic.length === 0) pools.epic = pools.rare;
        if (pools.rare.length === 0) pools.rare = pools.common;

        for (let i = 0; i < config.cardCount; i++) {
            const rand = Math.random();
            let selectedPool: Player[] = [];

            if (rand < config.probabilities.goat) {
                selectedPool = pools.goat;
            } else if (rand < config.probabilities.goat + config.probabilities.legendary) {
                selectedPool = pools.legendary;
            } else if (rand < config.probabilities.goat + config.probabilities.legendary + config.probabilities.epic) {
                selectedPool = pools.epic;
            } else if (rand < config.probabilities.goat + config.probabilities.legendary + config.probabilities.epic + config.probabilities.rare) {
                selectedPool = pools.rare;
            } else {
                selectedPool = pools.common;
            }

            if (selectedPool.length > 0) {
                const randomCard = selectedPool[Math.floor(Math.random() * selectedPool.length)];
                cards.push(randomCard);
            } else {
                // Ultimate fallback
                cards.push(allPlayers[Math.floor(Math.random() * allPlayers.length)]);
            }
        }

        return cards;
    }

    // Special logic: 2 Unique, 1 Duplicate
    private openStarterPack(allPlayers: Player[]): Player[] {
        const cards: Player[] = [];

        // Pick 2 different random players (prefer lower rating for starter)
        // Filter valid starter pool (exclude GOATs to avoid giving free top tier)
        const starters = allPlayers.filter(p => p.rating < 2660);
        const pool = starters.length > 2 ? starters : allPlayers;

        const p1 = pool[Math.floor(Math.random() * pool.length)];
        let p2 = pool[Math.floor(Math.random() * pool.length)];
        while (p2.id === p1.id) {
            p2 = pool[Math.floor(Math.random() * pool.length)];
        }

        // Add p1, p2, and p1 again (Duplicate!)
        cards.push(p1);
        cards.push(p2);
        cards.push(p1);

        return cards;
    }
}

export const packService = new PackService();
