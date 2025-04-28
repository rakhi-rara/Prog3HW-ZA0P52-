import { json } from '@sveltejs/kit';

export async function POST() {
    return json(
        { message: 'Logged out successfully' },
        {
            status: 200,
            headers: {
                'Set-Cookie': 'session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
            }
        }
    );
}
