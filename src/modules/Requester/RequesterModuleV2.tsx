import { useState, useRef, useEffect } from "react";
import { MessageSquare, List, Loader2 } from "lucide-react";
import { usePRStore } from "../../context/PRContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Stepper } from "../../components/workflow/Stepper";
import { Step1ChooseItems } from "../../components/workflow/Step1ChooseItems";
import { Step2Container } from "../../components/workflow/Step2Container";
import { Step3Summary } from "../../components/workflow/Step3Summary";
import { Step4Validation } from "../../components/workflow/Step4Validation";
import { Step5Approvals } from "../../components/workflow/Step5Approvals";
import { MyPRsView } from "../../components/workflow/MyPRsView";
import { performSearch, autoPopulateFreeTextItem } from "../../services/unifiedSearch";
import type { WorkflowStep, DraftPR, DraftLineItem, PurchaseInfo, ValidationIssue, CatalogItem, FreeTextItemDraft, RequestType } from "../../types/workflow";
import type { ChatMessage } from "../../types";
import { createPurchaseRequisition } from "../../services/prService";

export function RequesterModuleV2() {
  const { prs, addPR, currentPersona } = usePRStore();
  const [view, setView] = useState<"workflow" | "myPRs">("workflow");
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "system",
      content: "Hi! I'm your PR→PO assistant. Tell me what you need to buy, and I'll guide you through creating a purchase request.\n\nCommands: 'help' • 'status' • 'start over'\nExample: 'I need 3 laptops for new hires'",
      timestamp: new Date(),
    },
  ]);
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
        return "Tell me what you need to buy (e.g., '3 laptops' or 'consulting services for SAP').";
      case 1:
        return "You can choose items from the catalog, adjust quantities, or use the 'New Request' button to start over.";
      case 2:
        return "Please provide purchase information like usage, delivery details, and need-by date.";
      case 3:
        return "Review your request details. You can edit any section or proceed to validation.";
      case 4:
        return "Address any validation issues highlighted above, then proceed to see the approval path.";
      case 5:
        return "Review your approval path and submit when ready!";
      default:
        return "I'm here to help you create purchase requests. Ask me anything!";
    }
  };

  // Helper: Handle chat commands
  const handleChatCommand = (message: string, messageLower: string): boolean => {
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
      // Generate mock contracts if not already generated
      const category = draft.lineItems[0]?.category || "Professional Services";

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

    // Parse date patterns
    const datePatterns = [
      { regex: /need\s+(?:it\s+)?by\s+(\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?\w+(?:\s+\d{4})?)/i, label: 'by' },
      { regex: /by\s+(?:the\s+)?(\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?\w+(?:\s+\d{4})?)/i, label: 'by' },
      { regex: /(?:deadline|date)[\s:]+(\d{1,2}(?:st|nd|rd|th)?\s+\w+(?:\s+\d{4})?)/i, label: 'date' },
      { regex: /(\d{4}-\d{2}-\d{2})/i, label: 'iso' },
    ];

    for (const { regex } of datePatterns) {
      const match = message.match(regex);
      if (match) {
        let dateStr = match[1].trim();
        // Remove ordinal suffixes (st, nd, rd, th)
        dateStr = dateStr.replace(/(\d+)(?:st|nd|rd|th)/i, '$1');
        // Remove "of"
        dateStr = dateStr.replace(/\s+of\s+/i, ' ');

        const parsedDate = parseFlexibleDate(dateStr);
        if (parsedDate) {
          metadata.purchaseInfo.needByDate = parsedDate;
          // Remove date from search query
          workingMessage = workingMessage.replace(match[0], '').trim();
          break;
        }
      }
    }

    // Parse location patterns
    const locationPatterns = [
      /(?:deliver\s+to|to)\s+([A-Za-z\s]+?)\s+(?:office|location|site)/i,
      /(?:at|in)\s+([A-Za-z\s]+?)\s+(?:office|location|site)/i,
      /(?:office|location|site)[\s:]+([A-Za-z\s]+?)(?:\s|,|\.|\band\b|$)/i,
    ];

    for (const pattern of locationPatterns) {
      const match = message.match(pattern);
      if (match) {
        const location = match[1].trim();
        if (location.length > 2 && location.length < 50) {
          metadata.purchaseInfo.deliverToLocation = location;
          // Remove location from search query
          workingMessage = workingMessage.replace(match[0], '').trim();
          break;
        }
      }
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

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSearching) return;

    const userMessage = chatInput.trim();
    const messageLower = userMessage.toLowerCase();

    // Clear input immediately
    setChatInput("");

    // Check for commands FIRST (don't add to chat)
    if (handleChatCommand(userMessage, messageLower)) {
      return;
    }

    // Not a command - add to chat and process
    addChatMessage("user", userMessage);

    // Context-aware responses based on current step
    if (currentStep === 2 && draft.lineItems.length > 0) {
      // Step 2 Co-pilot: Parse message and update form fields
      handleStep2CoPilot(userMessage);
    } else if (currentStep === 0) {
      // Parse initial request to extract metadata
      const parsed = parseInitialRequest(userMessage);
      const { searchQuery, purchaseInfo: extractedInfo } = parsed;

      // Start search process
      setIsSearching(true);

      // Create new draft PR with extracted metadata
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
      };
      setDraft(newDraft);

      // Build smart confirmation message
      const extractedParts: string[] = [];
      if (extractedInfo.needByDate) extractedParts.push(`date: ${extractedInfo.needByDate}`);
      if (extractedInfo.deliverToLocation) extractedParts.push(`location: ${extractedInfo.deliverToLocation}`);
      if (extractedInfo.deliverTo && extractedInfo.deliverTo !== currentPersona.name) {
        extractedParts.push(`recipient: ${extractedInfo.deliverTo}`);
      }
      if (extractedInfo.projectName) extractedParts.push(`project: ${extractedInfo.projectName}`);
      if (extractedInfo.usage) extractedParts.push(`purpose: ${extractedInfo.usage.substring(0, 30)}${extractedInfo.usage.length > 30 ? '...' : ''}`);

      if (extractedParts.length > 0) {
        addChatMessage("assistant", `✓ Got it! Searching for "${searchQuery}"... I've captured: ${extractedParts.join(', ')}`);
      } else {
        addChatMessage("assistant", `Let me check our catalogs for "${searchQuery}"... searching now.`);
      }

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
          addChatMessage(
            "assistant",
            `I found ${searchResult.matchedItems.length} matching items in the catalog. Select items and quantities to continue.`
          );
          setCurrentStep(1);
        } else {
          addChatMessage(
            "assistant",
            "I couldn't find a suitable catalog item. I'll create a Free Text item for you - please fill in the details below."
          );

          const freeTextData = autoPopulateFreeTextItem(searchQuery);
          setFreeTextDraft(freeTextData);

          setCurrentStep(1);
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

    // Add restart message
    addChatMessage("assistant", "✓ Starting fresh! What would you like to buy? (Type 'help' for assistance)");

    // Focus chat input
    setTimeout(() => {
      const input = document.querySelector('input[placeholder="Type your message..."]') as HTMLInputElement;
      if (input) input.focus();
    }, 100);
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
      catalogGoods: "Step 2/5: Great! Now just a few quick details about this catalog order.",
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
    setCurrentStep(3);
    addChatMessage("assistant", "Step 3/5: Please review your request before I run validations.");
  };

  const handleStep3Confirm = () => {
    // Run validations
    const issues: ValidationIssue[] = [];
    const totalValue = draft.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);

    if (totalValue > 50000) {
      issues.push({
        id: "val-1",
        type: "error",
        message: "Requests over $50,000 require a quote attachment.",
        canFix: true,
        fixAction: "Upload quote",
      });
    }

    const hasNonPreferred = draft.lineItems.some((item) => !item.isPreferredSupplier);
    if (hasNonPreferred) {
      issues.push({
        id: "val-2",
        type: "suggestion",
        message: "Consider using preferred suppliers for faster approval.",
        canFix: false,
      });
    }

    setDraft((prev) => ({ ...prev, validationIssues: issues }));
    setCurrentStep(4);

    if (issues.filter((i) => i.type === "error").length === 0) {
      addChatMessage("assistant", "Step 4/5: Good news! Your request passes all policy checks.");
    } else {
      addChatMessage("assistant", "Step 4/5: I found some issues that need attention before submission.");
    }
  };

  const handleResolveIssue = (issueId: string) => {
    setDraft((prev) => ({
      ...prev,
      validationIssues: prev.validationIssues.filter((i) => i.id !== issueId),
    }));
    addChatMessage("assistant", "Issue resolved! You can now proceed.");
  };

  const handleStep4Next = () => {
    // Generate approval path
    const totalValue = draft.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
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

    setDraft((prev) => ({ ...prev, approvalPath }));
    setCurrentStep(5);
    addChatMessage("assistant", "Step 5/5: Here's your approval path. Ready to submit?");
  };

  const handleSubmit = () => {
    // Convert draft to PR using existing service
    const prMessage = draft.lineItems.map((item) => `${item.quantity} ${item.name}`).join(", ");
    const pr = createPurchaseRequisition(prMessage, currentPersona);
    addPR(pr);

    setIsSubmitted(true);
    addChatMessage(
      "assistant",
      `✅ ${pr.prNumber} submitted successfully! First approver: ${draft.approvalPath[0]?.approverName}. Check "My PRs" to track progress.`
    );
  };

  const handleStartNew = () => {
    setCurrentStep(0);
    setIsSubmitted(false);
    setCatalogResults([]);
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
    addChatMessage("system", "Ready for a new request. What would you like to buy?");
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-gray-50">
      {/* Left: Chat Panel (40%) */}
      <div className="w-[40%] flex flex-col border-r border-gray-200 bg-white">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold flex items-center gap-2 text-gray-900">
            <MessageSquare className="h-5 w-5 text-primary" />
            Chat Assistant
          </h3>
          <p className="text-xs text-gray-500 mt-1">Ask me to help create a purchase request</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 rounded-xl text-sm leading-relaxed transition-all ${
                msg.role === "user"
                  ? "bg-blue-600 text-white ml-12 shadow-sm"
                  : msg.role === "system"
                  ? "bg-blue-50 text-blue-900 border border-blue-100 mr-12"
                  : "bg-gray-100 text-gray-900 mr-12"
              }`}
            >
              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleChatSubmit} className="p-6 border-t border-gray-200 bg-white">
          <div className="flex gap-3">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            />
            <Button type="submit" size="lg">Send</Button>
          </div>
        </form>
      </div>

      {/* Right: Workflow or My PRs (60%) */}
      <div className="flex-1 flex flex-col bg-white">
        {/* View Toggle */}
        <div className="border-b border-gray-200 px-6 py-3 flex items-center gap-2 bg-gray-50">
          <button
            onClick={() => setView("workflow")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              view === "workflow"
                ? "bg-white text-blue-700 border-2 border-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            New Request
          </button>
          <button
            onClick={() => setView("myPRs")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              view === "myPRs"
                ? "bg-white text-blue-700 border-2 border-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <List className="h-4 w-4" />
            My PRs ({prs.length})
          </button>
          {(currentStep > 0 || draft.lineItems.length > 0) && !isSubmitted && (
            <Button size="sm" variant="secondary" onClick={handleNewRequest} className="ml-auto">
              New Request
            </Button>
          )}
          {isSubmitted && currentStep === 5 && (
            <Button size="sm" variant="secondary" onClick={handleStartNew} className="ml-auto">
              Start New Request
            </Button>
          )}
        </div>

        {view === "workflow" ? (
          <>
            {currentStep > 0 && !isSearching && <Stepper currentStep={currentStep} />}

            {currentStep === 0 && !isSearching && (
              <div className="flex-1 flex items-center justify-center p-12 bg-gradient-to-br from-gray-50 to-white">
                <div className="text-center max-w-lg">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-6">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Start a conversation</h3>
                  <p className="text-base text-gray-600 leading-relaxed mb-8">
                    Tell me what you need in the chat, and I'll guide you through creating a purchase request step by step.
                  </p>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-sm text-blue-900 font-medium mb-2">Try saying:</p>
                    <p className="text-sm text-blue-700 italic">"I need 3 laptops for new hires"</p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading/Searching State */}
            {isSearching && (
              <div className="flex-1 flex items-center justify-center p-12 bg-gray-50">
                <div className="text-center max-w-lg">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-6">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Searching for matching items...</h3>
                  <p className="text-sm text-gray-600">
                    I'm checking our catalogs to find the best options for your request.
                  </p>
                  <div className="mt-8 space-y-3">
                    {/* Skeleton placeholders */}
                    <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
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
              <Step3Summary
                draft={draft}
                onEdit={(step) => setCurrentStep(step)}
                onConfirm={handleStep3Confirm}
                onBack={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 4 && (
              <Step4Validation
                issues={draft.validationIssues}
                onResolveIssue={handleResolveIssue}
                onNext={handleStep4Next}
                onBack={() => setCurrentStep(3)}
              />
            )}

            {currentStep === 5 && (
              <Step5Approvals
                approvalPath={draft.approvalPath}
                onSubmit={handleSubmit}
                onBack={() => setCurrentStep(4)}
                isSubmitted={isSubmitted}
              />
            )}
          </>
        ) : (
          <MyPRsView prs={prs} onSelectPR={() => {}} />
        )}
      </div>
    </div>
  );
}
