# FDEカリキュラム教材

教材は、正式カリキュラムの3フェーズ・12章を基準に管理する。章はWeekと1対1で対応し、各章の中に必要な数のLesson／Readingを置く。

```text
Curriculum → Chapter → Lesson／Reading → Exercise → Learning Log
```

Learning Logは教材の元原稿ではなく、Lessonの理解と演習結果を記録する進捗データとして扱う。

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

複数の`prerequisiteReadings`または`relatedLogs`はカンマ区切りで記述する。章とLessonの正式な順序は`lib/learning-curriculum.ts`を正とする。

## 各Lesson／Readingの必須構成

1. このLessonで解けるようになる問い
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
