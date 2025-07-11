"use client";

import * as React from "react";
import { useChat } from "ai/react";

import { Button } from "@/components/ui/button";
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
  const [parsedPlan, setParsedPlan] = React.useState<TravelPlan | null>(null);
  const [rawResponse, setRawResponse] = React.useState<string>("");

  const { input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/plan",
    onFinish: (message) => {
      setRawResponse(message.content); // 生のレスポンスを保存
      
      try {
        let content = message.content;
        
        // Markdownコードブロックが含まれている場合は除去
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          content = jsonMatch[1];
        }
        
        // ```で囲まれていない場合でも、前後の余分な文字を除去
        content = content.trim();
        
        const plan = JSON.parse(content) as TravelPlan;
        setParsedPlan(plan);
      } catch (e) {
        console.error("Failed to parse AI response as JSON:", e);
        console.error("AI response content:", message.content);
        setParsedPlan(null);
      }
    },
  });

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-24">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Travel Planner AI</CardTitle>
          <CardDescription>
            AIがあなたの次の旅行プランを生成します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid items-center w-full gap-4">
              <div className="flex flex-col space-y-1.5">
                <Input
                  id="prompt"
                  placeholder="目的地と日付を入力してください (例: 東京 2025-07-20)"
                  value={input}
                  onChange={handleInputChange}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "生成中..." : "プランを生成"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start w-full">
          {error && <p className="text-red-500">エラー: {error.message}</p>}
          {parsedPlan ? (
            <div className="w-full">
              <h3 className="mb-2 text-lg font-bold">{parsedPlan.destination}への旅行プラン</h3>
              <p className="mb-3 text-sm text-gray-600">日付: {parsedPlan.date}</p>
              <ul className="space-y-2">
                {parsedPlan.itinerary.map((item, index) => (
                  <li key={index} className="pl-3 border-l-2 border-blue-500">
                    <span className="font-semibold">{item.time}</span>: {item.activity}
                  </li>
                ))}
              </ul>
            </div>
          ) : rawResponse ? (
            <div className="w-full">
              <h3 className="mb-2 text-lg font-bold">AI応答 (JSONパースに失敗)</h3>
              <pre className="p-3 overflow-auto text-sm bg-gray-100 rounded max-h-40">
                {rawResponse}
              </pre>
            </div>
          ) : (
            <p>生成されたプランがここに表示されます。</p>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}