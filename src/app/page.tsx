"use client";

import * as React from "react";
import { useChat } from "ai/react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ItineraryItem {
  time: string;
  activity: string;
}

interface DailyPlan {
  day: number;
  date: string;
  itinerary: ItineraryItem[];
}

interface TravelPlan {
  destination: string;
  startDate: string;
  endDate: string;
  days: number;
  dailyPlans: DailyPlan[];
}

// レガシー形式（単日）をサポート
interface LegacyTravelPlan {
  destination: string;
  date: string;
  itinerary: ItineraryItem[];
}

export default function Home() {
  const [parsedPlan, setParsedPlan] = React.useState<TravelPlan | null>(null);
  const [rawResponse, setRawResponse] = React.useState<string>("");
  const [destination, setDestination] = React.useState<string>("");
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();
  const [isStartDateOpen, setIsStartDateOpen] = React.useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = React.useState(false);
  const [currentTabPage, setCurrentTabPage] = React.useState(0); // タブページネーション用

  const { handleSubmit, isLoading, error, setInput } = useChat({
    api: "/api/plan",
    onFinish: (message) => {
      setRawResponse(message.content);
      setCurrentTabPage(0); // 新しいプランが生成されたらタブページをリセット
      
      try {
        let content = message.content;
        
        // Markdownコードブロックが含まれている場合は除去
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          content = jsonMatch[1];
        }
        
        content = content.trim();
        
        const plan = JSON.parse(content);
        
        // レガシー形式（単日）をチェック
        if (plan.date && plan.itinerary && !plan.dailyPlans) {
          const legacyPlan = plan as LegacyTravelPlan;
          const convertedPlan: TravelPlan = {
            destination: legacyPlan.destination,
            startDate: legacyPlan.date,
            endDate: legacyPlan.date,
            days: 1,
            dailyPlans: [{
              day: 1,
              date: legacyPlan.date,
              itinerary: legacyPlan.itinerary
            }]
          };
          setParsedPlan(convertedPlan);
        } else {
          setParsedPlan(plan as TravelPlan);
        }
      } catch (e) {
        console.error("Failed to parse AI response as JSON:", e);
        console.error("AI response content:", message.content);
        setParsedPlan(null);
      }
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destination.trim()) {
      alert("目的地を入力してください");
      return;
    }

    let formattedInput = `目的地: ${destination}`;
    
    if (startDate && endDate) {
      const startStr = format(startDate, "yyyy-MM-dd");
      const endStr = format(endDate, "yyyy-MM-dd");
      
      if (startStr === endStr) {
        formattedInput += ` 日付: ${startStr}`;
      } else {
        formattedInput += ` 開始日: ${startStr} 終了日: ${endStr}`;
      }
    } else if (startDate) {
      formattedInput += ` 日付: ${format(startDate, "yyyy-MM-dd")}`;
    }

    setInput(formattedInput);
    
    // フォームを送信
    const syntheticEvent = {
      preventDefault: () => {},
      target: { elements: { message: { value: formattedInput } } }
    } as unknown as React.FormEvent<HTMLFormElement>;
    
    handleSubmit(syntheticEvent);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Travel Planner AI</CardTitle>
          <CardDescription>
            AIがあなたの次の旅行プランを生成します。複数日程にも対応しています。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit}>
            <div className="grid items-center w-full gap-6">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="destination">目的地</Label>
                <Input
                  id="destination"
                  placeholder="例: 東京、京都、沖縄"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col space-y-2">
                  <Label>開始日</Label>
                  <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {startDate ? format(startDate, "yyyy年MM月dd日", { locale: ja }) : "日付を選択"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          setStartDate(date);
                          setIsStartDateOpen(false);
                          // 開始日が終了日より後の場合、終了日を開始日に設定
                          if (date && endDate && date > endDate) {
                            setEndDate(date);
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex flex-col space-y-2">
                  <Label>終了日（オプション）</Label>
                  <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {endDate ? format(endDate, "yyyy年MM月dd日", { locale: ja }) : "終了日を選択（オプション）"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => {
                          setEndDate(date);
                          setIsEndDateOpen(false);
                        }}
                        disabled={(date) => date < (startDate || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "生成中..." : "プランを生成"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start w-full">
          {error && <p className="text-red-500">エラー: {error.message}</p>}
          {parsedPlan ? (
            <div className="w-full space-y-4">
              <div>
                <h3 className="text-xl font-bold">{parsedPlan.destination}への旅行プラン</h3>
                <p className="text-sm text-gray-600">
                  {parsedPlan.days === 1 
                    ? `日付: ${parsedPlan.startDate}` 
                    : `期間: ${parsedPlan.startDate} ～ ${parsedPlan.endDate} (${parsedPlan.days}日間)`
                  }
                </p>
              </div>
              
              {parsedPlan.days === 1 ? (
                // 単日プランの表示
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {parsedPlan.dailyPlans[0]?.itinerary.map((item, index) => (
                        <div key={index} className="flex items-start gap-4 p-3 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
                          <div className="flex-shrink-0">
                            <span className="px-2 py-1 text-sm font-semibold text-gray-700 bg-white border rounded">
                              {item.time}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800">{item.activity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // 複数日プランのタブ表示
                (() => {
                  const TABS_PER_PAGE = 7;
                  const totalPages = Math.ceil(parsedPlan.days / TABS_PER_PAGE);
                  const currentStartDay = currentTabPage * TABS_PER_PAGE + 1;
                  const currentEndDay = Math.min((currentTabPage + 1) * TABS_PER_PAGE, parsedPlan.days);
                  const currentDays = parsedPlan.dailyPlans.slice(currentStartDay - 1, currentEndDay);
                  
                  return (
                    <div className="space-y-4">
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentTabPage(Math.max(0, currentTabPage - 1))}
                            disabled={currentTabPage === 0}
                          >
                            ← 前の週
                          </Button>
                          <span className="text-sm text-gray-600">
                            {currentStartDay}日目 - {currentEndDay}日目 ({currentTabPage + 1}/{totalPages}ページ)
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentTabPage(Math.min(totalPages - 1, currentTabPage + 1))}
                            disabled={currentTabPage === totalPages - 1}
                          >
                            次の週 →
                          </Button>
                        </div>
                      )}
                      
                      <Tabs defaultValue={`day-${currentStartDay}`} key={currentTabPage} className="w-full">
                        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${currentDays.length}, 1fr)` }}>
                          {currentDays.map((day) => (
                            <TabsTrigger key={day.day} value={`day-${day.day}`}>
                              {day.day}日目
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        {currentDays.map((day) => (
                          <TabsContent key={day.day} value={`day-${day.day}`}>
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                  <span className="px-2 py-1 text-sm font-medium text-gray-800 bg-gray-100 rounded-full">
                                    {day.day}日目
                                  </span>
                                  {day.date}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {day.itinerary.map((item, index) => (
                                    <div key={index} className="flex items-start gap-4 p-3 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
                                      <div className="flex-shrink-0">
                                        <span className="px-2 py-1 text-sm font-semibold text-gray-700 bg-white border rounded">
                                          {item.time}
                                        </span>
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-gray-800">{item.activity}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </div>
                  );
                })()
              )}
            </div>
          ) : rawResponse ? (
            <div className="w-full">
              <h3 className="mb-2 text-lg font-bold">AI応答 (JSONパースに失敗)</h3>
              <pre className="p-3 overflow-auto text-sm bg-gray-100 rounded max-h-40">
                {rawResponse}
              </pre>
            </div>
          ) : (
            <p className="text-gray-500">生成されたプランがここに表示されます。</p>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}