<script lang="ts">
    import type { Player } from "$lib/data/players";
    import { fade } from "svelte/transition";

    interface Props {
        player: Player;
        isNew?: boolean;
        showPrice?: boolean;
        onClick?: () => void;
    }

    let { player, isNew = false, showPrice = false, onClick } = $props();

    function getRarity(rating: number): {
        type: string;
        color: string;
        border: string;
        bg: string;
    } {
        // GOAT TIER (2700+) -> Solid Gold / Premium
        if (rating >= 2700)
            return {
                type: "GOAT",
                color: "text-yellow-200",
                border: "border-yellow-400 border-4", // Thick border
                bg: "bg-gradient-to-b from-yellow-700 via-amber-500 to-yellow-900 shadow-[0_0_20px_rgba(234,179,8,0.3)]",
            };
        // LEGENDARY TIER (2660-2699) -> Red / Dark Orange
        if (rating >= 2660)
            return {
                type: "LEGENDARY",
                color: "text-orange-400",
                border: "border-orange-500",
                bg: "bg-gradient-to-br from-orange-950 via-red-900 to-black",
            };
        // EPIC TIER (2655-2659) -> Purple
        if (rating >= 2655)
            return {
                type: "EPIC",
                color: "text-purple-400",
                border: "border-purple-500",
                bg: "bg-gradient-to-br from-purple-950 via-slate-900 to-black",
            };
        // RARE TIER (2650-2654) -> Blue
        if (rating >= 2650)
            return {
                type: "RARE",
                color: "text-blue-400",
                border: "border-blue-500",
                bg: "bg-gradient-to-br from-blue-950 to-slate-900",
            };
        // COMMON TIER (<2650) -> Grey/Slate
        return {
            type: "COMMON",
            color: "text-slate-400",
            border: "border-slate-600",
            bg: "bg-slate-800",
        };
    }

    let rarity = $derived(getRarity(player.rating));
</script>

<button
    class="relative group w-full aspect-[2/3] rounded-xl border-2 {rarity.border} {rarity.bg} p-2 shadow-2xl transition-transform hover:scale-105 hover:z-10 flex flex-col items-center justify-between overflow-hidden"
    onclick={onClick}
>
    <!-- Card Texture/Effect -->
    {#if player.rating >= 2660}
        <div
            class="absolute inset-0 opacity-20 bg-[url('/foil-texture.png')] bg-cover mix-blend-overlay pointer-events-none"
        ></div>
        <div
            class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out pointer-events-none"
        ></div>
    {/if}

    <!-- Header: Rating & Flag -->
    <div class="w-full flex justify-between items-start z-10 relative">
        <div
            class="flex flex-col items-center bg-black/40 px-2 py-1 rounded border border-white/10 backdrop-blur-sm"
        >
            <span class="text-xs font-bold {rarity.color}">{rarity.type}</span>
            <span class="text-xl font-black text-white leading-none"
                >{player.rating}</span
            >
        </div>
        {#if player.country}
            <div
                class="text-xl shadow-black drop-shadow-md grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
            >
                <img
                    src={`https://flagsapi.com/${player.country}/flat/32.png`}
                    alt={player.country}
                    class="w-8 h-8"
                />
            </div>
        {/if}
    </div>

    <!-- Player Image (Line Art Style) -->
    <div
        class="absolute inset-0 flex items-center justify-center top-4 z-0 pointer-events-none overflow-hidden group-hover:scale-105 transition-transform duration-500"
    >
        {#if player.photoUrl}
            <img
                src={player.photoUrl}
                alt={player.name}
                class="w-[90%] h-[90%] object-cover object-top transition-all duration-500 filter grayscale contrast-[1.5] brightness-125"
                style="mask-image: linear-gradient(to bottom, black 80%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);"
            />
        {:else}
            <!-- Fallback: Generated Contour Silhouette (SVG) -->
            <!-- This mimics a 'drawing' using stroke-only SVG -->
            <svg
                viewBox="0 0 24 24"
                class="w-[70%] h-[70%] stroke-white/80 fill-transparent stroke-[0.8] drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] opacity-80"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
            </svg>
            <!-- Decorative 'Chess' elements -->
            <div
                class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50"
            ></div>
        {/if}
    </div>

    <!-- Footer: Name & Username -->
    <div
        class="z-10 w-full text-center relative mt-auto bg-black/80 backdrop-blur-md rounded-lg p-2 border-t border-white/5 shadow-black/50 shadow-lg"
    >
        <h3
            class="font-serif font-bold text-white leading-tight truncate px-1 text-sm md:text-base tracking-wide"
        >
            {player.name}
        </h3>
        <p
            class="text-[10px] text-slate-400 truncate uppercase tracking-wider mt-0.5"
        >
            @{player.username}
        </p>
    </div>

    {#if isNew}
        <div
            class="absolute top-2 right-2 z-20 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse"
            transition:fade
        >
            NEW!
        </div>
    {/if}
</button>

<style>
    /* Custom sheen animation */
    @keyframes sheen {
        0% {
            transform: translateX(-150%) skewX(-15deg);
        }
        100% {
            transform: translateX(150%) skewX(-15deg);
        }
    }
</style>
