import { P as PM2Wrapper } from './PM2Wrapper-BvWto0cp.js';
import 'pm2';
import 'read-last-lines';
import 'os';
import 'rxjs';
import 'rxjs/operators';

const pm2 = new PM2Wrapper();
const GET = async ({ params, url, request }) => {
  const id = params.id;
  const action = url.searchParams.get("action");
  if (!id)
    return new Response("No ID provided", { status: 400 });
  if (!action)
    return new Response("No action provided", { status: 400 });
  await pm2.connect();
  pm2.performActions(Number(id), action);
  pm2.disconnect();
  return new Response(JSON.stringify({
    done: true
  }));
};

export { GET };
//# sourceMappingURL=_server.ts-7mRtOwud.js.map
