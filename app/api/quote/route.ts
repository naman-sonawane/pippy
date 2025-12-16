import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://zenquotes.io/api/today', {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch quote');
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      return NextResponse.json({
        quote: data[0].q,
        author: data[0].a,
      });
    }

    return NextResponse.json({
      quote: 'you have brains in your head. you have feet in your shoes. you can steer yourself any direction you choose.',
      author: 'dr. seuss',
    });
  } catch (error) {
    console.error('Quote fetch error:', error);
    return NextResponse.json({
      quote: 'you have brains in your head. you have feet in your shoes. you can steer yourself any direction you choose.',
      author: 'dr. seuss',
    });
  }
}

