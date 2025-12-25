<script lang="ts">
    import {
        allPlayers,
        availablePlayers,
        ownedPlayerIds,
        playersLoading,
    } from "$lib/stores/players";
    import { user } from "$lib/stores/user";
    import { toast } from "$lib/stores/toast";
    import type { Player } from "$lib/services/lichessApi";
    import PlayerDetailModal from "$lib/components/PlayerDetailModal.svelte";

    let searchQuery = "";
    let sortBy: "position" | "price" | "name" = "position";
    let buyingPlayerId: string | null = null;

    // Modal State
    let showDetailModal = false;
    let selectedPlayer: Player | null = null;

    $: filteredPlayers = $availablePlayers
        .filter(
            (p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.username.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .sort((a, b) => {
            if (sortBy === "position") return a.position - b.position;
            if (sortBy === "price") return b.price - a.price;
            return a.name.localeCompare(b.name);
        });

    function isOwned(playerId: string): boolean {
        return $ownedPlayerIds.includes(playerId);
    }

    function buyPlayer(player: Player) {
        buyingPlayerId = player.id;
        showDetailModal = false; // Close modal if open

        const result = ownedPlayerIds.buyPlayer(player.id, player.price);

        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }

        buyingPlayerId = null;
    }

    function sellPlayer(player: Player) {
        const result = ownedPlayerIds.sellPlayer(player.id);

        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    }

    function openDetailModal(player: Player) {
        selectedPlayer = player;
        showDetailModal = true;
    }

    function formatPrice(price: number): string {
        return `${(price / 1000000).toFixed(0)}M`;
    }

    function getPriceColor(price: number, budget: number): string {
        if (price > budget) return "rgb(239, 83, 80)"; // error
        if (price > budget * 0.7) return "rgb(255, 183, 77)"; // warning
        return "rgb(102, 187, 106)"; // success
    }
</script>

<svelte:head>
    <title>Mercado - Grandmaster Fantasy</title>
</svelte:head>

<div class="space-y-6">
    <!-- Header -->
    <div>
        <h1 class="text-3xl font-bold text-white mb-2">Mercado de Jugadores</h1>
        <p class="text-sm text-slate-400">
            Ficha a jugadores del top 500 de ajedrez clásico de Lichess
        </p>
    </div>

    <!-- Search -->
    <div class="flex gap-4">
        <input
            type="text"
            placeholder="Buscar jugador..."
            bind:value={searchQuery}
            class="input flex-1"
        />
        <select bind:value={sortBy} class="input w-48 cursor-pointer">
            <option value="position">Por Ranking</option>
            <option value="price">Por Precio</option>
            <option value="name">Por Nombre</option>
        </select>
    </div>

    <!-- Loading State -->
    {#if $playersLoading}
        <div class="text-center py-20">
            <div class="text-6xl mb-6 mx-auto w-fit animate-pulse text-primary">
                ♔
            </div>
            <p class="text-slate-400 text-lg">
                Cargando jugadores desde Lichess...
            </p>
        </div>
    {:else}
        <!-- Table -->
        <div class="card overflow-hidden">
            <table class="w-full">
                <thead class="bg-slate-900/50 border-b border-white/5">
                    <tr>
                        <th
                            class="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400"
                            >#</th
                        >
                        <th
                            class="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400"
                            >Jugador</th
                        >
                        <th
                            class="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400"
                            >Rating</th
                        >
                        <th
                            class="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400"
                            >Precio</th
                        >
                        <th
                            class="px-4 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400"
                            >Acción</th
                        >
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    {#each filteredPlayers as player (player.id)}
                        <tr
                            class="hover:bg-white/5 transition-colors group cursor-pointer"
                            on:click={() => openDetailModal(player)}
                        >
                            <td
                                class="px-4 py-3 text-sm text-slate-500 font-mono"
                                >{player.position}</td
                            >
                            <td class="px-4 py-3">
                                <div class="flex items-center gap-3">
                                    <img
                                        src={player.photoUrl ||
                                            `https://ui-avatars.com/api/?name=${player.name}&background=random`}
                                        alt={player.name}
                                        class="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-primary/50 transition-colors"
                                        loading="lazy"
                                    />
                                    <div>
                                        <div
                                            class="font-medium text-white group-hover:text-primary transition-colors"
                                        >
                                            {player.name}
                                        </div>
                                        <div class="text-xs text-slate-500">
                                            @{player.username}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-4 py-3">
                                <span
                                    class="font-mono font-bold text-slate-300 bg-slate-800/50 px-2 py-1 rounded text-xs"
                                >
                                    {player.rating}
                                </span>
                            </td>
                            <td class="px-4 py-3">
                                <span
                                    class="font-bold"
                                    style="color: {getPriceColor(
                                        player.price,
                                        $user.budget,
                                    )}"
                                >
                                    {formatPrice(player.price)}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-right">
                                {#if isOwned(player.id)}
                                    <span
                                        class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-success/20 text-success border border-success/30"
                                    >
                                        ✓ Fichado
                                    </span>
                                {:else}
                                    <button
                                        on:click|stopPropagation={() =>
                                            buyPlayer(player)}
                                        disabled={buyingPlayerId ===
                                            player.id ||
                                            $user.budget < player.price}
                                        class="btn-primary text-xs px-4 py-1.5 min-w-[90px] shadow-lg shadow-green-900/20"
                                    >
                                        {#if buyingPlayerId === player.id}
                                            <span
                                                class="animate-spin inline-block"
                                                >↻</span
                                            >
                                        {:else if $user.budget < player.price}
                                            Sin saldo
                                        {:else}
                                            Fichar
                                        {/if}
                                    </button>
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        {#if filteredPlayers.length === 0}
            <div class="text-center py-20">
                <p class="text-slate-500">No se encontraron jugadores</p>
            </div>
        {/if}
    {/if}
</div>

<PlayerDetailModal
    bind:isOpen={showDetailModal}
    player={selectedPlayer}
    onClose={() => (showDetailModal = false)}
    on:buy={(e) => buyPlayer(e.detail)}
    on:sell={(e) => sellPlayer(e.detail)}
/>
