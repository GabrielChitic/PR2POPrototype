import type {
  BackendRouting,
  BackendSystem,
  IntentType,
  ContextInference,
} from "../types";

// ============================================================================
// BACKEND ROUTING SERVICE
// ============================================================================

interface RoutingRule {
  system: BackendSystem;
  matcher: (intent: IntentType, context: ContextInference) => boolean;
  reasoningTemplate: (intent: IntentType, context: ContextInference) => string;
  priority: number;
}

const ROUTING_RULES: RoutingRule[] = [
  // Rule 1: Needs sourcing → Sourcing_HandOff
  {
    system: "Sourcing_HandOff",
    matcher: (intent) => intent === "needs_sourcing",
    reasoningTemplate: () =>
      "RFP/RFQ/tender requests are routed to the sourcing team for supplier selection",
    priority: 1,
  },

  // Rule 2: IT Hardware + RO01 → SAP_MM
  {
    system: "SAP_MM",
    matcher: (intent, context) =>
      context.category === "IT Hardware" && context.entity === "RO01",
    reasoningTemplate: (_, context) =>
      `IT Hardware purchases for entity ${context.entity} are processed through SAP Materials Management`,
    priority: 2,
  },

  // Rule 3: Marketing Services + US01 → Coupa
  {
    system: "Coupa",
    matcher: (intent, context) =>
      context.category === "Marketing Services" && context.entity === "US01",
    reasoningTemplate: (_, context) =>
      `Marketing Services for entity ${context.entity} are managed via Coupa`,
    priority: 2,
  },

  // Rule 4: Consulting Services → Coupa
  {
    system: "Coupa",
    matcher: (intent, context) => context.category === "Consulting Services",
    reasoningTemplate: () => "Consulting and professional services are procured through Coupa",
    priority: 3,
  },

  // Rule 5: US entities → Coupa (general rule)
  {
    system: "Coupa",
    matcher: (intent, context) => context.entity.startsWith("US"),
    reasoningTemplate: (_, context) =>
      `Entity ${context.entity} uses Coupa as primary procurement system`,
    priority: 4,
  },

  // Rule 6: IT Software/SaaS → Coupa
  {
    system: "Coupa",
    matcher: (intent, context) => context.category === "IT Software/SaaS",
    reasoningTemplate: () => "Software and SaaS subscriptions are managed through Coupa",
    priority: 4,
  },

  // Rule 7: Default fallback → Local_ERP_X
  {
    system: "Local_ERP_X",
    matcher: () => true,
    reasoningTemplate: (_, context) =>
      `No specific routing rule matched - defaulting to Local ERP for entity ${context.entity}`,
    priority: 999,
  },
];

export function routeToBackend(
  intentType: IntentType,
  context: ContextInference
): BackendRouting {
  // Sort rules by priority
  const sortedRules = [...ROUTING_RULES].sort((a, b) => a.priority - b.priority);

  // Find first matching rule
  for (const rule of sortedRules) {
    if (rule.matcher(intentType, context)) {
      return {
        system: rule.system,
        reasoning: rule.reasoningTemplate(intentType, context),
      };
    }
  }

  // This should never happen due to the catch-all rule, but TypeScript needs it
  return {
    system: "Local_ERP_X",
    reasoning: "Fallback routing to Local ERP",
  };
}
