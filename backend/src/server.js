import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.route.js';
import chatRoutes from './routes/chat.route.js';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const PORT = process.env.PORT || 5002;
const __dirname = path.resolve();

// basic middleware
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: corsOrigin, credentials: true, methods: ['GET','POST','PUT','DELETE','OPTIONS'] }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB()
  .then(() => {
    console.log('Database connected successfully');

    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/stream', chatRoutes);
    app.get('/api/health', (req, res) => res.json({ ok: true }));

    // serve frontend (safe catch-all)
    const distPath = path.join(__dirname, '../frontend/dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(distPath, 'index.html')));
    } else {
      app.get(/^\/(?!api).*/, (req, res) => {
        res.status(200).send('Frontend not found. Build frontend or run frontend dev server.');
      });
    }

    // create HTTP server so we can accept websocket upgrades
    const server = http.createServer(app);

    // WebSocket server (noServer: true) — handle upgrades explicitly
    const wss = new WebSocketServer({ noServer: true });

    // simple connection handler — adjust behavior as needed
    wss.on('connection', (ws, req) => {
      console.log('WebSocket connected:', req.url);
      // respond to ping/handshake or perform simple echo
      ws.on('message', (message) => {
        console.log('WS message:', message.toString());
        // optional: echo back
        // ws.send(message);
      });
      ws.on('close', () => console.log('WebSocket closed:', req.url));
      // optional: send initial message so client knows connection succeeded
      try { ws.send(JSON.stringify({ type: 'connected' })); } catch (e) {}
    });

    // handle upgrade requests: allow /ws (and /ws/*), reject others
    server.on('upgrade', (req, socket, head) => {
      const url = req.url || '';
      if (url.startsWith('/ws')) {
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit('connection', ws, req);
        });
      } else {
        // not a supported websocket path — politely close
        socket.write('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
        socket.destroy();
      }
    });

    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to the database:', error.message);
    process.exit(1);
  });