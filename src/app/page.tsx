"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ItineraryItem {
  time: string;
  activity: string;
}

interface TravelPlan {
  destination: string;
  date: string;
  itinerary: ItineraryItem[];
}

export default function Home() {
  const [destination, setDestination] = React.useState("");
  const [date, setDate] = React.useState<Date>();
  const [plan, setPlan] = React.useState<TravelPlan | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ destination, date: date?.toISOString() }),
    });
    const data = await res.json();
    setPlan(data);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Travel Planner</CardTitle>
          <CardDescription>
            AI-powered travel planner to generate your next itinerary.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Input
                  id="destination"
                  placeholder="Destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button type="submit">Generate Plan</Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          {plan ? (
            <div>
              <h3 className="font-bold">Your Plan for {plan.destination}</h3>
              <ul>
                {plan.itinerary.map((item, index) => (
                  <li key={index}>
                    {item.time}: {item.activity}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Your generated plan will appear here.</p>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}
