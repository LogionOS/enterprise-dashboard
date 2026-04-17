"use client";

import { useState } from "react";
import {
  MessageSquareHeart,
  Send,
  CheckCircle2,
  Loader2,
  Bug,
  Lightbulb,
  Star,
} from "lucide-react";
import { api } from "@/lib/api";

type Tab = "feedback" | "story";

const NPS_LABELS = ["Not likely", "", "", "", "", "", "", "", "", "", "Very likely"];

export default function FeedbackPage() {
  const [activeTab, setActiveTab] = useState<Tab>("feedback");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
          <MessageSquareHeart className="w-7 h-7 text-indigo-400" />
          Feedback &amp; Stories
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Report issues or share your LogionOS journey with us.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-[#0d1117] border border-[#1e293b] rounded-xl p-1">
        <TabButton
          active={activeTab === "feedback"}
          icon={Bug}
          label="Product Feedback"
          onClick={() => setActiveTab("feedback")}
        />
        <TabButton
          active={activeTab === "story"}
          icon={Star}
          label="Share Your Story"
          onClick={() => setActiveTab("story")}
        />
      </div>

      {activeTab === "feedback" ? <ProductFeedbackForm /> : <TestimonialForm />}
    </div>
  );
}

function TabButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-[#161b22] text-gray-100 shadow-sm"
          : "text-gray-500 hover:text-gray-300"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

/* ── Product Feedback Tab ──────────────────────────────────────────── */

function ProductFeedbackForm() {
  const [form, setForm] = useState({
    request_id: "",
    feedback: "bug",
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitFeedback(form);
      setSubmitted(true);
    } catch {
      /* ignore */
    }
    setSubmitting(false);
  }

  if (submitted) {
    return <SuccessMessage message="Your feedback has been recorded. We review every submission." onReset={() => { setSubmitted(false); setForm({ request_id: "", feedback: "bug", comment: "" }); }} />;
  }

  const categories = [
    { value: "bug", label: "Bug Report", icon: Bug, color: "text-red-400" },
    { value: "feature", label: "Feature Request", icon: Lightbulb, color: "text-amber-400" },
    { value: "improvement", label: "Improvement", icon: Star, color: "text-blue-400" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Category</label>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setForm({ ...form, feedback: cat.value })}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${
                form.feedback === cat.value
                  ? "bg-indigo-500/10 border-indigo-500/40 text-gray-100"
                  : "bg-[#161b22] border-[#1e293b] text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              <cat.icon className={`w-5 h-5 ${cat.color}`} />
              <span className="text-xs font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <FormField
        label="Related Request ID (optional)"
        value={form.request_id}
        onChange={(v) => setForm({ ...form, request_id: v })}
        placeholder="req_abc123 (from audit logs)"
      />

      <FormTextarea
        label="Description"
        placeholder="Describe the issue or suggestion in detail…"
        value={form.comment}
        onChange={(v) => setForm({ ...form, comment: v })}
      />

      <button
        type="submit"
        disabled={submitting || !form.comment.trim()}
        className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-50"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Submit Feedback
      </button>
    </form>
  );
}

/* ── Share Your Story Tab ──────────────────────────────────────────── */

function TestimonialForm() {
  const [form, setForm] = useState({
    company: "",
    founder_name: "",
    email: "",
    what_helped: "",
    use_case: "",
    would_recommend: false,
    allow_case_study: false,
    allow_logo_use: false,
    nps_score: 8,
    additional_comments: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitTestimonial(form);
      setSubmitted(true);
    } catch {
      /* ignore */
    }
    setSubmitting(false);
  }

  if (submitted) {
    return <SuccessMessage message="Your story helps us build a better product and share our impact." onReset={() => { setSubmitted(false); setForm({ company: "", founder_name: "", email: "", what_helped: "", use_case: "", would_recommend: false, allow_case_study: false, allow_logo_use: false, nps_score: 8, additional_comments: "" }); }} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Company Name" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
        <FormField label="Your Name" value={form.founder_name} onChange={(v) => setForm({ ...form, founder_name: v })} />
        <FormField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" className="md:col-span-2" />
      </div>

      <FormTextarea
        label="What did LogionOS help you do?"
        placeholder="e.g., 'We were able to ship our AI product to a regulated industry 3 months faster…'"
        value={form.what_helped}
        onChange={(v) => setForm({ ...form, what_helped: v })}
      />

      <FormTextarea
        label="How are you using LogionOS? (Use case)"
        placeholder="e.g., 'We use the compliance API to check every prompt before it reaches our LLM in a healthcare setting…'"
        value={form.use_case}
        onChange={(v) => setForm({ ...form, use_case: v })}
      />

      {/* NPS */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          How likely are you to recommend LogionOS? (0-10)
        </label>
        <div className="flex gap-1">
          {Array.from({ length: 11 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setForm({ ...form, nps_score: i })}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                form.nps_score === i
                  ? i >= 9 ? "bg-emerald-500 text-white"
                  : i >= 7 ? "bg-indigo-500 text-white"
                  : i >= 5 ? "bg-amber-500 text-white"
                  : "bg-red-500 text-white"
                  : "bg-[#161b22] border border-[#1e293b] text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              {i}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-600">{NPS_LABELS[0]}</span>
          <span className="text-[10px] text-gray-600">{NPS_LABELS[10]}</span>
        </div>
      </div>

      {/* Permissions */}
      <div className="space-y-3 bg-[#161b22] border border-[#1e293b] rounded-xl p-5">
        <p className="text-sm font-medium text-gray-300 mb-2">Permissions</p>
        <Checkbox
          label="I would recommend LogionOS to other founders"
          checked={form.would_recommend}
          onChange={(v) => setForm({ ...form, would_recommend: v })}
        />
        <Checkbox
          label="LogionOS may contact me for a case study / deeper interview"
          checked={form.allow_case_study}
          onChange={(v) => setForm({ ...form, allow_case_study: v })}
        />
        <Checkbox
          label="LogionOS may use our company logo in marketing materials"
          checked={form.allow_logo_use}
          onChange={(v) => setForm({ ...form, allow_logo_use: v })}
        />
      </div>

      <FormTextarea
        label="Anything else you'd like to share?"
        placeholder="Feature requests, pain points, things you love…"
        value={form.additional_comments}
        onChange={(v) => setForm({ ...form, additional_comments: v })}
      />

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-50"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Share Your Story
      </button>
    </form>
  );
}

/* ── Shared Components ────────────────────────────────────────────── */

function SuccessMessage({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <div className="py-20 text-center space-y-4">
      <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
      <h2 className="text-2xl font-bold text-gray-100">Thank you!</h2>
      <p className="text-gray-400">{message}</p>
      <button onClick={onReset} className="mt-4 text-sm text-indigo-400 hover:text-indigo-300">
        Submit another
      </button>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  className = "",
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
  placeholder?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#161b22] border border-[#1e293b] rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
      />
    </div>
  );
}

function FormTextarea({
  label,
  value,
  onChange,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-[#161b22] border border-[#1e293b] rounded-lg px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 resize-y"
      />
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-[#1e293b] bg-[#0d1117] text-indigo-500 focus:ring-indigo-500/30 focus:ring-offset-0"
      />
      <span className="text-sm text-gray-400 group-hover:text-gray-300">{label}</span>
    </label>
  );
}
