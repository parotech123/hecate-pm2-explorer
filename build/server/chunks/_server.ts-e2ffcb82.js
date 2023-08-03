import { P as PM2Wrapper } from './PM2Wrapper-d4c04e93.js';
import 'pm2';
import 'read-last-lines';
import 'os';
import 'rxjs';
import 'rxjs/operators';

const pm2 = new PM2Wrapper();
const POST = async ({ request }) => {
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
  }));
};

export { POST };
//# sourceMappingURL=_server.ts-e2ffcb82.js.map
