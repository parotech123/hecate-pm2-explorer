
import { PM2Wrapper, type ProcessData } from '$lib/PM2Wrapper';



const pm2 = new PM2Wrapper();


import type { RequestHandler } from '@sveltejs/kit';
import axios from 'axios';

const TIMEOUT = 3000;  // 5 seconds

export const GET: RequestHandler = async ({ request, params, url }) => {


        let host = url.searchParams.get('host')


        console.log("Host: " + host)


        if (host) {


                console.log("Host specified, using host: " + host)

                let urlToCall = host + "/api/processes"


                let data: ProcessData[] = []

                try {

                        console.log("Calling: " + urlToCall)
                        const res = await axios.get(urlToCall, {
                                timeout: TIMEOUT,
                                method: 'GET',
                        });
                        // const res = await fetch(urlToCall, {
                        //         headers: {
                        //                 'Content-Type': 'application/json'
                        //         },
                        //         method: 'GET',
                        // });

                        let texgt = await res.data
                        console.log(texgt)
                        data = await res.data;

                } catch (error) {
                        console.error(error)
                        data = []
                }
                // console.log(data)
                return new Response(JSON.stringify(data))

        } else {

                console.log("No host specified, using local host")


                await pm2.connect();
                const processList = await pm2.listProcesses();

                pm2.disconnect();

                return new Response(JSON.stringify(processList))
        }

};



