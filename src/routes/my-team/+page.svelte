<script lang="ts">
    import { teamPlayers, currentTeam, captain } from "$lib/stores/teams";
    import {
        ownedPlayers,
        ownedPlayerIds,
        allPlayers,
    } from "$lib/stores/players";
    import type { OwnedPlayer } from "$lib/stores/players";
    import { toast } from "$lib/stores/toast";
    import Modal from "$lib/components/Modal.svelte";

    // Clause Increase Modal State
    let showClauseModal = false;
    let selectedPlayer: OwnedPlayer | null = null;
    let newClauseValue: number = 0;

    $: rosterPlayers = $ownedPlayers.filter(
        (p) => !$currentTeam.includes(p.id),
    );

    // Calculate cost to increase clause dynamically
    $: increaseCost =
        selectedPlayer && newClauseValue > selectedPlayer.clause
            ? Math.floor((newClauseValue - selectedPlayer.clause) * 0.1)
            : 0;

    function openClauseModal(player: OwnedPlayer | undefined) {
        if (!player) return;
        selectedPlayer = player;
        newClauseValue = player.clause;
        showClauseModal = true;
    }

    function confirmIncreaseClause() {
        if (selectedPlayer && newClauseValue > selectedPlayer.clause) {
            const result = ownedPlayerIds.increaseClause(
                selectedPlayer.id,
                newClauseValue,
            );

            if (result.success) {
                toast.success(result.message);
                showClauseModal = false;
            } else {
                toast.error(result.message);
            }
        }
    }

    function addToTeam(playerId: string) {
        const result = currentTeam.addToTeam(playerId);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    }

    function removeFromTeam(playerId: string) {
        currentTeam.removeFromTeam(playerId);
        toast.success("Jugador eliminado del equipo");
    }

    function sellPlayer(player: OwnedPlayer) {
        if (
            confirm(
                `¿Vender a ${player.name}? Recibirás ${((player.price * 0.8) / 1000000).toFixed(0)}M`,
            )
        ) {
            const result = ownedPlayerIds.sellPlayer(player.id);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        }
    }

    function setCaptainPlayer(playerId: string) {
        const result = captain.setCaptain(
            $captain === playerId ? null : playerId,
        );
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    }

    function formatPrice(price: number): string {
        return `${(price / 1000000).toFixed(0)}M`;
    }
</script>

<svelte:head>
    <title>Mi Equipo - Grandmaster Fantasy</title>
</svelte:head>

<div class="space-y-8">
    <!-- Header -->
    <div>
        <h1 class="text-3xl font-bold font-serif text-white mb-2">Mi Equipo</h1>
        <p class="text-sm text-slate-400">
            Gestiona tu plantilla, alineación y cláusulas de rescisión
        </p>
    </div>

    <!-- Active Lineup -->
    <div class="card p-6">
        <h2
            class="text-xl font-bold font-serif text-white mb-6 flex items-center gap-3"
        >
            <span class="text-2xl">♟</span> Alineación Activa
            <span class="text-sm font-sans font-normal text-slate-400 ml-2"
                >({$currentTeam.length}/3)</span
            >
        </h2>

        {#if $teamPlayers.length === 0}
            <div
                class="text-center py-16 border-2 border-dashed border-slate-700/50 rounded-xl bg-slate-900/30"
            >
                <div class="text-5xl mb-4 text-slate-600">♔</div>
                <p class="mb-2 text-slate-400 font-medium">
                    Sin jugadores en la alineación
                </p>
                <p class="text-sm text-slate-500">
                    Añade jugadores desde tu roster para empezar a puntuar
                </p>
            </div>
        {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each $teamPlayers as player (player.id)}
                    {@const clause =
                        $ownedPlayers.find((p) => p.id === player.id)?.clause ||
                        player.price}
                    <div
                        class="relative group bg-slate-800/40 rounded-xl border border-white/5 p-4 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                    >
                        {#if $captain === player.id}
                            <div
                                class="absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold z-10 shadow-lg bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-900 border border-yellow-400"
                            >
                                ★ CAPITÁN
                            </div>
                        {/if}

                        <div class="flex items-start gap-4 mb-4">
                            <div class="relative">
                                <img
                                    src={player.photoUrl ||
                                        `https://ui-avatars.com/api/?name=${player.name}&background=random`}
                                    alt={player.name}
                                    class="w-14 h-14 rounded-full object-cover border-2 border-white/10 group-hover:border-primary transition-colors"
                                />
                                <div
                                    class="absolute -bottom-1 -right-1 bg-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/10 text-slate-300"
                                >
                                    {player.rating}
                                </div>
                            </div>
                            <div class="overflow-hidden">
                                <h3
                                    class="font-bold text-white leading-tight truncate pr-2 group-hover:text-primary transition-colors"
                                >
                                    {player.name}
                                </h3>
                                <div
                                    class="text-xs text-slate-400 mt-1 truncate"
                                >
                                    @{player.username}
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-3 mb-4 text-sm">
                            <div
                                class="bg-slate-900/50 p-2.5 rounded-lg border border-white/5"
                            >
                                <div
                                    class="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5"
                                >
                                    Valor
                                </div>
                                <div class="text-white font-mono font-medium">
                                    {formatPrice(player.price)}
                                </div>
                            </div>

                            <button
                                type="button"
                                class="bg-amber-500/5 p-2.5 rounded-lg cursor-pointer hover:bg-amber-500/10 transition-colors text-left border border-amber-500/10 group/clause"
                                onclick={() =>
                                    openClauseModal(
                                        $ownedPlayers.find(
                                            (p) => p.id === player.id,
                                        ),
                                    )}
                            >
                                <div
                                    class="text-[10px] text-amber-500/70 uppercase tracking-wider mb-0.5"
                                >
                                    Cláusula
                                </div>
                                <div
                                    class="text-amber-400 font-mono font-medium group-hover/clause:text-amber-300 transition-colors"
                                >
                                    {formatPrice(clause)}
                                    <span class="text-xs">✎</span>
                                </div>
                            </button>
                        </div>

                        <div class="flex gap-2">
                            <button
                                onclick={() => setCaptainPlayer(player.id)}
                                class="flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
									{$captain === player.id
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white border border-transparent'}"
                            >
                                {$captain === player.id
                                    ? "Quitar C"
                                    : "Capitán"}
                            </button>
                            <button
                                onclick={() => removeFromTeam(player.id)}
                                class="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 transition-colors"
                            >
                                Banquillo
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>

    <!-- Roster -->
    <div class="mt-12">
        <h2
            class="text-xl font-bold font-serif text-white mb-6 flex items-center gap-3 px-1"
        >
            <span class="text-2xl text-slate-500">👥</span> Banquillo
            <span class="text-sm font-sans font-normal text-slate-400 ml-2"
                >({$ownedPlayers.length}/15)</span
            >
        </h2>

        {#if rosterPlayers.length === 0}
            <div class="text-center py-12 bg-slate-900/30 rounded-xl">
                <p class="text-slate-400 mb-4">
                    {$ownedPlayers.length === 0
                        ? "No has fichado jugadores aún."
                        : "Todos tus jugadores están en la alineación titular."}
                </p>
                {#if $ownedPlayers.length === 0}
                    <a
                        href="/Grandmaster-Fantasy/market"
                        class="btn-primary inline-flex items-center gap-2"
                    >
                        <span>+</span> Ir al Mercado
                    </a>
                {/if}
            </div>
        {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {#each rosterPlayers as player (player.id)}
                    <div
                        class="bg-slate-900/50 rounded-lg p-4 border border-white/5 hover:border-white/10 transition-colors"
                    >
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h3
                                    class="font-bold text-white text-sm truncate max-w-[120px]"
                                >
                                    {player.name}
                                </h3>
                                <div
                                    class="text-xs text-slate-500 truncate max-w-[120px]"
                                >
                                    @{player.username}
                                </div>
                            </div>
                            <div
                                class="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 border border-white/5 font-mono"
                            >
                                {player.rating}
                            </div>
                        </div>

                        <div
                            class="flex justify-between items-center mb-4 text-xs bg-slate-950/30 p-2 rounded"
                        >
                            <span
                                class="text-slate-500 uppercase tracking-wider"
                                >Cláusula</span
                            >
                            <button
                                class="text-amber-400 font-mono font-medium hover:text-amber-300 hover:underline"
                                onclick={() => openClauseModal(player)}
                            >
                                {formatPrice(player.clause)} ✎
                            </button>
                        </div>

                        <div class="flex gap-2">
                            <button
                                onclick={() => addToTeam(player.id)}
                                disabled={$currentTeam.length >= 3}
                                class="flex-1 bg-primary text-slate-900 font-bold text-xs py-2 rounded hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Alinear
                            </button>
                            <button
                                onclick={() => sellPlayer(player)}
                                class="px-3 bg-red-500/10 text-red-400 font-bold text-xs py-2 rounded border border-red-500/20 hover:bg-red-500/20 transition-all"
                            >
                                Vender
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<!-- Modal Blindaje -->
<Modal
    isOpen={showClauseModal}
    title="Blindar Jugador"
    onClose={() => (showClauseModal = false)}
>
    {#if selectedPlayer}
        <div class="text-center mb-8">
            <div class="relative inline-block mb-4">
                <img
                    src={selectedPlayer.photoUrl ||
                        `https://ui-avatars.com/api/?name=${selectedPlayer.name}`}
                    alt={selectedPlayer.name}
                    class="w-24 h-24 rounded-full border-4 border-amber-500/20 shadow-xl"
                />
                <div
                    class="absolute bottom-0 right-0 bg-slate-900 text-amber-500 text-lg p-1.5 rounded-full border border-amber-500/30"
                >
                    🛡️
                </div>
            </div>
            <h3 class="text-2xl font-bold font-serif text-white">
                {selectedPlayer.name}
            </h3>
            <p class="text-slate-400 mt-1">
                Cláusula actual: <span class="text-white font-mono"
                    >{formatPrice(selectedPlayer.clause)}</span
                >
            </p>
        </div>

        <div class="space-y-6">
            <div class="bg-slate-800/50 p-6 rounded-xl border border-white/5">
                <label
                    for="clause-range"
                    class="block text-sm font-medium text-slate-300 mb-4"
                >
                    Nueva Cláusula (M)
                </label>

                <div class="flex items-center gap-4 mb-4">
                    <span class="font-mono text-slate-500 text-xs"
                        >{formatPrice(selectedPlayer.price)}</span
                    >
                    <input
                        id="clause-range"
                        type="range"
                        min={selectedPlayer.price}
                        max={selectedPlayer.price * 5}
                        step={1000000}
                        bind:value={newClauseValue}
                        class="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400"
                    />
                    <span class="font-mono text-slate-500 text-xs"
                        >{formatPrice(selectedPlayer.price * 5)}</span
                    >
                </div>

                <div class="text-center">
                    <span
                        class="text-4xl font-bold font-mono text-amber-400 tracking-tight"
                        >{formatPrice(newClauseValue)}</span
                    >
                </div>
            </div>

            <div
                class="bg-slate-900/50 p-4 rounded-lg flex justify-between items-center text-sm border border-white/5"
            >
                <span class="text-slate-400">Coste de la operación (10%)</span>
                <span
                    class="font-bold font-mono {increaseCost > 0
                        ? 'text-red-400'
                        : 'text-slate-500'}">-{formatPrice(increaseCost)}</span
                >
            </div>

            <div class="text-xs text-center text-slate-500 px-4">
                Al blindar a este jugador, reduces la probabilidad de que otros
                equipos paguen su cláusula.
            </div>

            <button
                class="w-full btn-primary py-3.5 text-base shadow-lg shadow-amber-500/10"
                disabled={increaseCost === 0}
                onclick={confirmIncreaseClause}
            >
                Confirmar Blindaje
            </button>
        </div>
    {/if}
</Modal>
