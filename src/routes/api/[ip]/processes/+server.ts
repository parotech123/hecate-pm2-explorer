
import { PM2Wrapper } from '$lib/PM2Wrapper';



const pm2 = new PM2Wrapper();


import type { RequestHandler } from '@sveltejs/kit';

const TIMEOUT = 3000;  // 5 seconds

export const GET: RequestHandler = async ({ request, params }) => {


        let ip = params.ip

        if (!ip) {
                return new Response('No ip provided', { status: 400 })
        }

        const host = ip
        console.log("retrieving process from " + ip)

        if (ip != "host") {

                let urlToCall = host  +"/api/host/processes"


                let data = {}

                return new Response(JSON.stringify(data))

        } else {



                await pm2.connect();
                const processList = await pm2.listProcesses();

                pm2.disconnect();

                return new Response(JSON.stringify(processList))
        }

};



