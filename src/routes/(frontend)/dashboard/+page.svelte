<script lang="ts">
    import { currentUser } from '$lib/stores';
    import type { Pet, SafeUser } from '$lib/types';
    import { goto } from '$app/navigation';


    export let data: { user: SafeUser; pets: Pet[] };

    let pets: Pet[] = data.pets;
    let user: SafeUser = data.user;
    let error = '';
    let success = '';



    async function handleAction(petId: number, action: 'feed' | 'toy' | 'return') {
        error = '';
        success = '';
        try {
            const res = await fetch(`/api/actions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ petId, action })
            });
            const result = await res.json();
            if (res.ok) {
                pets = result.pets;
                currentUser.set(result.user);
                user = result.user;
                success = result.message || `${action} successful.`;
            } else {
                if (result.redirectTo) {
                    await goto(result.redirectTo);
                } else {
                    error = result.error || 'Action failed.';
                }
            }
        } catch (err) {
            error = 'Something went wrong.';
        }
    }

    async function buy(item: 'food' | 'toy') {
        error = '';
        success = '';
        try {
            const res = await fetch('/api/shop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item })
            });
            const result = await res.json();
            if (res.ok) {
                currentUser.set(result.user);
                user = result.user;
                success = result.message;
            } else {
                error = result.error || 'Purchase failed.';
            }
        } catch {
            error = 'Failed to process purchase.';
        }
    }
</script>

<h1>📋 Your Adopted Pets</h1>

{#if success}<p style="color: green;">{success}</p>{/if}
{#if error}<p style="color: red;">{error}</p>{/if}

<p><strong>💰 Budget:</strong> ${user.budget}</p>
<p>
    🎒 Inventory —
    🍽️ Food: {user.inventory.food},
    🧸 Toy: {user.inventory.toy},
    🍬 Treat: {user.inventory.treat}
</p>

<h2>🛒 Shop</h2>
<button on:click={() => buy('food')}>Buy Food ($5)</button>
<button on:click={() => buy('toy')}>Buy Toy ($10)</button>

<h2>🐾 Your Pets</h2>
{#if pets.length === 0}
    <p>You haven’t adopted any pets yet.</p>
{:else}
    {#each pets as pet}
        <div style="border: 1px solid #ccc; padding: 1rem; margin-bottom: 1rem;">
            <h3>{pet.name} ({pet.type})</h3>
            <p>Hunger: {pet.hunger}</p>
            <p>Happiness: {pet.happiness}</p>
            <button on:click={() => handleAction(pet.id, 'feed')}>Feed (−$5)</button>
            <button on:click={() => handleAction(pet.id, 'toy')}>Play (−$10)</button>
            <button on:click={() => handleAction(pet.id, 'return')}>Return (−$20)</button>
        </div>
    {/each}
{/if}

<style>
    button {
        margin-right: 1rem;
        margin-bottom: 1rem;
    }
</style>
