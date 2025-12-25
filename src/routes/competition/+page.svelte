<script lang="ts">
    import { league } from "$lib/stores/league";
    import { user } from "$lib/stores/user";
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";
    import { toast } from "$lib/stores/toast";
    import confetti from "canvas-confetti";

    let isLoading = false;
    let justPlayed = false;

    // Computed: Current Fixture for user
    $: currentFixture = $league.fixtures.find(
        (f) => f.id === $league.currentMatchday,
    );
    $: userMatch = currentFixture?.matches.find(
        (m) => m.homeTeamId === "user-team" || m.awayTeamId === "user-team",
    );

    // Initialize league if empty
    onMount(() => {
        if ($league.teams.length === 0) {
            league.initLeague($user.username);
        }
    });

    function playMatchday() {
        if ($league.isFinished) return;

        isLoading = true;
        justPlayed = false;

        // Simulate "Thinking" time
        setTimeout(() => {
            league.playMatchday();
            isLoading = false;
            justPlayed = true;

            // Find result of user match TO SHOW TOAST
            const lastFixture = $league.fixtures.find(
                (f) => f.id === $league.currentMatchday - 1,
            );
            const playedMatch = lastFixture?.matches.find(
                (m) =>
                    m.homeTeamId === "user-team" ||
                    m.awayTeamId === "user-team",
            );

            if (playedMatch) {
                const isHome = playedMatch.homeTeamId === "user-team";
                const myScore = isHome
                    ? playedMatch.homeScore
                    : playedMatch.awayScore;
                const oppScore = isHome
                    ? playedMatch.awayScore
                    : playedMatch.homeScore;

                if (myScore > oppScore) {
                    toast.success(`¡Victoria! Ganaste ${myScore}-${oppScore}`);
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                    });
                    user.addPoints(10); // Standard win reward
                } else if (myScore === oppScore) {
                    toast.info(`Empate ${myScore}-${oppScore}`);
                    user.addPoints(3);
                } else {
                    toast.error(`Derrota ${myScore}-${oppScore}`);
                    user.addPoints(-2);
                }
            }
        }, 1500);
    }

    function getTeamName(id: string) {
        return $league.teams.find((t) => t.id === id)?.name || "Unknown";
    }

    function resetLeague() {
        if (confirm("¿Reiniciar la liga? Perderás el progreso actual.")) {
            league.resetLeague();
            league.initLeague($user.username);
        }
    }
</script>

<svelte:head>
    <title>Competición - Grandmaster Fantasy</title>
</svelte:head>

<div class="space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-end">
        <div>
            <h1 class="text-3xl font-bold font-serif text-white mb-2">
                Competición Oficial
            </h1>
            <p class="text-sm text-slate-400">
                Juega contra los mejores managers de bots del mundo
            </p>
        </div>
        {#if $league.isFinished}
            <button
                class="btn-primary bg-amber-500 hover:bg-amber-600 border-amber-400"
                on:click={resetLeague}
            >
                Nueva Temporada
            </button>
        {/if}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main: Table -->
        <div class="lg:col-span-2 card p-6">
            <h2 class="text-xl font-bold font-serif text-white mb-4">
                Clasificación
                <span class="text-sm font-sans font-normal text-slate-500 ml-2"
                    >Jornada {$league.isFinished
                        ? $league.fixtures.length
                        : $league.currentMatchday} / {$league.fixtures
                        .length}</span
                >
            </h2>

            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr
                            class="text-xs uppercase text-slate-500 border-b border-white/5"
                        >
                            <th class="py-3 text-left w-10">#</th>
                            <th class="py-3 text-left">Equipo</th>
                            <th class="py-3 text-center w-12">PJ</th>
                            <th class="py-3 text-center w-12 text-green-400"
                                >V</th
                            >
                            <th class="py-3 text-center w-12 text-amber-400"
                                >E</th
                            >
                            <th class="py-3 text-center w-12 text-red-400">D</th
                            >
                            <th class="py-3 text-center w-12">DG</th>
                            <th
                                class="py-3 text-center w-16 font-bold text-white"
                                >PTS</th
                            >
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        {#each $league.teams as team, i (team.id)}
                            <tr
                                class="hover:bg-white/5 transition-colors {team.isUser
                                    ? 'bg-primary/10'
                                    : ''}"
                                in:fly={{ y: 20, delay: i * 50 }}
                            >
                                <td class="py-3 font-mono text-slate-400"
                                    >{i + 1}</td
                                >
                                <td class="py-3 font-bold text-white">
                                    {team.name}
                                    {#if team.isUser}
                                        <span class="ml-2 text-primary text-xs"
                                            >(Tú)</span
                                        >
                                    {/if}
                                </td>
                                <td class="py-3 text-center text-slate-300"
                                    >{team.played}</td
                                >
                                <td class="py-3 text-center text-slate-400"
                                    >{team.won}</td
                                >
                                <td class="py-3 text-center text-slate-400"
                                    >{team.drawn}</td
                                >
                                <td class="py-3 text-center text-slate-400"
                                    >{team.lost}</td
                                >
                                <td
                                    class="py-3 text-center font-mono text-xs text-slate-500"
                                    >{team.gf - team.ga > 0
                                        ? "+"
                                        : ""}{team.gf - team.ga}</td
                                >
                                <td
                                    class="py-3 text-center font-bold text-white text-base"
                                    >{team.points}</td
                                >
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Sidebar: Next Match -->
        <div class="space-y-6">
            <div class="card p-6 border-primary/30 relative overflow-hidden">
                <!-- Background Decoration -->
                <div
                    class="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
                ></div>

                <h3 class="text-white font-bold mb-4 flex items-center gap-2">
                    <span class="text-amber-500">⚡</span> Próximo Partido
                </h3>

                {#if $league.isFinished}
                    <div class="text-center py-8">
                        <div class="text-4xl mb-2">🏆</div>
                        <p class="text-white font-bold">Liga Finalizada</p>
                        <p class="text-slate-400 text-sm">
                            ¡Consulta tu posición final!
                        </p>
                    </div>
                {:else if userMatch}
                    <div class="text-center mb-6">
                        <div class="flex justify-between items-center mb-4">
                            <div class="text-center w-1/3">
                                <div
                                    class="w-12 h-12 rounded-full bg-slate-800 border border-white/10 mx-auto mb-2 flex items-center justify-center text-xl font-bold"
                                >
                                    🏠
                                </div>
                                <div
                                    class="text-xs font-bold text-white truncate px-1"
                                >
                                    {getTeamName(userMatch.homeTeamId)}
                                </div>
                            </div>
                            <div class="font-bold text-slate-500 text-sm">
                                VS
                            </div>
                            <div class="text-center w-1/3">
                                <div
                                    class="w-12 h-12 rounded-full bg-slate-800 border border-white/10 mx-auto mb-2 flex items-center justify-center text-xl font-bold"
                                >
                                    ✈️
                                </div>
                                <div
                                    class="text-xs font-bold text-white truncate px-1"
                                >
                                    {getTeamName(userMatch.awayTeamId)}
                                </div>
                            </div>
                        </div>

                        <button
                            class="w-full btn-primary py-3 font-bold shadow-lg shadow-primary/20 relative group"
                            disabled={isLoading}
                            on:click={playMatchday}
                        >
                            {#if isLoading}
                                <span class="animate-pulse">Jugando...</span>
                            {:else}
                                Jugar Jornada {$league.currentMatchday}
                            {/if}
                        </button>
                    </div>

                    <div
                        class="bg-slate-950/50 p-3 rounded text-xs text-center text-slate-400 border border-white/5"
                    >
                        Tus puntos se sumarán a tu perfil global.
                    </div>
                {:else}
                    <div class="text-center py-4 text-slate-400">
                        Descansas esta jornada
                    </div>
                    <button
                        class="w-full btn-primary py-2 mt-4"
                        on:click={playMatchday}
                    >
                        Simular Resto de Jornada
                    </button>
                {/if}
            </div>

            <!-- Quick Tip -->
            <div
                class="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl"
            >
                <p class="text-blue-200 text-xs leading-relaxed">
                    <strong>ℹ️ Nota:</strong> La fuerza de tu equipo se basa en la
                    media de Elo de tus 3 titulares. ¡Ficha mejores jugadores para
                    ganar la liga!
                </p>
            </div>
        </div>
    </div>
</div>
