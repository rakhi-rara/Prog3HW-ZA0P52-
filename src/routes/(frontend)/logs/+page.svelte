<script lang="ts">
    import { goto } from '$app/navigation';
    import { currentUser } from '$lib/stores';

    export let data: {
        logs: { timestamp: string; message: string }[];
    };

    async function logout() {
        try {
            await fetch('/logout', {
                method: 'POST'
            });
            currentUser.set(null);
            goto('/login');
        } catch (e) {
            console.error('Logout failed:', e);
        }
    }
</script>

<h1>📜 Action Logs</h1>

{#if data.logs.length === 0}
    <p>No logs available yet.</p>
{:else}
    <ul>
        {#each data.logs as log}
            <li>
                <strong>{new Date(log.timestamp).toLocaleString()}:</strong> {log.message}
            </li>
        {/each}
    </ul>
{/if}

<button on:click={logout}>Logout</button>

<style>
    h1 {
        margin-bottom: 1rem;
    }
    ul {
        list-style-type: none;
        padding: 0;
    }
    li {
        margin-bottom: 0.5rem;
    }
    button {
        margin-top: 2rem;
        padding: 0.5rem 1rem;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
    button:hover {
        background-color: #45a049;
    }
</style>

