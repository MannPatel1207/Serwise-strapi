import fetch from 'node-fetch';

const API_URL = 'http://localhost:1337/api';
const API_KEY = '6a28feea84d4aca1ab5c397e60a98e10754931cfb8d1e520df94454cc2bc5a9cc5759d2362e0592af5bcca0e6d3f3fb36e48932e22e853bd5d89e767f08b15540c121f340d22e5f0fa1aee95795a92ee8a74b4fb9abfd60cb8f418d3e3ed8fd3ee8f2a2042feaabb1f6cb45af0a6d37408c5103babefd020c974b0b536bc3c7f';
const MAX_RETRIES = 60;
const RETRY_DELAY = 2000;

// Type definitions
interface Part {
  title: string;
  items: Array<{
    name: string;
    qty: number;
    price: number;
  }>;
}

interface CategoryData {
  [key: string]: Part[];
}

// Parts data structure
const TAB_DATA: CategoryData = {
  Parts: [
    {
      title: 'Basic Filters',
      items: [
        { name: 'Spun Filter', qty: 0, price: 10 },
        { name: 'Pre Filter Bowl', qty: 0, price: 10 },
        { name: 'Sediment Filter', qty: 0, price: 10 },
        { name: 'Pre Carbon Filter', qty: 0, price: 10 },
        { name: 'Post Carbon Filter', qty: 0, price: 10 },
        { name: 'Inline Filter Set', qty: 0, price: 10 },
        { name: 'UF Big Filter', qty: 0, price: 10 },
        { name: 'UF Small Filter', qty: 0, price: 10 },
        { name: 'RO Membrane', qty: 0, price: 10 },
        { name: 'Alkaline Filter', qty: 0, price: 10 },
      ],
    },
    {
      title: 'Additional Filters',
      items: [
        { name: 'Copper Filter', qty: 0, price: 10 },
        { name: 'Magnesium Filter', qty: 0, price: 10 },
        { name: 'Zinc Filter', qty: 0, price: 10 },
        { name: 'Calcium Filter', qty: 0, price: 10 },
      ],
    },
    {
      title: 'Electrical Components',
      items: [
        { name: 'Booster Pump', qty: 0, price: 10 },
        { name: 'UV Lamp', qty: 0, price: 10 },
        { name: 'TDS Controller', qty: 0, price: 10 },
        { name: 'Power Supply Unit (SMPS)', qty: 0, price: 10 },
        { name: 'Float Switch', qty: 0, price: 10 },
        { name: 'Solenoid Valve (SV)', qty: 0, price: 10 },
      ],
    },
    {
      title: 'Other Items',
      items: [
        { name: 'Pump Head', qty: 0, price: 10 },
        { name: 'Electrical Wire Changes', qty: 0, price: 10 },
      ],
    },
  ],

  Repair: [
    {
      title: 'Pipe & Fittings',
      items: [
        { name: 'Booster Pump Repair', qty: 0, price: 10 },
        { name: 'Pump Head Repair', qty: 0, price: 10 },
        { name: 'Electrical Wire Repair', qty: 0, price: 10 },
      ],
    },
  ],

  Service: [
    {
      title: 'Core',
      items: [
        { name: 'Installation', qty: 0, price: 10 },
        { name: 'Uninstallation', qty: 0, price: 10 },
        { name: 'Basic Check-up', qty: 0, price: 10 },
      ],
    },
  ],
};

async function waitForStrapi(retries: number = 0): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/parts`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
    });
    if (response.ok) {
      console.log('✅ Connected to Strapi\n');
      return;
    }
  } catch (e) {
    if (retries < MAX_RETRIES) {
      console.log(`⏳ Waiting for Strapi... (${retries}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return waitForStrapi(retries + 1);
    }
  }
  throw new Error('Could not connect to Strapi after retries');
}

async function createParts(): Promise<void> {
  console.log('📦 Creating Parts...\n');

  let partsCount = 0;

  // Iterate through all types (Parts, Repair, Service)
  for (const [partType, categories] of Object.entries(TAB_DATA)) {
    console.log(`\n📂 Creating ${partType}:`);

    // Iterate through categories
    for (const category of categories) {
      console.log(`  📁 ${category.title}`);

      // Create each item
      for (const item of category.items) {
        try {
          const partData = {
            name: item.name,
            category: category.title,
            type: partType,
            price: item.price,
            quantity: item.qty,
            status: 'ACTIVE',
          };

          const response = await fetch(`${API_URL}/parts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({ data: partData }),
          });

          if (!response.ok) {
            const error = await response.json();
            console.error(`    ❌ Error creating "${item.name}": ${JSON.stringify(error)}`);
            continue;
          }

          const result = await response.json() as any;
          console.log(`    ✓ ${item.name} (${category.title}) - $${item.price}`);
          partsCount++;
        } catch (error: any) {
          console.error(`    ❌ Error: ${error.message}`);
        }
      }
    }
  }

  console.log(`\n✓ Total ${partsCount} parts created\n`);
}

async function seedDatabase(): Promise<void> {
  try {
    console.log('🌱 Starting parts database seeding...\n');
    await waitForStrapi();
    await createParts();

    console.log('\n✅ Parts database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
