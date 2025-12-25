<script lang="ts">
    import { user } from "$lib/stores/user";
    import { ownedPlayers } from "$lib/stores/players";
    import { teamPlayers } from "$lib/stores/teams";

    $: totalValue = $ownedPlayers.reduce((sum, p) => sum + p.price, 0);
    $: teamValue = $teamPlayers.reduce((sum, p) => sum + p.price, 0);

    function formatPrice(price: number): string {
        return `${(price / 1000000).toFixed(0)}M`;
    }
</script>

<svelte:head>
    <title>Mis Estadísticas - Grandmaster Fantasy</title>
</svelte:head>

<div class="space-y-8">
    <!-- Header -->
    <div>
        <h1 class="text-3xl font-bold font-serif text-white mb-2">
            Mis Estadísticas
        </h1>
        <p class="text-sm text-slate-400">
            Tu rendimiento personal en Grandmaster Fantasy
        </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Budget -->
        <div class="card p-6 border-l-4 border-l-amber-500">
            <div
                class="text-xs text-slate-400 uppercase tracking-wider mb-2 font-bold"
            >
                Presupuesto Actual
            </div>
            <div class="text-3xl font-bold font-mono text-amber-500">
                {($user.budget / 1000000).toFixed(0)}M
            </div>
        </div>

        <!-- Total Points -->
        <div class="card p-6 border-l-4 border-l-emerald-500">
            <div
                class="text-xs text-slate-400 uppercase tracking-wider mb-2 font-bold"
            >
                Puntos Totales
            </div>
            <div class="text-3xl font-bold font-mono text-emerald-500">
                {$user.totalPoints}
            </div>
        </div>

        <!-- Roster Value -->
        <div class="card p-6 border-l-4 border-l-blue-500">
            <div
                class="text-xs text-slate-400 uppercase tracking-wider mb-2 font-bold"
            >
                Valor del Roster
            </div>
            <div class="text-3xl font-bold font-mono text-blue-500">
                {(totalValue / 1000000).toFixed(0)}M
            </div>
        </div>

        <!-- Team Value -->
        <div class="card p-6 border-l-4 border-l-purple-500">
            <div
                class="text-xs text-slate-400 uppercase tracking-wider mb-2 font-bold"
            >
                Valor del Equipo
            </div>
            <div class="text-3xl font-bold font-mono text-purple-500">
                {(teamValue / 1000000).toFixed(0)}M
            </div>
        </div>
    </div>

    <!-- User Profile -->
    <div class="card p-6">
        <h2
            class="text-xl font-bold font-serif text-white mb-6 flex items-center gap-2"
        >
            <span class="text-2xl">👤</span> Perfil de Manager
        </h2>
        <div class="space-y-4 max-w-lg">
            <div
                class="flex justify-between items-center p-3 rounded-lg bg-slate-900/50 border border-white/5"
            >
                <span class="text-slate-400">Usuario</span>
                <span class="text-white font-bold text-lg"
                    >{$user.username}</span
                >
            </div>
            <div
                class="flex justify-between items-center p-3 rounded-lg bg-slate-900/50 border border-white/5"
            >
                <span class="text-slate-400">Jugadores Fichados</span>
                <span class="text-white font-mono font-medium"
                    >{$ownedPlayers.length} / 15</span
                >
            </div>
            <div
                class="flex justify-between items-center p-3 rounded-lg bg-slate-900/50 border border-white/5"
            >
                <span class="text-slate-400">En Alineación</span>
                <span class="text-white font-mono font-medium"
                    >{$teamPlayers.length} / 3</span
                >
            </div>
        </div>
    </div>

    <!-- Top Players in Portfolio -->
    {#if $ownedPlayers.length > 0}
        <div class="card p-6">
            <h2
                class="text-xl font-bold font-serif text-white mb-6 flex items-center gap-2"
            >
                <span class="text-2xl">📈</span> Tus Mejores Jugadores
            </h2>
            <div class="space-y-3">
                {#each $ownedPlayers
                    .slice(0, 5)
                    .sort((a, b) => b.rating - a.rating) as player, index}
                    <div
                        class="flex items-center gap-4 p-4 rounded-lg bg-slate-900/50 border border-white/5 hover:border-white/10 transition-colors"
                    >
                        <div
                            class="text-2xl font-bold font-mono text-slate-600"
                        >
                            #{index + 1}
                        </div>
                        <div class="flex-1">
                            <div class="font-bold text-white text-lg">
                                {player.name}
                            </div>
                            <div class="text-sm text-slate-500 font-mono">
                                @{player.username} • Rating {player.rating}
                            </div>
                        </div>
                        <div class="text-right">
                            <div
                                class="font-bold font-mono text-emerald-400 text-lg"
                            >
                                {formatPrice(player.price)}
                            </div>
                            <div class="text-xs text-slate-600 uppercase">
                                Valor de mercado
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <!-- How Points Work -->
    <div class="card p-6">
        <h2
            class="text-xl font-bold font-serif text-white mb-6 flex items-center gap-2"
        >
            <span class="text-2xl">ℹ️</span> Sistema de Puntuación
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div
                class="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 text-center"
            >
                <div class="text-3xl font-bold text-emerald-500 mb-1">+10</div>
                <div
                    class="text-xs text-slate-400 uppercase tracking-widest font-bold"
                >
                    Victoria
                </div>
            </div>
            <div
                class="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 text-center"
            >
                <div class="text-3xl font-bold text-amber-500 mb-1">+3</div>
                <div
                    class="text-xs text-slate-400 uppercase tracking-widest font-bold"
                >
                    Tablas
                </div>
            </div>
            <div
                class="bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-center"
            >
                <div class="text-3xl font-bold text-red-500 mb-1">-2</div>
                <div
                    class="text-xs text-slate-400 uppercase tracking-widest font-bold"
                >
                    Derrota
                </div>
            </div>
            <div
                class="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 text-center"
            >
                <div class="text-3xl font-bold text-blue-500 mb-1">+2</div>
                <div
                    class="text-xs text-slate-400 uppercase tracking-widest font-bold"
                >
                    Negras
                </div>
            </div>
            <div
                class="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20 text-center"
            >
                <div class="text-3xl font-bold text-purple-500 mb-1">+5</div>
                <div
                    class="text-xs text-slate-400 uppercase tracking-widest font-bold"
                >
                    Racha 3+
                </div>
            </div>
            <div
                class="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 text-center relative overflow-hidden"
            >
                <div
                    class="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent"
                ></div>
                <div
                    class="text-3xl font-bold text-amber-500 mb-1 relative z-10"
                >
                    ×2
                </div>
                <div
                    class="text-xs text-slate-400 uppercase tracking-widest font-bold relative z-10"
                >
                    Capitán
                </div>
            </div>
        </div>

        <div
            class="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500"
        >
            <span>★</span>
            <p>
                El Capitán aplica su multiplicador ×2 a todos los puntos
                obtenidos (positivos o negativos).
            </p>
        </div>
    </div>
</div>
