import { getDb } from './src/lib/db';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const db = getDb();

// Seed admin user
const adminExists = db.query("SELECT id FROM users WHERE email = 'admin@boeriecall.co.za'").get();
if (!adminExists) {
  db.prepare(`
    INSERT INTO users (id, name, email, password, role, city)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(generateId(), 'BoerieCall Admin', 'admin@boeriecall.co.za', 'admin123', 'ADMIN', 'Johannesburg');
  console.log('Admin user created');
}

// Seed products
const products = [
  { name: 'Cold Smoked Bacon', description: 'Premium pork belly cold-smoked over applewood chips for 8 hours. Perfect for breakfast, sandwiches, or salads.', category: 'COLD_SMOKED', subcategory: 'Pork', cost_price: 120, markup_percent: 50, markup_amount: 0, selling_price: 180, weight: 0.5, stock_quantity: 50 },
  { name: 'Cold Smoked Salmon', description: 'Fresh Norwegian salmon cured and cold-smoked with a delicate blend of herbs. Serves 4-6 people.', category: 'COLD_SMOKED', subcategory: 'Seafood', cost_price: 280, markup_percent: 45, markup_amount: 0, selling_price: 406, weight: 0.4, stock_quantity: 30 },
  { name: 'Cold Smoked Pastrami', description: 'Traditional beef pastrami dry-rubbed with black pepper and coriander, then cold-smoked to perfection.', category: 'COLD_SMOKED', subcategory: 'Beef', cost_price: 160, markup_percent: 50, markup_amount: 0, selling_price: 240, weight: 0.5, stock_quantity: 40 },
  { name: 'Cold Smoked Trout', description: 'Rainbow trout cold-smoked with hickory. A delicacy perfect for pate, salads, or on crackers.', category: 'COLD_SMOKED', subcategory: 'Seafood', cost_price: 150, markup_percent: 50, markup_amount: 0, selling_price: 225, weight: 0.3, stock_quantity: 25 },
  { name: 'Hot Smoked Brisket', description: 'Full beef brisket slow-smoked at 120 degrees for 12 hours with oak and mesquite. Tender, juicy, and full of flavour.', category: 'HOT_SMOKED', subcategory: 'Beef', cost_price: 180, markup_percent: 55, markup_amount: 0, selling_price: 279, weight: 2.0, stock_quantity: 20 },
  { name: 'Hot Smoked Pork Belly', description: 'Pork belly hot-smoked until renderingly soft with a crispy bark. Great for braais or as a standalone dish.', category: 'HOT_SMOKED', subcategory: 'Pork', cost_price: 130, markup_percent: 50, markup_amount: 0, selling_price: 195, weight: 1.0, stock_quantity: 35 },
  { name: 'Hot Smoked Chicken', description: 'Whole free-range chicken hot-smoked with a secret spice rub. Ready to eat or reheat for a quick meal.', category: 'HOT_SMOKED', subcategory: 'Poultry', cost_price: 90, markup_percent: 60, markup_amount: 0, selling_price: 144, weight: 1.5, stock_quantity: 25 },
  { name: 'Hot Smoked Ribs', description: 'Pork ribs slow-smoked and glazed with a tangy BBQ sauce. Fall-off-the-bone tender.', category: 'HOT_SMOKED', subcategory: 'Pork', cost_price: 150, markup_percent: 50, markup_amount: 0, selling_price: 225, weight: 1.0, stock_quantity: 30 },
  { name: 'Classic Beef Biltong', description: 'Traditional South African beef biltong made from premium silverside, seasoned with salt, pepper, and coriander.', category: 'BILTONG', subcategory: 'Classic', cost_price: 180, markup_percent: 60, markup_amount: 0, selling_price: 288, weight: 1.0, stock_quantity: 100 },
  { name: 'Chilli Biltong', description: 'Spicy beef biltong with peri-peri and bird eye chilli for those who like it hot. Not for the faint-hearted!', category: 'BILTONG', subcategory: 'Chilli', cost_price: 195, markup_percent: 55, markup_amount: 0, selling_price: 302.25, weight: 1.0, stock_quantity: 80 },
  { name: 'Smoked Biltong', description: 'Unique smoked beef biltong with a rich smoky flavour. A BoerieCall signature product you will not find elsewhere.', category: 'BILTONG', subcategory: 'Smoked', cost_price: 200, markup_percent: 55, markup_amount: 0, selling_price: 310, weight: 1.0, stock_quantity: 60 },
  { name: 'Game Biltong (Kudu)', description: 'Premium Kudu biltong - lean, flavourful, and truly South African. Made from sustainably sourced game meat.', category: 'BILTONG', subcategory: 'Game', cost_price: 320, markup_percent: 50, markup_amount: 0, selling_price: 480, weight: 0.5, stock_quantity: 40 },
  { name: 'Droewors (Sticks)', description: 'Traditional South African dried sausage sticks made with premium beef and spices. 10 sticks per pack.', category: 'BILTONG', subcategory: 'Droewors', cost_price: 100, markup_percent: 65, markup_amount: 0, selling_price: 165, weight: 0.4, stock_quantity: 120 },
  { name: 'Biltong Slicer Pro', description: 'Professional-grade biltong slicer with adjustable thickness. Stainless steel blade for perfect cuts every time.', category: 'ACCESSORIES', subcategory: 'Equipment', cost_price: 250, markup_percent: 80, markup_amount: 0, selling_price: 450, weight: 0.8, stock_quantity: 15 },
  { name: 'Smoked Meat Gift Box', description: 'Curated gift box with a selection of cold smoked, hot smoked meats and biltong. Perfect for gifts.', category: 'ACCESSORIES', subcategory: 'Gifts', cost_price: 400, markup_percent: 50, markup_amount: 0, selling_price: 600, weight: 2.5, stock_quantity: 20 },
  { name: 'BoerieCall Spice Rub', description: 'Signature spice rub blend used in our smoked meats. 200g jar. Great for braais and home smoking.', category: 'ACCESSORIES', subcategory: 'Spices', cost_price: 45, markup_percent: 120, markup_amount: 0, selling_price: 99, weight: 0.2, stock_quantity: 200 },
  { name: 'Reusable Cooler Bag', description: 'Insulated cooler bag for keeping your smoked meats and biltong fresh during transport. Holds up to 5kg.', category: 'ACCESSORIES', subcategory: 'Packaging', cost_price: 80, markup_percent: 75, markup_amount: 0, selling_price: 140, weight: 0.3, stock_quantity: 50 },
];

const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO products (id, name, description, category, subcategory, cost_price, markup_percent, markup_amount, selling_price, weight, stock_quantity)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((items: typeof products) => {
  for (const p of items) {
    const id = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    insertStmt.run(id, p.name, p.description, p.category, p.subcategory, p.cost_price, p.markup_percent, p.markup_amount, p.selling_price, p.weight, p.stock_quantity);
  }
});

insertMany(products);
console.log(`Seeded ${products.length} products successfully!`);
