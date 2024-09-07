import { P as PM2Wrapper } from './PM2Wrapper-BvWto0cp.js';
import axios from 'axios';
import 'pm2';
import 'read-last-lines';
import 'os';
import 'rxjs';
import 'rxjs/operators';

const pm2 = new PM2Wrapper();
const TIMEOUT = 3e3;
const GET = async ({ request, params, url }) => {
  let host = url.searchParams.get("host");
  console.log("Host: " + host);
  if (host) {
    console.log("Host specified, using host: " + host);
    let urlToCall = host + "/api/processes";
    let data = [];
    try {
      console.log("Calling: " + urlToCall);
      const res = await axios.get(urlToCall, {
        timeout: TIMEOUT,
        method: "GET"
      });
      let texgt = await res.data;
      console.log(texgt);
      data = await res.data;
    } catch (error) {
      console.error(error);
      data = [];
    }
    return new Response(JSON.stringify(data));
  } else {
    console.log("No host specified, using local host");
    await pm2.connect();
    const processList = await pm2.listProcesses();
    pm2.disconnect();
    return new Response(JSON.stringify(processList));
  }
};

export { GET };
//# sourceMappingURL=_server.ts-lvNj_XjV.js.map
