/**
 * Migrates subscriptions (+ their device-type & part relations) and the
 * app-version single type from local Strapi → prod Strapi.
 *
 * Run with:  npm run migrate-to-prod
 *
 * NOTE: APK files on app-version are NOT migrated (binary upload not
 *       supported via REST). Re-upload them manually in the prod admin.
 */

export {};

const LOCAL = 'http://localhost:1337';
const PROD = 'https://serwise-strapi.onrender.com';

const LOCAL_TOKEN = 'baf542d33e32aea3a3ff0f9a97cdb6e1917f9b3407ce9395a29e1bf62c79201a65a1f93453669b56ceb7bad1df7c377e6fa3619448f19159bb88a16a1ea3e0940481b3db88e1d729ed0c7502784a78b0343712679e689f2e05449c077d63afc9285563864b73e7dbe6c1d4bf8cf172fac70791e6f9e4cc095cdc67a7d2980bbc';
const PROD_TOKEN = 'f4eccc44c4419a4e4836ee925ffd94300330212b5f40bd398d42a4c6f9d3ca35a136b98b252a4b3e41ba2080d57abd874873543eacc76f2858d3ab2712c115389aec6b9d67f063671cbe548d3798429e7243bb8f579cd71992e2fce6166698aff2fa5a7e9f6baf73b5636de7535e4595e0141440d274a6bbda7eaf63eec49b30';

// ─── helpers ────────────────────────────────────────────────────────────────

async function get(base: string, token: string, path: string) {
  const res = await fetch(`${base}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`GET ${base}${path} → ${res.status}: ${await res.text()}`);
  return (await res.json() as any);
}

async function post(base: string, token: string, path: string, body: any) {
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: body }),
  });
  if (!res.ok) throw new Error(`POST ${base}${path} → ${res.status}: ${await res.text()}`);
  return (await res.json() as any).data;
}

async function put(base: string, token: string, path: string, body: any) {
  const res = await fetch(`${base}${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: body }),
  });
  if (!res.ok) throw new Error(`PUT ${base}${path} → ${res.status}: ${await res.text()}`);
  return (await res.json() as any).data;
}

async function getAll(base: string, token: string, collection: string, populate = '') {
  const qs = populate ? `&populate=${populate}` : '';
  const r = await get(base, token, `/api/${collection}?pagination[limit]=1000${qs}`);
  return r.data as any[];
}

// ─── step 1: migrate parts ───────────────────────────────────────────────────

async function migrateParts(): Promise<Map<number, number>> {
  console.log('\n📦 Migrating parts...');
  const localParts = await getAll(LOCAL, LOCAL_TOKEN, 'parts');
  const prodParts = await getAll(PROD, PROD_TOKEN, 'parts');

  // key: "name|category|type" → prod documentId
  const prodIndex = new Map<string, any>();
  for (const p of prodParts) {
    prodIndex.set(`${p.name}|${p.category}|${p.type}`, p);
  }

  const idMap = new Map<number, number>(); // localId → prodId

  for (const lp of localParts) {
    const key = `${lp.name}|${lp.category}|${lp.type}`;
    let prodPart = prodIndex.get(key);

    if (!prodPart) {
      prodPart = await post(PROD, PROD_TOKEN, '/api/parts', {
        name: lp.name,
        category: lp.category,
        type: lp.type,
        status: lp.status,
        description: lp.description,
      });
      console.log(`  ✓ Created part: ${lp.name}`);
    } else {
      console.log(`  — Part already exists: ${lp.name}`);
    }

    idMap.set(lp.id, prodPart.id);
  }

  console.log(`  Parts done: ${idMap.size} mapped`);
  return idMap;
}

// ─── step 2: build local → prod device type ID map (read-only, no create) ───

async function buildDeviceTypeMap(): Promise<Map<number, number>> {
  console.log('\n📱 Mapping device types (prod only — no changes made)...');
  const localDTs = await getAll(LOCAL, LOCAL_TOKEN, 'device-types');
  const prodDTs = await getAll(PROD, PROD_TOKEN, 'device-types');

  const prodIndex = new Map<string, any>();
  for (const dt of prodDTs) prodIndex.set(dt.type, dt);

  const idMap = new Map<number, number>();
  for (const ldt of localDTs) {
    const prodDT = prodIndex.get(ldt.type);
    if (prodDT) {
      idMap.set(ldt.id, prodDT.id);
      console.log(`  — Mapped: ${ldt.type}`);
    } else {
      console.log(`  ⚠️  Device type not found on prod (skipping): ${ldt.type}`);
    }
  }
  return idMap;
}

// ─── step 3: migrate subscriptions ──────────────────────────────────────────

async function migrateSubscriptions(partMap: Map<number, number>) {
  console.log('\n💳 Migrating subscriptions...');

  const dtMap = await buildDeviceTypeMap();

  const localSubs = await getAll(
    LOCAL, LOCAL_TOKEN,
    'subscriptions',
    '*'
  );
  const prodSubs = await getAll(PROD, PROD_TOKEN, 'subscriptions');

  const prodNames = new Set(prodSubs.map((s: any) => s.name));

  for (const ls of localSubs) {
    if (prodNames.has(ls.name)) {
      console.log(`  — Subscription already exists: ${ls.name}`);
      continue;
    }

    const deviceTypeIds = (ls.device_types ?? [])
      .map((dt: any) => dtMap.get(dt.id))
      .filter(Boolean);

    const serviceMapping = (ls.serviceMapping ?? []).map((sm: any) => ({
      usageIndex: sm.usageIndex,
      providerCut: sm.providerCut,
      parts: (sm.parts ?? [])
        .map((p: any) => partMap.get(p.id))
        .filter(Boolean),
    }));

    await post(PROD, PROD_TOKEN, '/api/subscriptions', {
      name: ls.name,
      plan_type: ls.plan_type,
      totalServices: ls.totalServices,
      cost: ls.cost,
      sub_sales: ls.sub_sales,
      non_sub_sales: ls.non_sub_sales,
      sub_profit: ls.sub_profit,
      non_sub_profit: ls.non_sub_profit,
      maxDiscount: ls.maxDiscount,
      lockInPeriod: ls.lockInPeriod,
      validityDuration: ls.validityDuration,
      description: ls.description,
      device_types: deviceTypeIds,
      serviceMapping,
    });

    console.log(`  ✓ Created subscription: ${ls.name}`);
  }
}

// ─── step 4: migrate app-version (text fields only) ─────────────────────────

async function migrateAppVersion() {
  console.log('\n🔢 Migrating app-version...');

  const local = await get(LOCAL, LOCAL_TOKEN, '/api/app-version');
  const d = local.data;

  if (!d) {
    console.log('  ⚠️  No app-version data found on local. Skipping.');
    return;
  }

  await put(PROD, PROD_TOKEN, '/api/app-version', {
    serwise_version: d.serwise_version,
    serwise_min_required_version: d.serwise_min_required_version,
    radix_version: d.radix_version,
    radix_min_required_version: d.radix_min_required_version,
    is_forced: d.is_forced,
  });

  console.log('  ✓ App version updated (APK files must be re-uploaded manually in prod admin)');
  console.log(`    serwise: ${d.serwise_version} (min: ${d.serwise_min_required_version})`);
  console.log(`    radix:   ${d.radix_version}   (min: ${d.radix_min_required_version})`);
  console.log(`    forced:  ${d.is_forced}`);
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Starting migration: local → prod\n');
  console.log(`   Local: ${LOCAL}`);
  console.log(`   Prod:  ${PROD}`);

  const partMap = await migrateParts();
  await migrateSubscriptions(partMap);
  await migrateAppVersion();

  console.log('\n✅ Migration complete!');
  console.log('   ⚠️  Remember to re-upload APK files in the prod Strapi admin → App Version.');
}

main().catch(e => { console.error('❌', e); process.exit(1); });
