<script lang="ts">
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    let searchQuery = $state("");
    let userBudget = $state(100000000); // Mock budget - should come from user session

    // Filter players based on search
    const filteredPlayers = $derived(
        data.players.filter((player) =>
            player.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );

    function formatPrice(price: number): string {
        return (price / 1000000).toFixed(1) + "M";
    }

    function canAfford(price: number): boolean {
        return userBudget >= price;
    }

    async function signPlayer(
        playerId: string,
        playerName: string,
        price: number,
    ) {
        if (!canAfford(price)) {
            alert("Presupuesto insuficiente");
            return;
        }
        // TODO: Implement actual API call
        alert(`Fichando a ${playerName}... (implementar API)`);
    }
</script>

<svelte:head>
    <title>Mercado - Grandmaster Fantasy</title>
</svelte:head>

<div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-4xl font-bold text-white mb-2">
                Mercado de Jugadores
            </h1>
            <p class="text-gray-400">
                Ficha a los mejores Grandes Maestros del mundo
            </p>
        </div>
        <div
            class="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 rounded-xl"
        >
            <div class="text-sm text-white/80">Presupuesto Disponible</div>
            <div class="text-3xl font-bold text-white">
                {formatPrice(userBudget)}
            </div>
        </div>
    </div>

    <!-- Search Bar -->
    <div
        class="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10"
    >
        <input
            type="text"
            bind:value={searchQuery}
            placeholder="🔍 Buscar jugador por nombre..."
            class="w-full bg-transparent text-white placeholder-gray-400 outline-none text-lg"
        />
    </div>

    <!-- Players Table -->
    <div
        class="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden"
    >
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="border-b border-white/10">
                        <th class="text-left p-4 text-gray-300 font-semibold"
                            >Rank</th
                        >
                        <th class="text-left p-4 text-gray-300 font-semibold"
                            >Jugador</th
                        >
                        <th class="text-left p-4 text-gray-300 font-semibold"
                            >Precio</th
                        >
                        <th class="text-left p-4 text-gray-300 font-semibold"
                            >Prom. Puntos</th
                        >
                        <th class="text-left p-4 text-gray-300 font-semibold"
                            >Acción</th
                        >
                    </tr>
                </thead>
                <tbody>
                    {#each filteredPlayers as player (player.id)}
                        <tr
                            class="border-b border-white/5 hover:bg-white/5 transition"
                        >
                            <td class="p-4 text-gray-300"
                                >#{player.positionRank}</td
                            >
                            <td class="p-4">
                                <div class="flex items-center space-x-3">
                                    <div
                                        class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl"
                                    >
                                        ♔
                                    </div>
                                    <div>
                                        <div class="text-white font-semibold">
                                            {player.name}
                                        </div>
                                        <div class="text-sm text-gray-400">
                                            FIDE: {player.fideId}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="p-4">
                                <div class="text-yellow-400 font-bold text-lg">
                                    {formatPrice(player.currentPrice)}
                                </div>
                            </td>
                            <td class="p-4">
                                <div class="text-green-400 font-semibold">
                                    {player.averagePoints.toFixed(1)}
                                </div>
                            </td>
                            <td class="p-4">
                                {#if canAfford(player.currentPrice)}
                                    <button
                                        onclick={() =>
                                            signPlayer(
                                                player.id,
                                                player.name,
                                                player.currentPrice,
                                            )}
                                        class="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition transform hover:scale-105"
                                    >
                                        Fichar
                                    </button>
                                {:else}
                                    <button
                                        disabled
                                        class="bg-gray-700 text-gray-500 px-6 py-2 rounded-lg font-semibold cursor-not-allowed"
                                    >
                                        Sin presupuesto
                                    </button>
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        {#if filteredPlayers.length === 0}
            <div class="p-12 text-center text-gray-400">
                <div class="text-4xl mb-4">🔍</div>
                <div>No se encontraron jugadores</div>
            </div>
        {/if}
    </div>

    <!-- Market Info -->
    <div
        class="bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur-md rounded-xl p-6 border border-white/10"
    >
        <h3 class="text-xl font-bold text-white mb-3">
            ℹ️ Información del Mercado
        </h3>
        <ul class="space-y-2 text-gray-300">
            <li>• Cada equipo puede tener máximo 5 jugadores</li>
            <li>
                • Los precios fluctúan según el rendimiento de los jugadores
            </li>
            <li>
                • Al vender un jugador, recuperas el 80% de su precio actual
            </li>
            <li>• Debes designar un capitán que multiplicará sus puntos x2</li>
        </ul>
    </div>
</div>
