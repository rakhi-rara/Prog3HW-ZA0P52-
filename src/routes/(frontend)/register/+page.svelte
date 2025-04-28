<script lang="ts">
    import { goto } from '$app/navigation';
    let name = '';
    let password = '';
    let error = '';
    let success = '';

    async function handleRegister() {
        error = '';
        success = '';

        // ✅ Prevent submission if fields are empty
        if (!name || !password) {
            error = 'Please enter both name and password.';
            return;
        }

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password })
        });

        if (res.ok) {
            success = 'Account created! Redirecting to login...';
            setTimeout(() => goto('/login'), 1500);
        } else {
            const data = await res.json();
            error = data?.error || 'User already exists or error occurred.';
        }
    }
</script>

<h1>Register</h1>

<input bind:value={name} placeholder="Name" />
<input bind:value={password} type="password" placeholder="Password" />
<button on:click={handleRegister}>Register</button>

{#if error}
    <p style="color: red;">{error}</p>
{/if}

{#if success}
    <p style="color: green;">{success}</p>
{/if}




