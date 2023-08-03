import { P as PM2Wrapper } from './PM2Wrapper-d4c04e93.js';
import 'pm2';
import 'read-last-lines';
import 'os';
import 'rxjs';
import 'rxjs/operators';

const pm2 = new PM2Wrapper();
const GET = async ({ params }) => {
  const id = params.id;
  if (!id)
    return new Response("No ID provided", { status: 400 });
  await pm2.connect();
  let outLogs = await pm2.retrieveLastLines(id, 10, "out");
  const errLogs = await pm2.retrieveLastLines(id, 10, "err");
  pm2.disconnect();
  return new Response(JSON.stringify({
    outLogs,
    errLogs
  }));
};

export { GET };
//# sourceMappingURL=_server.ts-9b5dca50.js.map
