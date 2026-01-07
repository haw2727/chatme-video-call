import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.route.js';
import chatRoutes from './routes/chat.route.js';
import groupRoutes from './routes/group.route.js';
import callRoutes from './routes/call.route.js';
import groupCallRoutes from './routes/groupCall.route.js';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { WebSocketServer } from 'ws';
import { setUserConnection, removeUserConnection } from './controllers/callController.js';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

const app = express();
const PORT = process.env.PORT || 5002;
const __dirname = path.resolve();

// basic middleware
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: corsOrigin, credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB()
  .then(() => {
    console.log('Database connected successfully');

    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/stream', chatRoutes);
    app.use('/api/groups', groupRoutes);
    app.use('/api/calls', callRoutes);
    app.use('/api/group-calls', groupCallRoutes);
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

    // Enhanced WebSocket connection handler with authentication
    wss.on('connection', async (ws, req) => {
      console.log('WebSocket connection attempt:', req.url);

      let userId = null;

      try {
        // Extract token from query params or headers
        const url = new URL(req.url, `http://${req.headers.host}`);
        const token = url.searchParams.get('token') || req.headers.authorization?.replace('Bearer ', '');

        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.userId).select('-password');

          if (user) {
            userId = user._id.toString();
            setUserConnection(userId, ws);

            // Send connection confirmation
            ws.send(JSON.stringify({
              type: 'connected',
              userId,
              message: 'WebSocket authenticated successfully'
            }));
          }
        }

        if (!userId) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Authentication required for WebSocket connection'
          }));
          ws.close();
          return;
        }
      } catch (error) {
        console.error('WebSocket authentication error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid authentication token'
        }));
        ws.close();
        return;
      }

      // Handle incoming messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log(`WS message from ${userId}:`, data);

          // Handle different message types
          switch (data.type) {
            case 'ping':
              ws.send(JSON.stringify({ type: 'pong', timestamp: new Date() }));
              break;
            case 'heartbeat':
              // Keep connection alive
              break;
            default:
              console.log('Unknown WebSocket message type:', data.type);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });

      // Handle connection close
      ws.on('close', () => {
        console.log(`WebSocket closed for user: ${userId}`);
        if (userId) {
          removeUserConnection(userId);
        }
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for user ${userId}:`, error);
        if (userId) {
          removeUserConnection(userId);
        }
      });
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
