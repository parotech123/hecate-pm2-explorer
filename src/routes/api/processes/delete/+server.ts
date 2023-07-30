import { PM2Wrapper } from '$lib/PM2Wrapper';
import type { RequestHandler } from '@sveltejs/kit';

const pm2 = new PM2Wrapper();

export const POST: RequestHandler = async ({request }) => {
	
	let body = await request.json();

	const { id } = await body

	console.log(id);

	if (typeof id ==="undefined") return new Response('No ID provided', { status: 400 })

	await pm2.connect();

	await pm2.delete(id);

	pm2.disconnect();
	return new Response(JSON.stringify({
		message: `Process ${id} has been deleted successfully.`
	}))

};