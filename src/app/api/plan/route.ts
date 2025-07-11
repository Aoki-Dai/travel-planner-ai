import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { destination, date } = body;

  // In a real application, you would use the destination and date
  // to generate a travel plan, e.g., by calling an AI model.

  // For now, we'll just return a dummy plan.
  const dummyPlan = {
    destination,
    date,
    itinerary: [
      { time: '10:00', activity: 'Visit the main attraction' },
      { time: '12:30', activity: 'Lunch at a local restaurant' },
      { time: '14:00', activity: 'Explore the city center' },
      { time: '18:00', activity: 'Dinner with a view' },
    ],
  };

  return NextResponse.json(dummyPlan);
}
