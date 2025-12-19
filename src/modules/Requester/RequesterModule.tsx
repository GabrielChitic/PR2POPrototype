import { useState, useRef, useEffect } from "react";
import type { ChatMessage, PurchaseRequisition } from "../../types";
import { usePRStore } from "../../context/PRContext";
import { ChatMessage as ChatMessageComponent } from "../../components/ChatMessage";
import { ChatInput } from "../../components/ChatInput";
import { PRDetailsPanel } from "../../components/PRDetailsPanel";
import {
  createPurchaseRequisition,
  getPRByNumber,
  parseMessage,
} from "../../services/prService";

export function RequesterModule() {
  const { prs, addPR, currentPersona } = usePRStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "system",
      content:
        "Welcome to the PR→PO Intake Agent! I can help you create purchase requests, check their status, or list your PRs. Just tell me what you need!",
      timestamp: new Date(),
    },
  ]);
  const [selectedPR, setSelectedPR] = useState<PurchaseRequisition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (
    role: "user" | "assistant" | "system",
    content: string,
    prNumber?: string
  ) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date(),
      prNumber,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = (userMessage: string) => {
    addMessage("user", userMessage);
    const parsed = parseMessage(userMessage);

    if (parsed.action === "create") {
      try {
        const pr = createPurchaseRequisition(userMessage, currentPersona);
        addPR(pr);
        setSelectedPR(pr);

        let response = `✓ Created ${pr.prNumber}\n\n`;
        response += `**What I understood:**\n`;
        response += `• Intent: ${pr.intentClassification.type.replace(/_/g, " ")}\n`;
        response += `• Category: ${pr.contextInference.category}\n`;
        response += `• Entity: ${pr.contextInference.entity} (${pr.contextInference.location})\n`;
        response += `• Urgency: ${pr.contextInference.urgency}`;

        if (pr.contextInference.neededBy !== "Not specified") {
          response += ` - ${pr.contextInference.neededBy}`;
        }

        response += `\n• Backend: ${pr.backendRouting.system}\n`;

        if (pr.lineItems[0]?.totalPrice) {
          response += `• Estimated Total: $${pr.lineItems[0].totalPrice.toLocaleString()}\n`;
        }

        if (pr.intentClassification.needsHumanReview) {
          response += `\n⚠️ **Human review recommended** (confidence: ${pr.intentClassification.confidence})`;
        }

        addMessage("assistant", response, pr.prNumber);
      } catch (error) {
        addMessage("assistant", `Sorry, I encountered an error creating the PR: ${error}`);
      }
    } else if (parsed.action === "status") {
      if (parsed.prNumber) {
        const pr = getPRByNumber(parsed.prNumber);
        if (pr) {
          setSelectedPR(pr);
          let response = `**${pr.prNumber} Details:**\n\n`;
          response += `• Status: ${pr.status}\n`;
          response += `• Category: ${pr.contextInference.category}\n`;
          response += `• Entity/Location: ${pr.contextInference.entity}, ${pr.contextInference.location}\n`;
          response += `• Backend: ${pr.backendRouting.system}\n`;
          response += `• Created: ${pr.createdAt.toLocaleString()}\n`;

          if (pr.intentClassification.needsHumanReview) {
            response += `• Needs Review: Yes (${pr.intentClassification.confidence} confidence)`;
          }

          addMessage("assistant", response, pr.prNumber);
        } else {
          addMessage(
            "assistant",
            `I couldn't find ${parsed.prNumber}. Please check the PR number and try again.`
          );
        }
      } else {
        addMessage(
          "assistant",
          "I couldn't find a PR number in your message. Please specify the PR number (e.g., 'PR-0001')."
        );
      }
    } else if (parsed.action === "list") {
      if (prs.length === 0) {
        addMessage("assistant", "You haven't created any PRs yet.");
      } else {
        let response = `**Your Purchase Requests** (${prs.length} total):\n\n`;
        prs.slice(0, 10).forEach((pr) => {
          response += `• **${pr.prNumber}** - ${pr.contextInference.category} (${pr.status})`;
          if (pr.intentClassification.needsHumanReview) {
            response += " ⚠️";
          }
          response += `\n  ${pr.lineItems[0]?.description.substring(0, 60)}${
            pr.lineItems[0]?.description.length > 60 ? "..." : ""
          }\n`;
        });

        if (prs.length > 10) {
          response += `\n_Showing 10 of ${prs.length} PRs_`;
        }

        addMessage("assistant", response);
      }
    } else {
      addMessage(
        "assistant",
        "I'm not sure what you're asking for. You can:\n• Create a PR (e.g., 'I need 15 laptops')\n• Check status (e.g., 'Where is PR-0001?')\n• List PRs (e.g., 'Show all my PRs')"
      );
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Chat Section */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-4xl mx-auto">
            {messages.map((msg) => (
              <ChatMessageComponent key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input */}
        <div className="border-t bg-card px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <ChatInput onSendMessage={handleSendMessage} />
          </div>
        </div>
      </div>

      {/* PR Details Panel */}
      <div className="w-96 border-l bg-muted/20 p-4 overflow-hidden">
        <PRDetailsPanel pr={selectedPR} />
      </div>
    </div>
  );
}
