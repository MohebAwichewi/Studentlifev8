import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    // 1. Get the user's IP address from headers (works on Vercel)
    // If running locally, it defaults to a test IP (8.8.8.8)
    const ip = req.headers.get('x-forwarded-for') || '8.8.8.8'; 
    
    // 2. Call the external API from the server side
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    
    if (!res.ok) {
        throw new Error('Failed to fetch location');
    }

    const data = await res.json();

    // 3. Return the data to your frontend
    return NextResponse.json(data);
  } catch (error) {
    console.error("Location API Error:", error);
    // Return a default fallback to prevent the app from crashing
    return NextResponse.json({ 
        city: 'London', 
        country_name: 'United Kingdom', 
        country_code: 'GB' 
    });
  }
}