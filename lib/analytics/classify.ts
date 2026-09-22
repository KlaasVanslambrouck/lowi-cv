export type AutomationType = "human_candidate" | "search_engine" | "ai_training" | "ai_search" | "ai_user_fetch" | "social_preview" | "automation" | "unknown";
export type Confidence = "verified" | "declared" | "inferred";
export type Provider = "openai" | "anthropic" | "perplexity" | "google" | "microsoft" | "meta" | "other" | null;
export interface Classification {
  automation_type: AutomationType;
  provider: Provider;
  confidence: Confidence;
  evidence: string;
}

// UA tokens are declarations, never proof. Order specific agents before generic bots.
const rules: readonly [RegExp, AutomationType, Provider, string][] = [
  [/\bChatGPT-User\b/i, "ai_user_fetch", "openai", "ChatGPT-User"],
  [/\bOAI-SearchBot\b/i, "ai_search", "openai", "OAI-SearchBot"],
  [/\bGPTBot\b/i, "ai_training", "openai", "GPTBot"],
  [/\bClaude-User\b/i, "ai_user_fetch", "anthropic", "Claude-User"],
  [/\bClaude-SearchBot\b/i, "ai_search", "anthropic", "Claude-SearchBot"],
  [/\bClaudeBot\b/i, "ai_training", "anthropic", "ClaudeBot"],
  [/\bPerplexity-User\b/i, "ai_user_fetch", "perplexity", "Perplexity-User"],
  [/\bPerplexityBot\b/i, "ai_search", "perplexity", "PerplexityBot"],
  [/\bGooglebot(?:-\w+)?\b|\bGoogle-InspectionTool\b/i, "search_engine", "google", "Googlebot"],
  [/\bbingbot\b|\bBingPreview\b/i, "search_engine", "microsoft", "Bingbot"],
  [/\bDuckDuckBot\b|\bApplebot\b|\bYandexBot\b|\bBaiduspider\b/i, "search_engine", "other", "search-crawler"],
  [/\bfacebookexternalhit\b|\bFacebot\b|\bmeta-externalfetcher\b/i, "social_preview", "meta", "meta-preview"],
  [/\bmeta-externalagent\b/i, "ai_training", "meta", "meta-externalagent"],
  [/\bTwitterbot\b|\bLinkedInBot\b|\bSlackbot(?:-LinkExpanding)?\b|\bDiscordbot\b|\bTelegramBot\b|\bWhatsApp\b/i, "social_preview", "other", "link-preview"],
];

export function classifyUserAgent(userAgent: string | null, webdriver = false): Classification {
  const ua = (userAgent ?? "").slice(0, 2048);
  for (const [pattern, automation_type, provider, token] of rules) {
    if (pattern.test(ua)) return { automation_type, provider, confidence: "declared", evidence: `ua:${token}` };
  }
  if (webdriver || /HeadlessChrome|Playwright|Puppeteer|Selenium|PhantomJS/i.test(ua)) {
    return { automation_type: "automation", provider: null, confidence: "inferred", evidence: webdriver ? "client:webdriver" : "ua:headless" };
  }
  if (/bot\b|crawler|spider|curl\/|wget\/|python-requests|httpx\//i.test(ua)) {
    return { automation_type: "automation", provider: "other", confidence: "inferred", evidence: "ua:automation-pattern" };
  }
  return { automation_type: /Mozilla\/5\.0/.test(ua) ? "human_candidate" : "unknown", provider: null, confidence: "inferred", evidence: ua ? "ua:unverified" : "ua:missing" };
}
