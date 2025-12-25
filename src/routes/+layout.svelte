<script lang="ts">
	import { base } from "$app/paths";
	import "../app.css";
	import { user } from "$lib/stores/user";
	import { onMount } from "svelte";
	import { toast } from "$lib/stores/toast";
	import Modal from "$lib/components/Modal.svelte";
	import Toast from "$lib/components/Toast.svelte";
	import OnboardingWizard from "$lib/components/OnboardingWizard.svelte";

	let { children } = $props();
	let showRules = $state(false);

	function formatCoins(coins: number): string {
		return coins.toLocaleString();
	}
</script>

<div class="min-h-screen relative bg-slate-950 text-white">
	<Toast />

	<!-- Simple Clean Header -->
	<nav
		class="border-b border-white/5 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 shadow-2xl shadow-black/50"
	>
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-20">
				<!-- Logo/Brand -->
				<a
					href="{base}/"
					class="text-xl font-bold font-serif flex items-center gap-3 text-white hover:text-amber-500 transition-colors group"
				>
					<span
						class="text-4xl group-hover:scale-110 transition-transform duration-300"
						>♟️</span
					>
					<div class="flex flex-col">
						<span
							class="tracking-widest uppercase text-xs text-amber-500 font-sans font-bold"
							>Grandmaster</span
						>
						<span class="text-xl leading-none">Legends</span>
					</div>
				</a>

				<!-- Navigation Links -->
				<div class="flex items-center gap-2 sm:gap-6">
					<a
						href="{base}/store"
						class="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-amber-400 transition-colors px-3 py-2"
						>Tienda</a
					>
					<a
						href="{base}/collection"
						class="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-amber-400 transition-colors px-3 py-2"
						>Colección</a
					>

					<button
						onclick={() => (showRules = true)}
						class="text-sm font-medium text-slate-500 hover:text-white transition-colors ml-2"
					>
						?
					</button>

					<!-- Coin Balance -->
					<div
						class="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950 border border-amber-500/20 shadow-inner"
					>
						<span class="text-xl">🪙</span>
						<span class="font-bold font-mono text-amber-400"
							>{formatCoins($user.coins)}</span
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
	title="Reglas de Colección"
	onClose={() => (showRules = false)}
>
	<div
		class="space-y-6 text-sm text-slate-300 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
	>
		<section>
			<h3 class="text-amber-400 font-serif font-bold text-lg mb-2">
				🃏 Colecciona Leyendas
			</h3>
			<ul class="list-disc pl-4 space-y-2 text-slate-400">
				<li>
					Tu objetivo es conseguir los <strong
						>500 mejores jugadores</strong
					> de ajedrez del mundo.
				</li>
				<li>
					Abre sobres en la <strong>Tienda</strong> usando tus monedas.
				</li>
			</ul>
		</section>

		<section>
			<h3 class="text-white font-serif font-bold text-lg mb-2">
				📦 Rarezas
			</h3>
			<div
				class="bg-slate-800/50 p-4 rounded-lg border border-white/5 space-y-2"
			>
				<div class="flex items-center gap-2">
					<div
						class="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_orange]"
					></div>
					<span class="text-orange-400 font-bold"
						>Legendaria (2750+ Elo)</span
					>
				</div>
				<div class="flex items-center gap-2">
					<div class="w-3 h-3 rounded-full bg-purple-500"></div>
					<span class="text-purple-400 font-bold"
						>Épica (2650-2749 Elo)</span
					>
				</div>
				<div class="flex items-center gap-2">
					<div class="w-3 h-3 rounded-full bg-blue-500"></div>
					<span class="text-blue-400 font-bold"
						>Rara (2550-2649 Elo)</span
					>
				</div>
				<div class="flex items-center gap-2">
					<div class="w-3 h-3 rounded-full bg-slate-500"></div>
					<span class="text-slate-400 font-bold"
						>Común (&lt;2550 Elo)</span
					>
				</div>
			</div>
		</section>

		<section>
			<h3 class="text-amber-400 font-serif font-bold text-lg mb-2">
				💰 Economía
			</h3>
			<p class="text-slate-400">
				Ganas 100 monedas cada día que entras. También puedes vender tus
				cartas repetidas (automáticamente se convierten en monedas).
			</p>
		</section>
	</div>
</Modal>
