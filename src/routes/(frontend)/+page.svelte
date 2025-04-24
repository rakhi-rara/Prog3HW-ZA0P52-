<script lang="ts">
    import { onMount } from 'svelte';
    import type { Pet } from '$lib/types';

    let pets: Pet[] = [];
    let filter: 'all' | 'puppy' | 'kitten' = 'all';

    // Fetch pets from API on page load
    onMount(async () => {
        try {
            const res = await fetch('/api/pets');
            if (res.ok) {
                pets = await res.json();
            } else {
                console.error('Failed to load pets');
            }
        } catch (err) {
            console.error('Error fetching pets:', err);
        }
    });

    // Apply filter
    function filteredPets(): Pet[] {
        if (filter === 'all') return pets;
        return pets.filter(pet => pet.type === filter);
    }
</script>

<style>
    select {
        margin-bottom: 1rem;
        padding: 0.3rem;
    }
    ul {
        list-style: none;
        padding: 0;
    }
    li {
        margin-bottom: 1rem;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 6px;
    }
    button {
        margin-left: 1rem;
    }
</style>

<h1>🐾 Pet Adoption Portal</h1>

<!-- Filter dropdown -->
<label for="filter">Filter by type:</label>
<select id="filter" bind:value={filter}>
    <option value="all">All</option>
    <option value="puppy">Puppies</option>
    <option value="kitten">Kittens</option>
</select>

<!-- List of pets -->
<ul>
    {#each filteredPets() as pet}
        <li>
            <strong>{pet.name}</strong> ({pet.type}) —
            {pet.adopted ? 'Already adopted' : 'Available'}

            {#if !pet.adopted}
                <!-- Button is not functional yet -->
                <button disabled>Adopt</button>
            {/if}
        </li>
    {/each}
</ul>


