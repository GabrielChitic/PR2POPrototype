import { Calendar, DollarSign } from "lucide-react";
import { Card } from "../ui/Card";
import { StatusPill } from "../ui/StatusPill";
import type { PurchaseRequisition } from "../../types";

interface MyPRsViewProps {
  prs: PurchaseRequisition[];
  onSelectPR: (pr: PurchaseRequisition) => void;
}

export function MyPRsView({ prs, onSelectPR }: MyPRsViewProps) {
  if (prs.length === 0) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">My PRs</h2>
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              You haven't created any PRs yet. Start a conversation in the chat to create your first purchase request!
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My PRs ({prs.length})</h2>
        </div>

        <div className="space-y-3">
          {prs.map((pr) => {
            const totalValue = pr.lineItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

            return (
              <Card
                key={pr.id}
                className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onSelectPR(pr)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{pr.prNumber}</h3>
                      <StatusPill
                        variant={
                          pr.status === "SUBMITTED"
                            ? "submitted"
                            : pr.status === "APPROVED"
                            ? "approved"
                            : pr.status === "DRAFT"
                            ? "draft"
                            : "in_progress"
                        }
                      >
                        {pr.status}
                      </StatusPill>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {pr.lineItems[0]?.description || "No description"}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {pr.createdAt.toLocaleDateString()}
                      </span>
                      <span>
                        {pr.lineItems.length} item{pr.lineItems.length !== 1 ? "s" : ""}
                      </span>
                      {pr.contextInference && (
                        <span>{pr.contextInference.category}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="flex items-center gap-1 text-lg font-semibold">
                      <DollarSign className="h-4 w-4" />
                      {totalValue.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {pr.backendRouting?.system}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
