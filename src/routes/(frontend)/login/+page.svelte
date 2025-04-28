<script lang="ts">
    import { currentUser } from '$lib/stores';
    import { goto } from '$app/navigation';

    let name = '';
    let password = '';
    let error = '';

    async function handleLogin() {
        error = '';
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, password })
        });

        if (res.ok) {
            const result = await res.json();

            currentUser.set(result.user);
            if (result.user.role === "admin") {
              await  goto('/admin');
            } else {
             await  goto('/dashboard');
            }

        } else {
            const err = await res.json();
            error = err.error || 'Login failed';
        }
    }

</script>

<h1>Login</h1>
<form on:submit|preventDefault={handleLogin}>
    <label>
        Name:
        <input bind:value={name} required />
    </label>
    <br />
    <label>
        Password:
        <input type="password" bind:value={password} required />
    </label>
    <br />
    <button type="submit">Login</button>
    {#if error}
        <p style="color: red">{error}</p>
    {/if}
</form>
