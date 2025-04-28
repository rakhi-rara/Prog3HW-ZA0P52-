<script lang="ts">
    import { currentUser } from '$lib/stores';
    import { goto } from '$app/navigation';
    import { writable } from 'svelte/store';

    $: user = $currentUser;

    // Toast state
    const toast = writable<string | null>(null);

    async function logout() {
        try {
            const res = await fetch('/api/logout', {
                method: 'POST'
            });

            if (!res.ok) {
                console.error('Failed to logout');
                return;
            }

            currentUser.set(null);
            showToast('👋 Logged out successfully!');
            await goto('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    }

    function showToast(message: string) {
        toast.set(message);
        setTimeout(() => {
            toast.set(null);
        }, 3000); // Toast disappears after 3 seconds
    }
</script>

<nav>
    <a href="/">Home</a>
    {#if user}
        <a href="/dashboard">Dashboard</a>
        <a href="/shop">Shop</a>
        {#if user && user.role === 'admin'}
            <a href="/admin">Admin</a>
            <a href="/logs">Logs</a>
        {/if}

        <button on:click={logout}>Logout</button>
        <span class="user">{user.name}</span>
    {:else}
        <a href="/login">Login</a>
        <a href="/register">Register</a>
    {/if}
</nav>

<!-- Toast notification -->
{#if $toast}
    <div class="toast">{$toast}</div>
{/if}

<slot />

<style>
    nav {
        background: #f2f2f2;
        padding: 1rem;
        display: flex;
        gap: 1rem;
        align-items: center;
        border-bottom: 1px solid #ccc;
    }

    nav a {
        text-decoration: none;
        color: #333;
    }

    nav .user {
        margin-left: auto;
        font-weight: bold;
    }

    nav button {
        background: transparent;
        border: none;
        cursor: pointer;
        color: #0077cc;
    }

    nav button:hover {
        text-decoration: underline;
    }

    /* Toast styles */
    .toast {
        position: fixed;
        top: 1rem;
        right: 1rem;
        background: #333;
        color: #fff;
        padding: 0.8rem 1.2rem;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: fadein 0.5s, fadeout 0.5s 2.5s;
    }

    @keyframes fadein {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeout {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
</style>
