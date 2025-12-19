import { usePRStore } from "../../context/PRContext";

export function ProcurementModule() {
  const { prs } = usePRStore();

  return (
    <div className="flex-1 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="border rounded-lg p-6 bg-card">
          <p className="text-sm text-muted-foreground mb-4">
            Procurement flows will be implemented here (PR queue, validations, approvals, PO handling).
          </p>

          {/* Minimal proof of shared data */}
          {prs.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Active PRs ({prs.length})</h3>
              <div className="space-y-2">
                {prs.map((pr) => (
                  <div
                    key={pr.id}
                    className="text-sm p-3 bg-muted/50 rounded border"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{pr.prNumber}</span>
                      <span className="text-xs text-muted-foreground">
                        {pr.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {pr.contextInference.category} • {pr.contextInference.entity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {prs.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No PRs available yet. Create some in the Requester module.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
