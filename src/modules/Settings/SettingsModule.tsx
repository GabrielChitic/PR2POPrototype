import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export function SettingsModule() {
  return (
    <div className="flex-1 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="border rounded-lg p-6 bg-card">
          <p className="text-sm text-muted-foreground mb-6">
            Configuration flows will be implemented here (e.g., approval thresholds, rollout options).
          </p>

          {/* Placeholder controls - non-functional */}
          <div className="space-y-4 max-w-md">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Auto-approval threshold (placeholder)
              </label>
              <Input
                type="number"
                placeholder="e.g., $5000"
                disabled
                className="opacity-60"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Requests below this amount will be auto-approved
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Default urgency level (placeholder)
              </label>
              <Input
                type="text"
                placeholder="Medium"
                disabled
                className="opacity-60"
              />
            </div>

            <div className="pt-2">
              <Button disabled className="opacity-60">
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
