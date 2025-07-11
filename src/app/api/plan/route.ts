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
      { time: '10:00', activity: '有名な観光名所を訪問' },
      { time: '12:30', activity: '地元のレストランで昼食' },
      { time: '14:00', activity: '街の中心部を散策' },
      { time: '18:00', activity: '景色の良いレストランで夕食' },
    ],
  };

  return NextResponse.json(dummyPlan);
}
