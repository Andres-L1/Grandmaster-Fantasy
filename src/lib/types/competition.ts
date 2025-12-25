export interface CompetitionTeam {
    id: string;
    name: string;
    isUser: boolean;
    rating: number; // Team Strength (Avg Elo)
    played: number;
    won: number;
    drawn: number;
    lost: number;
    points: number;
    gf: number; // Goals/Points For
    ga: number; // Goals/Points Against
}

export interface MatchResult {
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number;
    awayScore: number;
    played: boolean;
}

export interface fixture {
    id: number;
    matches: MatchResult[];
}
