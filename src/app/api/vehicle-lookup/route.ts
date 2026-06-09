import { NextRequest, NextResponse } from 'next/server';

interface TokenCache {
  token: string;
  expiresAt: number;
}
let tokenCache: TokenCache | null = null;

async function getToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now) return tokenCache.token;

  const baseUrl = process.env.AUTOTRADER_BASE_URL || 'https://api-sandbox.autotrader.co.uk';
  const key = process.env.AUTOTRADER_AUTH_KEY;
  const secret = process.env.AUTOTRADER_AUTH_SECRET;

  if (!key || !secret) throw new Error('Missing AutoTrader credentials');

  const res = await fetch(`${baseUrl}/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ key, secret }).toString(),
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`AutoTrader auth failed: ${res.status}`);
  const data = await res.json();
  const token = data.access_token || data.token || data.accessToken;
  if (!token) throw new Error('No token in auth response');

  tokenCache = { token, expiresAt: now + 14 * 60 * 1000 }; // 14 min cache
  return token;
}

export async function POST(request: NextRequest) {
  try {
    const { registration } = await request.json();
    if (!registration) {
      return NextResponse.json({ error: 'Registration is required' }, { status: 400 });
    }

    const baseUrl = process.env.AUTOTRADER_BASE_URL || 'https://api-sandbox.autotrader.co.uk';
    const advertiserId = process.env.AUTOTRADER_ADVERTISER_ID;
    if (!advertiserId) {
      return NextResponse.json({ error: 'Missing advertiser ID' }, { status: 500 });
    }

    const token = await getToken();

    const params = new URLSearchParams({
      advertiserId,
      registration: registration.trim().toLowerCase(),
      valuations: 'true',
    });

    const res = await fetch(`${baseUrl}/vehicles?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('AutoTrader lookup error:', res.status, errText);
      return NextResponse.json(
        { error: res.status === 404 ? 'Vehicle not found' : 'Lookup failed' },
        { status: res.status },
      );
    }

    const payload = await res.json();
    const v = payload?.vehicle;
    if (!v) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Extract the year from firstRegistrationDate
    const year = v.firstRegistrationDate ? parseInt(v.firstRegistrationDate.split('-')[0]) : null;

    // Build a simplified response matching our cars table fields
    return NextResponse.json({
      vehicle: {
        registration: v.registration || registration.toUpperCase(),
        make: v.make || null,
        model: v.model || null,
        colour: v.colour || null,
        fuel_type: v.fuelType || null,
        body_type: v.bodyType || null,
        transmission: v.transmissionType || null,
        year,
        engine_size: v.badgeEngineSizeLitres ? `${v.badgeEngineSizeLitres}L` : null,
        doors: v.doors || null,
        seats: v.seats || null,
        derivative: v.derivative || null,
        vin: v.vin || null,
        first_registration_date: v.firstRegistrationDate || null,
        owners: v.owners || null,
        engine_power_bhp: v.enginePowerBHP || null,
        co2_emissions: v.co2EmissionGPKM || null,
        // Valuations
        retail_value: payload?.valuations?.retail?.amountGBP || null,
        trade_value: payload?.valuations?.trade?.amountGBP || null,
        private_value: payload?.valuations?.private?.amountGBP || null,
      },
    });
  } catch (error: any) {
    console.error('Vehicle lookup error:', error);
    return NextResponse.json({ error: error.message || 'Lookup failed' }, { status: 500 });
  }
}
