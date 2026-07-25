# FDEカリキュラム教材

教材は、正式カリキュラムの3フェーズ・12 Weekを基準に管理する。Weekの中で順に学ぶ必須Lessonと、必要なときに参照するPractice Guide（内部実装上の`kind`は`reference`）を分ける。

```text
Curriculum → Week → 必須Lesson → Exercise → Learning Log
                    ↘ Practice Guide（常設参照）
```

Learning Logは教材の元原稿ではなく、Lessonの理解と演習結果を記録する進捗データとして扱う。Guideの閲覧は必須Lessonの完了判定には含めない。

Git、セキュリティ、デバッグは特定Weekだけで完結させず、全Weekで実践する横断テーマとする。Week・Lesson・横断テーマの登録は`lib/learning-curriculum.ts`を正とする。Guideは`lib/learning-curriculum.ts`の`curriculumReferenceSlugs`が公開許可リストであり、タイトル・説明・分類などの表示内容はMarkdown frontmatterを正とする。

## ファイル名

小文字英数字とハイフンを使った、内容を表す安定したslugにする。

```text
docs/readings/project-files-and-imports.md
```

## Frontmatter

```yaml
---
order: 8
week: 2
lesson: 1
phase: foundation
title: 教材タイトル
summary: 一覧に表示する短い説明
prerequisite: 前提知識の説明
prerequisiteReadings: previous-reading-slug
goal: 読了後の到達目標
relatedLogs: 2026-07-18
---
```

複数の`prerequisiteReadings`または`relatedLogs`はカンマ区切りで記述する。WeekとLessonの正式な順序は`lib/learning-curriculum.ts`を正とする。

Practice Guideは次のように`kind`を明示し、`week`、`lesson`、`phase`を持たせない。

```yaml
---
order: 103
kind: reference
title: Guideタイトル
summary: 一覧カードに表示する短い説明
prerequisite: 必要になったWeekで参照する
prerequisiteReadings:
goal: 手順と判断基準を確認できる
relatedLogs: 2026-07-25
category: 開発ツール
estimatedMinutes: 30
featured: true
---
```

Guide固有の項目と制約:

- `order`: Guideは100番台を使い、追加順に採番する（新しいGuideほど大きい）
- `category`: 一覧カードに表示する分類
- `estimatedMinutes`: 読了・練習時間の目安（正の数値のみ有効）
- `featured`: `true`のGuideがDashboardに新しい順で最大3件表示される
- `relatedLogs`: 実在する`docs/learning-log/YYYY-MM-DD.md`の日付だけを記述する
- frontmatterは1行の`key: value`のみ対応。配列・ネスト・複数行は使えない

Markdownの追加と`curriculumReferenceSlugs`への登録は同じcommitで行う。整合性は`pnpm check:content`（`pnpm lint`にも含まれる）で検証できる。

## 各必須Lessonの構成

1. このLessonで答えられるようになる問い
2. なぜFDEに必要か
3. 基本概念
4. システム内部で実際に起きること
5. TalentScanでの具体例
6. 処理フローまたは構成図
7. よくある誤解
8. FDEとして顧客に確認すべきこと
9. 理解確認問題
10. ミニ演習
11. 学習ログへ記録する項目

## 進捗

Learning Logのfrontmatterに、完了したLessonのslugを記録する。

```yaml
completedLessons: web-system-overview, browser-and-server-components
```

章内の必須Lessonと章末演習が完了したとき、その章を完了扱いにする。
