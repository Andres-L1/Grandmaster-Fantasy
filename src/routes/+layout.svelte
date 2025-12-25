<script lang="ts">
	import { base } from "$app/paths";
	import "../app.css";
	import { user } from "$lib/stores/user";
	import { ownedPlayers, ownedPlayerIds } from "$lib/stores/players";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
	import Modal from "$lib/components/Modal.svelte";

	let { children } = $props();
	let showRules = $state(false);
	let marketEvent = $state<{
		title: string;
		message: string;
		type: "info" | "warning" | "error";
	} | null>(null);

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

			marketEvent = {
				title: "¡CLAUSULAZO!",
				message: `El equipo "Magnus Carlsen Academy" ha pagado la cláusula de ${targetPlayer.name} (${formatBudget(targetPlayer.clause)}). ¡Has perdido al jugador pero recibido el dinero!`,
				type: "error",
			};
		} else {
			// Just a notification of interest
			marketEvent = {
				title: "Rumores de Mercado",
				message: `Se rumorea que hay interés en ${targetPlayer.name}. Han ofrecido ${formatBudget(offer)} pero tu cláusula de ${formatBudget(targetPlayer.clause)} lo ha protegido.`,
				type: "info",
			};
		}
	}
</script>

<div class="min-h-screen" style="background: rgb(10, 25, 41);">
	<!-- Simple Clean Header -->
	<nav
		class="border-b"
		style="background: rgba(26, 35, 50, 0.95); backdrop-filter: blur(8px); border-color: rgba(55, 71, 79, 0.3);"
	>
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<!-- Logo/Brand -->
				<a
					href="{base}/"
					class="text-xl font-semibold flex items-center gap-2"
					style="color: rgb(227, 242, 253);"
				>
					<span class="text-2xl">♔</span>
					<span class="hidden sm:inline">Grandmaster Fantasy</span>
					<span class="sm:hidden">GF</span>
				</a>

				<!-- Navigation Links -->
				<div class="flex items-center gap-4 sm:gap-6">
					<a
						href="{base}/market"
						class="text-sm font-medium hover:text-white transition"
						style="color: rgb(176, 190, 197);">Mercado</a
					>
					<a
						href="{base}/my-team"
						class="text-sm font-medium hover:text-white transition"
						style="color: rgb(176, 190, 197);">Equipo</a
					>
					<a
						href="{base}/stats"
						class="text-sm font-medium hover:text-white transition"
						style="color: rgb(176, 190, 197);">Stats</a
					>
					<button
						onclick={() => (showRules = true)}
						class="text-sm font-medium hover:text-amber-400 transition"
						style="color: rgb(120, 144, 156);"
					>
						Reglas
					</button>

					<!-- Budget Badge -->
					<div
						class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
						style="background: rgba(255, 160, 0, 0.1); border: 1px solid rgba(255, 160, 0, 0.3);"
					>
						<span class="text-lg">💰</span>
						<span
							class="font-semibold text-sm"
							style="color: rgb(255, 160, 0);"
							>{formatBudget($user.budget)}</span
						>
					</div>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
		class="space-y-6 text-sm text-gray-300 max-h-[70vh] overflow-y-auto pr-2"
	>
		<section>
			<h3 class="text-white font-bold mb-2">💰 Mercado y Fichajes</h3>
			<ul class="list-disc pl-4 space-y-1">
				<li>Tienes un presupuesto inicial de <strong>100M</strong>.</li>
				<li>
					Puedes tener hasta <strong>15 jugadores</strong> en tu plantilla.
				</li>
				<li>
					Al vender un jugador, recuperas el <strong>80%</strong> de su
					valor actual.
				</li>
			</ul>
		</section>

		<section>
			<h3 class="text-amber-400 font-bold mb-2">
				🛡️ Cláusulas de Rescisión
			</h3>
			<div class="bg-amber-900/20 p-3 rounded border border-amber-500/20">
				<p class="mb-2">
					Cada jugador tiene una cláusula. Si es baja, ¡te lo pueden
					robar!
				</p>
				<ul class="list-disc pl-4 space-y-1">
					<li>La cláusula inicial es igual al precio de compra.</li>
					<li>
						Puedes <strong>aumentar la cláusula</strong> de cualquier
						jugador.
					</li>
					<li>
						El coste de aumentar la cláusula es el <strong
							>10%</strong
						> de la diferencia.
					</li>
					<li><em>Ejemplo: Subir de 10M a 20M cuesta 1M.</em></li>
				</ul>
			</div>
		</section>

		<section>
			<h3 class="text-green-400 font-bold mb-2">🏆 Puntuación</h3>
			<div class="grid grid-cols-2 gap-2 text-center text-xs">
				<div class="bg-white/5 p-2 rounded">
					<div class="text-green-400 font-bold text-lg">+10</div>
					<div>Victoria</div>
				</div>
				<div class="bg-white/5 p-2 rounded">
					<div class="text-yellow-400 font-bold text-lg">+3</div>
					<div>Tablas</div>
				</div>
				<div class="bg-white/5 p-2 rounded">
					<div class="text-red-400 font-bold text-lg">-2</div>
					<div>Derrota</div>
				</div>
				<div class="bg-white/5 p-2 rounded">
					<div class="text-blue-400 font-bold text-lg">+2</div>
					<div>Ganar con Negras</div>
				</div>
			</div>
			<p class="mt-2 text-center text-xs text-gray-400">
				El Capitán (★) duplica todos sus puntos.
			</p>
		</section>
	</div>
</Modal>

<!-- Market Event Modal -->
<Modal
	isOpen={!!marketEvent}
	title={marketEvent?.title || ""}
	onClose={() => (marketEvent = null)}
>
	<div class="text-center">
		<div class="text-5xl mb-4">
			{#if marketEvent?.type === "error"}😱{:else}👀{/if}
		</div>
		<p class="text-gray-300 mb-6">{marketEvent?.message}</p>
		<button
			class="btn-primary w-full py-2"
			onclick={() => (marketEvent = null)}
		>
			Entendido
		</button>
	</div>
</Modal>
