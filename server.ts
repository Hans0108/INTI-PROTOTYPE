import express from 'express';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('database.sqlite');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    nik TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'guest',
    location TEXT,
    interests TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT NOT NULL,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(event_id) REFERENCES events(id),
    UNIQUE(user_id, event_id)
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    author_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(author_id) REFERENCES users(id)
  );
`);

try {
  db.exec("ALTER TABLE users ADD COLUMN tier TEXT DEFAULT 'Standard'");
} catch (e) {
  // Column might already exist
}

const seedUsers = async () => {
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('Admin123@inti.com');
  if (!adminExists) {
    const hashedAdminPass = await bcrypt.hash('admin123', 10);
    db.prepare('INSERT INTO users (name, nik, email, password, role, tier) VALUES (?, ?, ?, ?, ?, ?)').run(
      'Admin User', 'ADMIN001', 'Admin123@inti.com', hashedAdminPass, 'admin', 'VIP'
    );
  }

  const superAdminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('Superadmin@inti.com');
  if (!superAdminExists) {
    const hashedSuperAdminPass = await bcrypt.hash('superadmin12345', 10);
    db.prepare('INSERT INTO users (name, nik, email, password, role, tier) VALUES (?, ?, ?, ?, ?, ?)').run(
      'Super Admin', 'SUPER001', 'Superadmin@inti.com', hashedSuperAdminPass, 'superadmin', 'VIP'
    );
  }

  const guestExists = db.prepare('SELECT id FROM users WHERE email = ?').get('guest@gmail.com');
  if (!guestExists) {
    const hashedGuestPass = await bcrypt.hash('guest123456', 10);
    db.prepare('INSERT INTO users (name, nik, email, password, role, tier) VALUES (?, ?, ?, ?, ?, ?)').run(
      'Guest User', 'GUEST001', 'guest@gmail.com', hashedGuestPass, 'guest', 'Standard'
    );
  }
};

seedUsers();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
      (req as any).user = user;
      next();
    });
  };

  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if ((req as any).user.role !== 'admin' && (req as any).user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  };

  // API Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, nik, email, password, location, interests } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const stmt = db.prepare('INSERT INTO users (name, nik, email, password, location, interests) VALUES (?, ?, ?, ?, ?, ?)');
      const info = stmt.run(name, nik, email, hashedPassword, location, interests);
      
      const token = jwt.sign({ id: info.lastInsertRowid, email, role: 'guest' }, JWT_SECRET, { expiresIn: '24h' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      res.json({ id: info.lastInsertRowid, name, email, role: 'guest' });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: 'Email or NIK already exists' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      res.json({ id: user.id, name: user.name, email: user.email, role: user.role, nik: user.nik, tier: user.tier });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  app.get('/api/auth/me', authenticateToken, (req, res) => {
    const user = db.prepare('SELECT id, name, email, role, nik, location, interests, tier FROM users WHERE id = ?').get((req as any).user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });

  // Events API
  app.get('/api/events', (req, res) => {
    const events = db.prepare('SELECT * FROM events ORDER BY date DESC').all();
    res.json(events);
  });

  app.post('/api/events', authenticateToken, requireAdmin, (req, res) => {
    const { title, description, date, location, image_url } = req.body;
    const stmt = db.prepare('INSERT INTO events (title, description, date, location, image_url) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(title, description, date, location, image_url);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete('/api/events/:id', authenticateToken, requireAdmin, (req, res) => {
    db.prepare('DELETE FROM rsvps WHERE event_id = ?').run(req.params.id);
    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // RSVP API
  app.post('/api/events/:id/rsvp', authenticateToken, (req, res) => {
    try {
      const stmt = db.prepare('INSERT INTO rsvps (user_id, event_id) VALUES (?, ?)');
      stmt.run((req as any).user.id, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: 'Already RSVPed' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  app.delete('/api/events/:id/rsvp', authenticateToken, (req, res) => {
    db.prepare('DELETE FROM rsvps WHERE user_id = ? AND event_id = ?').run((req as any).user.id, req.params.id);
    res.json({ success: true });
  });

  app.get('/api/users/me/rsvps', authenticateToken, (req, res) => {
    const rsvps = db.prepare(`
      SELECT events.* FROM events 
      JOIN rsvps ON events.id = rsvps.event_id 
      WHERE rsvps.user_id = ?
    `).all((req as any).user.id);
    res.json(rsvps);
  });

  // Posts API
  app.get('/api/posts', (req, res) => {
    const posts = db.prepare('SELECT posts.*, users.name as author_name FROM posts JOIN users ON posts.author_id = users.id ORDER BY posts.created_at DESC').all();
    res.json(posts);
  });

  app.post('/api/posts', authenticateToken, requireAdmin, (req, res) => {
    const { title, content, category, image_url } = req.body;
    const stmt = db.prepare('INSERT INTO posts (title, content, category, image_url, author_id) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(title, content, category, image_url, (req as any).user.id);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete('/api/posts/:id', authenticateToken, requireAdmin, (req, res) => {
    db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Admin Users API
  app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
    const users = db.prepare('SELECT id, name, email, role, tier, created_at FROM users').all();
    res.json(users);
  });

  app.put('/api/admin/users/:id/role', authenticateToken, requireAdmin, (req, res) => {
    if ((req as any).user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Superadmin access required' });
    }
    const { role } = req.body;
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
    res.json({ success: true });
  });

  app.put('/api/admin/users/:id/tier', authenticateToken, requireAdmin, (req, res) => {
    if ((req as any).user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Superadmin access required' });
    }
    const { tier } = req.body;
    db.prepare('UPDATE users SET tier = ? WHERE id = ?').run(tier, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, (req, res) => {
    if ((req as any).user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Superadmin access required' });
    }
    db.prepare('DELETE FROM rsvps WHERE user_id = ?').run(req.params.id);
    db.prepare('DELETE FROM posts WHERE author_id = ?').run(req.params.id);
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
