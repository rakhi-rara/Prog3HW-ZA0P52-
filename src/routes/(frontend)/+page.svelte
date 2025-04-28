<script lang="ts">
    import { onMount } from 'svelte';
    import type { Pet } from '$lib/types';

    let pets: Pet[] = [];
    let filter: 'all' | 'puppy' | 'kitten' = 'all';
    let displayedPets: Pet[] = [];

    onMount(async () => {
        await loadPets();
    });

    async function loadPets() {
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
    }

    $: displayedPets = filter === 'all'
        ? pets
        : pets.filter((pet) => pet.type === filter);

    async function adoptPet(id: number) {
        const res = await fetch('/api/adopt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ petId: id })
        });

        if (res.ok) {
            await loadPets(); // Refresh list
        } else {
            alert('Failed to adopt the pet.');
        }
    }

    function handleImageError(event: Event) {
        const target = event.target as HTMLImageElement;
        if (target) target.src = '/images/default.jpg';
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
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    img {
        width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid #ccc;
    }
    button {
        margin-left: auto;
    }
</style>

<h1>🐾 Pet Adoption Portal</h1>

<label for="filter">Filter by type:</label>
<select id="filter" bind:value={filter}>
    <option value="all">All</option>
    <option value="puppy">Puppies</option>
    <option value="kitten">Kittens</option>
</select>

<ul>
    {#each displayedPets as pet}
        <li>
            <img
                    src={`/images/${pet.name.toLowerCase()}.jpg`}
                    alt={pet.name}
                    on:error={handleImageError}
            />

            <div>
                <strong>{pet.name}</strong> ({pet.type})<br />
                {pet.adopted ? 'Already adopted' : 'Available'}
            </div>

            {#if !pet.adopted}
                <button on:click={() => adoptPet(pet.id)}>Adopt</button>
            {/if}
        </li>
    {/each}
</ul>
