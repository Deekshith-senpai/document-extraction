import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      
      // Close sidebar automatically on mobile when screen resizes
      if (mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return { 
    isMobile: !!isMobile, 
    isSidebarOpen, 
    toggleSidebar, 
    setIsSidebarOpen 
  };
}
