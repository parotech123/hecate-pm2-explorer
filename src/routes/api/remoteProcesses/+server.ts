import { PM2Wrapper } from '$lib/PM2Wrapper';

const pm2 = new PM2Wrapper();


import IpSubnetCalculator from 'ip-subnet-calculator';
import axios from 'axios';
import Bluebird from 'bluebird';
import type { RequestHandler } from '@sveltejs/kit';

const TIMEOUT = 100;  // 5 seconds

export const GET: RequestHandler = async ({ request, url }) => {
	let subnet = url.searchParams.get('subnet') as string;
	// console.log(subnet)

	if (typeof subnet === "undefined") return new Response('No subnet provided', { status: 400 })

	const allProcesses: any[] = [];

	const ipRange = IpSubnetCalculator.calculateSubnetMask(subnet.split('/')[0], Number(subnet.split('/')[1]));
	const ips = [];

	// console.log(ipRange)

	for (let i = ipRange.ipLow; i <= ipRange.ipHigh; i++) {
		ips.push(longToIp(i));
	}

	for (let i = 0; i < ips.length; i += 30) {
		const batch = ips.slice(i, i + 30);

		await Bluebird.map(batch, async (ip: string) => {
			try {
				const response = await axios.get(`http://${ip}:3000/api/processes`, { timeout: TIMEOUT });

				if (response.status === 200) {
					allProcesses.push({
						ip,
						processes: response.data.processes
					});
				}
			} catch (error: any) {
				console.error(`Failed to fetch processes from ${ip}:`, error.message);
			}
		}, { concurrency: 10 });
	}

	return new Response(JSON.stringify(allProcesses))

};


function longToIp(long:number) {
	const buf = Buffer.alloc(4);
	buf.writeUInt32BE(long);
	return [
		buf[0],
		buf[1],
		buf[2],
		buf[3]
	].join('.');
}

    // await pm2.connect();

    // const processList = await pm2.listProcesses();

    // pm2.disconnect();

