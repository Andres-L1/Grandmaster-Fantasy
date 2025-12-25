<script lang="ts">
    import { toast } from "$lib/stores/toast";
    import { flip } from "svelte/animate";
    import { fly, scale } from "svelte/transition";
    import { quintOut } from "svelte/easing";

    function getIcon(type: string) {
        switch (type) {
            case "success":
                return "✨";
            case "error":
                return "💔";
            case "info":
                return "💡";
            default:
                return "ℹ️";
        }
    }

    function getColors(type: string) {
        switch (type) {
            case "success":
                return {
                    bg: "from-emerald-600/90 to-green-600/90",
                    border: "border-emerald-400/50",
                    shadow: "shadow-emerald-500/20",
                    icon: "bg-emerald-400/20 text-emerald-200",
                };
            case "error":
                return {
                    bg: "from-red-600/90 to-rose-600/90",
                    border: "border-red-400/50",
                    shadow: "shadow-red-500/20",
                    icon: "bg-red-400/20 text-red-200",
                };
            case "info":
                return {
                    bg: "from-blue-600/90 to-cyan-600/90",
                    border: "border-blue-400/50",
                    shadow: "shadow-blue-500/20",
                    icon: "bg-blue-400/20 text-blue-200",
                };
            default:
                return {
                    bg: "from-slate-700/90 to-slate-800/90",
                    border: "border-slate-500/50",
                    shadow: "shadow-slate-500/20",
                    icon: "bg-slate-400/20 text-slate-200",
                };
        }
    }
</script>

<div
    class="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none max-w-md"
>
    {#each $toast as t (t.id)}
        {@const colors = getColors(t.type)}
        <div
            animate:flip={{ duration: 300 }}
            in:fly={{ x: 400, duration: 400, easing: quintOut }}
            out:scale={{ duration: 200, opacity: 0 }}
            class="pointer-events-auto relative overflow-hidden"
        >
            <!-- Animated background -->
            <div
                class="absolute inset-0 bg-gradient-to-r {colors.bg} rounded-xl"
            ></div>
            <div
                class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
            ></div>

            <!-- Shine effect -->
            <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full animate-shine"
            ></div>

            <!-- Content -->
            <div
                class="relative flex items-center gap-4 px-5 py-4 rounded-xl border-2 {colors.border} backdrop-blur-md shadow-2xl {colors.shadow}"
                role="alert"
            >
                <!-- Icon -->
                <div
                    class="flex-shrink-0 w-10 h-10 rounded-full {colors.icon} flex items-center justify-center font-bold text-2xl animate-pulse"
                >
                    {getIcon(t.type)}
                </div>

                <!-- Message -->
                <p class="text-base font-bold flex-1 text-white drop-shadow-md">
                    {t.message}
                </p>

                <!-- Close button -->
                <button
                    class="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
                    onclick={() => toast.dismiss(t.id)}
                    aria-label="Cerrar notificación"
                >
                    ✕
                </button>
            </div>
        </div>
    {/each}
</div>

<style>
    @keyframes shine {
        to {
            transform: translateX(200%) skewX(-12deg);
        }
    }

    .animate-shine {
        animation: shine 3s infinite;
    }
</style>
