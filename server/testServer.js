// Standalone Node HTTP Test Server for Postman / Newman CI runs
import http from 'http';
import { handleApiRequest } from './apiHandler.js';

const PORT = process.env.TEST_PORT || 5173;

const server = http.createServer(async (req, res) => {
  try {
    const handled = await handleApiRequest(req, res);
    if (!handled) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Endpoint not found', path: req.url }));
    }
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`[SocietyCMS REST Test API] listening on http://localhost:${PORT}`);
});
