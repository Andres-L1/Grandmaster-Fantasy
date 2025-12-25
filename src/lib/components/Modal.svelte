<script lang="ts">
    import { fade, scale } from "svelte/transition";

    export let title: string;
    export let isOpen: boolean = false;
    export let onClose: () => void;
    export let hideCloseButton: boolean = false;
</script>

{#if isOpen}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        transition:fade={{ duration: 200 }}
        role="presentation"
        onclick={() => !hideCloseButton && onClose()}
        onkeydown={(e) => e.key === "Escape" && !hideCloseButton && onClose()}
    >
        <div
            class="bg-slate-900 border border-white/10 rounded-xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden"
            transition:scale={{ duration: 200, start: 0.95 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabindex="-1"
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
        >
            <!-- Glass Shine Effect -->
            <div
                class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"
            ></div>

            {#if !hideCloseButton}
                <button
                    class="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-10"
                    onclick={onClose}
                    aria-label="Cerrar modal"
                >
                    ✕
                </button>
            {/if}

            <h2
                class="text-xl font-bold mb-6 text-white font-serif relative z-10 pr-8"
            >
                {title}
            </h2>

            <div class="space-y-4 relative z-10">
                <slot />
            </div>
        </div>
    </div>
{/if}
