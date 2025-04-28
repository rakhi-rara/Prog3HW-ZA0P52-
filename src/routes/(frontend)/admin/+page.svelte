<script lang="ts">
    import { onMount } from 'svelte';
    import { currentUser } from '$lib/stores';
    import type { SafeUser, Pet } from '$lib/types';
    import { goto } from '$app/navigation';
    import { get } from 'svelte/store';
    export let data;

    let name = '';
    let type = 'puppy';
    let success = '';
    let error = '';

    let users: SafeUser[] = data.users;
    let pets: Pet[] = data.pets;
    let logs: any[] = [];

    const user = get(currentUser);

    onMount(() => {
        if (!user || user.role !== 'admin') {
            goto('/login');
        } else {
            (async () => {
                await loadAdminData();
            })();
        }
    });

    async function loadAdminData() {
        try {
            const res = await fetch('/api/admin');
            if (res.ok) {
                const data = await res.json();
                users = data.users;
                pets = data.pets
            } 
        } catch {
            error = 'Could not load admin data.';
        }

        try {
            const logRes = await fetch('/api/log');
            if (logRes.ok) {
                logs = await logRes.json();
            } else {
                console.error('Failed to load logs');
            }
        } catch (err) {
            console.error('Error loading logs');
        }
    }

    async function addPet() {
        success = '';
        error = '';

        try {
            const res = await fetch('/api/pets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type })
            });

            const data = await res.json();

            if (res.ok) {
                success = 'Pet added successfully!';
                name = '';
                type = 'puppy';
                await loadAdminData();
            } else {
                error = data.error || 'Failed to add pet.';
            }
        } catch {
            error = 'Error adding pet.';
        }
    }
</script>

<h1>🛠 Admin Panel</h1>

{#if success}<p style="color: green;">{success}</p>{/if}
{#if error}<p style="color: red;">{error}</p>{/if}

<h2>➕ Add New Pet</h2>
<form on:submit|preventDefault={addPet}>
    <label>
        Name:
        <input type="text" bind:value={name} required />
    </label>
    <br />
    <label>
        Type:
        <select bind:value={type}>
            <option value="puppy">Puppy</option>
            <option value="kitten">Kitten</option>
        </select>
    </label>
    <br />
    <button type="submit">Add Pet</button>
</form>

<h2>👥 Users</h2>
<ul>
    {#each users as u}
        <li>{u.name} — Budget: ${u.budget}</li>
    {/each}
</ul>

<h2>🐾 Adopted Pets</h2>
<ul>
    {#each pets as pet}
        <li>{pet.name} ({pet.type}) — Owner ID: {pet.ownerId}</li>
    {/each}
</ul>

<h2>📜 Action Logs</h2>
{#if logs.length === 0}
    <p>No logs available.</p>
{:else}
    <ul>
        {#each logs as log}
            <li>
                <strong>{new Date(log.timestamp).toLocaleString()}</strong> — {log.message}
            </li>
        {/each}

    </ul>
{/if}

<style>
    form {
        display: grid;
        gap: 0.75rem;
        max-width: 300px;
        margin-bottom: 2rem;
    }

    ul {
        list-style-type: disc;
        margin-left: 1.5rem;
    }
</style>
