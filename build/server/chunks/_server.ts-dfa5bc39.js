import axios from 'axios';

const TIMEOUT = 3e3;
const GET = async ({ params }) => {
  const ip = params.ip;
  let processes = [];
  try {
    const response = await axios.get(`http://${ip}:3000/api/processes`, { timeout: TIMEOUT });
    if (response.status === 200) {
      processes = response.data.processes;
    }
  } catch (error) {
    console.error(`Failed to fetch processes from ${ip}:`, error.message);
    return new Response(JSON.stringify(processes));
  }
  return new Response(JSON.stringify(processes));
};

export { GET };
//# sourceMappingURL=_server.ts-dfa5bc39.js.map
