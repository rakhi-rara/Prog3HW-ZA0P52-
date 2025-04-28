<script lang="ts">
    import { onMount } from 'svelte';
    import { currentUser } from '$lib/stores';

    let error = '';
    let success = '';

    $: user = $currentUser;

    onMount(async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                currentUser.set(data.user);
            } else {
                console.error('Failed to fetch user data');
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
        }
    });

    async function buy(item: 'food' | 'toy' | 'treat') {
        error = '';
        success = '';

        if (!user) {
            error = 'Please log in to make a purchase.';
            return;
        }

        try {
            const res = await fetch('/api/shop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item })
            });

            const data = await res.json();

            if (res.ok) {
                currentUser.set(data.user); // reactive update
                success = data.message;
            } else {
                error = data.error || 'Purchase failed.';
            }
        } catch (err) {
            error = 'Something went wrong.';
        }
    }
</script>

<h1>🛍️ Pet Shop</h1>

{#if success}<p style="color: green;">{success}</p>{/if}
{#if error}<p style="color: red;">{error}</p>{/if}

{#if user}
    <p><strong>Budget:</strong> ${user.budget}</p>

    <h2>Inventory</h2>
    <ul>
        <li>Food: {user.inventory?.food || 0}</li>
        <li>Toy: {user.inventory?.toy || 0}</li>
        <li>Treat: {user.inventory?.treat || 0}</li>
    </ul>

    <div style="margin-top: 1rem;">
        <button on:click={() => buy('food')}>Buy Food (−$5)</button>
        <button on:click={() => buy('toy')}>Buy Toy (−$10)</button>
        <button on:click={() => buy('treat')}>Buy Treat (−$15)</button>
    </div>
{:else}
    <p>Please log in to access the shop.</p>
{/if}

<style>
    button {
        padding: 0.5rem 1rem;
        font-size: 1rem;
        margin: 0.5rem 0.5rem 1rem 0;
        cursor: pointer;
    }

    ul {
        list-style: disc;
        margin-left: 1.5rem;
    }

    h2 {
        margin-top: 1rem;
    }
</style>


