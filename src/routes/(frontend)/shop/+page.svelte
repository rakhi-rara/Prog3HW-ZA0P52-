<script lang="ts">
    import { currentUser } from '$lib/stores';

    // Reactive user store
    $: user = $currentUser;

    // Prices for each item
    const itemPrices = {
        food: 5,   // $5 for food
        toy: 10,   // $10 for toy
        treat: 3,  // $3 for treat
    };

    // Implement buy function
    async function buy(item: 'food' | 'toy' | 'treat') {
        // Check if the user is logged in
        if (!user) {
            alert("Please log in to make a purchase.");
            return;
        }

        // Check if the user has enough budget for the selected item
        const itemPrice = itemPrices[item];
        if (user.budget < itemPrice) {
            alert(`You don't have enough budget to buy ${item}.`);
            return;
        }

        // Deduct the item's price from the user's budget
        user.budget -= itemPrice;

        // Add the item to the user's inventory
        if (user.inventory) {
            user.inventory[item] = (user.inventory[item] || 0) + 1;
        }

        // Persist changes to the server (users.json)
        const res = await fetch('/api/users', {
            method: 'POST',
            body: JSON.stringify({
                userId: user.id,
                budget: user.budget,
                inventory: user.inventory,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (res.ok) {
            alert(`${item} purchased successfully!`);
        } else {
            alert("Failed to complete the purchase.");
        }
    }
</script>

<h1>Pet Shop</h1>

{#if user}
    <p>Budget: ${user.budget}</p>
    <p>Inventory:</p>
    <ul>
        <li>Food: {user.inventory?.food || 0}</li>
        <li>Toy: {user.inventory?.toy || 0}</li>
        <li>Treat: {user.inventory?.treat || 0}</li>
    </ul>

    <button on:click={() => buy('food')}>Buy Food ($5)</button>
    <button on:click={() => buy('toy')}>Buy Toy ($10)</button>
    <button on:click={() => buy('treat')}>Buy Treat ($3)</button>
{:else}
    <p>Please log in to access the shop.</p>
{/if}

<style>
    button {
        padding: 0.5rem;
        font-size: 1rem;
        margin-top: 1rem;
    }

    p {
        margin-top: 1rem;
    }
</style>

