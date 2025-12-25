<script lang="ts">
	let { children } = $props();
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
	<!-- Navigation -->
	<nav class="bg-black/30 backdrop-blur-md border-b border-white/10">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16 items-center">
				<div class="flex items-center space-x-8">
					<a href="/" class="text-2xl font-bold text-white">
						♔ Grandmaster Fantasy
					</a>
					<div class="hidden md:flex space-x-4">
						<a href="/market" class="text-gray-300 hover:text-white px-3 py-2 rounded-md transition">
							Mercado
						</a>
						<a href="/my-team" class="text-gray-300 hover:text-white px-3 py-2 rounded-md transition">
							Mi Equipo
						</a>
						<a href="/leagues" class="text-gray-300 hover:text-white px-3 py-2 rounded-md transition">
							Ligas
						</a>
					</div>
				</div>
				<div class="flex items-center space-x-4">
					<div class="text-yellow-400 font-semibold">
						💰 100M
					</div>
					<button class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
						Perfil
					</button>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{@render children()}
	</main>
</div>
