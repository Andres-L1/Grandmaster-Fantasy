<script lang="ts">
    import { user } from "$lib/stores/user";
    import { collectionIds, allPlayers } from "$lib/stores/players";
    import {
        PACKS,
        packService,
        type PackType,
    } from "$lib/services/packService";
    import type { Player } from "$lib/data/players";
    import { toast } from "$lib/stores/toast";
    import Card from "$lib/components/Card.svelte";
    import PackOpeningAnimation from "$lib/components/PackOpeningAnimation.svelte";
    import confetti from "canvas-confetti";
    import { onMount } from "svelte";
    import { storageService, type User } from "$lib/stores/localStorage";

    // State
    let isOpening = $state(false);
    let openedCards: { card: Player; isNew: boolean }[] = $state([]);
    let showResultModal = $state(false);
    let isStarter = $state(false);
    let duplicateSold = $state(false);
    let dailyPackAvailable = $state(false);
    let timeUntilNextDaily = $state("");
    let currentPackType = $state<PackType>("PAWN");

    // Check daily pack availability
    function updateDailyPackStatus() {
        const lastClaim = $user.lastDailyPackClaim || 0;
        const now = Date.now();
        const timeSinceLast = now - lastClaim;
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

        if (timeSinceLast >= TWENTY_FOUR_HOURS) {
            dailyPackAvailable = true;
            timeUntilNextDaily = "";
        } else {
            dailyPackAvailable = false;
            const remaining = TWENTY_FOUR_HOURS - timeSinceLast;
            const hours = Math.floor(remaining / (60 * 60 * 1000));
            const minutes = Math.floor(
                (remaining % (60 * 60 * 1000)) / (60 * 1000),
            );
            timeUntilNextDaily = `${hours}h ${minutes}m`;
        }
    }

    function claimDailyPack() {
        if (!dailyPackAvailable) return;

        // Update last claim time - need to save to storage
        user.update((u: User) => {
            const updated = { ...u, lastDailyPackClaim: Date.now() };
            if (typeof window !== "undefined") {
                storageService.saveUser(updated);
            }
            return updated;
        });

        isOpening = true;
        isStarter = false;
        currentPackType = "PAWN";
        toast.success("¡Sobre Diario Reclamado!");

        setTimeout(() => {
            const cards = packService.openPack("PAWN", $allPlayers);
            processOpenedCards(cards);
            updateDailyPackStatus();
        }, 500);
    }

    onMount(() => {
        // Auto-open starter pack if collection is empty
        if ($collectionIds.length === 0) {
            triggerStarterPack();
        }

        // Initialize daily pack status
        updateDailyPackStatus();

        // Update countdown every minute
        const interval = setInterval(updateDailyPackStatus, 60000);
        return () => clearInterval(interval);
    });

    function triggerStarterPack() {
        isStarter = true;
        isOpening = true;
        duplicateSold = false;
        currentPackType = "STARTER";
        // Small delay to let store load
        setTimeout(() => {
            const cards = packService.openPack("STARTER", $allPlayers);
            processOpenedCards(cards);
            toast.info("¡Bienvenido! Has recibido un Sobre Inicial.");
        }, 500);
    }

    function buyPack(packType: PackType) {
        if (isOpening) return;

        const pack = PACKS[packType];

        if ($user.coins < pack.price) {
            toast.error("No tienes suficientes monedas.");
            return;
        }

        // Transaction
        if (user.spendCoins(pack.price)) {
            isOpening = true;
            isStarter = false;
            currentPackType = packType;
            toast.success(`¡Compraste un ${pack.name}!`);

            // Artificial delay for "opening" feel
            setTimeout(() => {
                const cards = packService.openPack(packType, $allPlayers);
                processOpenedCards(cards);
            }, 500);
        }
    }

    function processOpenedCards(cards: Player[]) {
        openedCards = cards.map((card) => {
            const { isNew } = collectionIds.addCard(card.id);
            return { card, isNew };
        });

        isOpening = false;
        showResultModal = true;
    }

    function sellStarterDuplicate(card: Player) {
        if (!duplicateSold) {
            user.addCoins(100);
            collectionIds.removeCard(card.id);
            duplicateSold = true;
            toast.success("¡Vendido! Has ganado 100 Monedas.");
        }
    }

    function closeResult() {
        if (isStarter && !duplicateSold) {
            toast.error("Debes vender la carta repetida para continuar.");
            return;
        }
        showResultModal = false;
        openedCards = [];
        duplicateSold = false;
    }
</script>

<svelte:head>
    <title>Tienda - Grandmaster Legends</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-12">
    <!-- Header -->
    <div class="text-center space-y-4">
        <h1
            class="text-5xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 drop-shadow-sm"
        >
            Tienda de Sobres
        </h1>
        <p class="text-slate-400 text-lg max-w-2xl mx-auto">
            Usa tus monedas para adquirir nuevos sobres y completar tu colección
            de leyendas.
        </p>
    </div>

    <!-- Daily Free Pack Section -->
    <div class="relative">
        <button
            class="w-full group relative flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl border-2 transition-all {dailyPackAvailable
                ? 'border-green-500 bg-gradient-to-r from-green-900/40 via-emerald-900/40 to-green-900/40 hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-1'
                : 'border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 cursor-not-allowed opacity-75'}"
            onclick={claimDailyPack}
            disabled={!dailyPackAvailable || isOpening}
        >
            <!-- Icon & Title -->
            <div class="flex items-center gap-4">
                <div
                    class="text-6xl {dailyPackAvailable
                        ? 'animate-bounce'
                        : ''}"
                >
                    🎁
                </div>
                <div class="text-left">
                    <h3
                        class="text-2xl font-bold font-serif {dailyPackAvailable
                            ? 'text-green-400'
                            : 'text-slate-400'}"
                    >
                        Sobre Diario Gratis
                    </h3>
                    <p
                        class="text-sm {dailyPackAvailable
                            ? 'text-green-300'
                            : 'text-slate-500'}"
                    >
                        {#if dailyPackAvailable}
                            ¡Disponible ahora! Haz clic para reclamar
                        {:else}
                            Próximo sobre en: {timeUntilNextDaily}
                        {/if}
                    </p>
                </div>
            </div>

            <!-- Badge -->
            {#if dailyPackAvailable}
                <div
                    class="bg-green-500 text-black font-black px-6 py-3 rounded-full text-lg shadow-lg shadow-green-500/30 animate-pulse"
                >
                    ¡GRATIS!
                </div>
            {:else}
                <div
                    class="bg-slate-700 text-slate-400 font-bold px-6 py-3 rounded-full text-sm"
                >
                    🕐 {timeUntilNextDaily}
                </div>
            {/if}

            <!-- Glow effect when available -->
            {#if dailyPackAvailable}
                <div
                    class="absolute inset-0 bg-green-500/10 rounded-2xl animate-pulse pointer-events-none"
                ></div>
            {/if}
        </button>
    </div>

    <!-- Packs Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        {#each Object.values(PACKS) as pack}
            {#if pack.id !== "STARTER"}
                <button
                    class="group relative flex flex-col items-center p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800 to-slate-900 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-500/30"
                    onclick={() => buyPack(pack.id)}
                    disabled={isOpening}
                >
                    <!-- Pack Icon -->
                    <div
                        class="text-8xl mb-6 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-xl"
                    >
                        {pack.image}
                    </div>

                    <!-- Info -->
                    <h3 class="text-2xl font-bold font-serif text-white mb-2">
                        {pack.name}
                    </h3>
                    <p class="text-sm text-slate-400 text-center mb-6 h-12">
                        {pack.description}
                    </p>

                    <!-- Price -->
                    <div
                        class="mt-auto flex items-center gap-2 bg-slate-950/50 px-6 py-3 rounded-xl border border-white/5 group-hover:bg-amber-500/20 group-hover:border-amber-500/50 transition-colors"
                    >
                        <span class="text-2xl">🪙</span>
                        <span
                            class="text-xl font-bold font-mono text-white group-hover:text-amber-300"
                        >
                            {pack.price}
                        </span>
                    </div>

                    <!-- Hover Glow -->
                    <div
                        class="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity pointer-events-none"
                    ></div>
                </button>
            {/if}
        {/each}
    </div>
</div>

{#if showResultModal}
    <PackOpeningAnimation
        cards={openedCards}
        packType={currentPackType}
        {isStarter}
        onSellDuplicate={sellStarterDuplicate}
        {duplicateSold}
        onComplete={closeResult}
    />
{/if}
