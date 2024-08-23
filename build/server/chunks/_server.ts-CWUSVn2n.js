import { P as PM2Wrapper } from './PM2Wrapper-BvWto0cp.js';
import 'pm2';
import 'read-last-lines';
import 'os';
import 'rxjs';
import 'rxjs/operators';

const pm2 = new PM2Wrapper();
const GET = async ({ params, url }) => {
  const id = params.id;
  const lines = url.searchParams.get("lines") || 10;
  if (!id)
    return new Response("No ID provided", { status: 400 });
  await pm2.connect();
  let outLogs = await pm2.retrieveLastLines(id, Number(lines), "out");
  const errLogs = await pm2.retrieveLastLines(id, Number(lines), "err");
  pm2.disconnect();
  return new Response(JSON.stringify({
    outLogs,
    errLogs
  }));
};

export { GET };
//# sourceMappingURL=_server.ts-CWUSVn2n.js.map
