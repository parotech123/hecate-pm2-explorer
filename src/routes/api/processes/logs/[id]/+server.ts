import { PM2Wrapper } from '$lib/PM2Wrapper';
import type { RequestHandler } from '@sveltejs/kit';

const pm2 = new PM2Wrapper();

export const GET: RequestHandler = async ({ params }) => {
	const id = params.id;

	if (!id) return new Response('No ID provided', { status: 400 })

	await pm2.connect();

	const outLogs = await pm2.retrieveLastLines(id, 10, 'out');
	const errLogs = await pm2.retrieveLastLines(id, 10, 'err');

	pm2.disconnect();
	return new Response(JSON.stringify({
		outLogs,
		errLogs
	}))

};