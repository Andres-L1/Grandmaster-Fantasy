<script lang="ts">
    import { fade, scale } from "svelte/transition";

    export let title: string;
    export let isOpen: boolean = false;
    export let onClose: () => void;
</script>

{#if isOpen}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        transition:fade={{ duration: 200 }}
        on:click={onClose}
    >
        <div
            class="bg-[rgb(26,35,50)] border border-[rgba(55,71,79,0.5)] rounded-xl w-full max-w-md p-6 shadow-2xl relative"
            transition:scale={{ duration: 200, start: 0.95 }}
            on:click|stopPropagation
        >
            <button
                class="absolute top-4 right-4 text-gray-400 hover:text-white"
                on:click={onClose}
            >
                ✕
            </button>

            <h2 class="text-xl font-bold mb-4 text-[rgb(227,242,253)]">
                {title}
            </h2>

            <div class="space-y-4">
                <slot />
            </div>
        </div>
    </div>
{/if}
