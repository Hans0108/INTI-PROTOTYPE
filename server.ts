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

const seedPosts = () => {
  const postCount = db.prepare('SELECT COUNT(*) as count FROM posts').get() as { count: number };
  if (postCount.count === 0) {
    const admin = db.prepare('SELECT id FROM users WHERE email = ?').get('Admin123@inti.com') as { id: number };
    if (admin) {
      const dummyPosts = [
        { title: 'The Future of Cultural Exchange', content: 'Cultural exchange programs are evolving rapidly in the digital age. By leveraging new technologies, we can connect communities across the globe more effectively than ever before.', category: 'Culture', image_url: 'https://picsum.photos/seed/culture1/800/600' },
        { title: 'Business Networking in 2026', content: 'As we navigate the post-pandemic business landscape, networking has taken on new forms. Hybrid events and AI-driven matchmaking are becoming the new standard for professionals.', category: 'Business', image_url: 'https://picsum.photos/seed/business1/800/600' },
        { title: 'Community Outreach Success Story', content: 'Our recent community outreach program in the downtown area was a massive success. Over 500 volunteers participated, helping to clean up local parks and distribute food to those in need.', category: 'Community', image_url: 'https://picsum.photos/seed/community1/800/600' },
        { title: 'Upcoming Annual Gala Preview', content: 'Get ready for our biggest event of the year! The Annual Gala will feature keynote speakers from top tech companies, live entertainment, and a silent auction to support our local initiatives.', category: 'Events', image_url: 'https://picsum.photos/seed/events1/800/600' },
        { title: 'Preserving Traditional Arts', content: 'In an increasingly modernized world, preserving traditional arts and crafts is crucial. We explore how local artisans are keeping their heritage alive through workshops and exhibitions.', category: 'Culture', image_url: 'https://picsum.photos/seed/culture2/800/600' },
        { title: 'Startup Funding Trends', content: 'Venture capital is shifting focus towards sustainable and socially responsible startups. Here is what founders need to know when pitching to investors this quarter.', category: 'Business', image_url: 'https://picsum.photos/seed/business2/800/600' },
        { title: 'Youth Leadership Workshop Recap', content: 'Last weekend, we hosted a leadership workshop for high school students. The engagement and innovative ideas presented by these young minds were truly inspiring.', category: 'Community', image_url: 'https://picsum.photos/seed/community2/800/600' },
        { title: 'Tech Conference 2026 Highlights', content: 'The recent tech conference brought together industry leaders to discuss AI, blockchain, and the future of work. Read our comprehensive summary of the key takeaways.', category: 'Events', image_url: 'https://picsum.photos/seed/events2/800/600' },
        { title: 'Culinary Heritage Festival', content: 'Food is a universal language. Our upcoming Culinary Heritage Festival will showcase traditional dishes from over 20 different cultures, prepared by local chefs.', category: 'Culture', image_url: 'https://picsum.photos/seed/culture3/800/600' },
        { title: 'Building Resilient Supply Chains', content: 'Global disruptions have highlighted the need for resilient supply chains. Experts share their strategies for mitigating risks and ensuring business continuity.', category: 'Business', image_url: 'https://picsum.photos/seed/business3/800/600' }
      ];

      const insertPost = db.prepare('INSERT INTO posts (title, content, category, image_url, author_id) VALUES (?, ?, ?, ?, ?)');
      
      db.transaction(() => {
        for (const post of dummyPosts) {
          insertPost.run(post.title, post.content, post.category, post.image_url, admin.id);
        }
      })();
    }
  }
};

const seedEvents = () => {
  const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
  if (eventCount.count === 0) {
    const dummyEvents = [
      { title: 'Global Tech Summit 2026', description: 'Join industry leaders for a 3-day summit discussing the future of AI, quantum computing, and sustainable tech.', date: '2026-05-15T09:00:00Z', location: 'San Francisco Convention Center', image_url: 'https://picsum.photos/seed/eventtech1/800/600' },
      { title: 'Cultural Heritage Festival', description: 'A celebration of diverse cultures featuring traditional music, dance, and culinary delights from around the world.', date: '2026-06-20T10:00:00Z', location: 'City Park Amphitheater', image_url: 'https://picsum.photos/seed/eventculture1/800/600' },
      { title: 'Startup Pitch Night', description: 'Watch 10 promising startups pitch their ideas to a panel of top venture capitalists. Networking session to follow.', date: '2026-04-10T18:30:00Z', location: 'Innovation Hub Downtown', image_url: 'https://picsum.photos/seed/eventbusiness1/800/600' },
      { title: 'Community Clean-Up Drive', description: 'Give back to the community by joining our monthly clean-up drive. Supplies and lunch will be provided for all volunteers.', date: '2026-03-28T08:00:00Z', location: 'Riverside Park', image_url: 'https://picsum.photos/seed/eventcommunity1/800/600' },
      { title: 'Future of Finance Panel', description: 'Experts discuss the evolving landscape of fintech, decentralized finance, and digital currencies.', date: '2026-05-05T14:00:00Z', location: 'Financial District Hotel', image_url: 'https://picsum.photos/seed/eventfinance1/800/600' },
      { title: 'Annual Charity Gala', description: 'An elegant evening of dining and entertainment to raise funds for local educational initiatives. Black tie optional.', date: '2026-07-12T19:00:00Z', location: 'Grand Ballroom', image_url: 'https://picsum.photos/seed/eventgala1/800/600' },
      { title: 'Art & Design Expo', description: 'Discover the latest trends in contemporary art and graphic design. Featuring works from over 50 emerging artists.', date: '2026-08-18T11:00:00Z', location: 'Modern Art Museum', image_url: 'https://picsum.photos/seed/eventart1/800/600' },
      { title: 'Health & Wellness Retreat', description: 'A weekend dedicated to mindfulness, yoga, and holistic health practices. Disconnect and recharge.', date: '2026-09-05T08:00:00Z', location: 'Mountain View Resort', image_url: 'https://picsum.photos/seed/eventhealth1/800/600' },
      { title: 'E-commerce Strategies Workshop', description: 'Learn how to optimize your online store, improve conversion rates, and build customer loyalty in this intensive workshop.', date: '2026-04-22T10:00:00Z', location: 'Business Center Room A', image_url: 'https://picsum.photos/seed/eventecommerce1/800/600' },
      { title: 'Local Food Tasting Tour', description: 'Experience the best local cuisine with a guided tasting tour of the city\'s most renowned restaurants and hidden gems.', date: '2026-05-30T17:00:00Z', location: 'Downtown Market Square', image_url: 'https://picsum.photos/seed/eventfood1/800/600' }
    ];

    const insertEvent = db.prepare('INSERT INTO events (title, description, date, location, image_url) VALUES (?, ?, ?, ?, ?)');
    
    db.transaction(() => {
      for (const event of dummyEvents) {
        insertEvent.run(event.title, event.description, event.date, event.location, event.image_url);
      }
    })();
  }
};

seedUsers().then(() => {
  seedPosts();
  seedEvents();
});

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

  app.get('/api/events/:id', (req, res) => {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
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

  app.get('/api/posts/:id', (req, res) => {
    const post = db.prepare('SELECT posts.*, users.name as author_name FROM posts JOIN users ON posts.author_id = users.id WHERE posts.id = ?').get(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
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
