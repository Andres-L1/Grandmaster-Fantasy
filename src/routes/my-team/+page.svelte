<script lang="ts">
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    let selectedTeamIndex = $state(0);

    const selectedTeam = $derived(data.teams[selectedTeamIndex]);

    function formatPrice(price: number): string {
        return (price / 1000000).toFixed(1) + "M";
    }

    async function setCaptain(playerId: string) {
        // TODO: Implement API call
        alert(`Setting captain to player ${playerId}... (implementar API)`);
    }

    async function sellPlayer(playerId: string, playerName: string) {
        if (
            confirm(
                `¿Seguro que quieres vender a ${playerName}? Recuperarás el 80% del precio.`,
            )
        ) {
            // TODO: Implement API call
            alert(`Vendiendo a ${playerName}... (implementar API)`);
        }
    }
</script>

<svelte:head>
    <title>Mi Equipo - Grandmaster Fantasy</title>
</svelte:head>

<div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-4xl font-bold text-white mb-2">Mi Equipo</h1>
            <p class="text-gray-400">
                Gestiona tus jugadores y selecciona tu capitán
            </p>
        </div>
        <div
            class="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 rounded-xl"
        >
            <div class="text-sm text-white/80">Puntos Totales</div>
            <div class="text-3xl font-bold text-white">
                {data.user?.totalPoints || 0}
            </div>
        </div>
    </div>

    <!-- Tournament Selector -->
    {#if data.teams.length > 0}
        <div class="flex gap-4 overflow-x-auto pb-2">
            {#each data.teams as team, index}
                <button
                    onclick={() => (selectedTeamIndex = index)}
                    class="px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition {selectedTeamIndex ===
                    index
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'}"
                >
                    {team.tournament.name}
                </button>
            {/each}
        </div>
    {/if}

    {#if selectedTeam}
        <!-- Team Stats -->
        <div class="grid md:grid-cols-3 gap-4">
            <div
                class="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10"
            >
                <div class="text-gray-400 mb-2">Jugadores Fichados</div>
                <div class="text-3xl font-bold text-white">
                    {selectedTeam.playerDetails.length}/5
                </div>
            </div>
            <div
                class="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10"
            >
                <div class="text-gray-400 mb-2">Puntos del Equipo</div>
                <div class="text-3xl font-bold text-green-400">
                    {selectedTeam.totalPoints}
                </div>
            </div>
            <div
                class="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10"
            >
                <div class="text-gray-400 mb-2">Presupuesto Restante</div>
                <div class="text-3xl font-bold text-yellow-400">
                    {formatPrice(data.user?.budget || 0)}
                </div>
            </div>
        </div>

        <!-- Team Players Grid -->
        <div
            class="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10"
        >
            <h2 class="text-2xl font-bold text-white mb-6">Lineup</h2>

            {#if selectedTeam.playerDetails.length === 0}
                <div class="text-center py-16">
                    <div class="text-6xl mb-4">♟️</div>
                    <div class="text-xl text-gray-400 mb-4">
                        No tienes jugadores en este equipo
                    </div>
                    <a
                        href="/market"
                        class="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
                    >
                        Ir al Mercado
                    </a>
                </div>
            {:else}
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {#each selectedTeam.playerDetails as player}
                        <div
                            class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border-2 transition hover:scale-105 {selectedTeam.captainId ===
                            player.id
                                ? 'border-yellow-400'
                                : 'border-white/10'}"
                        >
                            <!-- Captain Badge -->
                            {#if selectedTeam.captainId === player.id}
                                <div
                                    class="absolute -top-3 -right-3 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold"
                                >
                                    ⭐ CAPITÁN
                                </div>
                            {/if}

                            <!-- Player Avatar -->
                            <div class="flex justify-center mb-4">
                                <div
                                    class="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-5xl"
                                >
                                    ♔
                                </div>
                            </div>

                            <!-- Player Info -->
                            <div class="text-center mb-4">
                                <h3 class="text-xl font-bold text-white mb-1">
                                    {player.name}
                                </h3>
                                <div class="text-sm text-gray-400">
                                    Rank #{player.positionRank}
                                </div>
                                <div class="text-yellow-400 font-semibold mt-2">
                                    {formatPrice(player.currentPrice)}
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="space-y-2">
                                {#if selectedTeam.captainId !== player.id}
                                    <button
                                        onclick={() => setCaptain(player.id)}
                                        class="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                                    >
                                        ⭐ Hacer Capitán
                                    </button>
                                {/if}
                                <button
                                    onclick={() =>
                                        sellPlayer(player.id, player.name)}
                                    class="w-full bg-red-900/50 hover:bg-red-900 text-white px-4 py-2 rounded-lg font-semibold transition border border-red-500/50"
                                >
                                    💸 Vender (80%)
                                </button>
                            </div>
                        </div>
                    {/each}

                    <!-- Add Player Placeholder -->
                    {#if selectedTeam.playerDetails.length < 5}
                        <a
                            href="/market"
                            class="bg-white/5 rounded-xl p-6 border-2 border-dashed border-white/20 flex flex-col items-center justify-center hover:bg-white/10 hover:border-purple-500/50 transition min-h-[300px]"
                        >
                            <div class="text-6xl mb-4">➕</div>
                            <div class="text-xl font-semibold text-gray-300">
                                Fichar Jugador
                            </div>
                            <div class="text-sm text-gray-500 mt-2">
                                {5 - selectedTeam.playerDetails.length} espacios
                                disponibles
                            </div>
                        </a>
                    {/if}
                </div>
            {/if}
        </div>
    {:else}
        <!-- No Teams Yet -->
        <div
            class="bg-white/5 backdrop-blur-md rounded-xl p-16 border border-white/10 text-center"
        >
            <div class="text-6xl mb-4">🏆</div>
            <h2 class="text-2xl font-bold text-white mb-4">
                No tienes ningún equipo
            </h2>
            <p class="text-gray-400 mb-6">
                Crea tu primer equipo para un torneo activo
            </p>
            <button
                class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
            >
                Crear Equipo
            </button>
        </div>
    {/if}
</div>
