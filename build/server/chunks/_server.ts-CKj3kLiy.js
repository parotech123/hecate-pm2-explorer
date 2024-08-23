import { P as PM2Wrapper } from './PM2Wrapper-BvWto0cp.js';
import 'pm2';
import 'read-last-lines';
import 'os';
import 'rxjs';
import 'rxjs/operators';

const pm2 = new PM2Wrapper();
const POST = async ({ params }) => {
  const id = params.id;
  if (!id)
    return new Response("No ID provided", { status: 400 });
  await pm2.connect();
  await pm2.restart(id);
  pm2.disconnect();
  return new Response(JSON.stringify({
    message: `Process ${id} has been restarted successfully.`
  }));
};

export { POST };
//# sourceMappingURL=_server.ts-CKj3kLiy.js.map
