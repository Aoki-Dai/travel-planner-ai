# 技術スタック

## フレームワーク & ランタイム

- **Next.js 15.3.5** - App Router 付き React フレームワーク
- **React 19** - UI ライブラリ
- **TypeScript 5** - 型安全性と開発体験
- **Node.js** - ランタイム環境

## UI & スタイリング

- **shadcn/ui** - コンポーネントライブラリ（New York スタイル）
- **Radix UI** - ヘッドレス UI プリミティブ
- **Tailwind CSS 4** - ユーティリティファースト CSS フレームワーク
- **Lucide React** - アイコンライブラリ
- **class-variance-authority** - コンポーネントバリアント管理

## AI & データ

- **AI SDK** - ストリーミングレスポンス用 Vercel の AI SDK
- **@ai-sdk/google** - Google Gemini AI 統合
- **date-fns** - 日本語ロケールサポート付き日付操作

## 開発ツール

- **ESLint** - Next.js 設定でのコードリンティング
- **PostCSS** - CSS 処理

## 共通コマンド

```bash
# 開発
npm run dev          # localhost:3000で開発サーバー起動

# 本番
npm run build        # 本番用ビルド
npm run start        # 本番サーバー起動

# コード品質
npm run lint         # ESLint実行
```

## 環境変数

- `GOOGLE_API_KEY` - Gemini AI 統合に必要

## アーキテクチャパターン

- **App Router** - Next.js 13+のファイルベースルーティング
- **Server Components** - デフォルトのサーバーサイドレンダリング
- **Client Components** - "use client"ディレクティブでマーク
- **API Routes** - `/api`ディレクトリ内のサーバーサイド API エンドポイント
- **ストリーミング AI レスポンス** - リアルタイム AI レスポンスストリーミング
