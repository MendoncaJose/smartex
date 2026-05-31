import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import { AppDataSource } from '../data-source';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';

const CATEGORIES = [
  'Electronics',
  'Computers',
  'Clothing',
  'Footwear',
  'Sports',
  'Home & Garden',
  'Books',
  'Food & Drink',
  'Toys & Games',
  'Automotive',
  'Health & Beauty',
  'Office Supplies',
];

interface ProductSeed {
  title: string;
  description: string;
  price: number;
  categories: string[];
}

const PRODUCTS: ProductSeed[] = [
  // Electronics
  {
    title: 'iPhone 15 Pro',
    description: 'Apple iPhone 15 Pro 256GB',
    price: 1199.99,
    categories: ['Electronics'],
  },
  {
    title: 'Samsung Galaxy S24',
    description: 'Samsung Galaxy S24 128GB',
    price: 999.99,
    categories: ['Electronics'],
  },
  {
    title: 'Sony WH-1000XM5',
    description: 'Wireless noise-cancelling headphones',
    price: 349.99,
    categories: ['Electronics'],
  },
  {
    title: 'Apple AirPods Pro',
    description: '2nd generation with USB-C',
    price: 249.99,
    categories: ['Electronics'],
  },
  {
    title: 'iPad Pro 12.9"',
    description: 'Apple iPad Pro M2 256GB',
    price: 1099.99,
    categories: ['Electronics'],
  },
  {
    title: 'Samsung 65" QLED TV',
    description: '4K Smart TV Neo QLED',
    price: 1299.99,
    categories: ['Electronics'],
  },
  {
    title: 'Sony PlayStation 5',
    description: 'PS5 Disc Edition',
    price: 499.99,
    categories: ['Electronics', 'Toys & Games'],
  },
  {
    title: 'Apple Watch Series 9',
    description: 'GPS + Cellular 45mm',
    price: 399.99,
    categories: ['Electronics', 'Sports'],
  },
  {
    title: 'Kindle Paperwhite',
    description: '11th Gen 16GB waterproof',
    price: 139.99,
    categories: ['Electronics', 'Books'],
  },
  {
    title: 'GoPro Hero 12',
    description: 'Action camera 5.3K video',
    price: 399.99,
    categories: ['Electronics', 'Sports'],
  },

  // Computers
  {
    title: 'MacBook Pro 16" M3',
    description: 'Apple M3 Pro chip 18GB RAM',
    price: 2499.99,
    categories: ['Computers', 'Electronics'],
  },
  {
    title: 'Dell XPS 15',
    description: 'Intel i9 32GB 1TB OLED',
    price: 1899.99,
    categories: ['Computers'],
  },
  {
    title: 'ASUS ROG Strix G16',
    description: 'Gaming laptop RTX 4070 32GB',
    price: 1599.99,
    categories: ['Computers', 'Electronics'],
  },
  {
    title: 'Logitech MX Master 3S',
    description: 'Wireless ergonomic mouse',
    price: 99.99,
    categories: ['Computers', 'Office Supplies'],
  },
  {
    title: 'Keychron K2 Keyboard',
    description: 'Mechanical wireless keyboard',
    price: 89.99,
    categories: ['Computers', 'Office Supplies'],
  },
  {
    title: 'LG 27" 4K Monitor',
    description: 'UltraFine IPS USB-C',
    price: 499.99,
    categories: ['Computers', 'Electronics'],
  },
  {
    title: 'Samsung T7 SSD 1TB',
    description: 'Portable NVMe USB 3.2',
    price: 89.99,
    categories: ['Computers', 'Electronics'],
  },
  {
    title: 'Raspberry Pi 5',
    description: '8GB RAM single-board computer',
    price: 79.99,
    categories: ['Computers', 'Electronics'],
  },

  // Clothing
  {
    title: "Levi's 501 Original Jeans",
    description: 'Classic straight fit denim',
    price: 69.99,
    categories: ['Clothing'],
  },
  {
    title: 'Nike Dri-FIT T-Shirt',
    description: 'Moisture-wicking training top',
    price: 34.99,
    categories: ['Clothing', 'Sports'],
  },
  {
    title: 'Adidas Essentials Hoodie',
    description: 'Fleece pullover hoodie',
    price: 64.99,
    categories: ['Clothing', 'Sports'],
  },
  {
    title: 'Ralph Lauren Polo Shirt',
    description: 'Classic fit cotton polo',
    price: 89.99,
    categories: ['Clothing'],
  },
  {
    title: 'Zara Slim Fit Chinos',
    description: 'Stretch cotton chino trousers',
    price: 49.99,
    categories: ['Clothing'],
  },
  {
    title: 'The North Face Fleece',
    description: '100 Glacier quarter-zip fleece',
    price: 149.99,
    categories: ['Clothing', 'Sports'],
  },
  {
    title: 'Uniqlo Ultralight Down',
    description: 'Packable 90% down jacket',
    price: 129.99,
    categories: ['Clothing'],
  },

  // Footwear
  {
    title: 'Nike Air Max 270',
    description: 'Lifestyle running shoe',
    price: 149.99,
    categories: ['Footwear', 'Sports'],
  },
  {
    title: 'Adidas Ultraboost 23',
    description: 'Performance running shoe',
    price: 179.99,
    categories: ['Footwear', 'Sports'],
  },
  {
    title: 'Converse Chuck Taylor All Star',
    description: 'Classic canvas high-top',
    price: 64.99,
    categories: ['Footwear'],
  },
  {
    title: 'New Balance 574',
    description: 'Classic lifestyle sneaker',
    price: 89.99,
    categories: ['Footwear'],
  },
  {
    title: 'Timberland 6" Premium Boot',
    description: 'Waterproof leather boot',
    price: 199.99,
    categories: ['Footwear'],
  },
  {
    title: 'Vans Old Skool',
    description: 'Skate shoe with side stripe',
    price: 74.99,
    categories: ['Footwear'],
  },

  // Sports
  {
    title: 'Wilson Pro Staff Tennis Racket',
    description: 'V14 300g professional racket',
    price: 229.99,
    categories: ['Sports'],
  },
  {
    title: 'Liforme Yoga Mat',
    description: 'Premium alignment yoga mat',
    price: 149.99,
    categories: ['Sports', 'Health & Beauty'],
  },
  {
    title: 'Bowflex SelectTech 552',
    description: 'Adjustable dumbbell set 2-24kg',
    price: 299.99,
    categories: ['Sports', 'Health & Beauty'],
  },
  {
    title: 'Garmin Forerunner 265',
    description: 'GPS running smartwatch AMOLED',
    price: 449.99,
    categories: ['Sports', 'Electronics'],
  },
  {
    title: 'Trek FX 3 Disc',
    description: 'Fitness hybrid bicycle',
    price: 849.99,
    categories: ['Sports', 'Automotive'],
  },
  {
    title: 'Speedo Fastskin Goggles',
    description: 'Elite competition swim goggles',
    price: 34.99,
    categories: ['Sports'],
  },

  // Home & Garden
  {
    title: 'Dyson V15 Detect',
    description: 'Cordless vacuum with laser detection',
    price: 749.99,
    categories: ['Home & Garden'],
  },
  {
    title: 'Nespresso Vertuo Pop',
    description: 'Coffee machine with 5 cup sizes',
    price: 99.99,
    categories: ['Home & Garden', 'Food & Drink'],
  },
  {
    title: 'Weber Q1200 Gas Grill',
    description: 'Portable propane grill',
    price: 249.99,
    categories: ['Home & Garden'],
  },
  {
    title: 'Philips Hue Starter Kit',
    description: 'Smart LED 4-bulb color kit',
    price: 199.99,
    categories: ['Home & Garden', 'Electronics'],
  },
  {
    title: 'Instant Pot Duo 7-in-1',
    description: 'Electric pressure cooker 6Qt',
    price: 99.99,
    categories: ['Home & Garden', 'Food & Drink'],
  },
  {
    title: 'Roomba i5+',
    description: 'Robot vacuum with auto empty',
    price: 499.99,
    categories: ['Home & Garden', 'Electronics'],
  },

  // Books
  {
    title: 'The Clean Coder',
    description: 'Robert C. Martin — Professional software development',
    price: 34.99,
    categories: ['Books'],
  },
  {
    title: 'Clean Architecture',
    description: 'Robert C. Martin — Software structure and design',
    price: 39.99,
    categories: ['Books'],
  },
  {
    title: 'Atomic Habits',
    description: 'James Clear — Tiny changes remarkable results',
    price: 19.99,
    categories: ['Books'],
  },
  {
    title: 'The Pragmatic Programmer',
    description: '20th Anniversary Edition',
    price: 44.99,
    categories: ['Books', 'Computers'],
  },
  {
    title: 'Designing Data-Intensive Apps',
    description: 'Martin Kleppmann — Reliable scalable systems',
    price: 49.99,
    categories: ['Books', 'Computers'],
  },

  // Food & Drink
  {
    title: 'Nespresso Capsules 100pk',
    description: 'Variety pack original line',
    price: 59.99,
    categories: ['Food & Drink'],
  },
  {
    title: 'Lavazza Espresso Beans 1kg',
    description: 'Qualità Rossa medium roast',
    price: 24.99,
    categories: ['Food & Drink'],
  },
  {
    title: 'Matcha Premium Grade 100g',
    description: 'Ceremonial grade Japanese matcha',
    price: 29.99,
    categories: ['Food & Drink', 'Health & Beauty'],
  },
];

async function seed() {
  await AppDataSource.initialize();
  console.log('DB connected');

  const userRepo = AppDataSource.getRepository(User);
  const categoryRepo = AppDataSource.getRepository(Category);
  const productRepo = AppDataSource.getRepository(Product);

  // Admin user
  let admin = await userRepo.findOne({ where: { email: 'admin@smartex.com' } });
  if (!admin) {
    const hashed = await bcrypt.hash('Admin123!', 10);
    admin = userRepo.create({ email: 'admin@smartex.com', password: hashed });
    admin = await userRepo.save(admin);
    console.log(`User created: ${admin.email}`);
  } else {
    console.log(`User already exists: ${admin.email}`);
  }

  // Categories
  const categoryMap = new Map<string, Category>();
  for (const categoryName of CATEGORIES) {
    let category = await categoryRepo.findOne({
      where: { name: categoryName, userId: admin.id },
    });
    if (!category) {
      category = categoryRepo.create({ name: categoryName, userId: admin.id });
      category = await categoryRepo.save(category);
      console.log(`Category created: ${categoryName}`);
    }
    categoryMap.set(categoryName, category);
  }

  // Products
  for (const productSeed of PRODUCTS) {
    const exists = await productRepo.findOne({
      where: { title: productSeed.title, userId: admin.id },
    });
    if (exists) {
      console.log(`Product already exists: ${productSeed.title}`);
      continue;
    }
    const categories = productSeed.categories.map(
      (categorySeedName) => categoryMap.get(categorySeedName)!,
    );
    const product = productRepo.create({
      title: productSeed.title,
      description: productSeed.description,
      price: productSeed.price,
      userId: admin.id,
      categories,
    });
    await productRepo.save(product);
    console.log(`Product created: ${productSeed.title}`);
  }

  console.log('\nSeed complete.');
  await AppDataSource.destroy();
}

seed().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
