import { P as PM2Wrapper } from './PM2Wrapper-BvWto0cp.js';
import 'pm2';
import 'read-last-lines';
import 'os';
import 'rxjs';
import 'rxjs/operators';

const pm2 = new PM2Wrapper();
const POST = async ({ request }) => {
  let body = await request.json();
  const { id } = await body;
  if (typeof id === "undefined")
    return new Response("No ID provided", { status: 400 });
  await pm2.connect();
  await pm2.delete(id);
  pm2.disconnect();
  return new Response(JSON.stringify({
    message: `Process ${id} has been deleted successfully.`
  }));
};

export { POST };
//# sourceMappingURL=_server.ts-DwIJ3dCo.js.map
