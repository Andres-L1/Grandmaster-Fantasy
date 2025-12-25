<script lang="ts">
    import { teamPlayers, currentTeam, captain } from "$lib/stores/teams";
    import {
        ownedPlayers,
        ownedPlayerIds,
        allPlayers,
    } from "$lib/stores/players";
    import type { OwnedPlayer } from "$lib/stores/players";
    import Modal from "$lib/components/Modal.svelte";

    let message: { text: string; type: "success" | "error" } | null = null;

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
            showMessage(result.message, result.success ? "success" : "error");
            if (result.success) {
                showClauseModal = false;
            }
        }
    }

    function addToTeam(playerId: string) {
        const result = currentTeam.addToTeam(playerId);
        showMessage(result.message, result.success ? "success" : "error");
    }

    function removeFromTeam(playerId: string) {
        currentTeam.removeFromTeam(playerId);
        showMessage("Jugador eliminado del equipo", "success");
    }

    function sellPlayer(player: OwnedPlayer) {
        if (
            confirm(
                `¿Vender a ${player.name}? Recibirás ${((player.price * 0.8) / 1000000).toFixed(0)}M`,
            )
        ) {
            const result = ownedPlayerIds.sellPlayer(player.id);
            showMessage(result.message, result.success ? "success" : "error");
        }
    }

    function setCaptainPlayer(playerId: string) {
        const result = captain.setCaptain(
            $captain === playerId ? null : playerId,
        );
        showMessage(result.message, result.success ? "success" : "error");
    }

    function showMessage(text: string, type: "success" | "error") {
        message = { text, type };
        setTimeout(() => (message = null), 3000);
    }

    function formatPrice(price: number): string {
        return `${(price / 1000000).toFixed(0)}M`;
    }
</script>

<svelte:head>
    <title>Mi Equipo - Grandmaster Fantasy</title>
</svelte:head>

<div class="space-y-6">
    <!-- Header -->
    <div>
        <h1 class="text-3xl font-bold" style="color: rgb(227, 242, 253);">
            Mi Equipo
        </h1>
        <p class="text-sm mt-2" style="color: rgb(120, 144, 156);">
            Gestiona tu plantilla, alineación y cláusulas de rescisión
        </p>
    </div>

    <!-- Message -->
    {#if message}
        <div
            class="p-4 rounded-lg border {message.type === 'success'
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'}"
            role="alert"
        >
            <span
                style="color: {message.type === 'success'
                    ? 'rgb(102, 187, 106)'
                    : 'rgb(239, 83, 80)'};"
            >
                {message.text}
            </span>
        </div>
    {/if}

    <!-- Active Lineup -->
    <div class="card">
        <h2 class="text-xl font-bold mb-4" style="color: rgb(227, 242, 253);">
            Alineación Activa ({$currentTeam.length}/5)
        </h2>

        {#if $teamPlayers.length === 0}
            <div class="text-center py-12">
                <div class="text-5xl mb-4">♔</div>
                <p class="mb-2" style="color: rgb(176, 190, 197);">
                    Sin jugadores en la alineación
                </p>
                <p class="text-sm" style="color: rgb(120, 144, 156);">
                    Añade jugadores desde tu roster
                </p>
            </div>
        {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each $teamPlayers as player (player.id)}
                    {@const clause =
                        $ownedPlayers.find((p) => p.id === player.id)?.clause ||
                        player.price}
                    <div class="card relative group">
                        {#if $captain === player.id}
                            <div
                                class="absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold z-10"
                                style="background: rgba(255, 160, 0, 0.2); color: rgb(255, 160, 0);"
                            >
                                ★ Capitán
                            </div>
                        {/if}

                        <div class="flex items-start gap-4 mb-4">
                            <img
                                src={player.photoUrl ||
                                    `https://ui-avatars.com/api/?name=${player.name}&background=random`}
                                alt={player.name}
                                class="w-12 h-12 rounded-full object-cover border border-[rgba(255,255,255,0.1)]"
                            />
                            <div>
                                <h3
                                    class="font-semibold text-white leading-tight"
                                >
                                    {player.name}
                                </h3>
                                <div class="text-xs text-gray-400 mt-1">
                                    Rating: {player.rating}
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-2 mb-4 text-sm">
                            <div
                                class="bg-[rgba(255,255,255,0.05)] p-2 rounded"
                            >
                                <div
                                    class="text-[10px] text-gray-500 uppercase"
                                >
                                    Valor
                                </div>
                                <div class="text-white font-medium">
                                    {formatPrice(player.price)}
                                </div>
                            </div>

                            <div
                                class="bg-[rgba(255,160,0,0.1)] p-2 rounded cursor-pointer hover:bg-[rgba(255,160,0,0.2)] transition"
                                onclick={() =>
                                    openClauseModal(
                                        $ownedPlayers.find(
                                            (p) => p.id === player.id,
                                        ),
                                    )}
                            >
                                <div
                                    class="text-[10px] text-amber-500/80 uppercase"
                                >
                                    Cláusula
                                </div>
                                <div class="text-amber-400 font-medium">
                                    {formatPrice(clause)} ✎
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-2">
                            <button
                                onclick={() => setCaptainPlayer(player.id)}
                                class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition"
                                style="background: rgba(255, 160, 0, 0.1); border: 1px solid rgba(255, 160, 0, 0.3); color: rgb(255, 160, 0);"
                            >
                                {$captain === player.id
                                    ? "Quitar C"
                                    : "Capitán"}
                            </button>
                            <button
                                onclick={() => removeFromTeam(player.id)}
                                class="flex-1 btn-danger text-sm"
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
    <div class="card mt-8">
        <h2 class="text-xl font-bold mb-4" style="color: rgb(227, 242, 253);">
            Banquillo / Roster ({$ownedPlayers.length}/15)
        </h2>

        {#if rosterPlayers.length === 0}
            <div class="text-center py-8">
                <p style="color: rgb(120, 144, 156);">
                    {$ownedPlayers.length === 0
                        ? "No has fichado jugadores."
                        : "Todos tus jugadores están en la alineación."}
                </p>
                {#if $ownedPlayers.length === 0}
                    <a
                        href="/Grandmaster-Fantasy/market"
                        class="btn-primary inline-block mt-4">Ir al Mercado</a
                    >
                {/if}
            </div>
        {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each rosterPlayers as player (player.id)}
                    <div class="card">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="font-semibold text-white">
                                {player.name}
                            </h3>
                            <div
                                class="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400"
                            >
                                Rating {player.rating}
                            </div>
                        </div>

                        <div
                            class="flex justify-between items-center mb-4 text-sm"
                        >
                            <span class="text-gray-400">Cláusula:</span>
                            <button
                                class="text-amber-400 font-medium hover:text-amber-300"
                                onclick={() => openClauseModal(player)}
                            >
                                {formatPrice(player.clause)} ✎
                            </button>
                        </div>

                        <div class="flex gap-2">
                            <button
                                onclick={() => addToTeam(player.id)}
                                disabled={$currentTeam.length >= 5}
                                class="flex-1 btn-primary text-sm"
                            >
                                Alinear
                            </button>
                            <button
                                onclick={() => sellPlayer(player)}
                                class="flex-1 btn-danger text-sm"
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
        <div class="text-center mb-6">
            <img
                src={selectedPlayer.photoUrl ||
                    `https://ui-avatars.com/api/?name=${selectedPlayer.name}`}
                alt={selectedPlayer.name}
                class="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-amber-500/50"
            />
            <h3 class="text-xl font-bold text-white">{selectedPlayer.name}</h3>
            <p class="text-gray-400">
                Cláusula actual: <span class="text-white"
                    >{formatPrice(selectedPlayer.clause)}</span
                >
            </p>
        </div>

        <div class="space-y-4">
            <div>
                <label class="block text-sm text-gray-400 mb-2"
                    >Nueva Cláusula (M)</label
                >
                <input
                    type="range"
                    min={selectedPlayer.price}
                    max={selectedPlayer.price * 5}
                    step={1000000}
                    bind:value={newClauseValue}
                    class="w-full accent-amber-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div class="flex justify-between mt-2">
                    <span class="text-amber-400 text-xl font-bold"
                        >{formatPrice(newClauseValue)}</span
                    >
                    <span class="text-xs text-gray-500"
                        >Max: {formatPrice(selectedPlayer.price * 5)}</span
                    >
                </div>
            </div>

            <div class="bg-[rgba(0,0,0,0.3)] p-4 rounded-lg">
                <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-400">Coste de mejora (10%):</span>
                    <span class="text-red-400 font-medium"
                        >-{formatPrice(increaseCost)}</span
                    >
                </div>
                <hr class="border-gray-700 my-2" />
                <div class="text-xs text-gray-500 text-center">
                    Aumentar la cláusula protege a tu jugador de ser robado por
                    otros equipos.
                </div>
            </div>

            <button
                class="w-full btn-primary py-3 font-bold text-lg"
                disabled={increaseCost === 0}
                onclick={confirmIncreaseClause}
            >
                Confirmar Blindaje
            </button>
        </div>
    {/if}
</Modal>
