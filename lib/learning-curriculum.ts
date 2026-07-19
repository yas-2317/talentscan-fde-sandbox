export const curriculumPhaseIds = [
  "foundation",
  "implementation",
  "fde-practice",
] as const;

export type CurriculumPhaseId = (typeof curriculumPhaseIds)[number];

export type CurriculumLesson = {
  slug: string;
  title: string;
};

export type CurriculumChapter = {
  week: number;
  phase: CurriculumPhaseId;
  title: string;
  purpose: string;
  target: string;
  lessons: CurriculumLesson[];
  topics: string[];
};

export type CurriculumPhase = {
  id: CurriculumPhaseId;
  order: number;
  label: string;
  shortLabel: string;
  duration: string;
  purpose: string;
  weeks: readonly number[];
};

export type CurriculumCrossCuttingTheme = {
  id: string;
  title: string;
  description: string;
  practices: string[];
};

export type CurriculumReference = {
  slug?: string;
  title: string;
  description: string;
  category: string;
  href: string;
};

export const curriculumPhases: CurriculumPhase[] = [
  {
    id: "foundation",
    order: 1,
    label: "基礎理解",
    shortLabel: "基礎",
    duration: "1〜2週間",
    purpose: "Webアプリの構造と、コードが動く土台を説明できる。",
    weeks: [1, 2],
  },
  {
    id: "implementation",
    order: 2,
    label: "候補者管理アプリ実装",
    shortLabel: "実装",
    duration: "5週間",
    purpose: "候補者管理の機能を、画面・API・DBまで縦につないで実装できる。",
    weeks: [3, 4, 5, 6, 7],
  },
  {
    id: "fde-practice",
    order: 3,
    label: "FDEデリバリー",
    shortLabel: "FDE",
    duration: "5週間",
    purpose: "要件から設計・実装・デプロイ・運用まで顧客と進められる。",
    weeks: [8, 9, 10, 11, 12],
  },
];

export const curriculumChapters: CurriculumChapter[] = [
  {
    week: 1,
    phase: "foundation",
    title: "Webアプリ全体像",
    purpose: "画面の裏側にある構成要素とデータの流れをつかむ。",
    target: "ユーザー操作から画面表示まで、各要素の責務を説明できる。",
    lessons: [
      { slug: "web-system-overview", title: "システム全体像" },
      { slug: "browser-and-server-components", title: "ブラウザとサーバー" },
      { slug: "url-http-and-network-tab", title: "URL・HTTP・リクエスト／レスポンス" },
      { slug: "frontend-and-backend", title: "フロントエンドとバックエンド" },
      { slug: "api-json-and-webhooks", title: "APIとJSON" },
      { slug: "database-and-persistence", title: "DBと永続化" },
      { slug: "talentscan-architecture", title: "TalentScanの構造分解" },
    ],
    topics: [],
  },
  {
    week: 2,
    phase: "foundation",
    title: "開発環境とコード読解",
    purpose: "OS・プロセス・ファイル構造を理解し、コードが動く場所を追えるようにする。",
    target: "ターミナルで開発環境を確認し、画面・API・処理があるファイルを探せる。",
    lessons: [
      { slug: "os-terminal-processes", title: "OS・ターミナル・プロセス" },
      { slug: "project-files-and-imports", title: "ファイルとディレクトリ" },
      { slug: "javascript-typescript-basics", title: "JavaScript／TypeScript基礎" },
      { slug: "react-basics", title: "React基礎" },
      { slug: "nextjs-code-reading", title: "Next.js基礎" },
    ],
    topics: [],
  },
  {
    week: 3,
    phase: "implementation",
    title: "候補者一覧を縦に実装",
    purpose: "候補者一覧を題材に、DB・API・画面を一つの流れとしてつなぐ。",
    target: "一覧取得のデータフローを説明し、表示と例外処理まで実装できる。",
    lessons: [],
    topics: ["一覧要件・データモデル", "取得API・query", "React component・state", "loading・error・test"],
  },
  {
    week: 4,
    phase: "implementation",
    title: "候補者詳細・編集を縦に実装",
    purpose: "候補者詳細の取得と編集を、画面からDB更新まで通して作る。",
    target: "入力を検証し、安全に更新して結果を画面へ返せる。",
    lessons: [],
    topics: ["動的route・詳細取得", "form・event管理", "入力検証・更新API", "認証・status code・error handling"],
  },
  {
    week: 5,
    phase: "implementation",
    title: "面接回答・評価準備を縦に実装",
    purpose: "面接回答と評価ステータスを、業務データとして保存できる形にする。",
    target: "回答入力から保存、評価待ち状態までの一連の処理を実装できる。",
    lessons: [],
    topics: ["回答・面接データモデル", "1対多・migration", "入力・保存API", "評価status・取得・test"],
  },
  {
    week: 6,
    phase: "implementation",
    title: "AI評価生成・保存を縦に実装",
    purpose: "AI推論を評価処理へ組み込み、検証可能な業務データとして保存する。",
    target: "AI評価を生成し、検証・保存・再利用できる。",
    lessons: [],
    topics: ["AWS SDK・Bedrock Runtime", "prompt・構造化出力", "JSON parse・DB保存", "timeout・retry・error handling"],
  },
  {
    week: 7,
    phase: "implementation",
    title: "ATS連携と権限境界を縦に実装",
    purpose: "外部ATSとのデータ連携と、利用者・組織ごとの安全な境界を作る。",
    target: "連携の失敗や再送を考慮し、誰が何を実行・閲覧できるか実装できる。",
    lessons: [],
    topics: ["API・Webhook・認証", "idempotency・retry", "user・organization・認可", "API key・監査log・data access control"],
  },
  {
    week: 8,
    phase: "fde-practice",
    title: "要件定義",
    purpose: "顧客の言葉から業務とシステムの要件を取り出す。",
    target: "利用者、入出力、業務ルール、例外、非機能要件を整理できる。",
    lessons: [],
    topics: ["現行業務・課題・利用者・use case", "入力・出力・業務ルール・例外", "非機能要件・制約", "FDEとして確認する問い"],
  },
  {
    week: 9,
    phase: "fde-practice",
    title: "業務・システム設計",
    purpose: "現行業務を分解し、AIを含む将来業務とシステムの境界を設計する。",
    target: "人・AI・システムの役割と、画面・API・DB・連携の設計を説明できる。",
    lessons: [],
    topics: ["現行業務・ボトルネック分析", "AI BPR・将来業務・人の判断", "画面・API・DB設計", "data flow・権限・外部連携"],
  },
  {
    week: 10,
    phase: "fde-practice",
    title: "顧客別実装・検証",
    purpose: "設計を小さな実装へ落とし、顧客と早く検証して修正する。",
    target: "設定とコード変更を判断し、受け入れ条件に沿って機能を検証できる。",
    lessons: [],
    topics: ["AI BPR prototype・業務検証", "共通機能・個社設定・code変更", "ATS・評価基準・通知", "受け入れ条件・test・feedback"],
  },
  {
    week: 11,
    phase: "fde-practice",
    title: "デプロイ・導入",
    purpose: "検証済みの変更を安全に本番へ届け、利用開始まで伴走する。",
    target: "変更を本番へ反映し、移行・教育・障害時対応を含む導入計画を実行できる。",
    lessons: [],
    topics: ["AI BPR rollout・定着支援", "data migration・環境変数", "Git・Pull Request・Vercel", "利用者教育・release・rollback"],
  },
  {
    week: 12,
    phase: "fde-practice",
    title: "運用・改善",
    purpose: "本番データと利用者の声から、業務とシステムを継続的に改善する。",
    target: "障害対応と効果測定を行い、次の改善を要件へ戻せる。",
    lessons: [],
    topics: ["monitoring・log・alert", "incident・復旧・再発防止", "業務KPI・AI品質・利用状況", "feedback・改善backlog・総合振り返り"],
  },
];

export const curriculumCrossCuttingThemes: CurriculumCrossCuttingTheme[] = [
  {
    id: "git-delivery",
    title: "Git・デリバリー",
    description: "各Weekの成果を、小さく安全に共有して戻せる状態にする。",
    practices: ["branch・commit", "Pull Request・review", "build・release evidence"],
  },
  {
    id: "security",
    title: "セキュリティ",
    description: "機能ごとに秘密情報、本人確認、権限、データ境界を確認する。",
    practices: ["secret・環境変数", "認証・認可", "入力検証・data access"],
  },
  {
    id: "debugging",
    title: "デバッグ・可観測性",
    description: "再現条件と証拠を集め、仮説を検証して復旧まで記録する。",
    practices: ["再現・切り分け", "Network・log・error", "復旧・再発防止"],
  },
];

export const curriculumReferences: CurriculumReference[] = [
  {
    slug: "markdown-learning-hub-and-pull-request",
    title: "Git・GitHub・Pull Request",
    description: "教材追加を例に、変更を安全に共有する手順を確認する。",
    category: "Git・デリバリー",
    href: "/learning/readings/markdown-learning-hub-and-pull-request",
  },
  {
    slug: "development-to-deployment",
    title: "ローカル・build・Vercel",
    description: "ローカルの変更が本番へ届くまでの境界と確認方法を整理する。",
    category: "Git・デリバリー",
    href: "/learning/readings/development-to-deployment",
  },
  {
    title: "実践トラブルシューティングログ",
    description: "実際の症状、原因、証拠、復旧手順を横断的に参照する。",
    category: "デバッグ・可観測性",
    href: "/learning/troubleshooting",
  },
];

export function isCurriculumPhaseId(value: string): value is CurriculumPhaseId {
  return curriculumPhaseIds.includes(value as CurriculumPhaseId);
}

export function getCurriculumPhase(id: CurriculumPhaseId) {
  return curriculumPhases.find((phase) => phase.id === id) ?? curriculumPhases[0];
}

export function getCurriculumChapter(week: number) {
  return curriculumChapters.find((chapter) => chapter.week === week);
}

export function getCurriculumLesson(slug: string) {
  for (const chapter of curriculumChapters) {
    const lessonIndex = chapter.lessons.findIndex((lesson) => lesson.slug === slug);
    if (lessonIndex !== -1) {
      return { chapter, lesson: chapter.lessons[lessonIndex], lessonNumber: lessonIndex + 1 };
    }
  }
  return null;
}

export function getCurriculumReference(slug: string) {
  return curriculumReferences.find((reference) => reference.slug === slug) ?? null;
}

export const curriculumLessons = curriculumChapters.flatMap((chapter) =>
  chapter.lessons.map((lesson, index) => ({
    ...lesson,
    week: chapter.week,
    phase: chapter.phase,
    lessonNumber: index + 1,
  })),
);
