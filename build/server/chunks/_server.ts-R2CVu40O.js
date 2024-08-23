import 'pm2';
import 'read-last-lines';
import IpSubnetCalculator from 'ip-subnet-calculator';
import axios from 'axios';
import Bluebird from 'bluebird';

const TIMEOUT = 100;
const GET = async ({ request, url }) => {
  let subnet = url.searchParams.get("subnet");
  if (typeof subnet === "undefined")
    return new Response("No subnet provided", { status: 400 });
  const allProcesses = [];
  const ipRange = IpSubnetCalculator.calculateSubnetMask(subnet.split("/")[0], Number(subnet.split("/")[1]));
  const ips = [];
  for (let i = ipRange.ipLow; i <= ipRange.ipHigh; i++) {
    ips.push(longToIp(i));
  }
  for (let i = 0; i < ips.length; i += 30) {
    const batch = ips.slice(i, i + 30);
    await Bluebird.map(batch, async (ip) => {
      try {
        const response = await axios.get(`http://${ip}:3000/api/processes`, { timeout: TIMEOUT });
        if (response.status === 200) {
          allProcesses.push({
            ip,
            processes: response.data.processes
          });
        }
      } catch (error) {
        console.error(`Failed to fetch processes from ${ip}:`, error.message);
      }
    }, { concurrency: 10 });
  }
  return new Response(JSON.stringify(allProcesses));
};
function longToIp(long) {
  const buf = Buffer.alloc(4);
  buf.writeUInt32BE(long);
  return [
    buf[0],
    buf[1],
    buf[2],
    buf[3]
  ].join(".");
}

export { GET };
//# sourceMappingURL=_server.ts-R2CVu40O.js.map
