import { useState } from "react";
import { PRProvider, usePRStore } from "./context/PRContext";
import { Sidebar, type ModuleType } from "./components/Sidebar";
import { PersonaSelector } from "./components/PersonaSelector";
import { RequesterModuleV2 as RequesterModule } from "./modules/Requester/RequesterModuleV2";
import { ProcurementModule } from "./modules/Procurement/ProcurementModule";
import { OverviewModule } from "./modules/Overview/OverviewModule";
import { SettingsModule } from "./modules/Settings/SettingsModule";

function AppContent() {
  const [activeModule, setActiveModule] = useState<ModuleType>("requester");
  const { currentPersona, setPersona } = usePRStore();

  const renderModule = () => {
    switch (activeModule) {
      case "requester":
        return <RequesterModule />;
      case "procurement":
        return <ProcurementModule />;
      case "overview":
        return <OverviewModule />;
      case "settings":
        return <SettingsModule />;
      default:
        return <RequesterModule />;
    }
  };

  return (
    <div className="h-screen w-screen bg-background flex">
      {/* Sidebar Navigation */}
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold capitalize">{activeModule}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Office of the CFO • Guided Buying Platform
              </p>
            </div>
            <PersonaSelector
              selectedPersona={currentPersona}
              onPersonaChange={setPersona}
            />
          </div>
        </header>

        {/* Module Content */}
        <div className="flex-1 flex overflow-hidden">{renderModule()}</div>
      </div>
    </div>
  );
}

function App() {
  return (
    <PRProvider>
      <AppContent />
    </PRProvider>
  );
}

export default App;
