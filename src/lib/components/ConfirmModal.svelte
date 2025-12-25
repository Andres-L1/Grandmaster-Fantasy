<script lang="ts">
    import { fade, scale } from "svelte/transition";
    import { quintOut } from "svelte/easing";

    interface Props {
        type?: "confirm" | "alert" | "success" | "error" | "warning";
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        onConfirm?: () => void;
        onCancel?: () => void;
        show: boolean;
    }

    let {
        type = "confirm",
        title,
        message,
        confirmText = "Aceptar",
        cancelText = "Cancelar",
        onConfirm,
        onCancel,
        show = $bindable(),
    } = $props();

    function handleConfirm() {
        onConfirm?.();
        show = false;
    }

    function handleCancel() {
        onCancel?.();
        show = false;
    }

    const typeStyles = {
        confirm: {
            icon: "❓",
            color: "from-blue-600 to-blue-700",
            borderColor: "border-blue-500/50",
        },
        alert: {
            icon: "ℹ️",
            color: "from-cyan-600 to-cyan-700",
            borderColor: "border-cyan-500/50",
        },
        success: {
            icon: "✅",
            color: "from-green-600 to-green-700",
            borderColor: "border-green-500/50",
        },
        error: {
            icon: "❌",
            color: "from-red-600 to-red-700",
            borderColor: "border-red-500/50",
        },
        warning: {
            icon: "⚠️",
            color: "from-amber-600 to-amber-700",
            borderColor: "border-amber-500/50",
        },
    } as const;

    let style = $derived(typeStyles[type as keyof typeof typeStyles]);
</script>

{#if show}
    <!-- Backdrop -->
    <div
        class="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        transition:fade={{ duration: 200 }}
        onclick={handleCancel}
        onkeydown={(e) => e.key === "Escape" && handleCancel()}
        role="button"
        tabindex="-1"
    >
        <!-- Modal -->
        <div
            class="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border-2 {style.borderColor} overflow-hidden"
            transition:scale={{ duration: 300, easing: quintOut }}
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
            role="dialog"
            tabindex="-1"
        >
            <!-- Header with icon -->
            <div
                class="bg-gradient-to-r {style.color} p-6 text-center relative overflow-hidden"
            >
                <!-- Background decoration -->
                <div class="absolute inset-0 opacity-20">
                    <div
                        class="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl"
                    ></div>
                    <div
                        class="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-3xl"
                    ></div>
                </div>

                <div class="relative z-10">
                    <div class="text-6xl mb-3 animate-bounce">
                        {style.icon}
                    </div>
                    <h2 class="text-2xl font-black text-white">
                        {title}
                    </h2>
                </div>
            </div>

            <!-- Content -->
            <div class="p-6">
                <p class="text-slate-300 text-center text-lg leading-relaxed">
                    {message}
                </p>
            </div>

            <!-- Actions -->
            <div class="px-6 pb-6 flex gap-3">
                {#if type === "confirm"}
                    <button
                        class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-6 rounded-xl transition-all hover:scale-105 active:scale-95"
                        onclick={handleCancel}
                    >
                        {cancelText}
                    </button>
                {/if}
                <button
                    class="flex-1 bg-gradient-to-r {style.color} hover:brightness-110 text-white font-black py-4 px-6 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
                    onclick={handleConfirm}
                >
                    {confirmText}
                </button>
            </div>
        </div>
    </div>
{/if}
