import type { ContextInference, Category, UrgencyLevel, Persona } from "../types";

// ============================================================================
// CONTEXT INFERENCE SERVICE
// ============================================================================

interface CategoryPattern {
  category: Category;
  keywords: string[];
  patterns: RegExp[];
}

const CATEGORY_PATTERNS: CategoryPattern[] = [
  {
    category: "IT Hardware",
    keywords: ["laptop", "monitor", "keyboard", "mouse", "hardware", "computer", "desktop", "server"],
    patterns: [/\d+\s*(laptop|monitor|computer|server)/i],
  },
  {
    category: "IT Software/SaaS",
    keywords: ["license", "subscription", "saas", "software", "platform", "tool", "app"],
    patterns: [/software|saas|license|subscription/i],
  },
  {
    category: "Marketing Services",
    keywords: ["campaign", "retainer", "agency", "marketing", "advertising", "promotion", "brand"],
    patterns: [/marketing|advertising|campaign|agency.*retainer/i],
  },
  {
    category: "Consulting Services",
    keywords: ["sow", "consulting", "consultant", "implementation", "advisory", "professional services"],
    patterns: [/consulting|consultant|sow|implementation|advisory/i],
  },
  {
    category: "Facilities & Office",
    keywords: ["chair", "desk", "office supplies", "furniture", "office", "supplies"],
    patterns: [/\d+\s*(chair|desk|office|furniture)/i, /office\s+supplies/i],
  },
  {
    category: "Legal Services",
    keywords: ["legal", "law", "attorney", "counsel"],
    patterns: [/legal|attorney|counsel/i],
  },
];

interface UrgencyPattern {
  level: UrgencyLevel;
  keywords: string[];
  patterns: RegExp[];
}

const URGENCY_PATTERNS: UrgencyPattern[] = [
  {
    level: "high",
    keywords: ["asap", "urgent", "immediately", "emergency", "critical"],
    patterns: [/asap|urgent|immediately|emergency|critical/i],
  },
  {
    level: "medium",
    keywords: ["soon", "next month", "q2", "q3", "q4", "quarter", "end of"],
    patterns: [
      /next\s+(month|quarter|week)/i,
      /by\s+end\s+of/i,
      /q[1-4]/i,
      /(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    ],
  },
];

function inferCategory(message: string): {
  category: Category;
  notes: string[];
} {
  const messageLower = message.toLowerCase();
  const notes: string[] = [];
  let bestMatch: { category: Category; score: number } = {
    category: "Unknown",
    score: 0,
  };

  for (const pattern of CATEGORY_PATTERNS) {
    let score = 0;

    // Check patterns (high weight)
    for (const regex of pattern.patterns) {
      if (regex.test(message)) {
        score += 2;
        notes.push(`Category "${pattern.category}" matched pattern`);
      }
    }

    // Check keywords (lower weight)
    for (const keyword of pattern.keywords) {
      if (messageLower.includes(keyword)) {
        score += 1;
        notes.push(`Found "${keyword}" → ${pattern.category}`);
      }
    }

    if (score > bestMatch.score) {
      bestMatch = { category: pattern.category, score };
    }
  }

  if (bestMatch.score === 0) {
    notes.push("Could not determine category - marked as Unknown");
  }

  return {
    category: bestMatch.category,
    notes: notes.slice(0, 3), // Top 3 notes
  };
}

function inferUrgency(message: string): {
  urgency: UrgencyLevel;
  neededBy: string;
  notes: string[];
} {
  const messageLower = message.toLowerCase();
  const notes: string[] = [];
  let urgency: UrgencyLevel = "low";
  let neededBy = "Not specified";

  // Check high urgency
  for (const pattern of URGENCY_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (messageLower.includes(keyword)) {
        urgency = pattern.level;
        notes.push(`Detected urgency "${pattern.level}" from keyword "${keyword}"`);

        // Try to extract specific timing
        if (messageLower.includes("asap")) {
          neededBy = "ASAP";
        } else if (messageLower.includes("next month")) {
          neededBy = "Next month";
        } else if (messageLower.includes("q2") || messageLower.includes("end of q2")) {
          neededBy = "End of Q2";
        } else if (messageLower.includes("q3")) {
          neededBy = "End of Q3";
        } else if (messageLower.includes("q4")) {
          neededBy = "End of Q4";
        }

        break;
      }
    }

    for (const regex of pattern.patterns) {
      if (regex.test(message)) {
        urgency = pattern.level;
        const match = message.match(regex);
        if (match) {
          neededBy = match[0];
          notes.push(`Extracted timing: "${neededBy}"`);
        }
        break;
      }
    }

    if (urgency !== "low") break;
  }

  if (urgency === "low") {
    notes.push("No urgency indicators found - defaulting to low urgency");
  }

  return { urgency, neededBy, notes };
}

function extractQuantity(message: string): { quantity: number; note?: string } {
  // Try to find numbers in the message
  const numberMatch = message.match(/\b(\d+)\b/);
  if (numberMatch) {
    const quantity = parseInt(numberMatch[1], 10);
    return {
      quantity,
      note: `Extracted quantity: ${quantity}`,
    };
  }
  return { quantity: 1, note: "No quantity specified - defaulting to 1" };
}

export function inferContext(
  message: string,
  persona: Persona
): ContextInference {
  const inferenceNotes: string[] = [];

  // Start with persona defaults
  inferenceNotes.push(`Using persona defaults: ${persona.entity}, ${persona.location}`);

  // Infer category
  const categoryResult = inferCategory(message);
  inferenceNotes.push(...categoryResult.notes);

  // Infer urgency and timing
  const urgencyResult = inferUrgency(message);
  inferenceNotes.push(...urgencyResult.notes);

  // Extract quantity (for reference)
  const quantityResult = extractQuantity(message);
  if (quantityResult.note) {
    inferenceNotes.push(quantityResult.note);
  }

  return {
    entity: persona.entity,
    region: persona.region,
    location: persona.location,
    category: categoryResult.category,
    urgency: urgencyResult.urgency,
    neededBy: urgencyResult.neededBy,
    inferenceNotes,
  };
}
