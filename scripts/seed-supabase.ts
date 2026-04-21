// Supabase Seed Script
// Run with: npx tsx scripts/seed-supabase.ts
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

async function seed() {
  console.log('Seeding BoerieCall database...');

  // Seed admin user
  const { data: adminExists } = await supabase.from('users').select('id').eq('email', 'admin@boeriecall.co.za').single();
  if (!adminExists) {
    await supabase.from('users').insert({
      id: generateId(),
      name: 'BoerieCall Admin',
      email: 'admin@boeriecall.co.za',
      password: 'admin123',
      role: 'ADMIN',
      city: 'Johannesburg',
    });
    console.log('Admin user created (admin@boeriecall.co.za / admin123)');
  } else {
    console.log('Admin user already exists');
  }

  // Seed products
  const products = [
    { name: 'Cold Smoked Bacon', description: 'Premium pork belly cold-smoked over applewood chips for 8 hours.', category: 'COLD_SMOKED', subcategory: 'Pork', cost_price: 120, markup_percent: 50, selling_price: 180, weight: 0.5, stock_quantity: 50 },
    { name: 'Cold Smoked Salmon', description: 'Fresh Norwegian salmon cured and cold-smoked with a delicate blend of herbs.', category: 'COLD_SMOKED', subcategory: 'Seafood', cost_price: 280, markup_percent: 45, selling_price: 406, weight: 0.4, stock_quantity: 30 },
    { name: 'Cold Smoked Pastrami', description: 'Traditional beef pastrami dry-rubbed with black pepper and coriander.', category: 'COLD_SMOKED', subcategory: 'Beef', cost_price: 160, markup_percent: 50, selling_price: 240, weight: 0.5, stock_quantity: 40 },
    { name: 'Cold Smoked Trout', description: 'Rainbow trout cold-smoked with hickory. Perfect for pate or salads.', category: 'COLD_SMOKED', subcategory: 'Seafood', cost_price: 150, markup_percent: 50, selling_price: 225, weight: 0.3, stock_quantity: 25 },
    { name: 'Hot Smoked Brisket', description: 'Full beef brisket slow-smoked for 12 hours with oak and mesquite.', category: 'HOT_SMOKED', subcategory: 'Beef', cost_price: 180, markup_percent: 55, selling_price: 279, weight: 2.0, stock_quantity: 20 },
    { name: 'Hot Smoked Pork Belly', description: 'Pork belly hot-smoked until renderingly soft with a crispy bark.', category: 'HOT_SMOKED', subcategory: 'Pork', cost_price: 130, markup_percent: 50, selling_price: 195, weight: 1.0, stock_quantity: 35 },
    { name: 'Hot Smoked Chicken', description: 'Whole free-range chicken hot-smoked with a secret spice rub.', category: 'HOT_SMOKED', subcategory: 'Poultry', cost_price: 90, markup_percent: 60, selling_price: 144, weight: 1.5, stock_quantity: 25 },
    { name: 'Hot Smoked Ribs', description: 'Pork ribs slow-smoked and glazed with a tangy BBQ sauce.', category: 'HOT_SMOKED', subcategory: 'Pork', cost_price: 150, markup_percent: 50, selling_price: 225, weight: 1.0, stock_quantity: 30 },
    { name: 'Classic Beef Biltong', description: 'Traditional SA beef biltong seasoned with salt, pepper, and coriander.', category: 'BILTONG', subcategory: 'Classic', cost_price: 180, markup_percent: 60, selling_price: 288, weight: 1.0, stock_quantity: 100 },
    { name: 'Chilli Biltong', description: 'Spicy beef biltong with peri-peri and bird eye chilli.', category: 'BILTONG', subcategory: 'Chilli', cost_price: 195, markup_percent: 55, selling_price: 302.25, weight: 1.0, stock_quantity: 80 },
    { name: 'Smoked Biltong', description: 'Unique smoked beef biltong with a rich smoky flavour. BoerieCall signature.', category: 'BILTONG', subcategory: 'Smoked', cost_price: 200, markup_percent: 55, selling_price: 310, weight: 1.0, stock_quantity: 60 },
    { name: 'Game Biltong (Kudu)', description: 'Premium Kudu biltong from sustainably sourced game meat.', category: 'BILTONG', subcategory: 'Game', cost_price: 320, markup_percent: 50, selling_price: 480, weight: 0.5, stock_quantity: 40 },
    { name: 'Droewors (Sticks)', description: 'Traditional SA dried sausage sticks. 10 sticks per pack.', category: 'BILTONG', subcategory: 'Droewors', cost_price: 100, markup_percent: 65, selling_price: 165, weight: 0.4, stock_quantity: 120 },
    { name: 'Biltong Slicer Pro', description: 'Professional biltong slicer with adjustable thickness.', category: 'ACCESSORIES', subcategory: 'Equipment', cost_price: 250, markup_percent: 80, selling_price: 450, weight: 0.8, stock_quantity: 15 },
    { name: 'Smoked Meat Gift Box', description: 'Curated gift box with smoked meats and biltong selection.', category: 'ACCESSORIES', subcategory: 'Gifts', cost_price: 400, markup_percent: 50, selling_price: 600, weight: 2.5, stock_quantity: 20 },
    { name: 'BoerieCall Spice Rub', description: 'Signature spice rub blend. 200g jar. Great for braais.', category: 'ACCESSORIES', subcategory: 'Spices', cost_price: 45, markup_percent: 120, selling_price: 99, weight: 0.2, stock_quantity: 200 },
    { name: 'Reusable Cooler Bag', description: 'Insulated cooler bag. Holds up to 5kg of smoked meats.', category: 'ACCESSORIES', subcategory: 'Packaging', cost_price: 80, markup_percent: 75, selling_price: 140, weight: 0.3, stock_quantity: 50 },
  ];

  const { data: existingProducts } = await supabase.from('products').select('name');
  const existingNames = new Set((existingProducts || []).map((p: any) => p.name));

  const newProducts = products.filter(p => !existingNames.has(p.name));

  if (newProducts.length > 0) {
    const rows = newProducts.map(p => ({
      id: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name: p.name,
      description: p.description,
      category: p.category,
      subcategory: p.subcategory,
      cost_price: p.cost_price,
      markup_percent: p.markup_percent,
      markup_amount: 0,
      selling_price: p.selling_price,
      weight: p.weight,
      stock_quantity: p.stock_quantity,
      is_active: true,
    }));

    await supabase.from('products').insert(rows);
    console.log(`Seeded ${newProducts.length} new products`);
  } else {
    console.log('All products already exist');
  }

  console.log('Done!');
}

seed().catch(console.error);
