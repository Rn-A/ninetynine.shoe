import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";
import { sequelize, User, Service, Order, Testimonial, ShowcaseItem } from "./src/db/database.js";
import { fileURLToPath } from 'url';

// ESM __dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Multer: save uploaded files directly to frontend's public/uploads folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'frontend', 'public', 'uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // max 100MB
  fileFilter: (req, file, cb) => {
    const allowed = /mp4|webm|ogg|jpg|jpeg|png|gif|webp/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file video (mp4, webm, ogg) dan gambar (jpg, png, gif, webp) yang diizinkan.'));
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 5001;

  app.use(cors());
  app.use(express.json());

  // Serve uploaded files directly from backend if frontend static file cache is stale
  app.use('/uploads', express.static(path.join(__dirname, '..', 'frontend', 'public', 'uploads')));

  // Connect & Sync Database
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Database synced successfully via Sequelize.');
    
    // Seed initial data if empty
    const serviceCount = await Service.count();
    if (serviceCount === 0) {
      await Service.bulkCreate([
        { name: 'Fast Cleaning', category: 'Paket pekat', price: 35000, description: 'Cuci kilat bagian luar' },
        { name: 'Deep Cleaning', category: 'Paket pekat', price: 50000, description: 'Luar dalam & insole' },
        { name: 'Kids Shoes', category: 'Ladies care', price: 30000, description: 'Cuci sepatu anak-anak' },
        { name: 'Repaint Sepatu', category: 'suede care', price: 150000, description: 'Cat ulang sepatu agar seperti baru' },
      ]);
    }

    // Seed default admin
    const adminCount = await User.count({ where: { role: 'admin' } });
    if (adminCount === 0) {
      await User.create({
        name: 'Admin Ninetynine Shoe',
        email: 'admin@ninetynine.shoe',
        password: 'admin', // in a real app, hash this!
        role: 'admin'
      });
    }

    // Seed Testimonials
    const testiCount = await Testimonial.count();
    if (testiCount === 0) {
      await Testimonial.bulkCreate([
        { name: 'Andi Saputra', location: 'Pelanggan Purwokerto', rating: 5, text: '"Gila sih, sepatu putih kesayangan yang udah menguning parah bisa balik putih lagi kayak baru beli. Mantap Ninetynine Shoe!"', sort_order: 1 },
        { name: 'Rina Melati', location: 'Pelanggan Cilacap', rating: 5, text: '"Layanan pick-up delivery-nya ngebantu banget buat yang sibuk kerja. Tinggal WA, sepatu dijemput, balik-balik udah wangi."', sort_order: 2 },
        { name: 'Dimas Anggara', location: 'Pelanggan Purwokerto', rating: 4, text: '"Cuci helm dan tas carrier juga oke banget di sini. Harganya masuk akal, kualitasnya premium. Sukses terus!"', sort_order: 3 },
      ]);
    }

    // Seed Showcase Videos
    const showcaseCount = await ShowcaseItem.count();
    if (showcaseCount === 0) {
      await ShowcaseItem.bulkCreate([
        { label: 'Deep Clean', icon: 'fa-shoe-prints', media_url: 'https://videos.pexels.com/video-files/3635378/3635378-uhd_2560_1440_25fps.mp4', media_type: 'video', sort_order: 1 },
        { label: 'Steam Uap', icon: 'fa-spray-can-sparkles', media_url: 'https://videos.pexels.com/video-files/6461561/6461561-uhd_2560_1440_30fps.mp4', media_type: 'video', sort_order: 2 },
        { label: 'Pick Up & Delivery', icon: 'fa-truck-fast', media_url: 'https://videos.pexels.com/video-files/5384913/5384913-uhd_2560_1440_25fps.mp4', media_type: 'video', sort_order: 3 },
      ]);
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

  // --- API ROUTES ---
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for: ${username}`);
    
    // Check if it's the hardcoded admin login
    if (username === "admin" && password === "admin123") {
      return res.json({ token: "admin-token", user: { id: 0, name: "Admin", email: "admin@ninetynine.shoe", role: "admin" }});
    }

    const user = await User.findOne({ where: { email: username, password } });
    if (user) {
      const u = user.get({ plain: true }) as any;
      res.json({ token: `token-for-${u.id}`, user: { id: u.id, name: u.name, email: u.email, role: u.role } });
    } else {
      res.status(401).json({ error: "Email atau password salah" });
    }
  });

  app.post("/api/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "Email sudah digunakan" });
      }
      const user = await User.create({ name, email, password, role: 'customer' });
      const u = user.get({ plain: true }) as any;
      res.json({ token: `token-for-${u.id}`, user: { id: u.id, name: u.name, email: u.email, role: u.role } });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Services APIs
  app.get("/api/services", async (req, res) => {
    const services = await Service.findAll();
    res.json(services);
  });
  app.post("/api/services", async (req, res) => {
    const service = await Service.create(req.body);
    res.json(service);
  });
  app.put("/api/services/:id", async (req, res) => {
    await Service.update(req.body, { where: { id: req.params.id } });
    res.json({ success: true });
  });
  app.delete("/api/services/:id", async (req, res) => {
    await Service.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  // Orders APIs
  app.get("/api/orders", async (req, res) => {
    const userId = req.query.userId;
    if (userId) {
      const orders = await Order.findAll({ where: { user_id: userId }, order: [['date', 'DESC']] });
      return res.json(orders);
    }
    const orders = await Order.findAll({ order: [['date', 'DESC']] });
    res.json(orders);
  });
  app.get("/api/orders/:id", async (req, res) => {
    const order = await Order.findByPk(req.params.id);
    if (order) res.json(order);
    else res.status(404).json({ error: "Resi tidak ditemukan" });
  });
  app.post("/api/orders", async (req, res) => {
    const order = await Order.create(req.body);
    res.json(order);
  });
  app.put("/api/orders/:id", async (req, res) => {
    await Order.update(req.body, { where: { id: req.params.id } });
    res.json({ success: true });
  });
  app.delete("/api/orders/:id", async (req, res) => {
    await Order.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  // ==== FILE UPLOAD API ====
  // POST /api/upload — accepts multipart/form-data with field "file"
  // Saves to frontend/public/uploads/ and returns the public URL path
  app.post("/api/upload", upload.single("file"), (req: any, res: any) => {
    if (!req.file) {
      return res.status(400).json({ error: "Tidak ada file yang diunggah." });
    }
    // Return full backend URL so uploads are immediately accessible without relying on frontend static asset cache.
    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: publicUrl, filename: req.file.filename, mimetype: req.file.mimetype });
  });

  // ==== CMS APIs ====

  // Testimonials
  app.get("/api/testimonials", async (req, res) => {
    const items = await Testimonial.findAll({ order: [['sort_order', 'ASC']] });
    res.json(items);
  });
  app.post("/api/testimonials", async (req, res) => {
    const item = await Testimonial.create(req.body);
    res.json(item);
  });
  app.put("/api/testimonials/:id", async (req, res) => {
    await Testimonial.update(req.body, { where: { id: req.params.id } });
    res.json({ success: true });
  });
  app.delete("/api/testimonials/:id", async (req, res) => {
    await Testimonial.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  // Showcase Items
  app.get("/api/showcase", async (req, res) => {
    const items = await ShowcaseItem.findAll({ order: [['sort_order', 'ASC']] });
    res.json(items);
  });
  app.post("/api/showcase", async (req, res) => {
    const item = await ShowcaseItem.create(req.body);
    res.json(item);
  });
  app.put("/api/showcase/:id", async (req, res) => {
    await ShowcaseItem.update(req.body, { where: { id: req.params.id } });
    res.json({ success: true });
  });
  app.delete("/api/showcase/:id", async (req, res) => {
    await ShowcaseItem.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  // Global Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Express Error:", err);
    res.status(err.status || 500).json({ 
      error: err.message || "Internal Server Error",
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API Server running on http://localhost:${PORT}`);
  });
}

startServer();
