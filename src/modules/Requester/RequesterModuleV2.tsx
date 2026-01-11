import { useState, useRef, useEffect } from "react";
import { MessageSquare, List, Loader2, Send, Paperclip, MoreVertical, RotateCcw, HelpCircle, Sparkles } from "lucide-react";
import { usePRStore } from "../../context/PRContext";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../../components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";
import { Skeleton } from "../../components/ui/skeleton";
import { cn } from "../../lib/utils";
import { Stepper } from "../../components/workflow/Stepper";
import { Step1ChooseItems } from "../../components/workflow/Step1ChooseItems";
import { Step2Container } from "../../components/workflow/Step2Container";
import { Step3AccountingChecks } from "../../components/workflow/Step3AccountingChecks";
import { Step4ReviewSubmit } from "../../components/workflow/Step4ReviewSubmit";
import { Step5TrackApprovals } from "../../components/workflow/Step5TrackApprovals";
import { ChatMessage as ChatMessageComponent } from "../../components/ChatMessage";
import { RequesterHeroLanding } from "../../components/RequesterHeroLanding";
import { performSearch, autoPopulateFreeTextItem, extractAndParseDate, extractLocation } from "../../services/unifiedSearch";
import type { WorkflowStep, DraftPR, DraftLineItem, PurchaseInfo, CatalogItem, FreeTextItemDraft, RequestType, PolicyCheckResult, AccountingValidation, SubmittedPR, LifecycleNode } from "../../types/workflow";
import type { ChatMessage } from "../../types";
import { getDefaultAccountingForCategory, getDefaultCostCenterForLocation } from "../../data/accountingData";

export function RequesterModuleV2() {
  const { prs, addPR, currentPersona } = usePRStore();
  const [view, setView] = useState<"workflow" | "myRequests">("workflow");
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(0);
  const [isPaneVisible, setIsPaneVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Draft PR state
  const [draft, setDraft] = useState<DraftPR>({
    draftId: `draft-${Date.now()}`,
    currentStep: 0,
    status: "DRAFT",
    lineItems: [],
    purchaseInfo: {
      usage: "",
      isPartOfProject: false,
      deliverTo: currentPersona.name,
      deliverToLocation: currentPersona.location,
      needByDate: "",
      involvesPersonalData: false,
      involvesThirdParty: false,
      requiresSpecialApproval: false,
    },
    validationIssues: [],
    approvalPath: [],
    attachments: [],
    requesterNotes: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [catalogResults, setCatalogResults] = useState<CatalogItem[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [freeTextDraft, setFreeTextDraft] = useState<Partial<FreeTextItemDraft> | null>(null);

  // Stage 5: Track & Approvals
  const [submittedPRs, setSubmittedPRs] = useState<SubmittedPR[]>([]);
  const [stage5Mode, setStage5Mode] = useState<"tracking" | "list">("tracking");
  const [currentPR, setCurrentPR] = useState<SubmittedPR | undefined>(undefined);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const addChatMessage = (role: "user" | "assistant" | "system", content: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-${Math.random()}`,
        role,
        content,
        timestamp: new Date(),
      },
    ]);
  };

  // Helper: Get context-aware help message based on current step
  const getContextHelp = (): string => {
    switch (currentStep) {
      case 0:
        return "Tell me what you need to buy (e.g., '15 laptops' or 'consulting services').";
      case 1:
        return "Choose items from the catalog and adjust quantities.";
      case 2:
        return "Provide delivery details and basic purchase info.";
      case 3:
        return "Review accounting codes and policy checks.";
      case 4:
        return "Review your request and submit when ready.";
      case 5:
        return "Track approval progress and status updates.";
      default:
        return "I'm here to help you create purchase requests!";
    }
  };

  // Phase 0 Helper: Extract item intent from message
  const extractItemIntent = (message: string): string => {
    const messageLower = message.toLowerCase();

    // Common item patterns
    if (messageLower.includes("laptop")) return "laptops";
    if (messageLower.includes("chair")) return "chairs";
    if (messageLower.includes("monitor")) return "monitors";
    if (messageLower.includes("desk")) return "desks";
    if (messageLower.includes("keyboard")) return "keyboards";
    if (messageLower.includes("mouse")) return "mice";

    // Service patterns
    if (messageLower.includes("consulting") || messageLower.includes("consultant")) return "consulting services";
    if (messageLower.includes("training")) return "training services";
    if (messageLower.includes("audit")) return "audit services";

    // If no clear intent, return "unknown"
    return "unknown";
  };

  // Phase 0 Helper: Extract timeframe from message
  const extractTimeframe = (message: string): string | undefined => {
    const messageLower = message.toLowerCase();

    // Month names
    const months = ["january", "february", "march", "april", "may", "june",
                    "july", "august", "september", "october", "november", "december"];
    for (const month of months) {
      if (messageLower.includes(month)) {
        return month.charAt(0).toUpperCase() + month.slice(1);
      }
    }

    // Relative time
    if (messageLower.includes("next month")) return "next month";
    if (messageLower.includes("next quarter")) return "next quarter";
    if (messageLower.includes("asap") || messageLower.includes("urgent")) return "ASAP";

    return undefined;
  };

  // Phase 0 Helper: Extract city/location from message
  const extractCity = (message: string): string | undefined => {
    const messageLower = message.toLowerCase();

    // Common cities
    const cities = ["bucharest", "new york", "london", "paris", "munich", "prague", "berlin"];
    for (const city of cities) {
      if (messageLower.includes(city)) {
        return city.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }
    }

    return undefined;
  };

  // Phase 0 Helper: Infer quantity from message
  const inferQuantityFromMessage = (message: string): number => {
    // Check for numeric quantity anywhere in the message (e.g., "I need 15 laptops")
    const quantityMatch = message.match(/\b(\d+)\s+(?:laptop|chair|monitor|desk|computer|pc|notebook|item|unit)/i);
    if (quantityMatch) {
      return parseInt(quantityMatch[1], 10);
    }

    // Fallback: check for number at start (e.g., "15 laptops")
    const startQuantityMatch = message.match(/^(\d+)\s/);
    if (startQuantityMatch) {
      return parseInt(startQuantityMatch[1], 10);
    }

    // Check for written numbers
    const writtenNumbers: Record<string, number> = {
      "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
      "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
      "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15,
      "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19, "twenty": 20
    };

    const messageLower = message.toLowerCase();
    for (const [word, num] of Object.entries(writtenNumbers)) {
      // Check if written number appears before common item keywords
      const writtenMatch = messageLower.match(new RegExp(`\\b${word}\\s+(?:laptop|chair|monitor|desk|computer|pc|notebook|item|unit)`, 'i'));
      if (writtenMatch) {
        return num;
      }
      // Fallback: check at start
      if (messageLower.startsWith(word + " ")) {
        return num;
      }
    }

    return 1; // Default to 1 if no quantity specified
  };

  // Phase 0 Helper: Generate internal blockers (tracked but not shown in UI)
  const generateInitialBlockers = (extractedInfo: Partial<PurchaseInfo>): any[] => {
    const blockers: any[] = [];

    if (!extractedInfo.needByDate) {
      blockers.push({
        id: "blocker-need-by-date",
        type: "need_by_date",
        severity: "high",
        description: "Need-by date not specified",
        resolved: false,
      });
    }

    if (!extractedInfo.deliverToLocation) {
      blockers.push({
        id: "blocker-ship-to",
        type: "ship_to",
        severity: "high",
        description: "Ship-to location not specified",
        resolved: false,
      });
    }

    // Limit to max 3 blockers per spec
    return blockers.slice(0, 3);
  };

  // Helper: Handle chat commands
  const handleChatCommand = (_message: string, messageLower: string): boolean => {
    // Restart commands
    if (messageLower.includes("new request") ||
        messageLower.includes("start over") ||
        messageLower.includes("search again") ||
        messageLower === "restart") {
      handleNewRequest();
      return true;
    }

    // Help command
    if (messageLower === "help" || messageLower.includes("help me")) {
      addChatMessage("assistant", getContextHelp());
      return true;
    }

    // Status/Where am I command
    if (messageLower.includes("where am i") ||
        messageLower.includes("what step") ||
        messageLower === "status") {
      const stepNames = ["Chat Intake", "Choose Items", "Purchase Info", "Review", "Validation", "Approvals"];
      const stepName = currentStep > 0 ? stepNames[currentStep] : "Starting";
      addChatMessage("assistant", `You're currently at: ${stepName} (Step ${currentStep}/5). ${getContextHelp()}`);
      return true;
    }

    // PR status query
    if (messageLower.includes("pr-")) {
      addChatMessage("assistant", "You can view all your PRs by clicking the 'My PRs' tab above.");
      return true;
    }

    return false;
  };

  // Step 2 Co-pilot: Parse user message and update form fields
  const handleStep2CoPilot = (message: string) => {
    const messageLower = message.toLowerCase();

    // Handle contract queries for services
    if (
      draft.requestType === "servicesOrComplex" &&
      (messageLower.includes("existing contract") ||
       messageLower.includes("contract for this") ||
       messageLower.includes("is there a contract") ||
       messageLower.includes("any contracts"))
    ) {
      // Respond with contract availability
      if (draft.selectedContract) {
        addChatMessage(
          "assistant",
          `Yes! You've already selected "${draft.selectedContract.name}" (${draft.selectedContract.contractId}) from CLM. This contract is valid until ${draft.selectedContract.validUntil}.`
        );
      } else {
        addChatMessage(
          "assistant",
          `Yes, I've found 3 contracts from CLM that match your request. For example:\n\n• "Global IT Services Framework Agreement" with Accenture (valid until 2027)\n• "Professional Services Master Agreement" with Deloitte (valid until 2026)\n• "Consulting Services Framework" with PwC (valid until 2025)\n\nYou can select one in the "Existing Contracts" section below to link it to this request.`
        );
      }
      return;
    }

    const updates: Partial<PurchaseInfo> = {};
    const confirmations: string[] = [];

    // Parse delivery location
    const deliverToMatch = message.match(/deliver\s+to\s+([A-Za-z\s]+?)(?:\s+office|,|\.|$)/i);
    if (deliverToMatch) {
      const location = deliverToMatch[1].trim();
      updates.deliverToLocation = location;
      confirmations.push(`delivery location to "${location}"`);
    }

    // Parse location mentions (for services)
    const locationMatch = message.match(/(?:location|office|site)[\s:]+([A-Za-z\s,]+?)(?:\.|,|$)/i);
    if (locationMatch && !deliverToMatch) {
      const location = locationMatch[1].trim();
      updates.deliverToLocation = location;
      confirmations.push(`location to "${location}"`);
    }

    // Parse dates (various formats)
    const datePatterns = [
      /need\s+(?:it\s+)?by\s+(\d{1,2}\s+\w+|\d{4}-\d{2}-\d{2})/i,
      /by\s+(\d{1,2}\s+\w+(?:\s+\d{4})?)/i,
      /(?:date|deadline)[\s:]+(\d{1,2}\s+\w+|\d{4}-\d{2}-\d{2})/i,
      /start\s+(?:date|on)[\s:]+(\d{1,2}\s+\w+|\d{4}-\d{2}-\d{2})/i,
    ];

    for (const pattern of datePatterns) {
      const match = message.match(pattern);
      if (match) {
        const dateStr = match[1].trim();
        const parsedDate = parseFlexibleDate(dateStr);
        if (parsedDate) {
          updates.needByDate = parsedDate;
          confirmations.push(`date to ${dateStr}`);
          break;
        }
      }
    }

    // Parse usage/reason
    const reasonPatterns = [
      /reason[\s:]+(.+?)(?:\.|$)/i,
      /(?:this is )?(?:for|because|to)\s+(.+?)(?:\.|$)/i,
      /justification[\s:]+(.+?)(?:\.|$)/i,
    ];

    for (const pattern of reasonPatterns) {
      const match = message.match(pattern);
      if (match && match[1].length > 10 && match[1].length < 200) {
        updates.usage = match[1].trim();
        confirmations.push("usage/justification");
        break;
      }
    }

    // Parse project/initiative
    const projectMatch = message.match(/(?:project|initiative)[\s:]+(.+?)(?:\.|,|$)/i);
    if (projectMatch) {
      updates.isPartOfProject = true;
      updates.projectName = projectMatch[1].trim();
      confirmations.push(`project to "${projectMatch[1].trim()}"`);
    }

    // Parse delivery model (for services)
    if (messageLower.includes("remote") || messageLower.includes("remotely")) {
      confirmations.push("delivery model to remote");
    } else if (messageLower.includes("on-site") || messageLower.includes("onsite")) {
      confirmations.push("delivery model to on-site");
    } else if (messageLower.includes("hybrid")) {
      confirmations.push("delivery model to hybrid");
    }

    // Parse risk toggles
    if (messageLower.includes("personal data") && messageLower.includes("yes")) {
      updates.involvesPersonalData = true;
      confirmations.push("personal data flag");
    }
    if (messageLower.includes("confidential") && messageLower.includes("yes")) {
      confirmations.push("confidential data flag");
    }
    if (messageLower.includes("third party") || messageLower.includes("third-party")) {
      updates.involvesThirdParty = true;
      confirmations.push("third-party flag");
    }
    if (messageLower.includes("special approval") || messageLower.includes("critical")) {
      updates.requiresSpecialApproval = true;
      confirmations.push("special approval flag");
    }

    // Parse recipient/service owner
    const deliverToPersonMatch = message.match(/(?:deliver to|for|owner)[\s:]+([A-Z][a-z]+\s+[A-Z][a-z]+)/);
    if (deliverToPersonMatch) {
      updates.deliverTo = deliverToPersonMatch[1].trim();
      confirmations.push(`recipient to "${deliverToPersonMatch[1].trim()}"`);
    }

    // Apply updates if any were found
    if (Object.keys(updates).length > 0) {
      setDraft(prev => ({
        ...prev,
        purchaseInfo: { ...prev.purchaseInfo!, ...updates },
      }));

      addChatMessage(
        "assistant",
        `✓ Updated ${confirmations.join(", ")}. The form has been updated automatically.`
      );
    } else {
      // No clear field updates detected - provide helpful response
      addChatMessage(
        "assistant",
        `I can help you fill the form! Try: "Need it by May 20" or "Deliver to Munich office" or "Reason: opening new office"`
      );
    }
  };

  // Helper: Parse flexible date formats
  const parseFlexibleDate = (dateStr: string): string | null => {
    // Handle "20 May", "May 20", "20 May 2025" formats
    const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const parts = dateStr.toLowerCase().split(/\s+/);

    for (let i = 0; i < parts.length; i++) {
      const monthIndex = monthNames.findIndex(m => parts[i].startsWith(m));
      if (monthIndex !== -1) {
        // Found month
        const day = parts[i - 1] || parts[i + 1];
        const year = parts[i + 1] && parts[i + 1].length === 4 ? parts[i + 1] : new Date().getFullYear().toString();

        if (day && !isNaN(parseInt(day))) {
          const month = (monthIndex + 1).toString().padStart(2, '0');
          const dayPadded = day.padStart(2, '0');
          return `${year}-${month}-${dayPadded}`;
        }
      }
    }

    // Handle ISO format "2025-05-20"
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    return null;
  };

  // Stage 1 Shortcuts: Handle optimization commands
  const handleStage1Shortcuts = (message: string, messageLower: string): boolean => {
    const qty = draft.inferredQuantity || 1;

    // Choose cheapest
    if (messageLower.includes("cheapest") || messageLower.includes("lowest cost") || messageLower.includes("lowest price")) {
      const allowed = catalogResults.filter(item => item.compliance.allowed);
      if (allowed.length === 0) {
        addChatMessage("assistant", "Sorry, no allowed items are available.");
        return true;
      }
      const cheapest = allowed.reduce((min, item) => item.unitPrice < min.unitPrice ? item : min);
      handleAddItem(cheapest, qty);
      addChatMessage("assistant", `Added ${cheapest.name} (lowest cost at $${cheapest.unitPrice}) — qty ${qty}.`);
      return true;
    }

    // Choose fastest delivery
    if (messageLower.includes("fastest") || messageLower.includes("quickest") || messageLower.includes("fastest delivery")) {
      const allowed = catalogResults.filter(item => item.compliance.allowed);
      if (allowed.length === 0) {
        addChatMessage("assistant", "Sorry, no allowed items are available.");
        return true;
      }
      const fastest = allowed.reduce((prev, curr) =>
        (curr.leadTimeDays || 999) < (prev.leadTimeDays || 999) ? curr : prev
      );
      handleAddItem(fastest, qty);
      addChatMessage("assistant", `Added ${fastest.name} (fastest delivery: ${fastest.leadTimeDays} days) — qty ${qty}.`);
      return true;
    }

    // Choose preferred
    if (messageLower.includes("preferred") && (messageLower.includes("choose") || messageLower.includes("select"))) {
      const preferred = catalogResults.filter(item => item.compliance.preferred && item.compliance.allowed);
      if (preferred.length === 0) {
        addChatMessage("assistant", "Sorry, no preferred items are available.");
        return true;
      }
      const item = preferred[0];
      handleAddItem(item, qty);
      addChatMessage("assistant", `Added ${item.name} — qty ${qty}. ✓ Preferred supplier with valid contract.`);
      return true;
    }

    // Choose best offer (deterministic scoring: preferred + price + lead time)
    if (messageLower.includes("best offer") || messageLower.includes("best option") || messageLower.includes("recommend")) {
      const allowed = catalogResults.filter(item => item.compliance.allowed);
      if (allowed.length === 0) {
        addChatMessage("assistant", "Sorry, no allowed items are available.");
        return true;
      }

      // Score each item: prefer lower price, shorter lead time, and preferred status
      const scored = allowed.map(item => {
        let score = 0;
        // Preferred supplier boost
        if (item.compliance.preferred) score += 20;
        // Price (normalize - lower is better)
        const maxPrice = Math.max(...allowed.map(i => i.unitPrice));
        score += (1 - item.unitPrice / maxPrice) * 30;
        // Lead time (normalize - shorter is better)
        const maxLead = Math.max(...allowed.map(i => i.leadTimeDays || 999));
        score += (1 - (item.leadTimeDays || 999) / maxLead) * 20;
        // Valid contract boost
        if (item.compliance.contractStatus === "valid") score += 15;
        return { item, score };
      });

      const best = scored.reduce((prev, curr) => curr.score > prev.score ? curr : prev);
      handleAddItem(best.item, qty);
      const reasons = [];
      if (best.item.compliance.preferred) reasons.push("preferred supplier");
      if (best.item.leadTimeDays && best.item.leadTimeDays <= 7) reasons.push(`fast delivery (${best.item.leadTimeDays} days)`);
      if (best.item.unitPrice < Math.max(...allowed.map(i => i.unitPrice))) reasons.push("competitive price");
      addChatMessage("assistant", `Added ${best.item.name} (best overall option: ${reasons.join(", ")}) — qty ${qty}.`);
      return true;
    }

    // Why is this one blocked?
    if (messageLower.includes("why") && messageLower.includes("block")) {
      const blocked = catalogResults.find(item => !item.compliance.allowed);
      if (blocked && blocked.compliance.blockedReason) {
        addChatMessage("assistant", `${blocked.name} is blocked: ${blocked.compliance.blockedReason}`);
        return true;
      }
      addChatMessage("assistant", "I don't see any blocked items in the current results.");
      return true;
    }

    // Make it [quantity]
    const qtyMatch = message.match(/(?:make it|set to|change to|quantity)\s+(\d+)/i);
    if (qtyMatch) {
      const newQty = parseInt(qtyMatch[1], 10);
      if (draft.lineItems.length === 0) {
        addChatMessage("assistant", "Please add an item to your request first.");
        return true;
      }

      // Update all selected items' quantities
      draft.lineItems.forEach(item => {
        handleUpdateQuantity(item.id, newQty);
      });

      addChatMessage("assistant", `Updated quantities to ${newQty} for all selected items.`);
      return true;
    }

    return false;
  };

  // Helper: Parse initial request to extract metadata
  const parseInitialRequest = (message: string) => {
    const metadata: {
      searchQuery: string;
      purchaseInfo: Partial<PurchaseInfo>;
    } = {
      searchQuery: message,
      purchaseInfo: {},
    };

    let workingMessage = message;

    // Parse date using new natural language date parser
    const parsedDate = extractAndParseDate(message);
    if (parsedDate) {
      metadata.purchaseInfo.needByDate = parsedDate;
    }

    // Parse location using new location extractor
    const extractedLocation = extractLocation(message);
    if (extractedLocation) {
      metadata.purchaseInfo.deliverToLocation = extractedLocation;
    }

    // Parse recipient/person names (capital letters pattern)
    const personPatterns = [
      /(?:for|to)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s|,|\.|\band\b|$)/,
      /(?:deliver to|recipient)[\s:]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
    ];

    for (const pattern of personPatterns) {
      const match = message.match(pattern);
      if (match) {
        metadata.purchaseInfo.deliverTo = match[1].trim();
        // Remove person from search query
        workingMessage = workingMessage.replace(match[0], '').trim();
        break;
      }
    }

    // Parse usage/reason
    const reasonPatterns = [
      /reason[\s:]+(.{10,150})(?:\.|$)/i,
      /(?:for|because)[\s:]+(.{10,150})(?:\.|$)/i,
      /(?:usage|purpose)[\s:]+(.{10,150})(?:\.|$)/i,
    ];

    for (const pattern of reasonPatterns) {
      const match = message.match(pattern);
      if (match) {
        const reason = match[1].trim();
        if (!reason.toLowerCase().includes('office') && !reason.match(/\d+(?:st|nd|rd|th)?/)) {
          metadata.purchaseInfo.usage = reason;
          // Remove reason from search query
          workingMessage = workingMessage.replace(match[0], '').trim();
          break;
        }
      }
    }

    // Parse project mentions
    const projectMatch = message.match(/(?:project|initiative)[\s:]+([A-Za-z0-9\s]+?)(?:\.|,|\band\b|$)/i);
    if (projectMatch) {
      const projectName = projectMatch[1].trim();
      if (projectName.length > 2 && projectName.length < 100) {
        metadata.purchaseInfo.isPartOfProject = true;
        metadata.purchaseInfo.projectName = projectName;
        // Remove project from search query
        workingMessage = workingMessage.replace(projectMatch[0], '').trim();
      }
    }

    // Clean up search query
    workingMessage = workingMessage
      .replace(/\s+/g, ' ') // normalize whitespace
      .replace(/^(need|needs|want|wants|looking for|get me)\s+/i, '') // remove intent words
      .replace(/^(a|an|the|some)\s+/i, '') // remove articles
      .trim();

    // Use cleaned query if it has meaningful content, otherwise use original
    metadata.searchQuery = workingMessage.length > 2 ? workingMessage : message;

    return metadata;
  };

  // Process chat message (can be called from form submit or hero landing)
  const processChatMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isSearching) return;

    const messageLower = userMessage.toLowerCase();

    // Check for commands FIRST (don't add to chat)
    if (handleChatCommand(userMessage, messageLower)) {
      return;
    }

    // Not a command - add to chat and process
    addChatMessage("user", userMessage);

    // Context-aware responses based on current step
    if (currentStep === 1 && catalogResults.length > 0) {
      // Stage 1: Handle shortcuts like "choose cheapest", "choose preferred", etc.
      if (handleStage1Shortcuts(userMessage, messageLower)) {
        return; // Shortcut handled
      }
      // If not a shortcut, provide general Stage 1 help
      addChatMessage("assistant", getContextHelp());
    } else if (currentStep === 2 && draft.lineItems.length > 0) {
      // Step 2 Co-pilot: Parse message and update form fields
      handleStep2CoPilot(userMessage);
    } else if (currentStep === 0) {
      // PHASE 0: BACKGROUND PROCESSING (never visible to user)

      // Parse initial request to extract metadata
      const parsed = parseInitialRequest(userMessage);
      const { searchQuery, purchaseInfo: extractedInfo } = parsed;

      // Extract Phase 0 metadata using new helper functions
      const itemIntent = extractItemIntent(userMessage);
      const inferredQuantity = inferQuantityFromMessage(userMessage);
      const inferredTimeframe = extractTimeframe(userMessage);
      const inferredCity = extractCity(userMessage);

      // RULE: Max 1 question if intent is unclear
      if (!itemIntent || itemIntent === "unknown") {
        addChatMessage("assistant", "What are you buying?");
        setIsSearching(false);
        return;
      }

      // Intent is clear - start search process (keep pane HIDDEN)
      setIsSearching(true);

      // Create new draft PR with Phase 0 metadata
      const newDraft: DraftPR = {
        draftId: `DRAFT-${Date.now()}`,
        title: userMessage,
        currentStep: 0,
        status: "DRAFT",
        lineItems: [],
        purchaseInfo: {
          usage: extractedInfo.usage || "",
          isPartOfProject: extractedInfo.isPartOfProject || false,
          projectName: extractedInfo.projectName,
          deliverTo: extractedInfo.deliverTo || currentPersona.name,
          deliverToLocation: extractedInfo.deliverToLocation || currentPersona.location,
          needByDate: extractedInfo.needByDate || "",
          involvesPersonalData: false,
          involvesThirdParty: false,
          requiresSpecialApproval: false,
        },
        validationIssues: [],
        approvalPath: [],
        attachments: [],
        requesterNotes: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        // Phase 0 metadata (NEW)
        requestStatement: userMessage,
        itemIntent,
        inferredQuantity,
        inferredTimeframe,
        inferredCity,
        // Internal blockers (tracked but not shown in UI per user preference)
        internalBlockers: generateInitialBlockers(extractedInfo),
      };
      setDraft(newDraft);

      // Chat response: acknowledge + progress (no lists!)
      addChatMessage("assistant", `Got it! Searching approved catalogs for ${itemIntent}...`);

      try {
        const searchResult = await performSearch(searchQuery);

        setDraft(prev => ({
          ...prev,
          intentType: searchResult.intentType,
          lastSearchResults: searchResult.matchedItems,
        }));

        setCatalogResults(searchResult.matchedItems);
        setIsSearching(false);

        if (searchResult.matchedItems.length > 0) {
          // SUCCESS: Move to Phase 1 and OPEN PANE
          setCurrentStep(1);
          setIsPaneVisible(true);

          addChatMessage(
            "assistant",
            `I found ${searchResult.matchedItems.length} matching catalog options in the panel. What should I optimize for: lowest cost, fastest delivery, or preferred suppliers?`
          );
        } else {
          // No matches: Free text flow
          addChatMessage(
            "assistant",
            "I couldn't find a suitable catalog item. I'll create a Free Text item for you."
          );

          const freeTextData = autoPopulateFreeTextItem(searchQuery);
          setFreeTextDraft(freeTextData);

          // Move to Phase 1 and OPEN PANE
          setCurrentStep(1);
          setIsPaneVisible(true);
        }
      } catch (error) {
        console.error("Search error:", error);
        setIsSearching(false);
        addChatMessage("assistant", "Sorry, there was an error processing your request. Please try again.");
      }
    } else if (currentStep > 0 && currentStep <= 5) {
      // Context-aware response for other steps
      addChatMessage("assistant", `I see you're at ${["", "Item Selection", "Purchase Info", "Review", "Validation", "Approvals"][currentStep]}. ${getContextHelp()}`);
    } else {
      addChatMessage("assistant", getContextHelp());
    }
  };

  // Form submit handler
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSearching) return;

    const userMessage = chatInput.trim();
    setChatInput(""); // Clear input immediately

    await processChatMessage(userMessage);
  };

  // Handle "New Request" / "Start Over"
  const handleNewRequest = () => {
    // Clear all state
    setCurrentStep(0);
    setIsSearching(false);
    setCatalogResults([]);
    setFreeTextDraft(null);
    setIsSubmitted(false);

    // Reset draft
    setDraft({
      draftId: `draft-${Date.now()}`,
      currentStep: 0,
      status: "DRAFT",
      lineItems: [],
      purchaseInfo: {
        usage: "",
        isPartOfProject: false,
        deliverTo: currentPersona.name,
        deliverToLocation: currentPersona.location,
        needByDate: "",
        involvesPersonalData: false,
        involvesThirdParty: false,
        requiresSpecialApproval: false,
      },
      validationIssues: [],
      approvalPath: [],
      attachments: [],
      requesterNotes: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Clear all messages to return to hero landing
    setChatMessages([]);

    // Switch to workflow view (from My Requests if needed)
    setView("workflow");

    // Hide the workflow pane
    setIsPaneVisible(false);
  };

  // Step handlers
  const handleAddItem = (item: CatalogItem, quantity: number) => {
    // Determine if this is a free-text item (created from free-text form in Step 1)
    const isFreeText = item.id.startsWith("freetext-");

    // Determine item type: catalog goods, free-text goods, or service
    let itemType: "goods" | "freeText" | "service" = "goods";

    if (isFreeText) {
      // For free-text items, check if it's a service or goods
      itemType = isServiceItem(item.name + " " + item.description) ? "service" : "freeText";
    }

    const newItem: DraftLineItem = {
      id: item.id,
      type: itemType,
      name: item.name,
      description: item.description,
      quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * quantity,
      unitOfMeasure: item.unitOfMeasure,
      supplier: item.supplier,
      category: item.category,
      isPreferredSupplier: item.isPreferredSupplier,
      // Compliance tracking from catalog item
      compliance: item.compliance,
      // For free-text items, store additional data
      ...(isFreeText && {
        estimatedValue: item.unitPrice,
        currency: item.currency,
        preferredSupplier: item.supplierName,
      }),
    };
    setDraft((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem],
    }));
  };

  // Helper: Check if item description indicates a service
  const isServiceItem = (text: string): boolean => {
    const serviceKeywords = [
      "consulting", "consultation", "consultancy",
      "service", "services", "support", "maintenance",
      "training", "workshop", "implementation",
      "audit", "assessment", "analysis",
      "development", "project", "rollout",
    ];
    const textLower = text.toLowerCase();
    return serviceKeywords.some(keyword => textLower.includes(keyword));
  };

  const handleRemoveItem = (itemId: string) => {
    setDraft((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((item) => item.id !== itemId),
    }));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setDraft((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) =>
        item.id === itemId
          ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
          : item
      ),
    }));
  };

  const handleStep1Next = () => {
    // Determine request type based on line items
    const requestType = determineRequestType(draft);

    // Update draft with request type
    setDraft(prev => ({
      ...prev,
      requestType,
    }));

    setCurrentStep(2);

    // Context-aware message based on request type
    const messages: Record<RequestType, string> = {
      catalogGoods: "Next, confirm delivery details and add a brief reason in the panel.",
      freeTextGoods: "Step 2/5: Since this is a custom item, I need a bit more detail to process it.",
      servicesOrComplex: "Step 2/5: For services, I need to understand the scope and any compliance considerations.",
    };

    addChatMessage("assistant", messages[requestType]);
  };

  // Helper: Determine request type from draft
  const determineRequestType = (draft: DraftPR): RequestType => {
    const hasService = draft.lineItems.some(item => item.type === "service");
    const hasFreeText = draft.lineItems.some(item => item.type === "freeText");
    const hasCatalogGoods = draft.lineItems.some(item => item.type === "goods");

    if (hasService) {
      return "servicesOrComplex";
    } else if (hasFreeText) {
      return "freeTextGoods";
    } else if (hasCatalogGoods) {
      return "catalogGoods";
    }

    // Fallback based on intentType
    if (draft.intentType === "service") {
      return "servicesOrComplex";
    } else if (draft.intentType === "freeText") {
      return "freeTextGoods";
    }

    return "catalogGoods";
  };

  const handleUpdatePurchaseInfo = (info: Partial<PurchaseInfo>) => {
    setDraft((prev) => ({
      ...prev,
      purchaseInfo: { ...prev.purchaseInfo!, ...info },
    }));
  };

  const handleUpdateDraft = (updates: Partial<DraftPR>) => {
    setDraft((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleStep2Next = () => {
    // Auto-prefill accounting fields based on item category and location
    const category = draft.lineItems[0]?.category || "IT Hardware";
    const location = draft.purchaseInfo?.deliverToLocation || "Bucharest";

    const { commodityGroup, glAccount } = getDefaultAccountingForCategory(category);
    const costCenter = getDefaultCostCenterForLocation(location);

    // Entity code from user profile (read-only)
    const entityCode = "UIPATH-RO";

    // Generate accounting validation (all pass by default for valid mappings)
    const accountingValidation: AccountingValidation = {
      commodityGroup: commodityGroup ? "pass" : "block",
      glAccount: glAccount ? "pass" : "block",
      costCenter: costCenter ? "pass" : "block",
      reasons: {
        commodityGroup: commodityGroup ? undefined : "No commodity group found for category",
        glAccount: glAccount ? undefined : "No GL account found for category",
        costCenter: costCenter ? undefined : "No cost center found for location",
      },
    };

    // Generate policy checks based on compliance data from line items
    const policyChecks: PolicyCheckResult[] = [];

    // Check 1: Preferred supplier compliance
    const nonPreferredItems = draft.lineItems.filter(item => !item.compliance?.preferred);
    if (nonPreferredItems.length > 0) {
      policyChecks.push({
        id: "policy-001",
        checkName: "Preferred Supplier Policy",
        status: "warn",
        message: `${nonPreferredItems.length} item(s) from non-preferred suppliers.`,
        detail: "Non-preferred suppliers may require additional approval and longer lead times.",
      });
    } else {
      policyChecks.push({
        id: "policy-001",
        checkName: "Preferred Supplier Policy",
        status: "pass",
        message: "All items are from preferred suppliers.",
      });
    }

    // Check 2: Contract status
    const expiredContractItems = draft.lineItems.filter(
      item => item.compliance?.contractStatus === "expired"
    );
    if (expiredContractItems.length > 0) {
      policyChecks.push({
        id: "policy-002",
        checkName: "Contract Validity",
        status: "warn",
        message: `${expiredContractItems.length} item(s) have expired contracts.`,
        detail: "Expired contracts may require renegotiation before proceeding.",
      });
    } else {
      policyChecks.push({
        id: "policy-002",
        checkName: "Contract Validity",
        status: "pass",
        message: "All contracts are valid and active.",
      });
    }

    // Check 3: Budget threshold
    const totalValue = draft.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
    if (totalValue > 50000) {
      policyChecks.push({
        id: "policy-003",
        checkName: "Budget Approval Threshold",
        status: "warn",
        message: "Total value exceeds $50,000 - requires executive approval.",
        detail: `Current total: $${totalValue.toLocaleString()}. Purchases over $50,000 require additional sign-off.`,
      });
    } else {
      policyChecks.push({
        id: "policy-003",
        checkName: "Budget Approval Threshold",
        status: "pass",
        message: "Purchase within standard approval limits.",
      });
    }

    // Update draft with prefilled accounting fields and validation
    setDraft(prev => ({
      ...prev,
      entityCode,
      commodityGroupId: commodityGroup?.id,
      commodityGroupCode: commodityGroup?.code,
      commodityGroupName: commodityGroup?.name,
      glAccountId: glAccount?.id,
      glAccountCode: glAccount?.code,
      glAccountName: glAccount?.name,
      costCenterId: costCenter?.id,
      costCenterCode: costCenter?.code,
      costCenterName: costCenter?.name,
      accountingValidation,
      policyChecks,
    }));

    setCurrentStep(3);
    addChatMessage("assistant", "Great — next we'll run accounting and policy checks.");
  };

  const handleStep3Next = () => {
    // Move to Step 4 (Review & Submit)
    setCurrentStep(4);

    // Generate chat summary
    const totalValue = draft.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const itemCount = draft.lineItems.length;
    const primarySupplier = draft.lineItems[0]?.supplier || "various suppliers";

    const blockers = draft.policyChecks?.filter(check => check.status === "block") || [];
    const hasAccountingBlockers =
      draft.accountingValidation?.commodityGroup === "block" ||
      draft.accountingValidation?.glAccount === "block" ||
      draft.accountingValidation?.costCenter === "block";

    if (blockers.length > 0 || hasAccountingBlockers) {
      const firstBlocker = blockers[0]?.message || "accounting field is invalid";
      addChatMessage("assistant", `I can't submit yet because ${firstBlocker}. Fix it in the panel.`);
    } else {
      addChatMessage(
        "assistant",
        `You're buying ${itemCount} item${itemCount > 1 ? "s" : ""} from ${primarySupplier}, total $${totalValue.toLocaleString()}. Coding is set and checks look good. Ready to submit.`
      );
    }
  };

  const handleRerunChecks = () => {
    // Re-run policy checks (useful if user edits accounting fields)
    const policyChecks: PolicyCheckResult[] = [];

    // Check 1: Preferred supplier compliance
    const nonPreferredItems = draft.lineItems.filter(item => !item.compliance?.preferred);
    if (nonPreferredItems.length > 0) {
      policyChecks.push({
        id: "policy-001",
        checkName: "Preferred Supplier Policy",
        status: "warn",
        message: `${nonPreferredItems.length} item(s) from non-preferred suppliers.`,
        detail: "Non-preferred suppliers may require additional approval and longer lead times.",
      });
    } else {
      policyChecks.push({
        id: "policy-001",
        checkName: "Preferred Supplier Policy",
        status: "pass",
        message: "All items are from preferred suppliers.",
      });
    }

    // Check 2: Contract status
    const expiredContractItems = draft.lineItems.filter(
      item => item.compliance?.contractStatus === "expired"
    );
    if (expiredContractItems.length > 0) {
      policyChecks.push({
        id: "policy-002",
        checkName: "Contract Validity",
        status: "warn",
        message: `${expiredContractItems.length} item(s) have expired contracts.`,
        detail: "Expired contracts may require renegotiation before proceeding.",
      });
    } else {
      policyChecks.push({
        id: "policy-002",
        checkName: "Contract Validity",
        status: "pass",
        message: "All contracts are valid and active.",
      });
    }

    // Check 3: Budget threshold
    const totalValue = draft.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
    if (totalValue > 50000) {
      policyChecks.push({
        id: "policy-003",
        checkName: "Budget Approval Threshold",
        status: "warn",
        message: "Total value exceeds $50,000 - requires executive approval.",
        detail: `Current total: $${totalValue.toLocaleString()}. Purchases over $50,000 require additional sign-off.`,
      });
    } else {
      policyChecks.push({
        id: "policy-003",
        checkName: "Budget Approval Threshold",
        status: "pass",
        message: "Purchase within standard approval limits.",
      });
    }

    setDraft(prev => ({
      ...prev,
      policyChecks,
    }));

    addChatMessage("assistant", "Checks re-run successfully.");
  };

  const handleStep4Submit = () => {
    // Generate PR ID
    const prNumber = `PR-${Math.floor(1000 + Math.random() * 9000)}`;
    const submissionTimestamp = new Date();

    // Calculate totals
    const totalValue = draft.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalQuantity = draft.lineItems.reduce((sum, item) => sum + item.quantity, 0);

    // Generate approval path based on total value
    const approvalPath = [
      { id: "app-1", role: "Manager", approverName: "Sarah Johnson", status: "pending" as const, order: 1 },
      { id: "app-2", role: "Cost Center Owner", approverName: "Michael Chen", status: "pending" as const, order: 2 },
    ];

    if (totalValue > 10000) {
      approvalPath.push({
        id: "app-3",
        role: "Procurement",
        approverName: "Emily Rodriguez",
        status: "pending" as const,
        order: 3,
      });
    }

    // Create lifecycle timeline
    const lifecycleTimeline: LifecycleNode[] = [
      {
        id: "lc-1",
        label: "Submitted",
        status: "completed",
        completedAt: submissionTimestamp,
      },
      {
        id: "lc-2",
        label: "Manager approval",
        owner: "Sarah Johnson",
        status: "in_progress",
        helperText: "Waiting on Sarah Johnson",
      },
      {
        id: "lc-3",
        label: "Cost center owner approval",
        owner: "Michael Chen",
        status: "pending",
      },
    ];

    if (totalValue > 10000) {
      lifecycleTimeline.push({
        id: "lc-4",
        label: "Procurement review",
        owner: "Emily Rodriguez",
        status: "pending",
      });
    }

    lifecycleTimeline.push(
      {
        id: "lc-5",
        label: "PR approved",
        status: "pending",
      },
      {
        id: "lc-6",
        label: "PO created & sent",
        status: "pending",
      }
    );

    // Create compact summaries
    const itemsSummary =
      draft.lineItems.length === 1
        ? `${draft.lineItems[0].name} × ${draft.lineItems[0].quantity}`
        : `${draft.lineItems.length} items (${totalQuantity} total)`;

    const deliverySummary = `${draft.purchaseInfo?.deliverToLocation || "N/A"}, Need by: ${
      draft.purchaseInfo?.needByDate || "N/A"
    }`;

    const accountingSummary = `${draft.commodityGroupCode || "N/A"}, ${draft.glAccountCode || "N/A"}, ${
      draft.costCenterCode || "N/A"
    }`;

    const policySummary: string[] = [];
    draft.policyChecks?.forEach((check) => {
      if (check.status === "pass") {
        policySummary.push(`${check.checkName} ✓`);
      } else if (check.status === "warn") {
        policySummary.push(`${check.checkName} ⚠`);
      }
    });

    // Generate title
    const title =
      draft.lineItems.length === 1
        ? `${draft.lineItems[0].quantity} ${draft.lineItems[0].name}`
        : `${totalQuantity} items`;

    // Create SubmittedPR
    const submittedPR: SubmittedPR = {
      prNumber,
      prId: draft.draftId,
      title,
      status: "pending_approval",
      currentStep: "Manager approval",
      currentOwner: "Sarah Johnson",
      timeInStep: "Just now",
      submittedAt: submissionTimestamp,
      submittedBy: currentPersona.name,
      totalValue,
      lifecycleTimeline,
      itemsSummary,
      deliverySummary,
      accountingSummary,
      policySummary,
      canEdit: true, // Early stage, still editable
      draftPR: { ...draft, prNumber }, // Store reference for editing
    };

    // Store the submitted PR
    setSubmittedPRs((prev) => [submittedPR, ...prev]);
    setCurrentPR(submittedPR);

    // Add to prs store for My Requests tab
    const prForStore = {
      id: draft.draftId,
      prNumber,
      status: "SUBMITTED" as const,
      requestingPersona: currentPersona,
      originalMessage: draft.requestStatement || title,
      intentClassification: {
        type: "catalog_purchase" as const,
        confidence: "high" as const,
        confidenceScore: 0.95,
        needsHumanReview: false,
        reasoning: ["Catalog items selected", "All required fields complete"],
      },
      contextInference: {
        entity: draft.entityCode || "UIPATH-RO",
        region: "EMEA" as const,
        location: draft.purchaseInfo?.deliverToLocation || "Bucharest",
        category: (draft.lineItems[0]?.category || "IT Hardware") as any,
        urgency: "medium" as const,
        neededBy: draft.purchaseInfo?.needByDate || "",
        inferenceNotes: ["Catalog workflow", "All fields validated"],
      },
      backendRouting: {
        system: "Coupa" as const,
        reasoning: "Catalog purchase workflow - routed to procurement system for PR creation",
      },
      lineItems: draft.lineItems.map(item => ({
        id: item.id,
        description: `${item.name} - ${item.description}`,
        quantity: item.quantity,
        unitOfMeasure: item.unitOfMeasure || "EA",
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        supplierName: item.supplier,
      })),
      createdAt: submissionTimestamp,
      updatedAt: submissionTimestamp,
    };
    addPR(prForStore);

    // Update draft with PR details
    setDraft((prev) => ({
      ...prev,
      prNumber,
      status: "SUBMITTED",
      approvalPath,
      updatedAt: submissionTimestamp,
    }));

    // Transition to Stage 5 in tracking mode
    setCurrentStep(5);
    setStage5Mode("tracking");

    // Chat message
    addChatMessage("assistant", `Submitted — your PR is ${prNumber}. I'll keep tracking approvals.`);
  };

  const handleNavigateToStage = (stage: number) => {
    setCurrentStep(stage as WorkflowStep);
    addChatMessage("assistant", `Navigated to stage ${stage} to fix the issue.`);
  };

  // Stage 5 handlers
  const handleSelectPR = (pr: SubmittedPR) => {
    setCurrentPR(pr);
    setStage5Mode("tracking");
    // Keep in myRequests view if already there, or switch to workflow
    // This allows clicking from either the My Requests tab or from Stage 5 list mode
    if (view !== "myRequests") {
      setView("workflow");
    }
    setCurrentStep(5);
    addChatMessage("assistant", `Showing details for ${pr.prNumber}.`);
  };

  const handleShowMyRequests = () => {
    // Navigate to My Requests tab and show list mode
    setView("myRequests");
    setStage5Mode("list");
    setCurrentStep(5);
    setIsPaneVisible(true); // Ensure pane is visible when navigating to My Requests
  };

  const handleEditPR = (pr: SubmittedPR) => {
    // Simplified: Navigate back to Stage 1 with the draft loaded
    if (pr.draftPR) {
      setDraft(pr.draftPR);
      setCurrentStep(1);
      addChatMessage("assistant", `Editing ${pr.prNumber}. Make your changes and resubmit when ready.`);
    }
  };

  const handleCompleteAction = (action: any) => {
    // Simulate completing an action
    addChatMessage("assistant", `Action "${action.title}" completed. Timeline updated.`);

    // Update the current PR to mark action as completed
    if (currentPR) {
      const updatedPR = {
        ...currentPR,
        actionRequired: currentPR.actionRequired
          ? { ...currentPR.actionRequired, completedAt: new Date() }
          : undefined,
      };
      setCurrentPR(updatedPR);

      // Also update in the list
      setSubmittedPRs((prev) =>
        prev.map((pr) => (pr.prNumber === currentPR.prNumber ? updatedPR : pr))
      );
    }
  };

  const handleStartNew = () => {
    setCurrentStep(0);
    setIsSubmitted(false);
    setCatalogResults([]);
    setFreeTextDraft(null);
    setIsSearching(false);
    setDraft({
      draftId: `draft-${Date.now()}`,
      currentStep: 0,
      status: "DRAFT",
      lineItems: [],
      purchaseInfo: {
        usage: "",
        isPartOfProject: false,
        deliverTo: currentPersona.name,
        deliverToLocation: currentPersona.location,
        needByDate: "",
        involvesPersonalData: false,
        involvesThirdParty: false,
        requiresSpecialApproval: false,
      },
      validationIssues: [],
      approvalPath: [],
      attachments: [],
      requesterNotes: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Clear all messages to return to hero landing
    setChatMessages([]);

    // Switch to workflow view (from My Requests if needed)
    setView("workflow");

    // Hide the workflow pane
    setIsPaneVisible(false);
  };

  // Check if there are any user messages (to determine if we should show hero landing)
  const hasUserMessages = chatMessages.some(msg => msg.role === "user");

  return (
    <TooltipProvider>
      {/* Show hero landing if no user messages yet and in workflow view */}
      {!hasUserMessages && view === "workflow" ? (
        <RequesterHeroLanding
          onSubmit={processChatMessage}
          disabled={isSearching}
          onMyRequests={handleShowMyRequests}
          prsCount={prs.length}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden bg-muted/20">
          {/* Left: Chat Panel - Dynamic width */}
          <div className={cn(
            "flex flex-col transition-all duration-300",
            isPaneVisible ? "w-[40%]" : "w-full"
          )}>
            <Card className="flex-1 flex flex-col m-4 shadow-lg border-border/50">
            {/* Chat Header */}
            <CardHeader className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Conversational Agent</h3>
                    <p className="text-xs text-muted-foreground">Purchase request assistant</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={isSearching ? "default" : "secondary"} className="text-xs">
                    {isSearching ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Searching
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-1" />
                        Ready
                      </>
                    )}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleNewRequest}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset Conversation
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => addChatMessage("assistant", getContextHelp())}>
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Get Help
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4 pr-4">
                {chatMessages.map((msg) => (
                  <ChatMessageComponent key={msg.id} message={msg} />
                ))}

                {/* Show typing indicator during search */}
                {isSearching && (
                  <div className="flex items-start gap-3">
                    <div className="flex-1 max-w-[80%]">
                      <div className="bg-muted rounded-2xl p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <Skeleton className="h-2 w-2 rounded-full animate-pulse" />
                            <Skeleton className="h-2 w-2 rounded-full animate-pulse [animation-delay:0.2s]" />
                            <Skeleton className="h-2 w-2 rounded-full animate-pulse [animation-delay:0.4s]" />
                          </div>
                          <span className="text-xs text-muted-foreground">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <CardContent className="border-t p-4">
              <form onSubmit={handleChatSubmit} className="flex items-end gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="h-10 w-10 shrink-0">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Attach file</TooltipContent>
                </Tooltip>

                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSubmit(e as any);
                    }
                  }}
                  placeholder="Type your message... (e.g., '15 laptops for new contractors')"
                  disabled={isSearching}
                  className="min-h-[60px] max-h-[200px] resize-none"
                  rows={2}
                />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isSearching || !chatInput.trim()}
                      className="h-10 w-10 shrink-0"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send message (Enter)</TooltipContent>
                </Tooltip>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right: Workflow Pane - Conditionally visible */}
        {isPaneVisible ? (
          <Card className="flex-1 flex flex-col m-4 ml-0 shadow-lg border-border/50">
            {/* View Toggle */}
            <CardHeader className="border-b bg-background/95 backdrop-blur">
              <div className="flex items-center gap-2">
                <Button
                  variant={view === "workflow" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView("workflow")}
                  className="gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Request Builder
                </Button>
                <Button
                  variant={view === "myRequests" ? "default" : "ghost"}
                  size="sm"
                  onClick={handleShowMyRequests}
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  My Requests ({prs.length})
                </Button>
                {(currentStep > 0 || draft.lineItems.length > 0) && !isSubmitted && (
                  <Button size="sm" variant="outline" onClick={handleNewRequest} className="ml-auto">
                    New Request
                  </Button>
                )}
                {isSubmitted && currentStep === 5 && (
                  <Button size="sm" variant="outline" onClick={handleStartNew} className="ml-auto">
                    Start New Request
                  </Button>
                )}
              </div>
            </CardHeader>

        {view === "workflow" ? (
          <>
            {currentStep > 0 && !isSearching && <Stepper currentStep={currentStep} />}

            {currentStep === 0 && !isSearching && (
              <div className="flex-1 flex items-center justify-center p-12 bg-gradient-to-br from-muted/50 to-background">
                <div className="text-center max-w-lg">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground mb-3">Start a conversation</h3>
                  <p className="text-base text-muted-foreground leading-relaxed mb-8">
                    Tell me what you need in the chat, and I'll guide you through creating a purchase request step by step.
                  </p>
                  <Card className="p-4 bg-primary/5 border-primary/20">
                    <p className="text-sm text-foreground font-medium mb-2">Try saying:</p>
                    <p className="text-sm text-muted-foreground italic">"I need 3 laptops for new hires"</p>
                  </Card>
                </div>
              </div>
            )}

            {/* Loading/Searching State */}
            {isSearching && (
              <div className="flex-1 flex items-center justify-center p-12 bg-muted/20">
                <div className="text-center max-w-lg">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Searching for matching items...</h3>
                  <p className="text-sm text-muted-foreground">
                    I'm checking our catalogs to find the best options for your request.
                  </p>
                  <div className="mt-8 space-y-3">
                    {/* Skeleton placeholders */}
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && !isSearching && (
              <Step1ChooseItems
                catalogResults={catalogResults}
                selectedItems={draft.lineItems}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onUpdateQuantity={handleUpdateQuantity}
                onNext={handleStep1Next}
                onAddCustomService={() => {}}
                freeTextDraft={freeTextDraft}
                onUpdateFreeTextDraft={setFreeTextDraft}
                inferredQuantity={draft.inferredQuantity}
              />
            )}

            {currentStep === 2 && (
              <Step2Container
                draft={draft}
                onUpdate={handleUpdatePurchaseInfo}
                onUpdateDraft={handleUpdateDraft}
                onNext={handleStep2Next}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && (
              <Step3AccountingChecks
                draft={draft}
                onUpdate={handleUpdateDraft}
                onNext={handleStep3Next}
                onBack={() => setCurrentStep(2)}
                onRunChecks={handleRerunChecks}
              />
            )}

            {currentStep === 4 && (
              <Step4ReviewSubmit
                draft={draft}
                onSubmit={handleStep4Submit}
                onBack={() => setCurrentStep(3)}
                onNavigateToStage={handleNavigateToStage}
              />
            )}

            {currentStep === 5 && (
              <Step5TrackApprovals
                mode={stage5Mode}
                submittedPR={currentPR}
                allPRs={submittedPRs}
                onSelectPR={handleSelectPR}
                onNewRequest={handleNewRequest}
                onMyRequests={handleShowMyRequests}
                onEditPR={handleEditPR}
                onCompleteAction={handleCompleteAction}
              />
            )}
          </>
        ) : view === "myRequests" ? (
          <Step5TrackApprovals
            mode={stage5Mode === "tracking" && currentPR ? "tracking" : "list"}
            submittedPR={currentPR}
            allPRs={submittedPRs}
            onSelectPR={handleSelectPR}
            onNewRequest={handleNewRequest}
            onMyRequests={handleShowMyRequests}
            onEditPR={handleEditPR}
            onCompleteAction={handleCompleteAction}
          />
        ) : null}
          </Card>
        ) : null}
        </div>
      )}
    </TooltipProvider>
  );
}
