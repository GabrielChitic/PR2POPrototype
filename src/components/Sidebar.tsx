import { ShoppingCart, Package, BarChart3, Settings } from "lucide-react";
import { cn } from "../lib/utils";

export type ModuleType = "requester" | "procurement" | "overview" | "settings";

interface SidebarProps {
  activeModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
}

interface NavItem {
  id: ModuleType;
  label: string;
  icon: typeof ShoppingCart;
}

const navItems: NavItem[] = [
  { id: "requester", label: "Requester", icon: ShoppingCart },
  { id: "procurement", label: "Procurement", icon: Package },
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">PR→PO Agent</h1>
        <p className="text-xs text-gray-500 mt-1">Guided Buying Platform</p>
      </div>

      <nav className="flex-1 p-3 pt-6">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onModuleChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative group",
                  isActive
                    ? "bg-blue-50 text-blue-700 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:bg-blue-600 before:rounded-r"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="p-6 border-t border-gray-200 text-xs text-gray-500">
        <p className="font-medium text-gray-700">Office of the CFO</p>
        <p className="mt-1">Prototype v0.1</p>
      </div>
    </aside>
  );
}
