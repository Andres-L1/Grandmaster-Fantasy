import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { CompetitionTeam, fixture, MatchResult } from '../types/competition';
import { SimulationEngine } from '../services/simulationEngine';
import { currentTeam, teamPlayers } from './teams';

// Constants
const LEAGUE_SIZE = 10;
const STORAGE_KEY = 'gf_league_state';

interface LeagueState {
    teams: CompetitionTeam[];
    fixtures: fixture[];
    currentMatchday: number;
    isFinished: boolean;
}

// Initial State (Empty)
const initialState: LeagueState = {
    teams: [],
    fixtures: [],
    currentMatchday: 1,
    isFinished: false
};

function createLeagueStore() {
    // Load from storage or init
    const stored = browser ? localStorage.getItem(STORAGE_KEY) : null;
    let startState = stored ? JSON.parse(stored) : initialState;

    const { subscribe, set, update } = writable<LeagueState>(startState);

    return {
        subscribe,

        // Initialize League with User's Team
        initLeague: (userTeamName: string) => {
            const bots = SimulationEngine.generateBots();
            const userTeam: CompetitionTeam = {
                id: 'user-team',
                name: userTeamName,
                isUser: true,
                rating: 1500, // Placeholder, updates dynamically
                played: 0, won: 0, drawn: 0, lost: 0, points: 0, gf: 0, ga: 0
            };

            const teams = [userTeam, ...bots];
            const fixtures = generateRoundRobin(teams);

            const newState = {
                teams,
                fixtures,
                currentMatchday: 1,
                isFinished: false
            };

            set(newState);
            if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        },

        // Play next matchday
        playMatchday: () => {
            update(state => {
                if (state.currentMatchday > state.fixtures.length) return state;

                const fixture = state.fixtures.find(f => f.id === state.currentMatchday);
                if (!fixture) return state;

                // Update User Rating before playing
                const currentTeamRating = calculateUserTeamRating();
                const userIndex = state.teams.findIndex(t => t.isUser);
                if (userIndex !== -1) {
                    state.teams[userIndex].rating = currentTeamRating;
                }

                // Simulate all matches in this fixture
                fixture.matches.forEach(match => {
                    const homeTeam = state.teams.find(t => t.id === match.homeTeamId)!;
                    const awayTeam = state.teams.find(t => t.id === match.awayTeamId)!;

                    const [scoreH, scoreA] = SimulationEngine.simulateMatch(homeTeam.rating, awayTeam.rating);

                    match.homeScore = scoreH;
                    match.awayScore = scoreA;
                    match.played = true;

                    // Update Table
                    updateTeamStats(homeTeam, scoreH, scoreA);
                    updateTeamStats(awayTeam, scoreA, scoreH);
                });

                // Sort table by points
                state.teams.sort((a, b) => {
                    if (b.points !== a.points) return b.points - a.points;
                    return (b.gf - b.ga) - (a.gf - a.ga); // Goal diff
                });

                state.currentMatchday++;
                if (state.currentMatchday > state.fixtures.length) {
                    state.isFinished = true;
                }

                if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
                return state;
            });
        },

        resetLeague: () => {
            set(initialState);
            if (browser) localStorage.removeItem(STORAGE_KEY);
        }
    };
}

// Helper: Calculate average rating of active team
function calculateUserTeamRating(): number {
    const players = get(teamPlayers);
    if (players.length === 0) return 0;
    const total = players.reduce((sum, p) => sum + p.rating, 0);
    return Math.floor(total / players.length);
}

// Helper: Update stats for a single team
function updateTeamStats(team: CompetitionTeam, goalsFor: number, goalsAgainst: number) {
    team.played++;
    team.gf += goalsFor;
    team.ga += goalsAgainst;

    if (goalsFor > goalsAgainst) {
        team.won++;
        team.points += 3;
    } else if (goalsFor === goalsAgainst) {
        team.drawn++;
        team.points += 1;
    } else {
        team.lost++;
    }
}

// Helper: Generate Round Robin Fixtures (Berger Tables)
function generateRoundRobin(teams: CompetitionTeam[]): fixture[] {
    const totalRounds = teams.length - 1;
    const matchesPerRound = teams.length / 2;
    const fixtures: fixture[] = [];
    const teamIds = teams.map(t => t.id);

    for (let round = 0; round < totalRounds; round++) {
        const roundMatches: MatchResult[] = [];

        for (let match = 0; match < matchesPerRound; match++) {
            const home = (round + match) % (teams.length - 1);
            let away = (teams.length - 1 - match + round) % (teams.length - 1);

            // Last team stays fixed
            if (match === 0) {
                away = teams.length - 1;
            }

            roundMatches.push({
                homeTeamId: teamIds[home],
                awayTeamId: teamIds[away],
                homeScore: 0,
                awayScore: 0,
                played: false
            });
        }
        fixtures.push({ id: round + 1, matches: roundMatches });
    }

    return fixtures;
}

export const league = createLeagueStore();
