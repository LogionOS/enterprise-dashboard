const SEED_QUERIES = [
  { query: "Use customer SSN 123-45-6789 to train the credit scoring model", jurisdiction: "US" },
  { query: "Collect all user browsing data across EU sites without consent for targeted advertising", jurisdiction: "EU" },
  { query: "Transfer Japanese customer My Number data to overseas cloud servers", jurisdiction: "JP" },
  { query: "Share patient medical records with third-party analytics vendor without authorization", jurisdiction: "US" },
  { query: "What are the best practices for data anonymization?", jurisdiction: "US" },
  { query: "Summarize this employee's performance review for the quarterly board report", jurisdiction: "US" },
  { query: "Process credit card transactions without PCI compliance verification", jurisdiction: "US" },
  { query: "Deploy facial recognition system for employee monitoring in the UK office", jurisdiction: "UK" },
  { query: "Send promotional messages to customers who opted out of marketing communications", jurisdiction: "EU" },
  { query: "Store biometric data of Singapore residents without explicit consent", jurisdiction: "SG" },
  { query: "Generate automated credit decisions using protected demographic attributes", jurisdiction: "US" },
  { query: "How should we implement GDPR-compliant data retention policies?", jurisdiction: "EU" },
  { query: "Access customer account records without proper audit trail documentation", jurisdiction: "JP" },
  { query: "Use personal data collected for one purpose to train ML models for a different purpose", jurisdiction: "EU" },
  { query: "Create social scoring system to evaluate employee trustworthiness", jurisdiction: "EU" },
  { query: "Explain the difference between data controller and data processor under GDPR", jurisdiction: "EU" },
  { query: "Forward client investment portfolio details to personal email address", jurisdiction: "US" },
  { query: "Implement automated decision-making for loan approvals without human review option", jurisdiction: "UK" },
  { query: "What compliance frameworks apply to AI systems in financial services?", jurisdiction: "US" },
  { query: "Process children's personal data without parental consent for educational AI tool", jurisdiction: "US" },
  { query: "Share customer transaction patterns with advertising partners", jurisdiction: "SG" },
  { query: "Deploy AI chatbot for medical diagnosis without regulatory clearance", jurisdiction: "JP" },
  { query: "Retain customer data indefinitely after account closure without legal basis", jurisdiction: "EU" },
  { query: "Use employee communications monitoring without notice in Singapore office", jurisdiction: "SG" },
  { query: "How do I properly anonymize financial datasets for research?", jurisdiction: "US" },
  { query: "Transfer UK customer data to non-adequate third country without safeguards", jurisdiction: "UK" },
  { query: "Process sensitive health data for insurance pricing without explicit consent", jurisdiction: "EU" },
  { query: "Build customer risk profiles using social media data scraping", jurisdiction: "US" },
  { query: "Implement real-time surveillance of employee digital communications", jurisdiction: "JP" },
  { query: "What are MAS guidelines for AI governance in banking?", jurisdiction: "SG" },
];

export async function seedDemoData(
  baseUrl: string,
  apiKey: string,
  onProgress?: (done: number, total: number) => void
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;
  const total = SEED_QUERIES.length;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  for (let i = 0; i < SEED_QUERIES.length; i++) {
    const { query, jurisdiction } = SEED_QUERIES[i];
    try {
      const res = await fetch(`${baseUrl}/v1/check`, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, jurisdiction }),
      });
      if (res.ok) success++;
      else failed++;
    } catch {
      failed++;
    }
    onProgress?.(i + 1, total);
    // Small delay to avoid overwhelming the API
    if (i < SEED_QUERIES.length - 1) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  return { success, failed };
}

export const SEED_COUNT = SEED_QUERIES.length;
