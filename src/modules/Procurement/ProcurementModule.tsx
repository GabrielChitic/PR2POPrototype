import { useState } from "react";
import { MessageCircle, Settings2, Filter, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";

type WorkbenchTab = "pr" | "po";
type ViewFilter = "all" | "attention" | "unassigned" | "sla-risk" | "my-queue";

interface QuickFilter {
  id: string;
  label: string;
  active: boolean;
}

export function ProcurementModule() {
  const [activeTab, setActiveTab] = useState<WorkbenchTab>("pr");
  const [selectedView, setSelectedView] = useState<ViewFilter>("all");
  const [quickFilters, setQuickFilters] = useState<QuickFilter[]>([
    { id: "unassigned", label: "Unassigned", active: false },
    { id: "sla-breached", label: "SLA breached", active: false },
    { id: "holds", label: "Holds", active: false },
    { id: "exceptions", label: "Exceptions", active: false },
    { id: "high-value", label: "High value", active: false },
  ]);
  const [showAssistant, setShowAssistant] = useState(false);
  const [showDetailPanel, _setShowDetailPanel] = useState(false);

  const toggleQuickFilter = (id: string) => {
    setQuickFilters((prev) =>
      prev.map((filter) =>
        filter.id === id ? { ...filter, active: !filter.active } : filter
      )
    );
  };

  const getEmptyStateText = (workbench: WorkbenchTab, view: ViewFilter) => {
    if (workbench === "pr") {
      if (view === "all") {
        return {
          title: "No requests yet",
          subtitle: "Requests will appear here once ingestion is connected.",
          helper: "Create a request in the Requester module to generate PRs later.",
        };
      } else if (view === "attention") {
        return {
          title: "No PRs need attention",
          subtitle: "When a requisition fails readiness or needs a decision, it will appear here.",
        };
      }
    } else {
      // PO workbench
      if (view === "all") {
        return {
          title: "No orders yet",
          subtitle: "Orders will appear here once PO ingestion is connected.",
        };
      } else if (view === "attention") {
        return {
          title: "No POs need attention",
          subtitle: "Posting and dispatch failures will appear here.",
        };
      }
    }

    // Default fallback
    return {
      title: workbench === "pr" ? "No requests found" : "No orders found",
      subtitle: "Adjust your filters to see different items.",
    };
  };

  const emptyState = getEmptyStateText(activeTab, selectedView);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-muted/20">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden p-4">
        {/* Primary Workspace Card */}
        <Card className="flex-1 flex flex-col shadow-lg border-border/50">
          {/* Header */}
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Procurement Console
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Triage requests and orders across systems
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as WorkbenchTab)}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="border-b bg-background/95 px-8">
              <TabsList className="bg-transparent">
                <TabsTrigger value="pr" className="data-[state=active]:bg-background">
                  PR Workbench (Requests)
                </TabsTrigger>
                <TabsTrigger value="po" className="data-[state=active]:bg-background">
                  PO Workbench (Orders)
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Shared Controls Row */}
            <div className="border-b bg-background/95 px-8 py-4">
              <div className="flex items-center gap-4 flex-wrap">
                {/* Views Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Views:</span>
                  <Select value={selectedView} onValueChange={(value: string) => setSelectedView(value as ViewFilter)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All items</SelectItem>
                      <SelectItem value="attention">Needs attention</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      <SelectItem value="sla-risk">SLA risk</SelectItem>
                      <SelectItem value="my-queue">My queue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-border" />

                {/* Quick Filter Chips */}
                <div className="flex items-center gap-2 flex-wrap">
                  {quickFilters.map((filter) => (
                    <Badge
                      key={filter.id}
                      variant={filter.active ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer hover:bg-primary/10 transition-colors",
                        filter.active && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => toggleQuickFilter(filter.id)}
                    >
                      {filter.label}
                      {filter.active && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-border" />

                {/* Columns Button */}
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings2 className="h-4 w-4" />
                  Columns
                </Button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              <TabsContent value="pr" className="h-full m-0 p-8 overflow-auto">
                <div className="bg-background rounded-lg border shadow-sm">
                  {/* PR Table */}
                  <div className="overflow-auto">
                    <table className="w-full">
                      <thead className="border-b bg-muted/50">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            PR #
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Title / Line summary
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Phase / Step
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Blocker / Exception
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Age / SLA
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Amount
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Requester
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Assignee / Queue
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Empty state */}
                        <tr>
                          <td colSpan={9} className="px-4 py-16 text-center">
                            <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
                              <div className="p-4 rounded-full bg-muted/30">
                                <Filter className="h-8 w-8 text-muted-foreground/50" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-foreground mb-1">
                                  {emptyState.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {emptyState.subtitle}
                                </p>
                                {emptyState.helper && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {emptyState.helper}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="po" className="h-full m-0 p-8 overflow-auto">
                <div className="bg-background rounded-lg border shadow-sm">
                  {/* PO Table */}
                  <div className="overflow-auto">
                    <table className="w-full">
                      <thead className="border-b bg-muted/50">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            PO #
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Supplier
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Phase / Step
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Failure reason
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Age / SLA
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Amount
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Assignee / Resolver group
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Empty state */}
                        <tr>
                          <td colSpan={8} className="px-4 py-16 text-center">
                            <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
                              <div className="p-4 rounded-full bg-muted/30">
                                <Filter className="h-8 w-8 text-muted-foreground/50" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-foreground mb-1">
                                  {emptyState.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {emptyState.subtitle}
                                </p>
                                {emptyState.helper && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {emptyState.helper}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Detail Panel Placeholder */}
        {showDetailPanel && (
          <Card className="w-96 ml-4 shadow-lg border-border/50">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center h-full text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Select an item
                </h3>
                <p className="text-sm text-muted-foreground">
                  Details, validations, and audit trail will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Assistant Button */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg z-30"
        onClick={() => setShowAssistant(true)}
        title="Assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Assistant Drawer */}
      {showAssistant && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowAssistant(false)}
          />

          {/* Drawer */}
          <div className="fixed right-0 top-0 bottom-0 w-96 bg-background border-l shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Procurement Assistant</h2>
                  <p className="text-xs text-muted-foreground">Ask about your queue</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAssistant(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-auto p-6">
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="p-4 rounded-full bg-muted/30 mb-4">
                  <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Ask me anything about your procurement queue:
                </p>
                <div className="text-xs text-muted-foreground space-y-2 bg-muted/30 rounded-lg p-4 max-w-xs">
                  <p className="font-medium">"What needs attention?"</p>
                  <p className="font-medium">"Why is this blocked?"</p>
                  <p className="font-medium">"Show SLA-breached PRs."</p>
                </div>
              </div>
            </div>

            {/* Input Box */}
            <div className="border-t bg-background/95 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about procurement items..."
                  className="flex-1 px-3 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled
                />
                <Button disabled>Send</Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
