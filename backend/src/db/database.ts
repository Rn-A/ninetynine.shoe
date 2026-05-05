import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // Load variables from .env file (if exists)

/*
// Konfigurasi Standar Industri menggunakan process.env
// Dengan 'fallback' (nilai default) khusus XAMPP agar langsung bisa jalan di komputer Anda
// saat pertama kali di-download meskipun Anda belum membuat file .env.
export const sequelize = new Sequelize(
  process.env.DB_NAME || 'ninetynine_shoe',     // Nama database
  process.env.DB_USER || 'root',                // Username default XAMPP
  process.env.DB_PASS || '',                    // Password default XAMPP (kosong)
  {
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: false,
  }
);
*/

// ======= BACKUP SQLITE =======
// (Akan dikembalikan setelah Anda selesai mengunduh file)
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
});

export const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'customer' } // 'customer' or 'admin'
});

export const Service = sequelize.define('Service', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, defaultValue: 'OTHER' },
  price: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.STRING }
});

export const Order = sequelize.define('Order', {
  id: { type: DataTypes.STRING, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  customer_name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.TEXT, allowNull: false },
  services_used: { type: DataTypes.STRING },
  total_price: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING, defaultValue: 'Pesanan Dibuat' },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

// === CMS MODELS ===

export const Testimonial = sequelize.define('Testimonial', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, defaultValue: 'Pelanggan' },
  rating: { type: DataTypes.INTEGER, defaultValue: 5 },
  text: { type: DataTypes.TEXT, allowNull: false },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
});

export const ShowcaseItem = sequelize.define('ShowcaseItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  label: { type: DataTypes.STRING, allowNull: false },
  icon: { type: DataTypes.STRING, defaultValue: 'fa-shoe-prints' },
  media_url: { type: DataTypes.TEXT, allowNull: false }, // URL to video or image
  media_type: { type: DataTypes.ENUM('video', 'image'), defaultValue: 'video' },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
});
