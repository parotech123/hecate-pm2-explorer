import { PM2Wrapper } from '$lib/PM2Wrapper';
import type { RequestHandler } from '@sveltejs/kit';

const pm2 = new PM2Wrapper();

export const POST: RequestHandler = async ({ params }) => {
	const id = params.id;

	if (!id) return new Response('No ID provided', { status: 400 })

	await pm2.connect();

	await pm2.stop(id)

	pm2.disconnect();
	
	return new Response(JSON.stringify({
		message: `Process ${id} has been stopped successfully.`
	}))

};