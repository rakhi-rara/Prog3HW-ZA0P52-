<script lang="ts">
    import { currentUser } from '$stores/user';
    import { goto } from '$app/navigation';

    let name = '';
    let password = '';
    let error = '';

    // Handle login form submission
    async function handleLogin() {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password })
        });

        const data = await res.json();

        if (res.ok) {
            currentUser.set(data); // Store user in session store
            goto('/dashboard');    // Redirect to dashboard
        } else {
            error = data.error || 'Login failed';
        }
    }
</script>

<h2>Login</h2>

{#if error}
    <p style="color: red;">{error}</p>
{/if}

<form on:submit|preventDefault={handleLogin}>
    <input type="text" bind:value={name} placeholder="Username" required />
    <br />
    <input type="password" bind:value={password} placeholder="Password" required />
    <br />
    <button type="submit">Log in</button>
</form>

<p>Don't have an account? <a href="/register">Register here</a></p>
