import { PM2Wrapper } from '$lib/PM2Wrapper';
import type { RequestHandler } from '@sveltejs/kit';

const pm2 = new PM2Wrapper();

export const GET: RequestHandler = async ({ params, url }) => {
	const id = params.id;
	const lines = url.searchParams.get('lines') || 10;

	if (!id) return new Response('No ID provided', { status: 400 })

	await pm2.connect();

	let outLogs = await pm2.retrieveLastLines(id, Number(lines), 'out');
	const errLogs = await pm2.retrieveLastLines(id, Number(lines), 'err');



	// console.log(outLogs[0])
	pm2.disconnect();
	return new Response(JSON.stringify({
		outLogs,
		errLogs
	}))

};