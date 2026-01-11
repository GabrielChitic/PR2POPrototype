import { useState } from "react";
import { Send, Paperclip, ShoppingCart, Package, Briefcase, FileText, List } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface RequesterHeroLandingProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  onMyRequests?: () => void;
  prsCount?: number;
}

const QUICK_START_SUGGESTIONS = [
  { label: "Laptops (catalog)", icon: ShoppingCart, query: "15 laptops for new contractors" },
  { label: "Office supplies", icon: Package, query: "office supplies for new office" },
  { label: "Software subscription", icon: Briefcase, query: "software subscriptions for team" },
  { label: "Create PR from quote", icon: FileText, query: "create PR from attached quote" },
];

export function RequesterHeroLanding({ onSubmit, disabled, onMyRequests, prsCount = 0 }: RequesterHeroLandingProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSubmit(input.trim());
      setInput("");
    }
  };

  const handleSuggestionClick = (query: string) => {
    if (!disabled) {
      onSubmit(query);
    }
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-primary/5 via-muted/30 to-background">
      {/* Centered Content */}
      <div className="relative flex items-center justify-center min-h-full px-4 py-16">
        <div className="w-full max-w-2xl space-y-8 animate-in fade-in duration-700">{disabled && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="bg-background border rounded-lg p-4 shadow-lg">
                <p className="text-sm text-muted-foreground">Processing your request...</p>
              </div>
            </div>
          )}
          {/* Headline */}
          <div className="text-center space-y-3">
            <h1 className="text-5xl font-bold tracking-tight text-foreground">
              Create a Purchase Request
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Describe what you need — I'll guide you from item selection to submission.
            </p>
          </div>

          {/* Hero Composer Card */}
          <form onSubmit={handleSubmit}>
            <div className="bg-background/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-border/50 p-2 transition-all hover:shadow-xl hover:border-primary/20">
              <div className="flex items-center gap-2 px-4 py-3">
                {/* Left Icons */}
                <button
                  type="button"
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                </button>

                {/* Input */}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g., '15 laptops for new contractors in Bucharest'"
                  disabled={disabled}
                  className="flex-1 bg-transparent border-none outline-none text-base text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                />

                {/* Right Actions */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={disabled || !input.trim()}
                  className="rounded-xl h-12 px-6 shadow-md"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </form>

          {/* Quick Start Chips */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground text-center">
              Quick start
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {QUICK_START_SUGGESTIONS.map((suggestion, index) => {
                const Icon = suggestion.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.query)}
                    disabled={disabled}
                    className={cn(
                      "group inline-flex items-center gap-2 px-4 py-2.5 rounded-full",
                      "bg-background/80 backdrop-blur-sm border border-border/60",
                      "hover:bg-primary/5 hover:border-primary/30 hover:shadow-md",
                      "transition-all duration-200",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {suggestion.label}
                    </span>
                  </button>
                );
              })}

              {/* My Requests chip */}
              {onMyRequests && (
                <button
                  onClick={onMyRequests}
                  disabled={disabled}
                  className={cn(
                    "group inline-flex items-center gap-2 px-4 py-2.5 rounded-full",
                    "bg-background/80 backdrop-blur-sm border border-border/60",
                    "hover:bg-primary/5 hover:border-primary/30 hover:shadow-md",
                    "transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <List className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    My Requests{prsCount > 0 ? ` (${prsCount})` : ""}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Optional: Subtle help text */}
          <p className="text-xs text-center text-muted-foreground/60 pt-4">
            Start by describing what you need, and I'll help you create a complete purchase request
          </p>
        </div>
      </div>
    </div>
  );
}
