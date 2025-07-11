import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { type CoreMessage } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();

  // 最新のユーザーメッセージから目的地と日付を抽出
  const latestUserMessage = messages.filter(m => m.role === 'user').pop();
  let destination = "";
  let date = "";

  if (latestUserMessage && typeof latestUserMessage.content === 'string') {
    // ここでは簡易的に、メッセージから「目的地: XXX 日付: YYYY-MM-DD」のような形式を想定
    const match = latestUserMessage.content.match(/目的地:\s*(.+?)\s*日付:\s*(.+)/);
    if (match) {
      destination = match[1];
      date = match[2];
    } else {
      // マッチしない場合は、メッセージ全体を目的地として扱うか、エラーを返すなど
      destination = latestUserMessage.content; // 仮の処理
      date = new Date().toISOString(); // 仮の処理
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
    - 日付: ${new Date(date).toLocaleDateString('ja-JP')}
    
    # 重要: 必ず以下のJSON形式のみで応答してください。マークダウンやコードブロックは使用しないでください。
    
    {
      "destination": "${destination}",
      "date": "${new Date(date).toLocaleDateString('ja-JP')}",
      "itinerary": [
        {
          "time": "09:00",
          "activity": "朝食・ホテル出発"
        },
        {
          "time": "10:00", 
          "activity": "観光スポット1"
        }
      ]
    }
  `;

  const result = streamText({
    model: google('models/gemini-1.5-flash-latest'),
    messages: messages,
    system: prompt, // プロンプトをsystemメッセージとして渡す
  });

  return result.toDataStreamResponse();
}
