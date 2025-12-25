// Lichess API Service
const LICHESS_API_BASE = 'https://lichess.org/api';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export interface LichessPlayer {
    id: string;
    username: string;
    title?: string;
    perfs: {
        classical?: { rating: number };
        rapid?: { rating: number };
        blitz?: { rating: number };
    };
    profile?: {
        firstName?: string;
        lastName?: string;
        country?: string;
    };
}

export interface Player {
    id: string;
    name: string;
    username: string;
    title?: string;
    rating: number;
    price: number;
    position: number;
    photoUrl: string;
    country?: string;
}

// Known players mapping (Lichess Username -> Real Name)
const KNOWN_PLAYERS: Record<string, string> = {
    'DrNykterstein': 'Magnus Carlsen',
    'RebeccaHarris': 'Daniel Naroditsky',
    'Penguingim1': 'Andrew Tang',
    'Hikaru': 'Hikaru Nakamura',
    'LachesisQ': 'Ian Nepomniachtchi',
    'FabianoCaruana': 'Fabiano Caruana',
    'WesleySo': 'Wesley So',
    'Levon': 'Levon Aronian',
    'MVL': 'Maxime Vachier-Lagrave',
    'AnishGiri': 'Anish Giri',
    'Vishy': 'Viswanathan Anand',
    'alireza2003': 'Alireza Firouzja',
    'Firouzja2003': 'Alireza Firouzja',
    'Bigfish1995': 'Vladimir Fedoseev',
    'Zhigalko_Sergei': 'Sergei Zhigalko',
    'Konavets': 'Savenkov Konstantin',
    'Night-King96': 'Oleksandr Bortnyk',
    'nihalsarin2004': 'Nihal Sarin',
    'RaunakSadhwani2005': 'Raunak Sadhwani',
    'Praggnanandhaa': 'Rameshbabu Praggnanandhaa',
    'Gukesh': 'Dommaraju Gukesh',
    'ArjunErigaisi': 'Arjun Erigaisi',
    'ViditS': 'Vidit Gujrathi',
    'S-L-Narayanan': 'S.L. Narayanan',
    'Aravindh': 'Aravindh Chithambaram',
    'yuuki-asuna': 'Jeffrey Xiong',
    'Haest': 'Nils Grandelius',
    'muisback': 'Muhammed Batuhan Dastan',
    'Mutdpro': 'Alan Pichot',
    'FeegLood': 'Sam Sevian',
    'benefactor2018': 'Alireza Firouzja'
};

interface CachedData {
    players: Player[];
    timestamp: number;
}

class LichessApiService {
    private cache: CachedData | null = null;

    /**
     * Get top classical chess players from Lichess
     */
    async getTopPlayers(count: number = 500): Promise<Player[]> {
        // Check cache first
        if (this.cache && Date.now() - this.cache.timestamp < CACHE_DURATION) {
            return this.cache.players.slice(0, count);
        }

        try {
            const response = await fetch(`${LICHESS_API_BASE}/player/top/${count}/classical`, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Lichess API error: ${response.status}`);
            }

            const data = await response.json();
            const players = this.transformPlayers(data.users || []);

            // Cache the result
            this.cache = {
                players,
                timestamp: Date.now()
            };

            return players;
        } catch (error) {
            console.error('Failed to fetch Lichess players:', error);

            // Return fallback data if API fails
            return this.getFallbackPlayers();
        }
    }

    /**
     * Transform Lichess API response to our Player format
     */
    private transformPlayers(lichessPlayers: LichessPlayer[]): Player[] {
        return lichessPlayers.map((player, index) => {
            const rating = player.perfs?.classical?.rating || 2500;
            const position = index + 1;

            // Try to get name from KNOWN_PLAYERS first, then profile, then fallback to username
            let fullName: string;
            if (KNOWN_PLAYERS[player.username]) {
                fullName = KNOWN_PLAYERS[player.username];
            } else if (player.profile?.firstName && player.profile?.lastName) {
                fullName = `${player.profile.firstName} ${player.profile.lastName}`;
            } else if (player.profile?.firstName) {
                fullName = player.profile.firstName;
            } else {
                fullName = player.username;
            }

            // Add title to name if available (e.g., "GM Magnus Carlsen")
            if (player.title) {
                fullName = `${player.title} ${fullName}`;
            }

            return {
                id: player.id,
                username: player.username,
                name: fullName,
                title: player.title,
                rating,
                price: this.calculatePrice(rating, position),
                position,
                photoUrl: `https://lichess1.org/assets/logo/lichess-pad-${player.username}.png`,
                country: player.profile?.country
            };
        });
    }

    /**
     * Calculate player price based on rating and ranking position
     * Similar to LaLiga Fantasy pricing (1M - 25M range)
     * Formula considers both absolute rating and relative ranking
     */
    private calculatePrice(rating: number, position: number): number {
        // Base price by position (progressive tiers)
        let basePrice: number;

        if (position <= 10) {
            // Top 10: 15-25M
            basePrice = 25000000 - (position - 1) * 1000000;
        } else if (position <= 50) {
            // Top 11-50: 8-15M  
            basePrice = 15000000 - ((position - 10) / 40) * 7000000;
        } else if (position <= 100) {
            // Top 51-100: 5-8M
            basePrice = 8000000 - ((position - 50) / 50) * 3000000;
        } else if (position <= 200) {
            // Top 101-200: 3-5M
            basePrice = 5000000 - ((position - 100) / 100) * 2000000;
        } else {
            // Top 201-500: 1-3M
            basePrice = 3000000 - ((position - 200) / 300) * 2000000;
        }

        // Ensure minimum 1M
        basePrice = Math.max(1000000, basePrice);

        // Round to nearest 100k for cleaner prices
        return Math.round(basePrice / 100000) * 100000;
    }

    /**
     * Fallback players if Lichess API fails
     */
    private getFallbackPlayers(): Player[] {
        return [
            { id: 'magnuscarlsen', username: 'DrNykterstein', name: 'GM Magnus Carlsen', rating: 2830, price: 25000000, position: 1, photoUrl: '', country: 'NO' },
            { id: 'fabianocaruana', username: 'FabianoCaruana', name: 'GM Fabiano Caruana', rating: 2805, price: 24000000, position: 2, photoUrl: '', country: 'US' },
            { id: 'dingliren', username: 'DingLiren', name: 'GM Ding Liren', rating: 2780, price: 23000000, position: 3, photoUrl: '', country: 'CN' },
            { id: 'iannepo', username: 'lachesisQ', name: 'GM Ian Nepomniachtchi', rating: 2770, price: 22000000, position: 4, photoUrl: '', country: 'RU' },
            { id: 'hikarunakamura', username: 'Hikaru', name: 'GM Hikaru Nakamura', rating: 2765, price: 21000000, position: 5, photoUrl: '', country: 'US' },
            { id: 'alirezafirouzja', username: 'Firouzja2003', name: 'GM Alireza Firouzja', rating: 2760, price: 20000000, position: 6, photoUrl: '', country: 'FR' },
            { id: 'wesleyso', username: 'WesleySo', name: 'GM Wesley So', rating: 2755, price: 19000000, position: 7, photoUrl: '', country: 'US' },
            { id: 'levonaronian', username: 'Levon', name: 'GM Levon Aronian', rating: 2750, price: 18000000, position: 8, photoUrl: '', country: 'US' },
            { id: 'mvl', username: 'MVL', name: 'GM Maxime Vachier-Lagrave', rating: 2745, price: 17000000, position: 9, photoUrl: '', country: 'FR' },
            { id: 'anishgiri', username: 'AnishGiri', name: 'GM Anish Giri', rating: 2740, price: 16000000, position: 10, photoUrl: '', country: 'NL' },
            { id: 'vishy', username: 'Vishy', name: 'GM Viswanathan Anand', rating: 2735, price: 14000000, position: 11, photoUrl: '', country: 'IN' },
            { id: 'shakhriyar', username: 'Shakhriyar', name: 'GM Shakhriyar Mamedyarov', rating: 2730, price: 13000000, position: 12, photoUrl: '', country: 'AZ' },
            { id: 'teimour', username: 'Teimour', name: 'GM Teimour Radjabov', rating: 2725, price: 12000000, position: 13, photoUrl: '', country: 'AZ' },
            { id: 'grischuk', username: 'Grischuk', name: 'GM Alexander Grischuk', rating: 2720, price: 11000000, position: 14, photoUrl: '', country: 'RU' },
            { id: 'rapport', username: 'RichardRapport', name: 'GM Richard Rapport', rating: 2715, price: 10000000, position: 15, photoUrl: '', country: 'RO' }
        ];
    }

    /**
     * Clear cache (useful for manual refresh)
     */
    clearCache(): void {
        this.cache = null;
    }
}

export const lichessApi = new LichessApiService();
