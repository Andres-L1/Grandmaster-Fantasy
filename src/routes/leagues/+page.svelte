<script lang="ts">
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    // Mock current user - should come from session
    const currentUserId = "user-1";

    function isCurrentUser(userId: string): boolean {
        return userId === currentUserId;
    }

    function getRankMedal(rank: number): string {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return `#${rank}`;
    }
</script>

<svelte:head>
    <title>Ligas - Grandmaster Fantasy</title>
</svelte:head>

<div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
        <h1 class="text-4xl font-bold text-white mb-2">
            🏆 Clasificación Global
        </h1>
        <p class="text-gray-400">Compite con jugadores de todo el mundo</p>
    </div>

    <!-- Stats Overview -->
    <div class="grid md:grid-cols-3 gap-4">
        <div
            class="bg-gradient-to-br from-yellow-900/40 to-yellow-700/40 backdrop-blur-md rounded-xl p-6 border border-yellow-500/30"
        >
            <div class="text-yellow-400 mb-2 text-4xl">🥇</div>
            <div class="text-sm text-gray-300">Total Jugadores</div>
            <div class="text-3xl font-bold text-white">
                {data.totalUsers.toLocaleString()}
            </div>
        </div>
        <div
            class="bg-gradient-to-br from-purple-900/40 to-purple-700/40 backdrop-blur-md rounded-xl p-6 border border-purple-500/30"
        >
            <div class="text-purple-400 mb-2 text-4xl">⚔️</div>
            <div class="text-sm text-gray-300">Competidores Activos</div>
            <div class="text-3xl font-bold text-white">{data.totalUsers}</div>
        </div>
        <div
            class="bg-gradient-to-br from-pink-900/40 to-pink-700/40 backdrop-blur-md rounded-xl p-6 border border-pink-500/30"
        >
            <div class="text-pink-400 mb-2 text-4xl">👑</div>
            <div class="text-sm text-gray-300">Tu Ranking</div>
            <div class="text-3xl font-bold text-white">#???</div>
        </div>
    </div>

    <!-- Leaderboard -->
    <div
        class="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden"
    >
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="border-b border-white/10 bg-white/5">
                        <th class="text-left p-4 text-gray-300 font-semibold"
                            >Rank</th
                        >
                        <th class="text-left p-4 text-gray-300 font-semibold"
                            >Usuario</th
                        >
                        <th class="text-right p-4 text-gray-300 font-semibold"
                            >Puntos Totales</th
                        >
                    </tr>
                </thead>
                <tbody>
                    {#each data.users as user, index}
                        {@const rank = (data.currentPage - 1) * 20 + index + 1}
                        <tr
                            class="border-b border-white/5 hover:bg-white/5 transition {isCurrentUser(
                                user.id,
                            )
                                ? 'bg-purple-900/30 border-purple-500/50'
                                : ''}"
                        >
                            <td class="p-4">
                                <div
                                    class="text-2xl font-bold {rank <= 3
                                        ? ''
                                        : 'text-gray-400'}"
                                >
                                    {getRankMedal(rank)}
                                </div>
                            </td>
                            <td class="p-4">
                                <div class="flex items-center space-x-3">
                                    <div
                                        class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white"
                                    >
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div
                                            class="text-white font-semibold flex items-center gap-2"
                                        >
                                            {user.username}
                                            {#if isCurrentUser(user.id)}
                                                <span
                                                    class="bg-purple-600 text-white text-xs px-2 py-1 rounded-full"
                                                >
                                                    TÚ
                                                </span>
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="p-4 text-right">
                                <div class="text-2xl font-bold text-green-400">
                                    {user.totalPoints.toLocaleString()}
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>

    <!-- Pagination -->
    {#if data.totalPages > 1}
        <div class="flex justify-center gap-2">
            {#if data.currentPage > 1}
                <a
                    href="/leagues?page={data.currentPage - 1}"
                    class="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition"
                >
                    ← Anterior
                </a>
            {/if}

            <div class="bg-white/5 px-4 py-2 rounded-lg text-white">
                Página {data.currentPage} de {data.totalPages}
            </div>

            {#if data.currentPage < data.totalPages}
                <a
                    href="/leagues?page={data.currentPage + 1}"
                    class="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition"
                >
                    Siguiente →
                </a>
            {/if}
        </div>
    {/if}

    <!-- Create Private League -->
    <div
        class="bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-md rounded-xl p-8 border border-white/10 text-center"
    >
        <h3 class="text-2xl font-bold text-white mb-3">🔒 Ligas Privadas</h3>
        <p class="text-gray-300 mb-6">
            Crea una liga privada y compite con tus amigos
        </p>
        <button
            class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105"
        >
            Crear Liga Privada
        </button>
    </div>
</div>
