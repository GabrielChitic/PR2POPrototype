import type { IntentClassification, IntentType, ConfidenceLevel } from "../types";

// ============================================================================
// INTENT CLASSIFICATION SERVICE
// ============================================================================

interface IntentPattern {
  type: IntentType;
  patterns: RegExp[];
  keywords: string[];
  weight: number;
}

const INTENT_PATTERNS: IntentPattern[] = [
  // Status queries
  {
    type: "status_query",
    patterns: [/where is pr[-\s]?\d+/i, /status of pr[-\s]?\d+/i, /show me pr[-\s]?\d+/i],
    keywords: ["where", "status", "show", "pr-", "pr"],
    weight: 1.0,
  },
  // List queries
  {
    type: "list_query",
    patterns: [
      /show all.*pr/i,
      /list.*pr/i,
      /show.*last.*pr/i,
      /my pr/i,
      /all pr/i,
    ],
    keywords: ["show all", "list", "all prs", "my prs", "last"],
    weight: 1.0,
  },
  // Needs sourcing (RFP, RFQ, tender)
  {
    type: "needs_sourcing",
    patterns: [/rfp|rfq|tender|proposal|bid/i, /new (supplier|vendor)/i],
    keywords: ["rfp", "rfq", "tender", "proposal", "bid", "new supplier", "new vendor"],
    weight: 0.9,
  },
  // Contract call-off
  {
    type: "contract_call_off",
    patterns: [/renew|retainer|contract|call[-\s]?off/i],
    keywords: ["renew", "retainer", "contract", "call-off", "existing contract"],
    weight: 0.8,
  },
  // Services/SOW
  {
    type: "services_sow",
    patterns: [/sow|statement of work|consulting|implementation|services/i],
    keywords: [
      "sow",
      "statement of work",
      "consulting",
      "implementation",
      "professional services",
      "agency",
    ],
    weight: 0.7,
  },
  // Catalog purchase (catch-all for buying physical items)
  {
    type: "catalog_purchase",
    patterns: [
      /\b(need|buy|purchase|order)\b.*\b\d+\b/i,
      /laptop|monitor|keyboard|mouse|hardware|chair|desk|office/i,
    ],
    keywords: [
      "need",
      "buy",
      "purchase",
      "order",
      "laptop",
      "monitor",
      "hardware",
      "chair",
      "desk",
      "office",
    ],
    weight: 0.6,
  },
];

function calculateConfidence(score: number): {
  level: ConfidenceLevel;
  score: number;
} {
  if (score >= 0.7) return { level: "high", score };
  if (score >= 0.4) return { level: "medium", score };
  return { level: "low", score };
}

export function classifyIntent(message: string): IntentClassification {
  const messageLower = message.toLowerCase();
  const reasoning: string[] = [];
  let bestMatch: {
    type: IntentType;
    score: number;
    matches: string[];
  } = {
    type: "unknown",
    score: 0,
    matches: [],
  };

  // Check each intent pattern
  for (const intentPattern of INTENT_PATTERNS) {
    let score = 0;
    const matches: string[] = [];

    // Check regex patterns (high weight)
    for (const pattern of intentPattern.patterns) {
      if (pattern.test(message)) {
        score += 0.5 * intentPattern.weight;
        matches.push(`Matched pattern: ${pattern.source}`);
      }
    }

    // Check keywords (medium weight)
    for (const keyword of intentPattern.keywords) {
      if (messageLower.includes(keyword.toLowerCase())) {
        score += 0.1 * intentPattern.weight;
        matches.push(`Found keyword: "${keyword}"`);
      }
    }

    // Track best match
    if (score > bestMatch.score) {
      bestMatch = {
        type: intentPattern.type,
        score,
        matches,
      };
    }
  }

  // Build reasoning
  if (bestMatch.matches.length > 0) {
    reasoning.push(`Detected as ${bestMatch.type.replace(/_/g, " ")}`);
    reasoning.push(...bestMatch.matches.slice(0, 3)); // Top 3 matches
  } else {
    reasoning.push("Could not determine intent from message");
  }

  const confidence = calculateConfidence(bestMatch.score);
  const needsHumanReview =
    confidence.level === "low" || bestMatch.type === "unknown";

  if (needsHumanReview) {
    reasoning.push("⚠️ Low confidence - human review recommended");
  }

  return {
    type: bestMatch.type,
    confidence: confidence.level,
    confidenceScore: confidence.score,
    needsHumanReview,
    reasoning,
  };
}

// Helper function to check if message is a query (vs. a create request)
export function isQueryIntent(intentType: IntentType): boolean {
  return intentType === "status_query" || intentType === "list_query";
}
