<script lang="ts">
    import {
        collectionIds,
        allPlayers,
        playersLoading,
    } from "$lib/stores/players";
    import { user } from "$lib/stores/user";
    import Card from "$lib/components/Card.svelte";
    import { onMount } from "svelte";
    import { toast } from "$lib/stores/toast";

    let showMissing = $state(true); // Default to showing placeholder for missing
    let searchQuery = $state("");

    // Pagination
    let currentPage = $state(1);
    const pageSize = 20;

    // Derived filtered list
    let filteredPlayers = $derived.by(() => {
        let players = $allPlayers;

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            players = players.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.username.toLowerCase().includes(q),
            );
        }

        // Filter collected?
        // Actually for an "Album" feel, we usually want to see gaps.
        if (!showMissing) {
            players = players.filter((p) => $collectionIds.includes(p.id));
        }

        return players;
    });

    let displayPlayers = $derived(
        filteredPlayers.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize,
        ),
    );
    let totalPages = $derived(Math.ceil(filteredPlayers.length / pageSize));

    // Stats
    let collectedCount = $derived($collectionIds.length);
    let totalCount = $derived($allPlayers.length);
    let progressPercent = $derived(
        totalCount > 0 ? (collectedCount / totalCount) * 100 : 0,
    );

    function sellDuplicate(player: any) {
        // Base sell prices (50% of original value)
        let basePrice = 10;
        if (player.rating >= 2700) basePrice = 500;
        else if (player.rating >= 2660) basePrice = 250;
        else if (player.rating >= 2655) basePrice = 50;
        else if (player.rating >= 2650) basePrice = 25;

        // Check if this is the last copy
        const copies = $collectionIds.filter((id) => id === player.id).length;
        const isLastCopy = copies === 1;

        // If it's the last copy, apply 75% penalty (25% of base price)
        let finalPrice = isLastCopy ? Math.floor(basePrice * 0.25) : basePrice;

        const warningMsg = isLastCopy
            ? `⚠️ ÚLTIMA CARTA: Solo recibirás ${finalPrice} monedas (25% del valor). ¿Seguro que quieres vender a ${player.name}?`
            : `¿Vender a ${player.name} por ${finalPrice} monedas?`;

        if (confirm(warningMsg)) {
            collectionIds.removeCard(player.id);
            user.addCoins(finalPrice);
            toast.success(`Vendido ${player.name} por ${finalPrice} monedas.`);
        }
    }
</script>

<svelte:head>
    <title>Colección - Grandmaster Legends</title>
</svelte:head>

<div class="space-y-8">
    <!-- Header Stats -->
    <div
        class="bg-slate-900/50 p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6"
    >
        <div>
            <h1 class="text-3xl font-bold font-serif text-white">Tu Álbum</h1>
            <p class="text-slate-400">
                Completa la colección de los 500 mejores.
            </p>
        </div>

        <div class="flex items-center gap-8">
            <div class="text-center">
                <div class="text-3xl font-mono font-bold text-amber-400">
                    {collectedCount}
                    <span class="text-slate-500 text-lg">/ {totalCount}</span>
                </div>
                <div class="text-xs uppercase tracking-widest text-slate-500">
                    Cartas
                </div>
            </div>

            <!-- Progress Bar -->
            <div
                class="w-48 h-4 bg-slate-800 rounded-full overflow-hidden border border-white/10"
            >
                <div
                    class="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-1000"
                    style="width: {progressPercent}%"
                ></div>
            </div>
            <div class="font-mono text-sm text-amber-400">
                {progressPercent.toFixed(1)}%
            </div>
        </div>
    </div>

    <!-- Controls -->
    <div class="flex flex-col md:flex-row justify-between gap-4">
        <input
            type="text"
            placeholder="Buscar jugador..."
            bind:value={searchQuery}
            class="bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 w-full md:w-64"
        />

        <div class="flex items-center gap-4">
            <label
                class="flex items-center gap-2 text-sm text-slate-300 cursor-pointer"
            >
                <input
                    type="checkbox"
                    bind:checked={showMissing}
                    class="rounded bg-slate-800 border-white/10 text-amber-500 focus:ring-amber-500/50"
                />
                Mostrar Faltantes
            </label>

            <!-- Pagination Controls -->
            {#if totalPages > 1}
                <div
                    class="flex items-center gap-2 bg-slate-900 px-2 py-1 rounded-lg"
                >
                    <button
                        disabled={currentPage === 1}
                        onclick={() => currentPage--}
                        class="px-2 py-1 text-slate-400 hover:text-white disabled:opacity-30"
                        >←</button
                    >
                    <span class="text-xs font-mono text-slate-500"
                        >{currentPage} / {totalPages}</span
                    >
                    <button
                        disabled={currentPage === totalPages}
                        onclick={() => currentPage++}
                        class="px-2 py-1 text-slate-400 hover:text-white disabled:opacity-30"
                        >→</button
                    >
                </div>
            {/if}
        </div>
    </div>

    <!-- Grid -->
    {#if $playersLoading}
        <div class="py-20 text-center text-slate-500 animate-pulse">
            Cargando base de datos de jugadores...
        </div>
    {:else}
        <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
            {#each displayPlayers as player (player.id)}
                {@const isOwned = $collectionIds.includes(player.id)}

                <div class="relative group perspective">
                    {#if isOwned}
                        <Card {player} onClick={() => sellDuplicate(player)} />
                    {:else}
                        <!-- Empty Slot / Ghost Card -->
                        <div
                            class="w-full aspect-[2/3] rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center grayscale opacity-40 hover:opacity-100 transition-opacity"
                        >
                            <div class="text-4xl mb-2 text-slate-700">?</div>
                            <div
                                class="text-xs text-slate-600 font-bold uppercase"
                            >
                                {player.name}
                            </div>
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}

    {#if filteredPlayers.length === 0}
        <div class="py-20 text-center text-slate-500">
            No se encontraron cartas con ese criterio.
        </div>
    {/if}
</div>
