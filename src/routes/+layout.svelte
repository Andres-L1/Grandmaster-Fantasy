<script lang="ts">
	import { base } from "$app/paths";
	import "../app.css";
	import { user } from "$lib/stores/user";
	import { ownedPlayers, ownedPlayerIds } from "$lib/stores/players";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
	import { toast } from "$lib/stores/toast";
	import Modal from "$lib/components/Modal.svelte";
	import Toast from "$lib/components/Toast.svelte";
	import OnboardingWizard from "$lib/components/OnboardingWizard.svelte";

	let { children } = $props();
	let showRules = $state(false);

	function formatBudget(budget: number): string {
		return `${(budget / 1000000).toFixed(0)}M`;
	}

	onMount(() => {
		simulateMarketEvents();
	});

	function simulateMarketEvents() {
		// 5% chance of market event on page load
		if (Math.random() > 0.05) return;

		const myPlayers = get(ownedPlayers);
		if (myPlayers.length === 0) return;

		// Pick random player
		const targetPlayer =
			myPlayers[Math.floor(Math.random() * myPlayers.length)];

		// Bot offer logic
		// Bots offer between 1.0x and 1.5x of market price
		const offer = Math.floor(
			targetPlayer.price * (1 + Math.random() * 0.5),
		);

		// If offer > clause, it's a forced buyout (Steal!)
		if (offer >= targetPlayer.clause) {
			ownedPlayerIds.sellPlayer(targetPlayer.id);
			// Bonus: User gets the clause amount
			const standardRefund = Math.floor(targetPlayer.price * 0.8);
			const extra = targetPlayer.clause - standardRefund;
			user.updateBudget(extra);

			// Use Toast instead of Modal for cleaner flow
			toast.error(
				`¡CLAUSULAZO! Te han robado a ${targetPlayer.name} por ${formatBudget(targetPlayer.clause)}`,
				6000,
			);
		} else {
			// Just a notification of interest
			toast.info(
				`Rumor: Oferta de ${formatBudget(offer)} por ${targetPlayer.name} rechazada.`,
				5000,
			);
		}
	}
</script>

<div class="min-h-screen relative">
	<Toast />
	<OnboardingWizard />

	<!-- Simple Clean Header -->
	<nav
		class="border-b border-white/5 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50"
	>
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<!-- Logo/Brand -->
				<a
					href="{base}/"
					class="text-xl font-bold font-serif flex items-center gap-2 text-white hover:text-primary transition-colors"
				>
					<span class="text-2xl text-primary">♔</span>
					<span class="hidden sm:inline tracking-tight"
						>Grandmaster Fantasy</span
					>
					<span class="sm:hidden">GF</span>
				</a>

				<!-- Navigation Links -->
				<div class="flex items-center gap-4 sm:gap-6">
					<a
						href="{base}/market"
						class="text-sm font-medium text-slate-400 hover:text-white transition-colors"
						>Mercado</a
					>
					<a
						href="{base}/my-team"
						class="text-sm font-medium text-slate-400 hover:text-white transition-colors"
						>Equipo</a
					>
					<a
						href="{base}/stats"
						class="text-sm font-medium text-slate-400 hover:text-white transition-colors"
						>Stats</a
					>
					<button
						onclick={() => (showRules = true)}
						class="text-sm font-medium text-slate-400 hover:text-primary transition-colors"
					>
						Reglas
					</button>

					<!-- Budget Badge -->
					<div
						class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20"
					>
						<span class="text-lg">💰</span>
						<span class="font-bold text-sm text-primary"
							>{formatBudget($user.budget)}</span
						>
					</div>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
		{@render children()}
	</main>
</div>

<!-- Rules Modal -->
<Modal
	isOpen={showRules}
	title="Reglas del Juego"
	onClose={() => (showRules = false)}
>
	<div
		class="space-y-6 text-sm text-slate-300 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
	>
		<section>
			<h3 class="text-white font-serif font-bold text-lg mb-2">
				💰 Mercado y Fichajes
			</h3>
			<ul class="list-disc pl-4 space-y-2 text-slate-400">
				<li>
					Tienes un presupuesto inicial de <strong
						class="text-primary">100M</strong
					>.
				</li>
				<li>
					Puedes tener hasta <strong>15 jugadores</strong> en tu plantilla.
				</li>
				<li>
					Al vender un jugador, recuperas el <strong
						class="text-white">80%</strong
					> de su valor actual.
				</li>
			</ul>
		</section>

		<section>
			<h3 class="text-primary font-serif font-bold text-lg mb-2">
				🛡️ Cláusulas de Rescisión
			</h3>
			<div class="bg-slate-800/50 p-4 rounded-lg border border-white/5">
				<p class="mb-3 text-slate-300">
					Cada jugador tiene una cláusula. Si es baja, ¡te lo pueden
					robar!
				</p>
				<ul class="list-disc pl-4 space-y-1 text-slate-400">
					<li>La cláusula inicial es igual al precio de compra.</li>
					<li>
						Puedes <strong class="text-white"
							>aumentar la cláusula</strong
						> de cualquier jugador.
					</li>
					<li>
						El coste de aumentar la cláusula es el <strong
							class="text-red-400">10%</strong
						> de la diferencia.
					</li>
					<li><em>Ejemplo: Subir de 10M a 20M cuesta 1M.</em></li>
				</ul>
			</div>
		</section>

		<section>
			<h3 class="text-success font-serif font-bold text-lg mb-2">
				🏆 Puntuación
			</h3>
			<div class="grid grid-cols-2 gap-3 text-center text-xs">
				<div
					class="bg-slate-800/50 p-3 rounded-lg border border-white/5"
				>
					<div class="text-success font-bold text-xl">+10</div>
					<div class="uppercase tracking-wider text-[10px] mt-1">
						Victoria
					</div>
				</div>
				<div
					class="bg-slate-800/50 p-3 rounded-lg border border-white/5"
				>
					<div class="text-amber-400 font-bold text-xl">+3</div>
					<div class="uppercase tracking-wider text-[10px] mt-1">
						Tablas
					</div>
				</div>
				<div
					class="bg-slate-800/50 p-3 rounded-lg border border-white/5"
				>
					<div class="text-red-400 font-bold text-xl">-2</div>
					<div class="uppercase tracking-wider text-[10px] mt-1">
						Derrota
					</div>
				</div>
				<div
					class="bg-slate-800/50 p-3 rounded-lg border border-white/5"
				>
					<div class="text-blue-400 font-bold text-xl">+2</div>
					<div class="uppercase tracking-wider text-[10px] mt-1">
						Bonus Negras
					</div>
				</div>
			</div>
			<p class="mt-4 text-center text-xs text-slate-500 font-medium">
				El Capitán (★) duplica todos sus puntos.
			</p>
		</section>
	</div>
</Modal>
