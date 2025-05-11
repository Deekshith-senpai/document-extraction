import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";

type SidebarItem = {
  name: string;
  href: string;
  icon: string;
};

const navigationItems: SidebarItem[] = [
  { name: "Dashboard", href: "/", icon: "dashboard" },
  { name: "Upload Documents", href: "/upload", icon: "upload_file" },
  { name: "Settings", href: "/settings", icon: "settings" }
];

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { isSidebarOpen, closeSidebar } = useSidebar();

  // Close sidebar on navigation on mobile
  const handleNavigation = () => {
    if (window.innerWidth < 768) {
      closeSidebar();
    }
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 bg-white shadow-lg flex-shrink-0 hidden md:flex md:flex-col">
        <div className="h-16 flex items-center px-6 bg-primary text-white font-semibold">
          <span className="material-icons mr-2">description</span>
          <span>DocuAI Platform</span>
        </div>
        <nav className="py-4 flex-1">
          <ul>
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <div
                    className={cn(
                      "flex items-center px-6 py-3 text-slate-600 hover:bg-slate-100 cursor-pointer",
                      location === item.href && "bg-slate-100 text-primary"
                    )}
                    onClick={handleNavigation}
                  >
                    <span
                      className={cn(
                        "material-icons mr-3",
                        location === item.href ? "text-primary" : "text-slate-500"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center text-slate-600 hover:text-primary-600 cursor-pointer">
            <span className="material-icons mr-2 text-sm">help_outline</span>
            <span className="text-sm">Documentation</span>
            <span className="text-xs text-slate-400 ml-auto">View API Docs</span>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:hidden",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center px-6 bg-primary text-white font-semibold">
          <span className="material-icons mr-2">description</span>
          <span>DocuAI Platform</span>
          <button 
            className="ml-auto text-white focus:outline-none"
            onClick={closeSidebar}
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        <nav className="py-4">
          <ul>
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <div
                    className={cn(
                      "flex items-center px-6 py-3 text-slate-600 hover:bg-slate-100 cursor-pointer",
                      location === item.href && "bg-slate-100 text-primary"
                    )}
                    onClick={handleNavigation}
                  >
                    <span
                      className={cn(
                        "material-icons mr-3",
                        location === item.href ? "text-primary" : "text-slate-500"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-200">
          <div className="flex items-center text-slate-600 hover:text-primary cursor-pointer">
            <span className="material-icons mr-2 text-sm">help_outline</span>
            <span className="text-sm">Documentation</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;