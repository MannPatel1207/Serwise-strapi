import fetch from 'node-fetch';

const API_URL = 'http://localhost:1337/api';
const API_KEY = '6a28feea84d4aca1ab5c397e60a98e10754931cfb8d1e520df94454cc2bc5a9cc5759d2362e0592af5bcca0e6d3f3fb36e48932e22e853bd5d89e767f08b15540c121f340d22e5f0fa1aee95795a92ee8a74b4fb9abfd60cb8f418d3e3ed8fd3ee8f2a2042feaabb1f6cb45af0a6d37408c5103babefd020c974b0b536bc3c7f'; // Replace with your actual API key
const MAX_RETRIES = 60; // 2 minutes total
const RETRY_DELAY = 2000; // 2 seconds

async function clearCollections() {
  console.log('🗑️  Clearing existing data...\n');
  
  // First unpublish all subscriptions
  console.log('Unpublishing subscriptions...');
  try {
    const subResponse = await fetch(`${API_URL}/subscriptions?pagination[limit]=1000`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (subResponse.ok) {
      const subData = await subResponse.json() as any;
      const subs = subData.data || [];
      
      for (const sub of subs) {
        await fetch(`${API_URL}/subscriptions/${sub.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({ data: { publishedAt: null } }),
        });
      }
    }
  } catch (e) {
    console.log('⚠️  Could not unpublish subscriptions, continuing...');
  }

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 500));

  // Delete subscriptions
  console.log('Deleting subscriptions...');
  try {
    const subResponse = await fetch(`${API_URL}/subscriptions?pagination[limit]=1000`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (subResponse.ok) {
      const subData = await subResponse.json() as any;
      const subs = subData.data || [];
      
      for (const sub of subs) {
        await fetch(`${API_URL}/subscriptions/${sub.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${API_KEY}` },
        });
      }
      console.log(`✓ Deleted ${subs.length} subscriptions`);
    }
  } catch (e: any) {
    console.log(`⚠️  Could not delete subscriptions: ${e.message}`);
  }

  await new Promise(resolve => setTimeout(resolve, 500));

  // Delete services
  console.log('Deleting services...');
  try {
    const servResponse = await fetch(`${API_URL}/services?pagination[limit]=1000`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (servResponse.ok) {
      const servData = await servResponse.json() as any;
      const servs = servData.data || [];
      
      for (const serv of servs) {
        await fetch(`${API_URL}/services/${serv.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${API_KEY}` },
        });
      }
      console.log(`✓ Deleted ${servs.length} services`);
    }
  } catch (e: any) {
    console.log(`⚠️  Could not delete services: ${e.message}`);
  }

  await new Promise(resolve => setTimeout(resolve, 500));

  // Delete device-types
  console.log('Deleting device-types...');
  try {
    const dtResponse = await fetch(`${API_URL}/device-types?pagination[limit]=1000`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (dtResponse.ok) {
      const dtData = await dtResponse.json() as any;
      const dts = dtData.data || [];
      
      for (const dt of dts) {
        await fetch(`${API_URL}/device-types/${dt.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${API_KEY}` },
        });
      }
      console.log(`✓ Deleted ${dts.length} device-types`);
    }
  } catch (e: any) {
    console.log(`⚠️  Could not delete device-types: ${e.message}`);
  }

  console.log('⏳ Waiting for database to sync...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('✓ All collections cleared!\n');
}

async function waitForStrapi() {
  console.log('⏳ Checking if Strapi is running...');
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await fetch(`http://localhost:1337/admin`);
      if (response.status === 200 || response.status === 302) {
        console.log('✓ Strapi is ready!\n');
        return true;
      }
    } catch (error: any) {
      if (i % 10 === 0) {
        console.log(`⏳ Waiting for Strapi... (${i + 1}/${MAX_RETRIES}) - ${error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  throw new Error(`Strapi did not start in time. Make sure Strapi is running with: npm run develop`);
}

async function createDeviceTypes() {
  console.log('📱 Creating Device Types...');
  
  const deviceTypesData = [
    {
      type: 'Air Conditioner',
      status: 'EXPERIMENTAL',
      action_link: '/devices/air-conditioner',
    },
    {
      type: 'Fridge',
      status: 'EXPERIMENTAL',
      action_link: '/devices/fridge',
    },
    {
      type: 'Washing Machine',
      status: 'EXPERIMENTAL',
      action_link: '/devices/washing-machine',
    },
    {
      type: 'RO',
      status: 'ACTIVE',
      action_link: '/devices/ro',
    },
    {
      type: 'Geyser',
      status: 'EXPERIMENTAL',
      action_link: '/devices/geyser',
    },
  ];

  const deviceTypes = [];
  for (const deviceTypeData of deviceTypesData) {
    const response = await fetch(`${API_URL}/device-types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        data: deviceTypeData,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create device type: ${JSON.stringify(error)}`);
    }

    const result = await response.json();
    deviceTypes.push(result.data);
    console.log(`✓ Device Type created: ${result.data.type} (${result.data.status})`);
  }
  console.log(`✓ Total ${deviceTypes.length} device types created\n`);
  return deviceTypes;
}

async function createServices(deviceTypes: any[]) {
  console.log('🔧 Creating Services for RO Device Type...');
  
  // Get RO device type
  const roDeviceType = deviceTypes.find(dt => dt.type === 'RO');
  if (!roDeviceType) {
    throw new Error('RO device type not found');
  }

  const servicesData = [
    {
      name: 'Visit Charge',
      description: 'Service visit charge',
      face_value: 150.00,
      device_type: roDeviceType.id,
    },
    {
      name: 'Pre Filter',
      description: 'Pre filter replacement',
      face_value: 100.00,
      expense: 35.00,
      provider_cut: 35.00,
      revenue: 65.00,
      device_type: roDeviceType.id,
    },
    {
      name: '1 Filter (Sadesman)',
      description: 'Single filter installation by salesman',
      face_value: 250.00,
      expense: 60.00,
      provider_cut: 60.00,
      revenue: 190.00,
      device_type: roDeviceType.id,
    },
    {
      name: 'Carbon Filter - 1',
      description: 'Carbon filter installation',
      face_value: 250.00,
      expense: 60.00,
      provider_cut: 60.00,
      revenue: 190.00,
      device_type: roDeviceType.id,
    },
    {
      name: 'Memron Filter - 1',
      description: 'Memron filter installation',
      face_value: 1150.00,
      expense: 350.00,
      provider_cut: 350.00,
      revenue: 800.00,
      device_type: roDeviceType.id,
    },
    {
      name: 'Pre Filter',
      description: 'Pre filter service',
      face_value: 100.00,
      expense: 35.00,
      provider_cut: 35.00,
      revenue: 65.00,
      device_type: roDeviceType.id,
    },
    {
      name: 'Filter Set (Sadesman + Carbon - Post Carbon)',
      description: 'Complete filter set installation',
      face_value: 1050.00,
      expense: 350.00,
      provider_cut: 350.00,
      revenue: 700.00,
      device_type: roDeviceType.id,
    },
    {
      name: 'Carbon Filter - 1',
      description: 'Carbon filter replacement',
      face_value: 350.00,
      expense: 120.00,
      provider_cut: 150.00,
      revenue: 200.00,
      device_type: roDeviceType.id,
    },
    {
      name: 'Post Carbon Filter',
      description: 'Post carbon filter service',
      face_value: 350.00,
      expense: 120.00,
      provider_cut: 150.00,
      revenue: 200.00,
      device_type: roDeviceType.id,
    },
    {
      name: 'UV Filter',
      description: 'UV filter installation',
      face_value: 850.00,
      expense: 350.00,
      provider_cut: 350.00,
      revenue: 500.00,
      device_type: roDeviceType.id,
    },
    {
      name: 'UF Filter Small',
      description: 'UF filter small size',
      face_value: 400.00,
      expense: 120.00,
      provider_cut: 120.00,
      revenue: 280.00,
      device_type: roDeviceType.id,
    },
    {
      name: 'UF Filter Big',
      description: 'UF filter big size',
      face_value: 850.00,
      device_type: roDeviceType.id,
    },
    {
      name: 'Sadesman Filter only',
      description: 'Sadesman filter only service',
      face_value: 350.00,
      expense: 120.00,
      provider_cut: 150.00,
      revenue: 200.00,
      device_type: roDeviceType.id,
    },
    {
      name: 'UV Lamp',
      description: 'UV lamp replacement',
      face_value: 1250.00,
      device_type: roDeviceType.id,
    },
    {
      name: 'Alkaline Filter - 1',
      description: 'Alkaline filter installation',
      face_value: 1850.00,
      expense: 900.00,
      provider_cut: 900.00,
      revenue: 950.00,
      device_type: roDeviceType.id,
    },
    {
      name: 'TDS Controller (Spars)',
      description: 'TDS controller spare parts',
      face_value: 350.00,
      expense: 100.00,
      provider_cut: 100.00,
      revenue: 250.00,
      device_type: roDeviceType.id,
    },
    {
      name: 'Power Supply Unit',
      description: 'Power supply unit service',
      face_value: 550.00,
      expense: 190.00,
      provider_cut: 190.00,
      revenue: 360.00,
      device_type: roDeviceType.id,
    },
    {
      name: 'Booster Pump',
      description: 'Booster pump service',
      face_value: 1850.00,
      expense: 800.00,
      provider_cut: 800.00,
      revenue: 1050.00,
      device_type: roDeviceType.id,
    },
    {
      name: 'Float Switch',
      description: 'Float switch replacement',
      face_value: 250.00,
      expense: 45.00,
      provider_cut: 45.00,
      revenue: 205.00,
      device_type: roDeviceType.id,
    },
    {
      name: 'SV (Valve)',
      description: 'Solenoid valve service',
      face_value: 350.00,
      expense: 130.00,
      provider_cut: 130.00,
      revenue: 220.00,
      device_type: roDeviceType.id,
    },
    {
      name: 'water pipe',
      description: 'Water pipe service',
      face_value: 100.00,
      device_type: roDeviceType.id,
    },
    {
      name: 'Bowl',
      description: 'Bowl replacement',
      face_value: 850.00,
      expense: 250.00,
      provider_cut: 250.00,
      revenue: 600.00,
      device_type: roDeviceType.id,
    },
    {
      name: 'Pump Head Repair',
      description: 'Pump head repair service',
      face_value: 550.00,
      expense: 180.00,
      provider_cut: 180.00,
      revenue: 370.00,
      device_type: roDeviceType.id,
    },
  ];

  const services = [];
  for (const serviceData of servicesData) {
    const response = await fetch(`${API_URL}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ data: serviceData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create service: ${JSON.stringify(error)}`);
    }

    const result = await response.json();
    services.push(result.data);
    console.log(`✓ Service created: ${result.data.name}`);
  }
  console.log(`✓ Total ${services.length} services created\n`);
  return services;
}

async function createSubscriptions(deviceTypes: any[], services: any[]) {
  console.log('💳 Creating Subscriptions for RO...');
  
  // Get RO device type
  const roDeviceType = deviceTypes.find(dt => dt.type === 'RO');
  if (!roDeviceType) {
    throw new Error('RO device type not found');
  }
  
  const subscriptionsData = [
    {
      name: 'Plan A - 3 Monthly',
      plan_type: 'Normal Plan',
      duration: 'monthly_3',
      cost: 2380,
      sales_subscribed: 3600,
      sales_non_subscribed: 4400,
      profit_subscribed: 1220,
      profit_non_subscribed: 2020,
      price_of_subscription: 400.00,
      device_types: [roDeviceType.id],
      services: [services[0].id, services[1].id, services[2].id],
    },
    {
      name: 'Plan A - 4 Monthly',
      plan_type: 'Normal Plan',
      duration: 'monthly_4',
      cost: 1785,
      sales_subscribed: 2700,
      sales_non_subscribed: 3300,
      profit_subscribed: 915,
      profit_non_subscribed: 1515,
      price_of_subscription: 350.00,
      device_types: [roDeviceType.id],
      services: [services[0].id, services[1].id],
    },
    {
      name: 'Plan A - 6 Monthly',
      plan_type: 'Normal Plan',
      duration: 'monthly_6',
      cost: 1190,
      sales_subscribed: 1800,
      sales_non_subscribed: 2200,
      profit_subscribed: 610,
      profit_non_subscribed: 1010,
      price_of_subscription: 280.00,
      device_types: [roDeviceType.id],
      services: [services[0].id, services[1].id],
    },
    {
      name: 'Plan B - 3 Monthly',
      plan_type: 'UV Plan',
      duration: 'monthly_3',
      cost: 2660,
      sales_subscribed: 4100,
      sales_non_subscribed: 5100,
      profit_subscribed: 1440,
      profit_non_subscribed: 2440,
      price_of_subscription: 600.00,
      device_types: [roDeviceType.id],
      services: [services[0].id, services[1].id, services[9].id],
    },
    {
      name: 'Plan B - 4 Monthly',
      plan_type: 'UV Plan',
      duration: 'monthly_4',
      cost: 2065,
      sales_subscribed: 3200,
      sales_non_subscribed: 4000,
      profit_subscribed: 1135,
      profit_non_subscribed: 1935,
      price_of_subscription: 500.00,
      device_types: [roDeviceType.id],
      services: [services[0].id, services[1].id, services[9].id],
    },
    {
      name: 'Plan B - 6 Monthly',
      plan_type: 'UV Plan',
      duration: 'monthly_6',
      cost: 1470,
      sales_subscribed: 2300,
      sales_non_subscribed: 2900,
      profit_subscribed: 830,
      profit_non_subscribed: 1430,
      price_of_subscription: 400.00,
      device_types: [roDeviceType.id],
      services: [services[0].id, services[1].id, services[9].id],
    },
    {
      name: 'Plan C - 1 Time',
      plan_type: 'UF Plan',
      duration: 'one_time',
      cost: 1445,
      sales_subscribed: 1800,
      sales_non_subscribed: 2200,
      profit_subscribed: 355,
      profit_non_subscribed: 755,
      price_of_subscription: 200.00,
      device_types: [roDeviceType.id],
      services: [services[0].id, services[11].id],
    },
  ];

  for (const subData of subscriptionsData) {
    const response = await fetch(`${API_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ data: subData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create subscription: ${JSON.stringify(error)}`);
    }

    const result = await response.json();
    console.log(`✓ ${result.data.name} created`);
  }
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');
    await waitForStrapi();
    // await clearCollections();
    
    const deviceTypes = await createDeviceTypes();
    const services = await createServices(deviceTypes);
    await createSubscriptions(deviceTypes, services);

    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
