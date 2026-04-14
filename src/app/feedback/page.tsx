"use client";

import { useState } from "react";
import { MessageSquareHeart, Send, CheckCircle2, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const NPS_LABELS = ["Not likely", "", "", "", "", "", "", "", "", "", "Very likely"];

export default function FeedbackPage() {
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
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
        <h1 className="text-2xl font-bold text-gray-100">Thank you!</h1>
        <p className="text-gray-400">
          Your feedback helps us build a better product and tells our story to the world.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ company: "", founder_name: "", email: "", what_helped: "", use_case: "", would_recommend: false, allow_case_study: false, allow_logo_use: false, nps_score: 8, additional_comments: "" }); }}
          className="mt-4 text-sm text-indigo-400 hover:text-indigo-300"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
          <MessageSquareHeart className="w-7 h-7 text-indigo-400" />
          Share Your Experience
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Help us improve LogionOS and share your story with the community.
          Your feedback may be used (with permission) in case studies and marketing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Company Name" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
          <FormField label="Your Name" value={form.founder_name} onChange={(v) => setForm({ ...form, founder_name: v })} />
          <FormField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" className="md:col-span-2" />
        </div>

        {/* Core questions */}
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

        {/* Additional */}
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
          Submit Feedback
        </button>
      </form>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
