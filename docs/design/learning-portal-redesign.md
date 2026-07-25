# FDE学習ポータル拡張 設計書

- 対象リポジトリ: `talentscan-fde-sandbox`
- 対象機能: `/learning`
- 作成日: 2026-07-25
- 文書種別: 実装設計
- ステータス: 実装済み（下記レビュー変更を反映）

## 0. 設計レビューによる変更（実装反映済み）

2026-07-25の設計レビューで、以下を原案から変更して実装した。以降の章は原案のまま残しているため、差異はこの章を正とする。

1. **Guideカードのデータソースを一本化**（§9.3の方針を前倒し）
   `curriculumReferences`の静的なタイトル・説明・分類は廃止し、`lib/learning-curriculum.ts`の`curriculumReferenceSlugs`（公開許可リスト）と、Markdown frontmatter（表示内容の正）に分離した。Guides一覧とDashboardの両方が`getReadings()`から描画するため、表示の不整合が起きない。slugを持たないTroubleshooting導線は`externalReferenceLinks`として分離し、Guideカードとは別の見た目で表示する。
2. **ナビゲーション名`Guides`への変更は見送り**（§5.3・§7.1の一部変更）
   `/learning/readings`の主コンテンツは進捗を駆動するCurriculumのため、当面ナビは`Lessons`のまま維持する。ページ内は「Curriculum Lessons」と「Practice Guides」の二領域に分け、Guide詳細の表示は`Reference`から`Guide`へ変更した。ナビ名の変更はCurriculum独立（§17）と同時に一回で行う。
3. **`updatedAt`は直近スコープから除外**（§9.1の一部変更）
   表示箇所が定義されていないため追加しない。Guide用メタデータは`category`、`estimatedMinutes`、`featured`の3項目とした。
4. **featured選定ロジックを確定**（§8.1の選択肢を解消）
   Dashboardは`kind === "reference"`かつ`featured === true`を`order`降順（新しいGuideが先頭）で最大3件表示する。
5. **既存Reference 2件のfrontmatter更新を実装手順に追加**（§12 Step 3の補完）
   `markdown-learning-hub-and-pull-request`と`development-to-deployment`へ`category`、`estimatedMinutes`、`featured`を追記した。
6. **整合性チェックスクリプトを追加**（§11.3-1の機械化）
   `scripts/check-content.mjs`が、Markdownと登録の相互整合、`relatedLogs`の実在、`featured`の値を検証する。`pnpm lint`に組み込み済み。
7. **`order`の採番規約を明文化**
   Practice Guideは100番台を追加順に使う。規約は`docs/readings/README.md`に記載した。

## 1. 目的

既存のFDE学習機能を壊さず、日次ログ、正式カリキュラム、常設ガイド、障害切り分け知識を継続的に追加できる学習ポータルへ拡張する。

直近の実装では、現在の`/learning/readings`を内部URLとデータ取得方式を維持したまま、画面上では「Guides」として整理する。最初の常設ガイドとして「Shell & VS Code Basics」を追加し、Dashboardから直接再開・参照できる導線を追加する。

将来は、現在`/learning/readings`内に含まれる正式カリキュラムを`/learning/curriculum`へ独立させ、実際のトラブル記録とは別に、再利用可能な切り分けパターンを扱う`/learning/errors`を追加できる構造にする。

## 2. 設計原則

1. 既存URLを変更・削除しない。
2. Learning Log、必須Lesson、常設Guide、実践トラブルログの役割を混ぜない。
3. 既存のMarkdown駆動とServer Component中心の実装を維持する。
4. 進捗判定は必須Lessonのみを対象とし、Guideの閲覧は完了率に影響させない。
5. 表示名の変更と内部実装名の変更を分離し、直近対応では不要な大規模renameを行わない。
6. 新しい情報種別は、一覧・詳細・Dashboard導線・関連コンテンツの接続方法を定義してから追加する。
7. 初学者が「今やること」「過去の記録」「必要な参照資料」「障害時の確認先」を迷わず選べることを優先する。

## 3. 現状分析

### 3.1 現在のURLと責務

| URL | 実装 | 現在の責務 |
|---|---|---|
| `/learning` | `app/learning/page.tsx` | Dashboard。最新ログ、統計、ヒートマップ、直近ログ、FDE Roadmapを表示 |
| `/learning/readings` | `app/learning/readings/page.tsx` | 3フェーズ・12 Weekのカリキュラム、必須Lesson、Reference一覧を表示 |
| `/learning/readings/[slug]` | `app/learning/readings/[slug]/page.tsx` | LessonまたはReferenceの詳細を表示 |
| `/learning/logs` | `app/learning/logs/page.tsx` | 日付単位のLearning Log一覧 |
| `/learning/logs/[date]` | `app/learning/logs/[date]/page.tsx` | Learning Log詳細と関連教材を表示 |
| `/learning/troubleshooting` | `app/learning/troubleshooting/page.tsx` | 実際に発生したトラブルの一覧 |
| `/learning/troubleshooting/[slug]` | `app/learning/troubleshooting/[slug]/page.tsx` | 実践トラブルログ詳細 |

共通ナビゲーションは`app/learning/layout.tsx`にあり、現状は`Dashboard / Lessons / Logs / Troubleshooting`を表示している。

### 3.2 現在のデータソース

| データ | 保存先 | 読み込みロジック | 主な用途 |
|---|---|---|---|
| 必須Lesson・Reference本文 | `docs/readings/*.md` | `lib/readings.ts` | 教材詳細 |
| 正式カリキュラム・Reference登録 | `lib/learning-curriculum.ts` | 静的TypeScriptデータ | Week、Lesson順、Phase、Reference一覧 |
| Learning Log | `docs/learning-log/YYYY-MM-DD.md` | `lib/learning-logs.ts` | 日次記録、進捗証拠 |
| 実践トラブルログ | `docs/troubleshooting-log/YYYY-MM-DD-slug.md` | `lib/troubleshooting-logs.ts` | 実際の障害記録 |
| Lesson進捗 | Learning Logの`completedLessons` | `lib/learning-roadmap.ts` | 現在Lesson、章・Phase進捗 |

### 3.3 Readings読み込みの重要な制約

`lib/readings.ts`は、`docs/readings/*.md`を無条件に公開しない。ファイルslugが次のどちらかに登録されている場合だけ`Reading`として返す。

- `lib/learning-curriculum.ts`の`curriculumChapters[].lessons`
- `lib/learning-curriculum.ts`の`curriculumReferences`

また、`kind`はMarkdown frontmatterの値ではなく、上記登録先から`lesson`または`reference`として決定される。したがって「Shell & VS Code Basics」はMarkdown追加だけでは表示されず、`curriculumReferences`への登録も必要である。

### 3.4 Markdownとfrontmatterの現状

`lib/markdown-frontmatter.ts`は外部YAMLライブラリを使わず、1行の`key: value`を文字列として読む簡易パーサーである。

現行の`Reading`は次を持つ。

```ts
type Reading = {
  slug: string;
  order: number;
  kind: "lesson" | "reference";
  week: number | null;
  lesson: number | null;
  phase: CurriculumPhaseId | null;
  title: string;
  summary: string;
  prerequisite: string;
  prerequisiteReadings: string[];
  goal: string;
  relatedLogs: string[];
  content: string;
};
```

複数値はカンマ区切りで読み取る。配列、ネスト、複数行YAMLは扱えないため、直近実装でもこの制約を維持する。

### 3.5 現状の強み

- Dashboard、Logs、教材一覧、教材詳細、トラブル一覧・詳細が既に分離されている。
- 3フェーズ・12 Weekの正式カリキュラムが`lib/learning-curriculum.ts`に定義済み。
- 必須LessonとReferenceが既に区別されている。
- Learning Logの`completedLessons`から進捗を計算できる。
- Markdown本文を一覧データや詳細ページへ接続するloaderが存在する。
- `MarkdownContent`、目次生成、Mermaid表示、前後ページ移動を再利用できる。
- Troubleshootingは将来のError Libraryの根拠データとして活用できる。

### 3.6 現状の課題

1. URL名`readings`、ナビゲーション名`Lessons`、ページ見出し`教材`、本文内の`Reference`が混在し、利用目的が分かりにくい。
2. `/learning/readings`が「正式カリキュラム」と「必要時に読むReference」の両方を持つため、常設ガイドの入口が弱い。
3. Dashboardから常設ガイドへ直接移動できない。
4. `curriculumReferences`とMarkdown frontmatterにタイトル・説明が重複し、将来的に不整合が起きる可能性がある。
5. Troubleshootingは実際のインシデント記録であり、一般化した「API 500の切り分け」などを扱うError Libraryとは役割が異なる。
6. `MarkdownContent`は限定的なMarkdownのみ対応するため、Guide本文は対応記法の範囲で書く必要がある。

## 4. 変更方針

### 4.1 直近対応

直近は次だけを実装する。

1. `/learning/readings`のURL、loader、型名、ディレクトリ名は維持する。
2. 画面上の入口名を`Guides`へ統一する。
3. `/learning/readings`内を「Curriculum Lessons」と「Practice Guides」の二領域として明確に分ける。
4. `Shell & VS Code Basics`を`reference`種別の常設Guideとして追加する。
5. DashboardへPractice Guides導線を追加する。
6. Guide詳細では`Reference`ではなく`Guide`と表示する。
7. READMEと`docs/readings/README.md`の説明を実装に合わせて更新する。

### 4.2 直近では行わないこと

- `/learning/readings`から`/learning/guides`へのURL移行
- `Reading`型、`getReadings()`、`docs/readings`の一括rename
- 新しいCMS、DB、検索エンジンの導入
- 学習完了状態をGuide閲覧から自動更新する機能
- Curriculumページの分離
- Error Libraryの新規実装

これらはURL互換性、既存リンク、進捗ロジックへの影響が大きいため、別変更として扱う。

## 5. 情報設計

### 5.1 コンテンツ種別

| 種別 | 利用者の問い | 更新単位 | 進捗への影響 |
|---|---|---|---|
| Dashboard | 今どこで、次に何をするか | 自動集約 | なし |
| Curriculum Lesson | 順番に何を学ぶか | Week・Lesson | あり |
| Practice Guide | 操作や仕組みを必要時にどう確認するか | テーマ単位 | なし |
| Learning Log | いつ何を理解・実践したか | 日付単位 | `completedLessons`であり |
| Troubleshooting Log | 実際の問題で何が起き、どう直したか | インシデント単位 | なし |
| Error Pattern（将来） | この症状をどう切り分けるか | 症状・エラー種別 | なし |

### 5.2 利用者導線

```text
今日の続き
→ Dashboard
→ 現在のCurriculum Lesson

操作方法を確認
→ DashboardのPractice Guides
→ Shell & VS Code Basics

過去の理解を確認
→ Learning Logs

実際に起きた問題を確認
→ Troubleshooting

一般化した切り分け手順を探す（将来）
→ Error Library
```

### 5.3 用語の表示ルール

- URL・内部コード: 当面`readings`、`Reading`、`reference`を維持
- ナビゲーション: `Guides`
- 一覧ページ最上位見出し: `Guides`
- 必須教材領域: `Curriculum Lessons`
- 常設参照領域: `Practice Guides`
- `kind === "reference"`の画面表示: `Guide`
- 日次記録: `Learning Logs`
- 実インシデント: `Troubleshooting`

## 6. URL設計

### 6.1 直近

| URL | 変更 |
|---|---|
| `/learning` | Practice Guidesセクションを追加 |
| `/learning/readings` | URL維持。画面上はGuidesとして表示 |
| `/learning/readings/shell-and-vscode-basics` | 新規Guide |
| `/learning/logs` | 変更なし |
| `/learning/troubleshooting` | 変更なし |

既存URLへのredirectは不要である。

### 6.2 将来

| URL | 役割 | 移行方針 |
|---|---|---|
| `/learning/curriculum` | 正式カリキュラム専用 | 現在の`ReadingsPage`のカリキュラム表示をコンポーネント化して移設 |
| `/learning/guides` | 常設Guide一覧 | `/learning/readings`を残し、移行時は恒久redirectまたは互換ページを用意 |
| `/learning/guides/[slug]` | Guide詳細 | 既存`/learning/readings/[slug]`リンクを壊さず段階移行 |
| `/learning/errors` | 一般化したError Pattern一覧 | Troubleshootingと別データソースにする |
| `/learning/errors/[slug]` | Error Pattern詳細 | 関連Troubleshootingへのリンクを持つ |

`/learning/troubleshooting`は実際のインシデント記録として残し、`/learning/errors`へ名称だけ変更して上書きしない。

## 7. 画面構成

### 7.1 共通ナビゲーション

直近の表示:

```text
Dashboard | Guides | Logs | Troubleshooting
```

`Guides`のリンク先は既存の`/learning/readings`とする。

将来:

```text
Dashboard | Curriculum | Guides | Logs | Error Library
```

TroubleshootingはError Library配下または補助導線として残す。未実装ページへのナビゲーションは表示しない。

### 7.2 Dashboard

既存の優先順位を維持する。

1. 最新学習・続きから再開
2. 学習統計
3. ヒートマップ・Learning Logs
4. FDE Roadmap
5. Practice Guides

追加する`Practice Guides`は、Dashboard全体を巨大な一覧にしないよう最大3件とする。直近は次を表示する。

- Shell & VS Code Basics
- Markdown駆動の学習ポータルとPull Request
- 開発から公開まで

各カードに表示する情報:

- category
- title
- summary
- estimated minutes（値がある場合）
- 詳細へのリンク

セクション見出しから`/learning/readings#practice-guides`へ移動できるようにする。

### 7.3 Guides一覧

ページヘッダー:

- eyebrow: `FDE Learning Resources`
- h1: `Guides`
- 説明: 順番に進めるLessonと、必要なときに参照するPractice Guideを分けて案内する

本文:

1. `Curriculum Lessons`
   - 現在のPhase、Week、Lesson一覧をそのまま活用
   - 完了、学習中、未着手の状態を維持
2. `Practice Guides`
   - `id="practice-guides"`を付与
   - Guideカード一覧
   - category、title、summary、所要時間を表示
   - GuideはLesson完了判定に含まれない旨を表示

### 7.4 Guide詳細

既存`ReadingPage`を再利用する。`kind === "reference"`の場合のみ表示文言を変更する。

| 現在 | 変更後 |
|---|---|
| Reference | Guide |
| 参照資料 | 常設ガイド |
| On this Reference | On this Guide |
| このReferenceの到達目標 | このGuideの到達目標 |

URL、目次、Markdown表示、関連ログ、前後ナビゲーションは維持する。

### 7.5 Shell & VS Code Basics本文

次の章を必須とする。

1. このGuideの使い方
2. ターミナルとシェルの違い
3. プロンプト、コマンド、引数、オプション
4. 絶対パス・相対パス・現在地
5. Tab補完、履歴、`Ctrl + R`
6. 実行中・終了・停止の見分け方
7. `Ctrl + C`、`q`、`clear`、`Ctrl + L`
8. 標準出力とエラーの見方
9. VS CodeのExplorer、Editor、Panel
10. `Cmd + P`と`Cmd + Shift + F`
11. 保存、自動保存、未保存状態
12. 統合ターミナル、Problems、Source Control
13. TalentScanを使う10分練習
14. 成功時に見るもの
15. 失敗したときに見る場所
16. よくある間違い

Guideはファイル編集やGit操作を自動実行する教材ではなく、学習者が安全に反復できる読み物と練習手順にする。

## 8. コンポーネント設計

### 8.1 直近で追加・変更する単位

#### `components/guide-card.tsx`（新規）

責務:

- Guideのcategory、title、summary、所要時間、リンクを表示
- DashboardとGuides一覧で共通利用
- 表示専用とし、ファイル読み込みを行わない

想定props:

```ts
type GuideCardProps = {
  href: string;
  category: string;
  title: string;
  summary: string;
  estimatedMinutes?: number | null;
  compact?: boolean;
};
```

#### `components/guide-section.tsx`（任意）

同じカード構成がDashboardと一覧で重複する場合に追加する。初回実装で重複が小さければ、過剰な抽象化を避けて追加しなくてもよい。

#### `app/learning/page.tsx`（変更）

- `getReadings()`の結果から`kind === "reference"`を抽出
- 表示対象slugを明示するか、`featured`メタデータで最大3件へ絞る
- Practice Guidesセクションを追加
- 現在Lessonの`resume`ロジックは変更しない

#### `app/learning/readings/page.tsx`（変更）

- ページ見出しと説明をGuidesへ変更
- カリキュラム領域の見出しを追加
- Reference一覧をPractice Guidesとして表示
- TroubleshootingへのカードはGuide記事と同列にせず、関連ライブラリ導線として区別してもよい

#### `app/learning/readings/[slug]/page.tsx`（変更）

- `reference`用の表示文言だけGuideへ変更
- Lessonの表示、進捗、前後移動ロジックは変更しない

#### `app/learning/layout.tsx`（変更）

- `Lessons`を`Guides`へ変更
- hrefは`/learning/readings`のまま

#### `app/globals.css`（変更）

- 既存の`.reference-grid`、`.reference-card`を再利用可能
- 新規命名する場合は`.guide-grid`、`.guide-card`へ段階的に追加し、既存classを一括削除しない
- 既存のブレークポイントで1列表示になることを維持

### 8.2 将来のコンポーネント分割

Curriculum独立時に、現在の`ReadingsPage`から次を抽出する。

- `CurriculumOverview`
- `CurriculumPhaseSection`
- `CurriculumLessonRow`
- `GuideLibrary`
- `ErrorPatternCard`
- `RelatedTroubleshootingList`

直近実装では将来のためだけに全てを先行作成しない。

## 9. データモデルとfrontmatter

### 9.1 直近のReading型拡張

常設Guideの一覧表示に必要な最小項目を追加する。

```ts
type Reading = {
  // 既存項目
  category: string | null;
  estimatedMinutes: number | null;
  updatedAt: string | null;
  featured: boolean;
};
```

解釈:

- `category`: Guideの分類。Lessonでは`null`可
- `estimatedMinutes`: 読了・練習時間の目安
- `updatedAt`: `YYYY-MM-DD`
- `featured`: Dashboard掲載候補

簡易parserに合わせ、すべて単一行の値にする。`featured`は文字列`"true"`との一致でbooleanへ変換する。

### 9.2 Shell & VS Code Basicsのfrontmatter

```yaml
---
order: 103
kind: reference
title: Shell & VS Code Basics
summary: ターミナルとVS Codeの基本操作を、TalentScanで安全に反復するための常設ガイド。
prerequisite: 特になし。Week 2以降、必要なときに参照する
prerequisiteReadings:
goal: コマンドを実行する場所と結果を判断し、VS Codeで対象ファイル・差分・エラー箇所を探せる。
relatedLogs: 2026-07-24, 2026-07-25
category: 開発ツール
estimatedMinutes: 30
updatedAt: 2026-07-25
featured: true
---
```

`week`、`lesson`、`phase`は持たせない。`kind`は文書上の明示として残すが、現在のloaderでは`curriculumReferences`登録が種別判定の正である。

### 9.3 Reference登録

`lib/learning-curriculum.ts`の`curriculumReferences`へ次を追加する。

```ts
{
  slug: "shell-and-vscode-basics",
  title: "Shell & VS Code Basics",
  description: "ターミナルとVS Codeの基本操作を、必要なときに反復する。",
  category: "開発ツール",
  href: "/learning/readings/shell-and-vscode-basics",
}
```

直近は既存モデルに合わせる。将来はslugを持つGuideについて、タイトル、summary、category、hrefをMarkdownから導出し、`curriculumReferences`の重複を減らす。Troubleshootingのような外部導線だけは静的登録を残す。

### 9.4 将来のError Pattern

実践トラブルログとは別に次の型を想定する。

```ts
type ErrorPattern = {
  slug: string;
  title: string;
  symptom: string;
  layer: "browser" | "frontend" | "api" | "backend" | "database" | "external" | "build" | "deployment";
  signals: string[];
  checks: string[];
  likelyCauses: string[];
  relatedTroubleshootingSlugs: string[];
  relatedGuideSlugs: string[];
  updatedAt: string;
  content: string;
};
```

保存先は`docs/errors/*.md`、読み込みは`lib/error-patterns.ts`を想定する。実装時点で必要なfrontmatterを別設計する。

## 10. ファイル構成

### 10.1 直近の変更後

```text
app/learning/
├── layout.tsx                         # ナビゲーション表示変更
├── page.tsx                           # Practice Guides導線追加
├── logs/                              # 変更なし
├── readings/
│   ├── page.tsx                       # Guidesとして再整理
│   └── [slug]/page.tsx                # Guide表示文言を追加
└── troubleshooting/                   # 変更なし

components/
└── guide-card.tsx                     # 新規

docs/
├── design/
│   └── learning-portal-redesign.md    # 本設計書
├── learning-log/                      # 変更なし
├── readings/
│   ├── README.md                      # Guideメタデータ規約を追記
│   └── shell-and-vscode-basics.md     # 新規
└── troubleshooting-log/               # 変更なし

lib/
├── learning-curriculum.ts             # Guide登録追加
├── readings.ts                        # Guide用メタデータ追加
└── markdown-frontmatter.ts            # 原則変更なし

app/globals.css                        # Guideカードとレスポンシブ表示
README.md                              # 画面上の名称を更新
```

### 10.2 将来

```text
app/learning/
├── curriculum/
├── guides/
├── errors/
├── logs/
└── troubleshooting/

docs/
├── readings/          # 移行完了までは維持
├── errors/
├── learning-log/
└── troubleshooting-log/

lib/
├── learning-curriculum.ts
├── readings.ts
├── error-patterns.ts
├── learning-logs.ts
└── troubleshooting-logs.ts
```

## 11. 既存実装への影響

### 11.1 影響する箇所

- ナビゲーションと画面文言
- Readingsのfrontmatter読み込み項目
- Dashboardのデータ取得後の表示
- Curriculum Reference登録
- Guideカード用CSS
- README類

### 11.2 影響させない箇所

- Learning Logのファイル形式と進捗計算
- `completedLessons`
- 既存Lessonのslug、順序、URL
- 既存Referenceのslug、URL
- Troubleshootingの保存形式とURL
- `generateStaticParams()`の基本動作
- Mermaid、Markdown、目次表示
- Vercelデプロイ方式

### 11.3 互換性上の注意

1. `getReading()`は登録のないMarkdownを無視するため、MarkdownとReference登録を同一commitに含める。
2. 新しいfrontmatter項目がない既存教材は、`null`または`false`へフォールバックさせる。
3. Dashboardでは特定slugが存在しなくてもページ全体が失敗しないよう、取得結果をfilterして表示する。
4. `Number(attributes.estimatedMinutes)`は不正値を`null`へ変換する。
5. `updatedAt`は形式が正しい場合だけ採用する。
6. 既存の`kind: reference`記述だけを信頼して公開対象にしない。
7. Guideを`completedLessons`へ追加しない。

## 12. 実装手順

### Step 1: 作業前確認

1. `main`が`origin/main`と同期していることを確認する。
2. `git status`で既存の未commit変更がないことを確認する。
3. `feature/learning-guides`などの作業Branchを作る。
4. 現在の`/learning`、`/learning/readings`、既存詳細ページをスクリーンショットまたは目視で基準確認する。

### Step 2: データモデル拡張

1. `Reading`へGuide用メタデータを追加する。
2. 既存ファイルに値がなくても動くfallbackを実装する。
3. `docs/readings/README.md`へ項目と制約を追記する。

### Step 3: Guide本文追加

1. `docs/readings/shell-and-vscode-basics.md`を作成する。
2. 本設計の必須章を含める。
3. `curriculumReferences`へslugを登録する。
4. `getReading("shell-and-vscode-basics")`で取得できる状態にする。

### Step 4: Guides一覧再整理

1. ナビゲーションを`Guides`へ変更する。
2. `/learning/readings`のページヘッダーを変更する。
3. Curriculum LessonsとPractice Guidesを視覚的に分ける。
4. Practice Guidesへアンカー`practice-guides`を付ける。
5. Guideカードをレスポンシブ表示する。

### Step 5: Guide詳細表示

1. `reference`用ラベルをGuideへ変更する。
2. Lessonのラベルと進捗表示が変わっていないことを確認する。
3. Shell & VS Code Basicsの目次、表、コード、内部見出しが正しく表示されることを確認する。

### Step 6: Dashboard導線

1. `featured`なGuideを最大3件表示する。
2. Shell & VS Code Basicsへのリンクを含める。
3. Guideが0件でもDashboardが崩れないようにする。
4. 現在Lessonの再開ボタンと競合しない配置にする。

### Step 7: ドキュメント更新

1. ルート`README.md`の`Reading教材`表記を画面表示に合わせる。
2. URLは`/learning/readings`のままであることを明記する。
3. 日次ログ、Guide、Troubleshootingの役割を短く説明する。

### Step 8: 検証

受け入れ条件と検証方法に従い、lint、build、画面確認、差分確認を行う。

## 13. 受け入れ条件

### 13.1 機能

- [ ] `/learning`が従来どおり表示される。
- [ ] DashboardにPractice Guidesが表示される。
- [ ] DashboardからShell & VS Code Basicsへ移動できる。
- [ ] 共通ナビゲーションに`Guides`と表示され、`/learning/readings`へ移動する。
- [ ] `/learning/readings`にCurriculum LessonsとPractice Guidesが別領域で表示される。
- [ ] `/learning/readings/shell-and-vscode-basics`が表示される。
- [ ] Guide詳細に目次、本文、コードブロック、表が表示される。
- [ ] 既存Lesson詳細が従来どおり表示される。
- [ ] 既存Reference URLが従来どおり表示される。
- [ ] `/learning/logs`とログ詳細が従来どおり表示される。
- [ ] `/learning/troubleshooting`と詳細が従来どおり表示される。
- [ ] 存在しないReading slugは404になる。

### 13.2 データと進捗

- [ ] Shell & VS Code Basicsは`kind === "reference"`として読み込まれる。
- [ ] Guide追加によってLesson総数、完了Lesson数、完了Chapter数が変わらない。
- [ ] 既存frontmatterに新項目がなくてもbuildできる。
- [ ] Markdownだけ、または登録だけが欠けた状態を検証し、ページ全体が不正なリンクを出さない。

### 13.3 UI・アクセシビリティ

- [ ] 360px程度の画面幅で横スクロールせず読める。
- [ ] Guideカードはキーボードで移動・選択できる。
- [ ] 見出し階層が`h1 → h2 → h3`の順になる。
- [ ] セクションとナビゲーションに適切なラベルがある。
- [ ] 既存の色、余白、カード表現と一貫する。

### 13.4 品質

- [ ] `pnpm lint`が成功する。
- [ ] `pnpm build`が成功する。
- [ ] 意図しないファイル変更がない。
- [ ] 新しい警告やTypeScriptエラーがない。

## 14. 非対象

- Curriculum専用URLの実装
- Error Libraryの実装
- Troubleshootingデータの移行
- 全文検索、タグ検索、絞り込みUI
- 認証、ユーザー別進捗、DB保存
- Markdown編集画面
- Guide閲覧履歴や既読管理
- 自動テスト基盤の新規導入
- 既存教材本文の全面改稿
- 学習ログの作成・変更
- `readings`から`guides`への内部コード一括rename
- 手動Vercelデプロイ

## 15. 検証方法

### 15.1 静的確認

```bash
git status
git diff --check
pnpm lint
pnpm build
```

`pnpm build`で`generateStaticParams()`が新規Guideを含み、既存ReadingとLogの静的生成が失敗しないことを確認する。

### 15.2 ローカル画面確認

```bash
pnpm dev
```

次のURLを確認する。

```text
http://localhost:3000/learning
http://localhost:3000/learning/readings
http://localhost:3000/learning/readings/shell-and-vscode-basics
http://localhost:3000/learning/readings/web-system-overview
http://localhost:3000/learning/logs
http://localhost:3000/learning/troubleshooting
```

各画面でブラウザConsoleエラーがないこと、Networkでdocumentが200を返すことを確認する。

### 15.3 回帰確認

1. Dashboardの最新ログ、統計、ヒートマップ、Roadmapが表示される。
2. 現在Lessonへの再開リンクが変わっていない。
3. Lesson完了数が変更前後で同じ。
4. Learning Log詳細の関連教材リンクが動く。
5. 既存Referenceの前後ナビゲーションが動く。
6. モバイル幅でヘッダーとカードが崩れない。

### 15.4 公開後確認

GitHub連携によるVercel自動デプロイ完了後、公開URLの同じ経路を確認する。ローカルと公開環境で表示差がある場合は、Vercel Build Logs、Runtime Logs、Network responseの順に確認する。

## 16. コミット・push方針

### 16.1 本設計書作成タスク

- 設計書以外の実装ファイルは変更しない。
- 設計書作成だけではcommit、push、deployを行わない。
- 実装開始前に設計レビューを行う。

### 16.2 実装タスク

1. `main`へ直接実装せず、専用Branchを作る。
2. 既存の未commit変更がある場合は勝手に含めない。
3. Markdown、登録データ、画面変更を同じPull Requestでレビュー可能にする。
4. commit前に`git status`と`git diff`で対象を確認する。
5. 推奨commitは次の2単位とする。

```text
docs: add shell and vscode guide
feat: surface practice guides in learning portal
```

変更量が小さく、一体でなければbuildできない場合は1 commitでもよい。

```text
feat: add practice guides to learning portal
```

6. `pnpm lint`と`pnpm build`成功後にpushする。
7. Pull Requestには、目的、変更URL、画面確認結果、lint/build結果、進捗数が変わらないことを記載する。
8. merge後はVercel自動デプロイを確認する。追加の手動デプロイは行わない。

## 17. 将来拡張の判断基準

### Curriculumを独立させるタイミング

- Guideが増え、`/learning/readings`の1ページでCurriculumとGuideを探しにくくなったとき
- Week 3以降のLessonが増え、Curriculum一覧の表示量が大きくなったとき
- Curriculum固有の絞り込み、章末演習、成果物管理が必要になったとき

### Error Libraryを追加するタイミング

- 同じ症状が複数のTroubleshooting Logに現れたとき
- 「どのログを読むか」ではなく「この症状の確認順を知りたい」という利用が増えたとき
- Browser、API、DB、Build、Deploymentの層別に切り分けパターンを整理できるだけの事例が集まったとき

### URLを`guides`へ移行するタイミング

- 外部・学習ログ・README内の既存`/learning/readings`リンクを列挙できること
- redirect方針を決められること
- LessonとGuideの詳細routeを分離する価値が、移行コストを上回ること

## 18. 完了時の期待状態

直近実装後、利用者はDashboardで現在Lessonを再開できるだけでなく、空き時間に反復する常設教材としてShell & VS Code Basicsをすぐ開ける。カリキュラム上の必須LessonとGuideは同じMarkdown表示基盤を使いながら、目的と進捗上の扱いが明確に分かれる。

内部では既存の`readings` URL、loader、正式カリキュラム、Learning Log、Troubleshootingを維持するため、現在の学習履歴やリンクを壊さない。将来は表示コンポーネントとデータ責務を保ったまま、CurriculumとError Libraryを独立させられる。
