# プロジェクト構造

## ディレクトリ構成

```text
src/
├── app/                    # Next.js App Router
│   ├── api/               # APIルート
│   │   └── plan/          # 旅行プラン生成エンドポイント
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # ルートレイアウトコンポーネント
│   └── page.tsx           # ホームページコンポーネント
├── components/            # 再利用可能コンポーネント
│   └── ui/               # shadcn/uiコンポーネント
└── lib/                  # ユーティリティ関数
    └── utils.ts          # 共通ユーティリティ（cn関数）
```

## ファイル命名規則

- **コンポーネント**: PascalCase（例：`Button.tsx`、`TravelPlan.tsx`）
- **ページ**: 小文字（例：`page.tsx`、`layout.tsx`）
- **API ルート**: 小文字（例：`route.ts`）
- **ユーティリティ**: camelCase（例：`utils.ts`、`dateHelpers.ts`）
- **型定義**: PascalCase で`.types.ts`サフィックス

## コンポーネント構成

### UI コンポーネント（`src/components/ui/`）

- shadcn/ui CLI で生成・管理
- カスタムスタイリング付き Radix UI パターンに従う
- 条件付きクラスには`cn()`ユーティリティを使用
- コンポーネントとバリアント型の両方をエクスポート

### ページコンポーネント（`src/app/`）

- Next.js App Router 規約を使用
- デフォルトで Server Components
- Client Components は`"use client"`でマーク
- ページ固有の場合は関連コンポーネントを同じ場所に配置

## API 構造

### ルートハンドラー（`src/app/api/`）

- REST 規約に従う
- リクエスト/レスポンス型に TypeScript を使用
- 適切な HTTP ステータスコードでエラーを適切に処理
- AI 相互作用のストリーミングレスポンスをサポート

## インポート規約

```typescript
// 外部ライブラリを最初に
import React from "react";
import { NextRequest } from "next/server";

// 内部ユーティリティとコンポーネント
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// 型とインターフェース
import type { TravelPlan } from "@/types/travel";
```

## パスエイリアス

- `@/*`は`src/*`にマップ
- 保守性向上のため絶対インポートを使用
- `tsconfig.json`と`components.json`で設定
