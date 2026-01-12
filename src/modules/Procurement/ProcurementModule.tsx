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
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="border-b bg-card px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Procurement Console
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Triage requests and orders across systems
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Primary Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as WorkbenchTab)}
            className="flex-1 flex flex-col"
          >
            <div className="border-b bg-card px-8">
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
            <div className="border-b bg-card px-8 py-4">
              <div className="flex items-center gap-4">
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
            <div className="flex-1 overflow-auto p-8">
              <TabsContent value="pr" className="mt-0 h-full">
                <Card className="h-full flex flex-col">
                  <CardContent className="p-0 flex-1 flex flex-col">
                    {/* PR Table */}
                    <div className="overflow-auto flex-1">
                      <table className="w-full">
                        <thead className="border-b bg-muted/50">
                          <tr>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                              PR #
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                              Title / Line summary
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                              Phase / Step
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                              Blocker / Exception
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                              Age / SLA
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                              Amount
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                              Requester
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                              Assignee / Queue
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Empty state */}
                          <tr>
                            <td colSpan={9} className="px-4 py-16 text-center">
                              <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
                                <Filter className="h-12 w-12 text-muted-foreground/50" />
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="po" className="mt-0 h-full">
                <Card className="h-full flex flex-col">
                  <CardContent className="p-0 flex-1 flex flex-col">
                    {/* PO Table */}
                    <div className="overflow-auto flex-1">
                      <table className="w-full">
                        <thead className="border-b bg-muted/50">
                          <tr>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                              PO #
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                              Supplier
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                              Phase / Step
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                              Failure reason
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                              Age / SLA
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                              Amount
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                              Assignee / Resolver group
                            </th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Empty state */}
                          <tr>
                            <td colSpan={8} className="px-4 py-16 text-center">
                              <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
                                <Filter className="h-12 w-12 text-muted-foreground/50" />
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
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Detail Panel Placeholder */}
        {showDetailPanel && (
          <div className="w-96 border-l bg-card p-6 overflow-auto">
            <div className="flex flex-col items-center justify-center h-full text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Select an item
              </h3>
              <p className="text-sm text-muted-foreground">
                Details, validations, and audit trail will appear here.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Assistant Button */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg"
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
          <div className="fixed right-0 top-0 bottom-0 w-96 bg-card border-l shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Procurement Assistant</h2>
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
                <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Ask me anything about your procurement queue:
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>"What needs attention?"</p>
                  <p>"Why is this blocked?"</p>
                  <p>"Show SLA-breached PRs."</p>
                </div>
              </div>
            </div>

            {/* Input Box */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about procurement items..."
                  className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
