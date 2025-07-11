"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useChat } from "ai/react";

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

export default function Home() {
  const [destination, setDestination] = React.useState("");
  const [date, setDate] = React.useState<Date>();

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/plan",
    body: {
      destination,
      date: date?.toISOString(),
    },
  });

  const latestMessageContent = messages.length > 0 ? messages[messages.length - 1].content : "";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>AI トラベルプランナー</CardTitle>
          <CardDescription>
            AIがあなたの次の旅行プランを生成します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Input
                  id="destination"
                  placeholder="目的地"
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
                      {date ? format(date, "PPP") : <span>日付を選択</span>}
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "生成中..." : "プランを生成"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start w-full">
          {error && <p className="text-red-500">エラー: {error.message}</p>}
          {latestMessageContent ? (
            <div className="prose prose-sm max-w-full">
              <pre className="whitespace-pre-wrap">{latestMessageContent}</pre>
            </div>
          ) : (
            <p>生成されたプランがここに表示されます。</p>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}
