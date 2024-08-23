import { P as PM2Wrapper } from './PM2Wrapper-BvWto0cp.js';
import 'ip-subnet-calculator';
import 'bluebird';
import 'pm2';
import 'read-last-lines';
import 'os';
import 'rxjs';
import 'rxjs/operators';

const pm2 = new PM2Wrapper();
const GET = async ({ request }) => {
  await pm2.connect();
  const processList = await pm2.listProcesses();
  pm2.disconnect();
  return new Response(JSON.stringify(processList));
};

export { GET };
//# sourceMappingURL=_server.ts-CThuzzy3.js.map
