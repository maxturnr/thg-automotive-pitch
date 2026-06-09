import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Temporary migration endpoint — will be removed after use
export async function POST(req: Request) {
  const { secret } = await req.json();
  if (secret !== 'migrate-thg-2026') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const sqls = [
    'ALTER TABLE cars ADD COLUMN IF NOT EXISTS colour TEXT',
    'ALTER TABLE cars ADD COLUMN IF NOT EXISTS fuel_type TEXT',
    'ALTER TABLE cars ADD COLUMN IF NOT EXISTS body_type TEXT',
    'ALTER TABLE cars ADD COLUMN IF NOT EXISTS transmission TEXT',
    'ALTER TABLE cars ADD COLUMN IF NOT EXISTS year INTEGER',
    'ALTER TABLE cars ADD COLUMN IF NOT EXISTS engine_size TEXT',
    'ALTER TABLE cars ADD COLUMN IF NOT EXISTS doors INTEGER',
    'ALTER TABLE cars ADD COLUMN IF NOT EXISTS seats INTEGER',
    'ALTER TABLE cars ADD COLUMN IF NOT EXISTS derivative TEXT',
    'ALTER TABLE cars ADD COLUMN IF NOT EXISTS vin TEXT',
    'ALTER TABLE cars ADD COLUMN IF NOT EXISTS mileage INTEGER',
    'ALTER TABLE cars ADD COLUMN IF NOT EXISTS engine_power_bhp INTEGER',
    'ALTER TABLE cars ADD COLUMN IF NOT EXISTS co2_emissions INTEGER',
    'ALTER TABLE cars ADD COLUMN IF NOT EXISTS retail_value NUMERIC',
    'ALTER TABLE cars ADD COLUMN IF NOT EXISTS trade_value NUMERIC',
  ];

  const results: string[] = [];
  try {
    for (const sql of sqls) {
      await pool.query(sql);
      const col = sql.split('NOT EXISTS ')[1];
      results.push(`✅ ${col}`);
    }
    await pool.end();
    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    await pool.end();
    return NextResponse.json({ error: err.message, results }, { status: 500 });
  }
}
