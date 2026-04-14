"use client";

import { useState, type ReactNode } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Globe,
  Code,
  Key,
  HelpCircle,
  Rocket,
} from "lucide-react";

type Lang = "en" | "cn" | "jp";

const LANG_LABELS: Record<Lang, string> = { en: "English", cn: "中文", jp: "日本語" };

const LANG_TABS: { id: Lang; short: string }[] = [
  { id: "en", short: "EN" },
  { id: "cn", short: "中文" },
  { id: "jp", short: "日本語" },
];

const API_TABLE_COLS: Record<Lang, { method: string; path: string; desc: string }> = {
  en: { method: "Method", path: "Path", desc: "Description" },
  cn: { method: "方法", path: "路径", desc: "说明" },
  jp: { method: "メソッド", path: "パス", desc: "説明" },
};

type ContentShape = {
  quickStart: { title: string; steps: { title: string; content: string }[] };
  apiRef: {
    title: string;
    intro: string;
    endpoints: { method: string; path: string; desc: string }[];
  };
  byok: { title: string; steps: { title: string; content: string }[] };
  faq: { title: string; items: { q: string; a: string }[] };
};

const CONTENT: Record<Lang, ContentShape> = {
  en: {
    quickStart: {
      title: "Quick Start Guide",
      steps: [
        {
          title: "1. Get Your API Key",
          content:
            "Log in to the Dashboard and navigate to API Keys page. Create a new key with 'developer' role. Copy and store it securely — it won't be shown again.",
        },
        {
          title: "2. Make Your First Check",
          content:
            "curl -X POST https://logionos-api.onrender.com/v1/check \\\n  -H 'Authorization: Bearer YOUR_KEY' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"query\": \"Deploy facial recognition system for employee monitoring\", \"jurisdiction\": \"EU\"}'",
        },
        {
          title: "3. View Results",
          content:
            "The response includes action (PASS/FLAG/BLOCK), risk_level, matched regulations, PII detection results, and AI judge reasoning. Check the Events page for audit trail.",
        },
        {
          title: "4. Set Up Policies",
          content:
            "Create custom compliance policies under Policies page. Policies are checked alongside regulatory rules during every compliance check.",
        },
        {
          title: "5. Configure Alerts",
          content:
            "Set up webhook notifications in Settings to receive real-time alerts when BLOCK or FLAG events occur.",
        },
      ],
    },
    apiRef: {
      title: "API Reference",
      intro:
        "Base URL: https://logionos-api.onrender.com — All endpoints require Bearer token authentication.",
      endpoints: [
        { method: "POST", path: "/v1/check", desc: "Run compliance check on AI query" },
        { method: "GET", path: "/v1/usage", desc: "Get current quota and usage" },
        { method: "GET", path: "/v1/usage/history", desc: "Usage history (days param)" },
        { method: "GET", path: "/v1/rules", desc: "List regulation rules" },
        { method: "GET", path: "/v1/analytics", desc: "Aggregated analytics" },
        { method: "GET", path: "/v1/audit", desc: "Query audit log" },
        { method: "POST/GET/PUT/DELETE", path: "/v1/policies", desc: "CRUD custom policies" },
        { method: "POST/GET/DELETE", path: "/v1/webhooks", desc: "Manage webhook alerts" },
        { method: "GET", path: "/v1/incidents", desc: "List compliance incidents" },
        { method: "POST/GET/DELETE", path: "/v1/settings/llm-keys", desc: "BYOK key management" },
        { method: "GET", path: "/v1/notifications", desc: "In-app notifications" },
        { method: "GET", path: "/v1/policy-packs", desc: "Pre-built policy packs" },
        { method: "GET", path: "/v1/traces", desc: "Agent workflow traces" },
        { method: "POST", path: "/v1/reports/generate", desc: "Generate compliance report" },
      ],
    },
    byok: {
      title: "BYOK (Bring Your Own Key) Guide",
      steps: [
        {
          title: "What is BYOK?",
          content:
            "BYOK lets you use your own LLM API key (OpenAI, Anthropic, etc.) for deep compliance analysis. Your key is encrypted at rest and only used for your checks.",
        },
        {
          title: "Supported Providers",
          content:
            "OpenAI (GPT-4o, GPT-4o-mini)\nAnthropic (Claude 3.5)\nDeepSeek\nGroq (Llama 3.1)",
        },
        {
          title: "Setup via API",
          content:
            "curl -X POST https://logionos-api.onrender.com/v1/settings/llm-keys \\\n  -H 'Authorization: Bearer YOUR_KEY' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"provider\": \"openai\", \"api_key\": \"sk-...\", \"model_override\": \"gpt-4o\"}'",
        },
        {
          title: "Setup via Dashboard",
          content:
            "Go to Quick Start page → BYOK Setup section. Select provider, paste your key, and click Save.",
        },
      ],
    },
    faq: {
      title: "Founder Program FAQ",
      items: [
        {
          q: "What's included in the free tier?",
          a: "5,000 API calls/month, 100 LLM deep checks, 10 custom policies, 3 webhooks, 3 API keys, and 90-day audit retention.",
        },
        {
          q: "How long does the free tier last?",
          a: "6 months from key activation. You'll receive notifications before expiry.",
        },
        {
          q: "What happens after the free period?",
          a: "You can upgrade to a paid plan or contact us for an extension. Your data is retained for 30 days after expiry.",
        },
        {
          q: "Can I use my own LLM API key?",
          a: "Yes! BYOK (Bring Your Own Key) is supported. Your LLM calls using BYOK don't count against the 100 LLM monthly limit.",
        },
        {
          q: "Is my data shared?",
          a: "No. Your compliance data is isolated per tenant. We only use aggregated, anonymized data for platform improvements.",
        },
        {
          q: "Which jurisdictions are supported?",
          a: "US, EU, JP, UK, SG, and HK — covering 4,004+ regulation rules across 6 jurisdictions.",
        },
      ],
    },
  },
  cn: {
    quickStart: {
      title: "快速入门指南",
      steps: [
        {
          title: "1. 获取 API Key",
          content:
            "登录 Dashboard，进入 API Keys 页面。创建 developer 角色的新密钥。复制并安全保存——密钥只显示一次。",
        },
        {
          title: "2. 执行首次合规检查",
          content:
            "curl -X POST https://logionos-api.onrender.com/v1/check \\\n  -H 'Authorization: Bearer YOUR_KEY' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"query\": \"部署面部识别系统用于员工监控\", \"jurisdiction\": \"EU\"}'",
        },
        {
          title: "3. 查看结果",
          content:
            "响应包含 action（PASS/FLAG/BLOCK）、risk_level、匹配的法规、PII 检测结果和 AI Judge 推理。在 Events 页面查看审计日志。",
        },
        {
          title: "4. 设置策略",
          content: "在 Policies 页面创建自定义合规策略。策略会在每次合规检查时与法规规则一起执行。",
        },
        {
          title: "5. 配置告警",
          content: "在 Settings 中设置 Webhook 通知，当发生 BLOCK 或 FLAG 事件时接收实时告警。",
        },
      ],
    },
    apiRef: {
      title: "API 参考",
      intro: "Base URL: https://logionos-api.onrender.com — 所有端点需要 Bearer token 认证。",
      endpoints: [
        { method: "POST", path: "/v1/check", desc: "对 AI 查询运行合规检查" },
        { method: "GET", path: "/v1/usage", desc: "获取当前配额与用量" },
        { method: "GET", path: "/v1/usage/history", desc: "用量历史（days 参数）" },
        { method: "GET", path: "/v1/rules", desc: "列出法规规则" },
        { method: "GET", path: "/v1/analytics", desc: "聚合分析数据" },
        { method: "GET", path: "/v1/audit", desc: "查询审计日志" },
        { method: "POST/GET/PUT/DELETE", path: "/v1/policies", desc: "自定义策略 CRUD" },
        { method: "POST/GET/DELETE", path: "/v1/webhooks", desc: "管理 Webhook 告警" },
        { method: "GET", path: "/v1/incidents", desc: "列出合规事件" },
        { method: "POST/GET/DELETE", path: "/v1/settings/llm-keys", desc: "BYOK 密钥管理" },
        { method: "GET", path: "/v1/notifications", desc: "应用内通知" },
        { method: "GET", path: "/v1/policy-packs", desc: "预构建策略包" },
        { method: "GET", path: "/v1/traces", desc: "Agent 工作流追踪" },
        { method: "POST", path: "/v1/reports/generate", desc: "生成合规报告" },
      ],
    },
    byok: {
      title: "BYOK（自带密钥）指南",
      steps: [
        {
          title: "什么是 BYOK？",
          content:
            "BYOK 允许你使用自己的 LLM API 密钥（OpenAI、Anthropic 等）进行深度合规分析。密钥在存储时加密，仅用于你的检查。",
        },
        {
          title: "支持的提供商",
          content:
            "OpenAI（GPT-4o、GPT-4o-mini）\nAnthropic（Claude 3.5）\nDeepSeek\nGroq（Llama 3.1）",
        },
        {
          title: "通过 API 配置",
          content:
            "curl -X POST https://logionos-api.onrender.com/v1/settings/llm-keys \\\n  -H 'Authorization: Bearer YOUR_KEY' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"provider\": \"openai\", \"api_key\": \"sk-...\", \"model_override\": \"gpt-4o\"}'",
        },
        {
          title: "通过 Dashboard 配置",
          content: "进入 Quick Start 页面 → BYOK 设置区域。选择提供商，粘贴密钥，点击保存。",
        },
      ],
    },
    faq: {
      title: "Founder Program 常见问题",
      items: [
        {
          q: "免费套餐包含什么？",
          a: "每月 5,000 次 API 调用、100 次 LLM 深度检查、10 个自定义策略、3 个 Webhook、3 个 API Key 和 90 天审计日志保留。",
        },
        { q: "免费期多长？", a: "从密钥激活起 6 个月。过期前会收到通知。" },
        {
          q: "免费期结束后怎么办？",
          a: "可以升级到付费套餐或联系我们申请延期。过期后数据保留 30 天。",
        },
        {
          q: "可以使用自己的 LLM API Key 吗？",
          a: "可以！支持 BYOK。使用 BYOK 的 LLM 调用不计入每月 100 次限额。",
        },
        {
          q: "我的数据会被共享吗？",
          a: "不会。你的合规数据按租户隔离。我们仅使用聚合、匿名化数据用于平台改进。",
        },
        {
          q: "支持哪些司法管辖区？",
          a: "美国、欧盟、日本、英国、新加坡和香港——覆盖 6 个司法管辖区的 4,004+ 条法规规则。",
        },
      ],
    },
  },
  jp: {
    quickStart: {
      title: "クイックスタートガイド",
      steps: [
        {
          title: "1. API Keyの取得",
          content:
            "Dashboardにログインし、API Keysページへ移動。developerロールの新しいキーを作成してください。コピーして安全に保管してください。キーは一度しか表示されません。",
        },
        {
          title: "2. 初回コンプライアンスチェック",
          content:
            "curl -X POST https://logionos-api.onrender.com/v1/check \\\n  -H 'Authorization: Bearer YOUR_KEY' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"query\": \"従業員監視のための顔認識システムを展開\", \"jurisdiction\": \"EU\"}'",
        },
        {
          title: "3. 結果の確認",
          content:
            "レスポンスにはaction（PASS/FLAG/BLOCK）、risk_level、マッチした規制、PII検出結果、AI Judgeの推論が含まれます。Eventsページで監査証跡を確認できます。",
        },
        {
          title: "4. ポリシーの設定",
          content:
            "PoliciesページでカスタムコンプライアンスポリシーをCRUDできます。ポリシーは各コンプライアンスチェック時に規制ルールと一緒に実行されます。",
        },
        {
          title: "5. アラートの設定",
          content:
            "SettingsでWebhook通知を設定し、BLOCKまたはFLAGイベント発生時にリアルタイムアラートを受け取ります。",
        },
      ],
    },
    apiRef: {
      title: "APIリファレンス",
      intro:
        "Base URL: https://logionos-api.onrender.com — すべてのエンドポイントにBearer token認証が必要です。",
      endpoints: [
        { method: "POST", path: "/v1/check", desc: "AIクエリのコンプライアンスチェック" },
        { method: "GET", path: "/v1/usage", desc: "現在のクォータと使用量" },
        { method: "GET", path: "/v1/usage/history", desc: "使用量履歴（daysパラメータ）" },
        { method: "GET", path: "/v1/rules", desc: "規制ルール一覧" },
        { method: "GET", path: "/v1/analytics", desc: "集計分析" },
        { method: "GET", path: "/v1/audit", desc: "監査ログの照会" },
        { method: "POST/GET/PUT/DELETE", path: "/v1/policies", desc: "カスタムポリシーCRUD" },
        { method: "POST/GET/DELETE", path: "/v1/webhooks", desc: "Webhookアラート管理" },
        { method: "GET", path: "/v1/incidents", desc: "コンプライアンスインシデント一覧" },
        { method: "POST/GET/DELETE", path: "/v1/settings/llm-keys", desc: "BYOKキー管理" },
        { method: "GET", path: "/v1/notifications", desc: "アプリ内通知" },
        { method: "GET", path: "/v1/policy-packs", desc: "プリビルトポリシーパック" },
        { method: "GET", path: "/v1/traces", desc: "Agentワークフロートレース" },
        { method: "POST", path: "/v1/reports/generate", desc: "コンプライアンスレポート生成" },
      ],
    },
    byok: {
      title: "BYOK（自分のキーを持ち込む）ガイド",
      steps: [
        {
          title: "BYOKとは？",
          content:
            "BYOKは、自分のLLM APIキー（OpenAI、Anthropicなど）を使用して深いコンプライアンス分析を行う機能です。キーは暗号化して保存され、あなたのチェックにのみ使用されます。",
        },
        {
          title: "対応プロバイダー",
          content:
            "OpenAI（GPT-4o、GPT-4o-mini）\nAnthropic（Claude 3.5）\nDeepSeek\nGroq（Llama 3.1）",
        },
        {
          title: "APIで設定",
          content:
            "curl -X POST https://logionos-api.onrender.com/v1/settings/llm-keys \\\n  -H 'Authorization: Bearer YOUR_KEY' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"provider\": \"openai\", \"api_key\": \"sk-...\", \"model_override\": \"gpt-4o\"}'",
        },
        {
          title: "Dashboardで設定",
          content:
            "Quick Startページ → BYOK設定セクションに移動。プロバイダーを選択し、キーを貼り付けて保存をクリックしてください。",
        },
      ],
    },
    faq: {
      title: "Founder Program よくある質問",
      items: [
        {
          q: "無料プランには何が含まれますか？",
          a: "月間5,000回のAPI呼び出し、100回のLLMディープチェック、10個のカスタムポリシー、3個のWebhook、3個のAPI Key、90日間の監査ログ保持。",
        },
        { q: "無料期間はどのくらい？", a: "キー有効化から6か月。期限前に通知が届きます。" },
        {
          q: "無料期間終了後は？",
          a: "有料プランにアップグレードするか、延長をご相談ください。期限後30日間データは保持されます。",
        },
        {
          q: "自分のLLM APIキーは使えますか？",
          a: "はい！BYOKに対応しています。BYOKを使用したLLM呼び出しは月100回の制限にカウントされません。",
        },
        {
          q: "データは共有されますか？",
          a: "いいえ。コンプライアンスデータはテナントごとに分離されています。集約・匿名化されたデータのみをプラットフォーム改善に使用します。",
        },
        {
          q: "どの法域に対応していますか？",
          a: "米国、EU、日本、英国、シンガポール、香港の6法域にまたがる4,004以上の規制ルールをカバーしています。",
        },
      ],
    },
  },
};

function methodBadgeClass(method: string): string {
  const m = method.toUpperCase();
  if (m.includes("POST")) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25";
  if (m.includes("GET")) return "bg-sky-500/15 text-sky-400 border-sky-500/25";
  if (m.includes("PUT")) return "bg-amber-500/15 text-amber-400 border-amber-500/25";
  if (m.includes("DELETE")) return "bg-rose-500/15 text-rose-400 border-rose-500/25";
  return "bg-violet-500/15 text-violet-300 border-violet-500/25";
}

function highlightShellLine(line: string): ReactNode {
  const out: ReactNode[] = [];
  const re =
    /'[^']*'|"[^"]*"|https?:\/\/[^\s'"]+|\b(?:curl|POST|GET|PUT|DELETE)\b|-[A-Za-z]/g;
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) {
      out.push(<span key={`t-${k++}`}>{line.slice(last, m.index)}</span>);
    }
    const token = m[0];
    let cls = "text-sky-300";
    if (token.startsWith("'") || token.startsWith('"')) cls = "text-emerald-400";
    else if (token.startsWith("http")) cls = "text-violet-400";
    else if (token === "curl") cls = "text-amber-400";
    else if (/^-/.test(token)) cls = "text-cyan-400";
    else if (["POST", "GET", "PUT", "DELETE"].includes(token)) cls = "text-orange-300";
    out.push(
      <span key={`t-${k++}`} className={cls}>
        {token}
      </span>,
    );
    last = m.index + token.length;
  }
  if (last < line.length) {
    out.push(<span key={`t-${k++}`}>{line.slice(last)}</span>);
  }
  return out.length ? out : line;
}

function CodeBlock({ code }: { code: string }) {
  const lines = code.split("\n");
  return (
    <pre className="mt-3 overflow-x-auto rounded-lg border border-[#1e293b] bg-[#050608] p-4 text-[12px] sm:text-[13px] leading-relaxed font-mono shadow-inner">
      <code className="text-gray-200">
        {lines.map((line, i) => (
          <span key={i} className="block whitespace-pre">
            {highlightShellLine(line)}
            {i < lines.length - 1 ? "\n" : null}
          </span>
        ))}
      </code>
    </pre>
  );
}

function isCurlBlock(content: string): boolean {
  return content.trimStart().startsWith("curl");
}

function isProviderList(content: string): boolean {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return false;
  return lines.every((l) => /^[A-Za-z]/.test(l) || /^[A-Za-z（]/.test(l));
}

function StepBody({ content }: { content: string }) {
  const t = content.trim();
  if (isCurlBlock(t)) {
    return <CodeBlock code={t} />;
  }
  if (isProviderList(content)) {
    const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
    return (
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-gray-300">
        {lines.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    );
  }
  return (
    <p className="mt-3 text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">{content}</p>
  );
}

type SectionId = "quickStart" | "apiRef" | "byok" | "faq";

function AccordionSection({
  id,
  title,
  icon: Icon,
  open,
  onToggle,
  children,
}: {
  id: SectionId;
  title: string;
  icon: typeof Rocket;
  open: boolean;
  onToggle: (id: SectionId) => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#1e293b] bg-[#111827]/80 overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.04]"
        aria-expanded={open}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <span className="flex-1 text-[15px] font-semibold text-gray-100">{title}</span>
        {open ? (
          <ChevronDown className="h-5 w-5 shrink-0 text-gray-500" />
        ) : (
          <ChevronRight className="h-5 w-5 shrink-0 text-gray-500" />
        )}
      </button>
      {open && <div className="border-t border-[#1e293b] px-4 py-4">{children}</div>}
    </div>
  );
}

export default function DocsPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [openSections, setOpenSections] = useState<Record<SectionId, boolean>>({
    quickStart: true,
    apiRef: false,
    byok: false,
    faq: false,
  });

  const c = CONTENT[lang];

  const toggleSection = (id: SectionId) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const docTitle =
    lang === "cn" ? "文档" : lang === "jp" ? "ドキュメント" : "Documentation";

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-400">
            <BookOpen className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Docs</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-50 sm:text-3xl">
            {docTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            {lang === "en" && "In-dashboard reference: quick start, API, BYOK, and Founder Program."}
            {lang === "cn" && "仪表板内参考：快速入门、API、BYOK 与 Founder Program。"}
            {lang === "jp" && "ダッシュボード内リファレンス：クイックスタート、API、BYOK、Founder Program。"}
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Globe className="h-3.5 w-3.5" />
            <span className="uppercase tracking-wide">Language</span>
          </div>
          <div className="inline-flex rounded-lg border border-[#1e293b] bg-[#0d1117] p-1">
            {LANG_TABS.map(({ id, short }) => (
              <button
                key={id}
                type="button"
                onClick={() => setLang(id)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  lang === id
                    ? "bg-indigo-500/20 text-indigo-300 shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                title={LANG_LABELS[id]}
              >
                {short}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <AccordionSection
          id="quickStart"
          title={c.quickStart.title}
          icon={Rocket}
          open={openSections.quickStart}
          onToggle={toggleSection}
        >
          <ol className="space-y-5">
            {c.quickStart.steps.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1e293b] text-xs font-bold text-indigo-300">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-100">{step.title}</h3>
                  <StepBody content={step.content} />
                </div>
              </li>
            ))}
          </ol>
        </AccordionSection>

        <AccordionSection
          id="apiRef"
          title={c.apiRef.title}
          icon={Code}
          open={openSections.apiRef}
          onToggle={toggleSection}
        >
          <p className="text-sm leading-relaxed text-gray-300">{c.apiRef.intro}</p>
          <div className="mt-4 overflow-x-auto rounded-lg border border-[#1e293b]">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr
                  className={`bg-[#0d1117] text-xs tracking-wide text-gray-500 ${
                    lang === "en" ? "uppercase" : ""
                  }`}
                >
                  <th className="border-b border-[#1e293b] px-3 py-2.5 font-medium">
                    {API_TABLE_COLS[lang].method}
                  </th>
                  <th className="border-b border-[#1e293b] px-3 py-2.5 font-medium">
                    {API_TABLE_COLS[lang].path}
                  </th>
                  <th className="border-b border-[#1e293b] px-3 py-2.5 font-medium">
                    {API_TABLE_COLS[lang].desc}
                  </th>
                </tr>
              </thead>
              <tbody>
                {c.apiRef.endpoints.map((row, i) => (
                  <tr
                    key={`${row.path}-${i}`}
                    className="border-b border-[#1e293b]/80 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="align-top px-3 py-2.5">
                      <span
                        className={`inline-flex rounded border px-2 py-0.5 font-mono text-[11px] font-semibold ${methodBadgeClass(row.method)}`}
                      >
                        {row.method}
                      </span>
                    </td>
                    <td className="align-top px-3 py-2.5 font-mono text-[12px] text-sky-300/90">
                      {row.path}
                    </td>
                    <td className="align-top px-3 py-2.5 text-gray-300">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AccordionSection>

        <AccordionSection
          id="byok"
          title={c.byok.title}
          icon={Key}
          open={openSections.byok}
          onToggle={toggleSection}
        >
          <div className="space-y-6">
            {c.byok.steps.map((step, idx) => (
              <div key={idx}>
                <h3 className="text-sm font-semibold text-gray-100">{step.title}</h3>
                <StepBody content={step.content} />
              </div>
            ))}
          </div>
        </AccordionSection>

        <AccordionSection
          id="faq"
          title={c.faq.title}
          icon={HelpCircle}
          open={openSections.faq}
          onToggle={toggleSection}
        >
          <dl className="space-y-5">
            {c.faq.items.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-[#1e293b] bg-[#0d1117]/60 p-4">
                <dt className="text-sm font-semibold text-gray-100">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-gray-300">{item.a}</dd>
              </div>
            ))}
          </dl>
        </AccordionSection>
      </div>
    </div>
  );
}
