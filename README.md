# 202_RPO - RPO月次レポート自動生成ツール

株式会社202向けのRPO（Recruitment Process Outsourcing）月次レポート自動生成アプリケーション。
CSVデータとクライアント情報をもとに、Gemini AIが包括的な採用分析レポートを自動生成します。

## 主な機能

### コア機能
- **AI レポート自動生成** — Gemini 3 Flash による採用データ分析・レポート生成
- **Google Search Grounding** — リアルタイム市場データを活用した競合・トレンド分析
- **ペルソナ画像生成** — Gemini 2.5 Flash による理想候補者のイメージ画像生成
- **KPT分析** — Keep / Problem / Try フレームワークによる戦略提案

### データ入力
- **CSVアップロード** — 媒体実績データ・応募者データのCSV取り込み
- **Google Sheets連携** — n8n Webhook経由でスプレッドシートから直接データ取得
- **クライアントプリセット** — マスタースプレッドシートからクライアント情報をワンクリック読み込み

### ペルソナマッチング
- **構造化入力** — ターゲット年齢範囲・性別・国籍の指定
- **自由記載** — 求める人物像の詳細記述
- **マッチング分析** — 応募者データとペルソナ条件の適合率算出

### 出力
- **レポート表示** — セクション別の分析結果表示（Markdown対応）
- **セクション編集** — 各セクションの手動編集・再生成
- **Googleドキュメント保存** — n8n経由でGoogle Docsに自動保存

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | React 19 + TypeScript |
| モジュール | ESM importmap (esm.sh CDN) |
| AI | Google Gemini API (3 Flash / 2.5 Flash) |
| スタイリング | Tailwind CSS |
| チャート | Recharts |
| アイコン | Lucide React |
| バックエンド連携 | n8n Webhooks (セルフホスト) |
| デプロイ | Google AI Studio |

## アーキテクチャ

```
┌─────────────────────────────────────────┐
│         Google AI Studio (Deploy)        │
│  ┌─────────────────────────────────────┐ │
│  │  React App (Client-side Only)       │ │
│  │  ├── App.tsx (メインUI)             │ │
│  │  ├── services/geminiService.ts      │ │
│  │  ├── components/                    │ │
│  │  └── types.ts                       │ │
│  └──────────┬──────────────────────────┘ │
└─────────────┼────────────────────────────┘
              │ fetch API
              ▼
┌─────────────────────────────────────────┐
│         n8n (202.xvps.jp)               │
│  ├── /rpo-save-doc      → Google Docs   │
│  ├── /rpo-fetch-sheets  → Google Sheets │
│  └── /rpo-client-presets → Sheets Master│
└─────────────────────────────────────────┘
```

## プロジェクト構成

```
202_RPO/
├── index.html              # ESM importmap + メタ設定
├── index.tsx               # エントリーポイント
├── index.css               # グローバルスタイル
├── App.tsx                 # メインアプリケーション (~56KB)
├── types.ts                # TypeScript型定義
├── services/
│   └── geminiService.ts    # Gemini API連携サービス
├── components/             # UIコンポーネント
├── public/                 # 静的アセット
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## セットアップ

### ローカル開発

```bash
# 依存関係インストール
npm install

# .env.local に Gemini API Key を設定
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# 開発サーバー起動
npm run dev
```

### n8n Webhook 設定

以下の3つのワークフローがn8n (202.xvps.jp) 上で稼働:

| Webhook | メソッド | パス | 機能 |
|---------|---------|------|------|
| Save to Google Doc | POST | `/rpo-save-doc` | レポートをGoogle Docsに保存 |
| Fetch Sheets CSV | GET | `/rpo-fetch-sheets` | スプレッドシートからCSV取得 |
| Client Presets | GET | `/rpo-client-presets` | クライアントマスター取得 |

### クライアントマスター スプレッドシート

クライアントプリセット機能用のスプレッドシート構成:

| カラム | 説明 |
|--------|------|
| クライアント名 | 会社名 |
| スプレッドシートURL | 媒体実績データのURL |
| ターゲット年齢（下限） | 採用ターゲットの下限年齢 |
| ターゲット年齢（上限） | 採用ターゲットの上限年齢 |
| ターゲット性別 | 男性 / 女性 / 不問 |
| ターゲット国籍 | 日本国籍 / 外国籍 / 不問 |
| 求める人物像 | ペルソナの詳細記述 |
| 備考 | その他メモ |

## レポート構成

生成されるレポートは以下のセクションで構成:

1. **エグゼクティブサマリー** — 全体概要と主要KPI
2. **媒体別パフォーマンス** — 各求人媒体の実績分析
3. **候補者分析** — 応募者の質的・量的分析
4. **応募者属性** — 年齢・性別・国籍の分布（チャート付き）
5. **ペルソナ適合分析** — ターゲットペルソナとのマッチ率
6. **市場トレンド** — Google Search Groundingによる最新動向
7. **競合事例** — 同業他社の採用事例
8. **戦略提案（KPT）** — Keep / Problem / Try の具体的アクション
9. **推奨アクション** — 次月に向けた優先施策

## AI Studio

アプリを表示: https://ai.studio/apps/821a5328-adfc-4f36-a680-999f5900ff5c

## ライセンス

Private - 株式会社202 / BM Studio
