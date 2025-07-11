import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { destination, date } = await req.json();

  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const prompt = `
    あなたはプロの旅行プランナーです。
    以下の条件に基づいて、最高の旅行プランを生成してください。

    # 条件
    - 目的地: ${destination}
    - 日付: ${new Date(date).toLocaleDateString('ja-JP')}
    - 出力形式: マークダウン形式で、時間とアクティビティをリスト表示してください。
      例:
      ### 1日目
      - 10:00 〇〇に到着、ホテルにチェックイン
      - 12:00 △△でランチ
      - 14:00 □□を観光
      - 18:00 ▽▽でディナー
  `;

  const result = await streamText({
    model: google('models/gemini-1.5-flash-latest'),
    prompt,
  });

  return result.toAIStreamResponse();
}
