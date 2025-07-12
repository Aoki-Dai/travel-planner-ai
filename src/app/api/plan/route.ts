import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { type CoreMessage } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();

  // 最新のユーザーメッセージから目的地、開始日、終了日を抽出
  const latestUserMessage = messages.filter(m => m.role === 'user').pop();
  let destination = "";
  let startDate = "";
  let endDate = "";
  let days = 1;

  if (latestUserMessage && typeof latestUserMessage.content === 'string') {
    // 複数の形式をサポート
    // 形式1: "目的地: XXX 開始日: YYYY-MM-DD 終了日: YYYY-MM-DD"
    const multiDayMatch = latestUserMessage.content.match(/目的地:\s*(.+?)\s*開始日:\s*(.+?)\s*終了日:\s*(.+)/);
    // 形式2: "目的地: XXX 日数: N日間"
    const daysMatch = latestUserMessage.content.match(/目的地:\s*(.+?)\s*日数:\s*(\d+)日間/);
    // 形式3: "目的地: XXX 日付: YYYY-MM-DD" (従来の形式)
    const singleDayMatch = latestUserMessage.content.match(/目的地:\s*(.+?)\s*日付:\s*(.+)/);

    if (multiDayMatch) {
      destination = multiDayMatch[1];
      startDate = multiDayMatch[2];
      endDate = multiDayMatch[3];
      // 日数を計算
      const start = new Date(startDate);
      const end = new Date(endDate);
      days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    } else if (daysMatch) {
      destination = daysMatch[1];
      days = parseInt(daysMatch[2]);
      startDate = new Date().toISOString().split('T')[0];
      const endDateObj = new Date();
      endDateObj.setDate(endDateObj.getDate() + days - 1);
      endDate = endDateObj.toISOString().split('T')[0];
    } else if (singleDayMatch) {
      destination = singleDayMatch[1];
      startDate = singleDayMatch[2];
      endDate = startDate;
      days = 1;
    } else {
      // フォールバック
      destination = latestUserMessage.content;
      startDate = new Date().toISOString().split('T')[0];
      endDate = startDate;
      days = 1;
    }
  }

  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const prompt = `
    あなたはプロの旅行プランナーです。
    以下の条件に基づいて、最高の旅行プランを生成してください。

    # 条件
    - 目的地: ${destination}
    - 開始日: ${new Date(startDate).toLocaleDateString('ja-JP')}
    - 終了日: ${new Date(endDate).toLocaleDateString('ja-JP')}
    - 日数: ${days}日間
    
    # 重要: 必ず以下のJSON形式のみで応答してください。マークダウンやコードブロックは使用しないでください。
    
    {
      "destination": "${destination}",
      "startDate": "${new Date(startDate).toLocaleDateString('ja-JP')}",
      "endDate": "${new Date(endDate).toLocaleDateString('ja-JP')}",
      "days": ${days},
      "dailyPlans": [
        {
          "day": 1,
          "date": "${new Date(startDate).toLocaleDateString('ja-JP')}",
          "itinerary": [
            {
              "time": "09:00",
              "activity": "朝食・ホテルチェックイン"
            },
            {
              "time": "10:00",
              "activity": "観光スポット1"
            }
          ]
        }
      ]
    }

    各日程について詳細な時間割を作成し、観光地の営業時間、移動時間、食事時間を考慮してください。
  `;

  const result = streamText({
    model: google("models/gemini-2.5-flash"),
    messages: messages,
    system: prompt,
  });

  return result.toDataStreamResponse();
}
