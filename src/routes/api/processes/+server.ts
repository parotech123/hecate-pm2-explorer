import { PM2Wrapper } from '$lib/PM2Wrapper';

const pm2 = new PM2Wrapper();


import IpSubnetCalculator from 'ip-subnet-calculator';
import axios from 'axios';
import Bluebird from 'bluebird';
import type { RequestHandler } from '@sveltejs/kit';

const TIMEOUT = 3000;  // 5 seconds

export const GET: RequestHandler = async ({ request }) => {
   
    await pm2.connect();
    
    const processList = await pm2.listProcesses();
    
    pm2.disconnect();

    return new Response(JSON.stringify(processList))

};



