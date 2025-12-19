import { usePRStore } from "../../context/PRContext";

export function OverviewModule() {
  const { prs } = usePRStore();

  // Simple aggregations for proof of concept
  const draftCount = prs.filter((pr) => pr.status === "DRAFT").length;
  const totalEstimated = prs.reduce((sum, pr) => {
    const total = pr.lineItems.reduce((itemSum, item) => itemSum + (item.totalPrice || 0), 0);
    return sum + total;
  }, 0);

  return (
    <div className="flex-1 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="border rounded-lg p-6 bg-card">
          <p className="text-sm text-muted-foreground mb-6">
            Overview metrics and charts will be implemented here.
          </p>

          {/* Minimal proof of shared data */}
          {prs.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Total PRs</div>
                <div className="text-3xl font-bold mt-1">{prs.length}</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Draft</div>
                <div className="text-3xl font-bold mt-1">{draftCount}</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Est. Value</div>
                <div className="text-3xl font-bold mt-1">
                  ${totalEstimated.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {prs.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No data available yet. Create some PRs in the Requester module to see metrics.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
