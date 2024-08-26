import { PM2Wrapper } from '$lib/PM2Wrapper';
import type { RequestHandler } from '@sveltejs/kit';

const pm2 = new PM2Wrapper();

export const POST: RequestHandler = async ({request}) => {
	let body = await request.json();

	const { script, env } = body;

	await pm2.connect();

	const process = await pm2.start({
		script,
		env
	});

	pm2.disconnect();

	return new Response(JSON.stringify({
		process,
		message: `Process ${process.name} has been started successfully.`
	}))

};