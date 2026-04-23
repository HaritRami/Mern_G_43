/**
 * NexaMart – Full Database Seeder
 * Run: npm run seed  (from the root 12-02 folder)
 *      OR: node seed/seed.js  (from inside Backend/)
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';
import { fileURLToPath } from 'url';
import path from 'path';

// ── Load .env ────────────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ── Models (inline schemas so seeder is self-contained) ──────────────────────
// We import the real models so we respect all validators + hooks.
import User from '../models/user.model.js';
import CategoryModel from '../models/category.model.js';
import ProductModel from '../models/product.model.js';

// ── Helpers ──────────────────────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randPrice = (min, max) => Math.round((Math.random() * (max - min) + min) / 10) * 10;

const UNITS = ['piece', 'pair', 'set', 'pack', 'kg', 'litre', 'box', 'roll'];
const ADJECTIVES = ['Premium', 'Pro', 'Elite', 'Ultra', 'Classic', 'Compact', 'Smart', 'Deluxe', 'Advance', 'Lite', 'Max', 'Pure', 'Swift', 'Flex', 'Power'];
const COLORS = ['Black', 'White', 'Silver', 'Blue', 'Red', 'Green', 'Grey', 'Navy', 'Beige', 'Gold'];

/** Build a unique product name: "<Adjective> <Base> <Color> <Edition|Model>" */
const makeProductName = (base, idx) => {
  const adj = ADJECTIVES[idx % ADJECTIVES.length];
  const col = COLORS[Math.floor(idx / ADJECTIVES.length) % COLORS.length];
  const suffix = idx < 25 ? `v${idx + 1}` : `Edition ${idx + 1}`;
  return `${adj} ${base} ${col} ${suffix}`;
};

const makeDescription = (name, category) =>
  `The ${name} is a top-tier ${category} product designed for everyday reliability and long-lasting performance. ` +
  `Built with high-quality materials, it offers superior durability and a refined user experience. ` +
  `Trusted by thousands of NexaMart customers for consistent quality and value.`;

// ── Category Definitions ─────────────────────────────────────────────────────
// Each entry: [name, description, baseProductName, priceMin, priceMax]
const CATEGORY_DEFS = [
  ['Electronics',        'Cutting-edge electronic gadgets and devices for home and office. Featuring the latest technology for productivity and entertainment.',                                            'Digital Device',      500,  45000],
  ['Fashion',            'Stylish clothing and apparel for men, women and children. Curated collections that blend comfort with contemporary design.',                                                    'Apparel',             299,  5999 ],
  ['Home & Kitchen',     'Premium home and kitchen essentials for a modern lifestyle. Functional, durable products that elevate your living space.',                                                       'Kitchen Item',        199,  8999 ],
  ['Beauty',             'Luxury beauty and personal care products crafted for skin health and confidence. Dermatologist-tested formulas for all skin types.',                                            'Beauty Product',      149,  3999 ],
  ['Sports',             'Professional-grade sports and fitness equipment for athletes and enthusiasts. Engineered for performance, built to endure.',                                                   'Sports Gear',         299,  12000],
  ['Books',              'A curated collection of bestselling books across genres — fiction, non-fiction, academic and more. Expand your knowledge with every page.',                                   'Book',                99,   1499 ],
  ['Toys',               'Safe, creative and educational toys for children of all ages. Designed to spark imagination and support developmental growth.',                                               'Toy',                 199,  3999 ],
  ['Groceries',          'Fresh and packaged grocery essentials sourced from trusted suppliers. Everyday staples delivered with quality assurance.',                                                    'Grocery Pack',        49,   999  ],
  ['Automotive',         'High-performance automotive accessories and care products for every vehicle type. Keep your ride in peak condition.',                                                          'Auto Accessory',      299,  9999 ],
  ['Health',             'Evidence-based health and wellness supplements for a balanced lifestyle. Formulated by nutritionists to support immunity and vitality.',                                      'Health Supplement',   199,  2999 ],
  ['Mobile Accessories', 'Essential mobile accessories compatible with all major smartphone brands. Precision-engineered for protection and performance.',                                              'Mobile Accessory',    99,   4999 ],
  ['Furniture',          'Contemporary and ergonomic furniture pieces crafted for modern homes and offices. Durable construction with elegant finishes.',                                              'Furniture Piece',     1999, 49999],
  ['Appliances',         'Energy-efficient home appliances from trusted brands. Designed for convenience, safety and long-term performance.',                                                          'Home Appliance',      999,  35000],
  ['Gaming',             'Next-generation gaming peripherals, consoles and accessories for serious gamers. Optimised for speed, precision and immersive play.',                                       'Gaming Gear',         499,  25000],
  ['Office Supplies',    'Professional office stationery and supplies for productive workspaces. High-quality materials for daily business needs.',                                                    'Office Supply',        49,   2999 ],
  ['Pet Supplies',       'Premium pet care products for dogs, cats and small animals. Nutritious, safe and vet-recommended choices for your pets.',                                                   'Pet Care Product',    149,  3999 ],
  ['Jewelry',            'Elegant handcrafted jewelry pieces in gold, silver and precious stones. Timeless designs for every occasion and personality.',                                              'Jewelry Piece',       499,  19999],
  ['Footwear',           'Comfortable and stylish footwear for every occasion. Crafted with premium materials for lasting wear and foot health.',                                                     'Footwear',            499,  7999 ],
  ['Bags',               'Functional and fashionable bags for travel, work and everyday use. Designed with durable materials and thoughtful organisation.',                                          'Bag',                 399,  8999 ],
  ['Watches',            'Precision-crafted timepieces for men and women. A blend of classic elegance and modern functionality on your wrist.',                                                      'Watch',               799,  24999],
  ['Baby Products',      'Safe, certified and gentle baby care essentials. Every product is tested for infant safety and designed for parenting ease.',                                              'Baby Care Item',      199,  4999 ],
  ['Fitness',            'High-performance fitness equipment and accessories for home and gym use. Built to support your training goals at every level.',                                            'Fitness Equipment',   499,  14999],
  ['Gardening',          'Professional gardening tools and plant care essentials for home gardens. Designed for both beginner and expert gardeners.',                                               'Garden Tool',         149,  4999 ],
  ['Tools',              'Heavy-duty hand and power tools for construction, DIY and professional use. Precision-engineered for accuracy and durability.',                                           'Tool',                199,  9999 ],
  ['Stationery',         'Premium quality stationery essentials for students, artists and professionals. Designed for precision, comfort and creativity.',                                          'Stationery Item',      29,   999  ],
  ['Music',              'Musical instruments and accessories for beginners to professionals. Crafted for sound quality and long-lasting playability.',                                             'Music Instrument',    399,  19999],
  ['Travel Accessories', 'Smart travel accessories designed for comfort, security and organisation. Your perfect companion for every journey.',                                                    'Travel Accessory',    199,  5999 ],
  ['Outdoor Gear',       'Rugged outdoor and adventure gear for trekking, camping and exploration. Built to perform in demanding outdoor environments.',                                           'Outdoor Equipment',   499,  14999],
  ['Kitchen Appliances', 'Modern kitchen appliances that combine technology with culinary art. Save time and enhance cooking with smart, efficient designs.',                                     'Kitchen Appliance',   799,  24999],
  ['Smart Devices',      'Next-generation IoT and smart home devices for a connected lifestyle. Seamlessly integrating technology into everyday living.',                                         'Smart Device',        999,  39999],
];

// ── Connect & Seed ────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nexamart';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('\n✅ MongoDB connected.\n');

    // ── 1. Clear existing data ───────────────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      CategoryModel.deleteMany({}),
      ProductModel.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing Users, Categories, Products.\n');

    // ── 2. Create Users ──────────────────────────────────────────────────────
    const SALT = await bcrypt.genSalt(10);
    const adminPass  = await bcrypt.hash('admin#nexamart123',  SALT);
    const sellerPass = await bcrypt.hash('seller#nexamart123', SALT);

    const adminBios  = ['Passionate about building seamless e-commerce experiences. Overseeing operations at NexaMart to ensure quality and trust for every customer.'];
    const sellerBios = ['Dedicated seller bringing curated, high-quality products to NexaMart. Committed to transparency, fast fulfilment and customer satisfaction.'];

    const [adminUser, sellerUser] = await User.insertMany([
      {
        name: 'Admin',
        email: 'admin@nexamart.com',
        password: adminPass,
        bio: adminBios[0],
        mobile: '9999999999',
        verify_email: true,
        role: 'Admin',
        status: 'Active',
      },
      {
        name: 'nexa_Seller',
        email: 'seller@nexamart.com',
        password: sellerPass,
        bio: sellerBios[0],
        mobile: '8899999999',
        verify_email: true,
        role: 'Seller',
        status: 'Active',
      },
    ]);
    console.log('👤 Users created (Admin + Seller).\n');

    // ── 3. Create Categories ─────────────────────────────────────────────────
    const categoryDocs = CATEGORY_DEFS.map(([name, description]) => ({
      userId: adminUser._id,
      name,
      description,
      image: `https://placehold.co/400x300?text=${encodeURIComponent(name)}`,
      barcodeId: nanoid(10),
    }));

    const insertedCategories = await CategoryModel.insertMany(categoryDocs);
    console.log(`📂 ${insertedCategories.length} categories created.\n`);

    // ── 4. Create Products ───────────────────────────────────────────────────
    const allProducts = [];

    insertedCategories.forEach((cat, catIdx) => {
      const [, , baseName, priceMin, priceMax] = CATEGORY_DEFS[catIdx];

      for (let i = 0; i < 25; i++) {
        const productName = makeProductName(baseName, i);
        const price       = randPrice(priceMin, priceMax);
        const discount    = pick([0, 0, 5, 10, 15]); // 0 = no discount (weighted)

        allProducts.push({
          userId: sellerUser._id,
          name: productName,
          images: [
            `https://placehold.co/600x400?text=${encodeURIComponent(productName.split(' ').slice(0, 2).join('+'))}`,
            `https://placehold.co/600x400?text=${encodeURIComponent(cat.name)}`,
          ],
          category: [cat._id],
          subCategory: [],
          unit: pick(UNITS),
          stock: randInt(10, 200),
          price,
          discount: discount || null,
          description: makeDescription(productName, cat.name),
          moreDetail: {
            brand: `NexaBrand ${catIdx + 1}`,
            warranty: pick(['6 months', '1 year', '2 years', 'No warranty']),
            color: pick(COLORS),
            weight: `${randInt(1, 10) * 100}g`,
          },
          Public: true,
          barcodeId: nanoid(10),
          averageRating: 0,
          totalReviews: 0,
        });
      }
    });

    const insertedProducts = await ProductModel.insertMany(allProducts);
    console.log(`📦 ${insertedProducts.length} products created.\n`);

    // ── 5. Summary ───────────────────────────────────────────────────────────
    console.log('====================================');
    console.log(' NexaMart Seed Completed Successfully');
    console.log('====================================\n');
    console.log('Admin Login:');
    console.log('  Email   : admin@nexamart.com');
    console.log('  Password: admin#nexamart123\n');
    console.log('Seller Login:');
    console.log('  Email   : seller@nexamart.com');
    console.log('  Password: seller#nexamart123\n');
    console.log(`Total Categories : ${insertedCategories.length}`);
    console.log(`Total Products   : ${insertedProducts.length}`);
    console.log('\n====================================\n');

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    if (err.writeErrors) {
      err.writeErrors.slice(0, 5).forEach(e => console.error(' •', e.errmsg));
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected. Exiting.');
    process.exit(0);
  }
}

seed();
