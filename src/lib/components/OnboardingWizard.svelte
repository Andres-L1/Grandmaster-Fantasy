<script lang="ts">
    import Modal from "./Modal.svelte";
    import { user } from "$lib/stores/user";

    let step = 0;

    const steps = [
        {
            title: "Bienvenido a Grandmaster Fantasy",
            content:
                "Conviértete en el mejor manager de ajedrez del mundo. Ficha a los mejores Grandes Maestros, gestiona tu presupuesto y compite por la gloria.",
            emoji: "♔",
        },
        {
            title: "Tu Presupuesto",
            content:
                "Comienzas con 100M. Úsalos sabiamente para fichar jugadores en el Mercado. ¡Cuidado! Los mejores jugadores son caros.",
            emoji: "💰",
        },
        {
            title: "Tu Equipo",
            content:
                "Debes formar una alineación titular de 3 jugadores. Ellos puntuarán en base a sus partidas reales en Lichess y torneos.",
            emoji: "♟️",
        },
        {
            title: "Cláusulas de Rescisión",
            content:
                "¡Protege a tus estrellas! Otros managers pueden robarte jugadores pagando su cláusula. Auméntala para disuadirlos (cuesta el 10% del aumento).",
            emoji: "🛡️",
        },
        {
            title: "Sistema de Puntuación",
            content:
                "Victoria (+10), Tablas (+3), Derrota (-2). El Capitán duplica puntos. ¡Buena suerte!",
            emoji: "🏆",
        },
    ];

    function nextStep() {
        if (step < steps.length - 1) {
            step++;
        } else {
            user.completeOnboarding();
        }
    }
</script>

<Modal
    isOpen={!$user.seenOnboarding}
    title=""
    onClose={() => {}}
    hideCloseButton={true}
>
    <div class="text-center py-6 px-4">
        <div class="text-6xl mb-6 animate-bounce">
            {steps[step].emoji}
        </div>

        <h2 class="text-2xl font-bold font-serif text-white mb-4">
            {steps[step].title}
        </h2>

        <p class="text-slate-300 text-lg leading-relaxed mb-8 min-h-[100px]">
            {steps[step].content}
        </p>

        <div class="flex flex-col gap-4">
            <button
                class="btn-primary w-full py-3 text-lg shadow-xl"
                on:click={nextStep}
            >
                {step === steps.length - 1 ? "¡Empezar a Jugar!" : "Siguiente"}
            </button>

            <div class="flex justify-center gap-2 mt-4">
                {#each steps as _, i}
                    <div
                        class="w-2 h-2 rounded-full transition-colors {i ===
                        step
                            ? 'bg-primary'
                            : 'bg-slate-700'}"
                    ></div>
                {/each}
            </div>
        </div>
    </div>
</Modal>
