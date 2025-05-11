import React from "react";
import { useSidebar } from "@/contexts/SidebarContext";

const MobileNavbar: React.FC = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="md:hidden bg-primary text-white w-full fixed top-0 z-10">
      <div className="flex justify-between items-center h-16 px-4">
        <div className="flex items-center">
          <span className="material-icons mr-2">description</span>
          <span className="font-semibold">DocuAI Platform</span>
        </div>
        <button 
          type="button" 
          className="text-white focus:outline-none"
          onClick={toggleSidebar}
          aria-label="Toggle mobile menu"
        >
          <span className="material-icons">menu</span>
        </button>
      </div>
    </div>
  );
};

export default MobileNavbar;
