import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Network,
  FileText,
  Settings,
  Globe2,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/country-comparison", icon: Globe2, label: "Country Comparison" },

  {
    path: "/institution-comparison",
    icon: Building2,
    label: "Institution Comparison",
  },
  { path: "/researcher-analysis", icon: Users, label: "Researcher Analysis" },
  { path: "/field-comparison", icon: Users, label: "Field Comparison" },
  { path: "/area-taxonomy", icon: Network, label: "Area Taxonomy" },
  { path: "classification", icon: FileText, label: "Article classification" },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0f2820] border-r border-[#1a3d33] flex flex-col">
      <div className="p-6 border-b border-[#1a3d33]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
            <Network className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white tracking-tight">Research Analytics</h1>
            <p className="text-emerald-400/60 text-sm">
              Impact Analysis System
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-300"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[#1a3d33]">
        {/* <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-300 w-full transition-all">
          <Settings className="w-5 h-5" />
          <span>Report</span>
        </button> */}
      </div>
    </aside>
  );
}
