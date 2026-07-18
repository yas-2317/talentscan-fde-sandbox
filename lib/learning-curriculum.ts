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

export const curriculumPhases: CurriculumPhase[] = [
  {
    id: "foundation",
    order: 1,
    label: "基礎構造",
    shortLabel: "基礎",
    duration: "1〜2週間",
    purpose: "Webアプリの裏側で何が起きているか説明できる。",
    weeks: [1, 2],
  },
  {
    id: "implementation",
    order: 2,
    label: "技術要素の実装",
    shortLabel: "実装",
    duration: "4〜6週間",
    purpose: "フロント・API・DB・AI連携を自分で変更できる。",
    weeks: [3, 4, 5, 6, 7, 8],
  },
  {
    id: "fde-practice",
    order: 3,
    label: "FDE実践",
    shortLabel: "FDE",
    duration: "4〜6週間",
    purpose: "顧客要件をシステム設計・実装へ変換できる。",
    weeks: [9, 10, 11, 12],
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
    title: "コードを読むための基礎",
    purpose: "実装前に、コードがどこで何をしているか追えるようにする。",
    target: "既存コードを読み、画面・API・処理があるファイルを探せる。",
    lessons: [
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
    title: "フロントエンド",
    purpose: "TalentScanの候補者画面を題材にReactの画面実装を学ぶ。",
    target: "既存画面の項目追加や表示変更を自分で行える。",
    lessons: [],
    topics: ["候補者一覧・詳細画面", "component・props・state", "event・form管理", "loading・error表示"],
  },
  {
    week: 4,
    phase: "implementation",
    title: "APIとバックエンド",
    purpose: "フロントエンドから呼べる候補者・評価APIを実装する。",
    target: "APIを呼び、入力を検証し、結果を画面へ返せる。",
    lessons: [],
    topics: ["GET・POST", "request body・path・query parameter", "入力検証", "status code・error handling"],
  },
  {
    week: 5,
    phase: "implementation",
    title: "DBとSQL",
    purpose: "TalentScanの業務データを関係として設計し、操作する。",
    target: "必要なデータを設計し、保存・取得できる。",
    lessons: [],
    topics: ["table設計・主キー・外部キー", "1対多", "SELECT・INSERT・UPDATE・DELETE・JOIN", "migration"],
  },
  {
    week: 6,
    phase: "implementation",
    title: "AI・Bedrock連携",
    purpose: "AI推論をTalentScanのバックエンド処理へ組み込む。",
    target: "AI評価を生成し、検証・保存・再利用できる。",
    lessons: [],
    topics: ["AWS SDK・Bedrock Runtime", "prompt・構造化出力", "JSON parse・DB保存", "timeout・retry・error handling"],
  },
  {
    week: 7,
    phase: "implementation",
    title: "認証とセキュリティ",
    purpose: "利用者と組織ごとに安全なデータ境界を作る。",
    target: "誰が何を実行・閲覧できるかを実装へ落とせる。",
    lessons: [],
    topics: ["login・session・Cookie", "認証・認可", "user・organization・data access control", "API key・環境変数・入力検証"],
  },
  {
    week: 8,
    phase: "implementation",
    title: "デプロイと運用",
    purpose: "変更を安全に共有し、本番へ反映して調査できるようにする。",
    target: "GitHub経由で本番へ反映し、ログからエラーを調査できる。",
    lessons: [
      { slug: "markdown-learning-hub-and-pull-request", title: "Git・GitHub・Pull Request" },
      { slug: "development-to-deployment", title: "ローカル・build・Vercel" },
    ],
    topics: ["branch・commit・push・Pull Request", "Vercel・本番環境・環境変数", "log・error調査"],
  },
  {
    week: 9,
    phase: "fde-practice",
    title: "要件定義",
    purpose: "顧客の言葉から業務とシステムの要件を取り出す。",
    target: "利用者、入出力、業務ルール、例外、非機能要件を整理できる。",
    lessons: [],
    topics: ["現行業務・課題・利用者・use case", "入力・出力・業務ルール・例外", "非機能要件", "FDEとして確認する問い"],
  },
  {
    week: 10,
    phase: "fde-practice",
    title: "システム設計",
    purpose: "要件を画面、API、DB、連携、運用へ分解する。",
    target: "構成図、データフロー、API、DB、画面の設計成果物を作れる。",
    lessons: [],
    topics: ["画面・API・DB設計", "data flow・外部連携", "権限・error handling", "batch／real-time・API／Webhook"],
  },
  {
    week: 11,
    phase: "fde-practice",
    title: "顧客別カスタマイズ",
    purpose: "共通機能と個社要件を分離し、変更方法を判断する。",
    target: "設定、コード変更、外部連携、運用の境界を説明できる。",
    lessons: [],
    topics: ["個社要件と共通機能", "設定とコード変更", "ATS・評価基準・質問・通知", "API連携仕様・障害時運用"],
  },
  {
    week: 12,
    phase: "fde-practice",
    title: "FDE総合課題",
    purpose: "TalentScanの一機能を要件から本番反映まで通して作る。",
    target: "設計意図を説明しながら、Codexと実装・検証を進められる。",
    lessons: [],
    topics: ["要件整理・data flow・DB・API設計", "frontend・Bedrock実装", "error handling・test・GitHub反映", "設計意図の説明"],
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

export const curriculumLessons = curriculumChapters.flatMap((chapter) =>
  chapter.lessons.map((lesson, index) => ({
    ...lesson,
    week: chapter.week,
    phase: chapter.phase,
    lessonNumber: index + 1,
  })),
);
