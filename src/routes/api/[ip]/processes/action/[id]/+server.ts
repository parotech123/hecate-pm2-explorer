import type { RequestHandler } from '@sveltejs/kit';
import { PM2Wrapper } from 'src/lib/PM2Wrapper';

const pm2 = new PM2Wrapper();

export const GET: RequestHandler = async ({ params, url, request }) => {
	const id = params.id;
	const action = url.searchParams.get('action');

	if (!id) return new Response('No ID provided', { status: 400 })
	if (!action) return new Response('No action provided', { status: 400 })

	await pm2.connect();
	pm2.performActions(Number(id), action)
	pm2.disconnect();
	return new Response(JSON.stringify({
		done: true
	}))

};