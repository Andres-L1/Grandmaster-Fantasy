<script lang="ts">
    import { base } from "$app/paths";
</script>

<svelte:head>
    <title>Grandmaster Fantasy - Fantasy Chess</title>
</svelte:head>

<div class="space-y-8">
    <!-- Hero Section -->
    <div class="text-center space-y-4">
        <h1 class="text-6xl font-bold text-white mb-4">
            Bienvenido a <span
                class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
                >Grandmaster Fantasy</span
            >
        </h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto">
            El primer Fantasy Sports exclusivo para Ajedrez. Ficha a los mejores
            Grandes Maestros del mundo y compite en torneos reales.
        </p>
        <div class="flex gap-4 justify-center mt-8">
            <a
                href="{base}/market"
                class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition transform hover:scale-105"
            >
                Explorar Mercado ♔
            </a>
            <a
                href="{base}/my-team"
                class="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-lg font-semibold text-lg transition border border-white/20"
            >
                Ver Mi Equipo
            </a>
        </div>
    </div>

    <!-- Features Grid -->
    <div class="grid md:grid-cols-3 gap-6 mt-16">
        <div
            class="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:border-purple-500/50 transition"
        >
            <div class="text-4xl mb-4">💰</div>
            <h3 class="text-xl font-semibold text-white mb-2">
                Presupuesto Virtual
            </h3>
            <p class="text-gray-400">
                Empieza con 100M y gestiona tu presupuesto estratégicamente para
                fichar a los mejores GMs.
            </p>
        </div>

        <div
            class="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:border-purple-500/50 transition"
        >
            <div class="text-4xl mb-4">🏆</div>
            <h3 class="text-xl font-semibold text-white mb-2">
                Torneos Reales
            </h3>
            <p class="text-gray-400">
                Tus jugadores compiten en torneos reales de ajedrez. Gana puntos
                según sus resultados.
            </p>
        </div>

        <div
            class="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:border-purple-500/50 transition"
        >
            <div class="text-4xl mb-4">📊</div>
            <h3 class="text-xl font-semibold text-white mb-2">
                Ligas Globales
            </h3>
            <p class="text-gray-400">
                Compite en la liga global o crea ligas privadas con tus amigos.
            </p>
        </div>
    </div>

    <!-- Quick Stats -->
    <div
        class="bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-md rounded-xl p-8 border border-white/10"
    >
        <h2 class="text-2xl font-bold text-white mb-6">
            Sistema de Puntuación
        </h2>
        <div class="grid md:grid-cols-5 gap-4">
            <div class="text-center">
                <div class="text-3xl font-bold text-green-400">+10</div>
                <div class="text-sm text-gray-300 mt-1">Victoria</div>
            </div>
            <div class="text-center">
                <div class="text-3xl font-bold text-yellow-400">+3</div>
                <div class="text-sm text-gray-300 mt-1">Tablas</div>
            </div>
            <div class="text-center">
                <div class="text-3xl font-bold text-red-400">-2</div>
                <div class="text-sm text-gray-300 mt-1">Derrota</div>
            </div>
            <div class="text-center">
                <div class="text-3xl font-bold text-purple-400">+2</div>
                <div class="text-sm text-gray-300 mt-1">Bonus Negras</div>
            </div>
            <div class="text-center">
                <div class="text-3xl font-bold text-pink-400">+5</div>
                <div class="text-sm text-gray-300 mt-1">Racha (3+ wins)</div>
            </div>
        </div>
    </div>
</div>
