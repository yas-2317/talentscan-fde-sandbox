# Reading教材

FDE学習で繰り返し参照する教材を保存する。日ごとの出来事はLearning Log、障害の記録はTroubleshooting Log、概念と仕組みの解説はReadingへ分ける。

## ファイル名

小文字英数字とハイフンを使った、内容を表す安定したslugにする。

```text
docs/readings/frontend-and-backend.md
```

## Frontmatter

```yaml
---
order: 1
phase: environment
title: 教材タイトル
summary: 一覧に表示する短い説明
prerequisite: 前提知識の説明
prerequisiteReadings: previous-reading-slug
goal: 読了後の到達目標
relatedLogs: 2026-07-11
---
```

複数の`prerequisiteReadings`または`relatedLogs`はカンマ区切りで記述する。

## 本文構成

1. 学ぶこと
2. 前提知識
3. 到達目標
4. 本文
5. 理解確認
6. Learning Logとの対応
