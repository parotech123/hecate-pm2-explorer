import { PM2Wrapper } from '$lib/PM2Wrapper';

const pm2 = new PM2Wrapper();


import type { RequestHandler } from '@sveltejs/kit';

const TIMEOUT = 3000;  // 5 seconds

export const GET: RequestHandler = async ({ request, params }) => {


    
        return new Response(JSON.stringify({ok:true}))

};



