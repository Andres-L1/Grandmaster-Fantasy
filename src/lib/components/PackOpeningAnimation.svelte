<script lang="ts">
    import { fade, scale, fly } from "svelte/transition";
    import { quintOut, backOut } from "svelte/easing";
    import type { Player } from "$lib/data/players";
    import Card from "./Card.svelte";
    import confetti from "canvas-confetti";

    interface Props {
        cards: { card: Player; isNew: boolean }[];
        packType: string;
        onComplete: () => void;
        isStarter?: boolean;
        onSellDuplicate?: (card: Player) => void;
        duplicateSold?: boolean;
    }

    let {
        cards,
        packType,
        onComplete,
        isStarter = false,
        onSellDuplicate,
        duplicateSold = false,
    } = $props();

    // Animation states
    let phase = $state<"opening" | "revealing" | "complete">("opening");
    let currentCardIndex = $state(0);
    let showPackAnimation = $state(true);
    let revealedCards = $state<typeof cards>([]);

    // Pack icons
    const packIcons: Record<string, string> = {
        STARTER: "🎁",
        PAWN: "♟️",
        KNIGHT: "♞",
        KING: "♚",
    };

    function getRarityColor(rating: number): string {
        if (rating >= 2700) return "#fbbf24"; // Gold
        if (rating >= 2660) return "#fb923c"; // Orange
        if (rating >= 2655) return "#a855f7"; // Purple
        if (rating >= 2650) return "#3b82f6"; // Blue
        return "#94a3b8"; // Slate
    }

    function triggerRarityEffects(rating: number) {
        const color = getRarityColor(rating);

        // Confetti for rare cards
        if (rating >= 2655) {
            confetti({
                particleCount:
                    rating >= 2700 ? 200 : rating >= 2660 ? 150 : 100,
                spread: 100,
                origin: { y: 0.6 },
                colors: [color, "#ffffff"],
                ticks: 300,
            });
        }

        // Screen flash for GOAT
        if (rating >= 2700) {
            const flash = document.createElement("div");
            flash.className =
                "fixed inset-0 bg-yellow-400 pointer-events-none z-[200]";
            flash.style.opacity = "0.3";
            document.body.appendChild(flash);
            setTimeout(() => {
                flash.style.transition = "opacity 0.5s";
                flash.style.opacity = "0";
                setTimeout(() => flash.remove(), 500);
            }, 100);
        }
    }

    // Start opening animation
    $effect(() => {
        if (phase === "opening") {
            setTimeout(() => {
                showPackAnimation = false;
                setTimeout(() => {
                    phase = "revealing";
                }, 500);
            }, 2000);
        }
    });

    function revealNextCard() {
        if (currentCardIndex < cards.length) {
            const card = cards[currentCardIndex];
            revealedCards = [...revealedCards, card];
            triggerRarityEffects(card.card.rating);
            currentCardIndex++;

            if (currentCardIndex >= cards.length) {
                setTimeout(() => {
                    phase = "complete";
                }, 1000);
            }
        }
    }

    // Auto-reveal first card
    $effect(() => {
        if (phase === "revealing" && currentCardIndex === 0) {
            setTimeout(revealNextCard, 300);
        }
    });
</script>

<!-- Full screen overlay -->
<div
    class="fixed inset-0 z-[150] bg-gradient-to-b from-slate-950 via-slate-900 to-black flex items-center justify-center"
    transition:fade={{ duration: 300 }}
>
    <!-- Opening Animation -->
    {#if phase === "opening" && showPackAnimation}
        <div
            class="flex flex-col items-center gap-8"
            in:scale={{ duration: 600, easing: backOut }}
            out:scale={{ duration: 400 }}
        >
            <div class="text-9xl animate-bounce drop-shadow-2xl">
                {packIcons[packType] || "📦"}
            </div>
            <div class="text-3xl font-bold text-white animate-pulse">
                Abriendo sobre...
            </div>
            <!-- Spinning particles -->
            <div class="relative w-32 h-32">
                {#each Array(8) as _, i}
                    <div
                        class="absolute w-3 h-3 bg-amber-400 rounded-full animate-ping"
                        style="
                            top: 50%;
                            left: 50%;
                            animation-delay: {i * 0.15}s;
                            transform: rotate({i * 45}deg) translateY(-50px);
                        "
                    ></div>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Revealing Phase -->
    {#if phase === "revealing" || phase === "complete"}
        <div class="w-full max-w-7xl px-4 space-y-8">
            <!-- Header -->
            <div
                class="text-center space-y-2"
                in:fly={{ y: -50, duration: 500 }}
            >
                <h2
                    class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600"
                >
                    {isStarter ? "¡Tu Primer Sobre!" : "¡Contenido del Sobre!"}
                </h2>
                <p class="text-slate-400 text-lg">
                    {#if phase === "revealing"}
                        Carta {currentCardIndex} de {cards.length}
                    {:else}
                        ¡Todas las cartas reveladas!
                    {/if}
                </p>
            </div>

            <!-- Cards Grid -->
            <div
                class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center"
            >
                {#each revealedCards as { card, isNew }, i (card.id + i)}
                    <div
                        class="relative max-w-xs w-full"
                        in:fly={{
                            y: 100,
                            duration: 800,
                            delay: 0,
                            easing: backOut,
                        }}
                    >
                        <!-- Glow effect based on rarity -->
                        <div
                            class="absolute inset-0 blur-3xl opacity-50 rounded-xl"
                            style="background: radial-gradient(circle, {getRarityColor(
                                card.rating,
                            )}, transparent);"
                        ></div>

                        <!-- Card -->
                        <div
                            class="relative transform hover:scale-105 transition-transform"
                        >
                            <Card player={card} {isNew} onClick={() => {}} />
                        </div>

                        <!-- Starter duplicate overlay -->
                        {#if isStarter && !isNew && onSellDuplicate}
                            {#if !duplicateSold}
                                <div
                                    class="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm z-20"
                                    in:fade={{ delay: 500 }}
                                >
                                    <span
                                        class="text-amber-400 font-bold mb-3 text-lg drop-shadow-md"
                                    >
                                        ¡REPETIDA!
                                    </span>
                                    <button
                                        class="bg-green-500 hover:bg-green-400 text-black font-black text-sm px-4 py-3 rounded-full shadow-lg shadow-green-500/20 transition-all hover:scale-105 active:scale-95"
                                        onclick={() => onSellDuplicate?.(card)}
                                    >
                                        VENDER (+100 🪙)
                                    </button>
                                </div>
                            {:else}
                                <div
                                    class="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl z-20"
                                >
                                    <span
                                        class="text-green-400 font-bold text-xl"
                                        >✅ VENDIDA</span
                                    >
                                </div>
                            {/if}
                        {/if}
                    </div>
                {/each}
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col items-center gap-4 pt-8">
                {#if phase === "revealing" && currentCardIndex < cards.length}
                    <button
                        class="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 font-black px-12 py-5 rounded-full text-xl shadow-2xl shadow-amber-500/30 transition-all hover:scale-110 active:scale-95 animate-pulse"
                        onclick={revealNextCard}
                        in:scale={{ delay: 600, duration: 400 }}
                    >
                        ✨ Revelar Siguiente Carta
                    </button>
                {:else if phase === "complete"}
                    <button
                        class="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-black px-12 py-5 rounded-full text-xl shadow-2xl shadow-emerald-500/30 transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
                        onclick={onComplete}
                        disabled={isStarter && !duplicateSold}
                        in:scale={{ delay: 300, duration: 400 }}
                    >
                        {isStarter && !duplicateSold
                            ? "Vende la repetida para continuar"
                            : "🎉 Continuar"}
                    </button>
                {/if}

                {#if isStarter && phase === "complete"}
                    <p
                        class="text-center text-slate-400 text-sm max-w-lg bg-slate-900/80 p-4 rounded-lg border border-white/5"
                    >
                        <strong>Tutorial:</strong> Has recibido cartas, pero una
                        está repetida. ¡Véndela para conseguir tus primeras monedas!
                    </p>
                {/if}
            </div>
        </div>
    {/if}
</div>

<style>
    @keyframes ping {
        75%,
        100% {
            transform: scale(2);
            opacity: 0;
        }
    }
</style>
