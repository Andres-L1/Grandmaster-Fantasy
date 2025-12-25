<script lang="ts">
    import Modal from "./Modal.svelte";
    import { ownedPlayerIds } from "$lib/stores/players";
    import { user } from "$lib/stores/user";
    import type { Player } from "$lib/services/lichessApi";
    import { createEventDispatcher } from "svelte";
    import confetti from "canvas-confetti";

    export let isOpen = false;
    export let player: Player | null = null;
    export let onClose: () => void;

    const dispatch = createEventDispatcher();

    $: isOwned = player ? $ownedPlayerIds.includes(player.id) : false;
    $: canAfford = player ? $user.budget >= player.price : false;

    function formatPrice(price: number): string {
        return `${(price / 1000000).toFixed(1)}M`;
    }

    function handleBuy() {
        if (!player) return;
        dispatch("buy", player);
        fireConfetti();
        onClose();
    }

    function handleSell() {
        if (!player) return;
        dispatch("sell", player);
        onClose();
    }

    function fireConfetti() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#FFD700", "#FFA500", "#FFFFFF"],
        });
    }

    function getRatingColor(rating: number): string {
        if (rating >= 2800) return "text-purple-400";
        if (rating >= 2700) return "text-red-400";
        if (rating >= 2600) return "text-amber-400";
        return "text-green-400";
    }
</script>

<Modal {isOpen} title="Ficha de Jugador" {onClose}>
    {#if player}
        <div class="space-y-6">
            <!-- Header Profile -->
            <div class="flex flex-col items-center text-center">
                <div class="relative mb-4">
                    <img
                        src={player.photoUrl ||
                            `https://ui-avatars.com/api/?name=${player.name}&background=random`}
                        alt={player.name}
                        class="w-32 h-32 rounded-full border-4 border-amber-500/20 shadow-2xl object-cover"
                    />
                    {#if player.title}
                        <div
                            class="absolute -bottom-2 md:right-0 right-8 bg-amber-500 text-slate-900 font-bold px-2 py-0.5 rounded text-xs border border-white/20 shadow-lg"
                        >
                            {player.title}
                        </div>
                    {/if}
                    <div
                        class="absolute -bottom-2 left-8 md:left-0 bg-slate-800 text-white font-mono text-xs px-2 py-0.5 rounded border border-white/10"
                    >
                        Rank #{player.position}
                    </div>
                </div>

                <h3 class="text-2xl font-bold font-serif text-white">
                    {player.name}
                </h3>
                <p class="text-slate-400 font-mono text-sm">
                    @{player.username}
                </p>
                {#if player.country}
                    <p
                        class="text-xs text-slate-500 mt-1 uppercase tracking-widest"
                    >
                        {player.country}
                    </p>
                {/if}
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-3 gap-2">
                <div
                    class="bg-slate-800/50 p-3 rounded-lg border border-white/5 text-center flex flex-col items-center justify-center"
                >
                    <div class="text-2xl mb-1">♟️</div>
                    <div
                        class="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1"
                    >
                        Classic
                    </div>
                    <div
                        class={`text-lg font-bold font-mono ${getRatingColor(player.rating)}`}
                    >
                        {player.rating}
                    </div>
                </div>
                <div
                    class="bg-slate-800/50 p-3 rounded-lg border border-white/5 text-center flex flex-col items-center justify-center"
                >
                    <div class="text-2xl mb-1">🐇</div>
                    <div
                        class="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1"
                    >
                        Rapid
                    </div>
                    <div
                        class={`text-lg font-bold font-mono ${getRatingColor(player.ratingRapid || player.rating - 100)}`}
                    >
                        {player.ratingRapid || "-"}
                    </div>
                    {#if !player.ratingRapid}<span
                            class="text-[9px] text-slate-600">(Est)</span
                        >{/if}
                </div>
                <div
                    class="bg-slate-800/50 p-3 rounded-lg border border-white/5 text-center flex flex-col items-center justify-center"
                >
                    <div class="text-2xl mb-1">⚡</div>
                    <div
                        class="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1"
                    >
                        Blitz
                    </div>
                    <div
                        class={`text-lg font-bold font-mono ${getRatingColor(player.ratingBlitz || player.rating + 50)}`}
                    >
                        {player.ratingBlitz || "-"}
                    </div>
                    {#if !player.ratingBlitz}<span
                            class="text-[9px] text-slate-600">(Est)</span
                        >{/if}
                </div>
            </div>

            <!-- Market Info -->
            <div
                class="bg-slate-900/50 p-4 rounded-xl border border-white/5 flex justify-between items-center"
            >
                <div>
                    <div
                        class="text-xs text-slate-400 uppercase tracking-wider mb-1"
                    >
                        Valor de Mercado
                    </div>
                    <div class="text-3xl font-bold text-white font-mono">
                        {formatPrice(player.price)}
                    </div>
                </div>
                <div class="text-right">
                    {#if isOwned}
                        <div
                            class="px-3 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30"
                        >
                            EN PROPIEDAD
                        </div>
                    {:else if canAfford}
                        <div class="text-xs text-green-400 font-medium">
                            Puedes pagarlo
                        </div>
                    {:else}
                        <div class="text-xs text-red-400 font-medium">
                            Insuficiente (-{formatPrice(
                                player.price - $user.budget,
                            )})
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
                {#if isOwned}
                    <button
                        class="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-3 rounded-lg font-bold transition-all"
                        onclick={handleSell}
                    >
                        Vender ({formatPrice(player.price * 0.8)})
                    </button>
                    <!-- "Blindar" button could link to another modal, but for now just showing status -->
                {:else}
                    <button
                        class="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg shadow-green-900/20 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!canAfford}
                        onclick={handleBuy}
                    >
                        Fichar Jugador
                    </button>
                {/if}
            </div>
        </div>
    {/if}
</Modal>
