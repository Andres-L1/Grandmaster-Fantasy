<script lang="ts">
    import { toast } from "$lib/stores/toast";
    import { flip } from "svelte/animate";
    import { fly } from "svelte/transition";

    function getIcon(type: string) {
        switch (type) {
            case "success":
                return "✓";
            case "error":
                return "✕";
            default:
                return "ℹ";
        }
    }

    function getColors(type: string) {
        switch (type) {
            case "success":
                return "bg-slate-900 border-green-500/30 text-green-400";
            case "error":
                return "bg-slate-900 border-red-500/30 text-red-400";
            default:
                return "bg-slate-900 border-blue-500/30 text-blue-400";
        }
    }
</script>

<div
    class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
>
    {#each $toast as t (t.id)}
        <div
            animate:flip={{ duration: 300 }}
            transition:fly={{ y: 20, duration: 300 }}
            class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-md min-w-[300px] {getColors(
                t.type,
            )}"
            role="alert"
        >
            <div
                class="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center font-bold text-sm"
            >
                {getIcon(t.type)}
            </div>
            <p class="text-sm font-medium flex-1">{t.message}</p>
            <button
                class="text-white/20 hover:text-white transition-colors"
                on:click={() => toast.dismiss(t.id)}
                aria-label="Cerrar notificación"
            >
                ✕
            </button>
        </div>
    {/each}
</div>
