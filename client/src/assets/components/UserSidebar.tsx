import { Link, useLocation } from "wouter";
import { cn } from "@lib/utils";
import "../css/UserSidebar.css";

import {
  BookOpen,
  Headphones,
  Mic,
  Pencil,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  HomeIcon,
  LayoutDashboard,
  FileText,
  Users,
  User,
  BookPlus,
  FilePenLine,
  FilePlus,
  FileStack,
  UserCheck,
  MessageSquare,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";

const userMenuItems = [
  { label: "Home", href: "/home", icon: HomeIcon },
  { label: "Reading Tests", href: "/practice/reading", icon: BookOpen },
  { label: "Listening Tests", href: "/practice/listening", icon: Headphones },
  { label: "Speaking Tests", href: "/practice/speaking", icon: Mic },
  { label: "Writing Tests", href: "/practice/writing", icon: Pencil },
  { label: "Short stories", href: "/practice/reports", icon: Megaphone },
];

const adminMenuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/tests", label: "All Tests", icon: FileText },
  { href: "/admin/create-reading-test", label: "Create Reading", icon: BookPlus },
  { href: "/admin/create-listening-test", label: "Create Listening", icon: Headphones },
  { href: "/admin/create-writing-test", label: "Create Writing", icon: FilePlus },
  { href: "/admin/create-speaking-test", label: "Create Speaking", icon: Mic },
  { href: "/admin/create-stories", label: "Create Story", icon: FilePenLine },
  { href: "/admin/posts", label: "All Posts", icon: FileStack },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/feedback", label: "User Feedback", icon: MessageSquare  },
  { href: "/home", label: "Back to User View", icon: User },
];

export default function UserSidebar({ 
  className, 
  onToggle,
  menuType = 'user'
}: { 
  className?: string;
  onToggle?: (isCollapsed: boolean) => void;
  menuType?: 'user' | 'admin';
}) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const menuItems = menuType === 'admin' ? adminMenuItems : userMenuItems;

  const activeIndex = useMemo(() => {
    const matchScores = menuItems.map(item => {
      if (item.href === '/admin' && location !== '/admin') {
        return 0;
      }
      if (location.startsWith(item.href)) {
        if (location === item.href) {
          return item.href.length + 1;
        }
        return item.href.length;
      }
      return 0;
    });

    const maxScore = Math.max(...matchScores);
    if (maxScore > 0) {
      return matchScores.indexOf(maxScore);
    }
    return -1;
  }, [location, menuItems]);

  // Kiểm tra kích thước màn hình
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024; 
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true); 
        onToggle?.(true);
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [onToggle]);

  const toggleSidebar = () => {
    if (isMobile) return; // mobile luôn collapsed
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onToggle?.(newState);
  };

  return (
    <aside
      className={cn(
        "fixed top-16 left-0 h-[calc(100vh-100px)] bg-white shadow-md z-30 flex flex-col transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
        isMobile ? "mobile-sidebar" : "",
        className
      )}
    >
      {/* Toggle chỉ hiện desktop */}
      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-4 w-7 h-7 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-40"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      )}

      <div className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === activeIndex;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center cursor-pointer overflow-hidden transition-all duration-300",
                  isCollapsed ? "justify-center px-4 py-3" : "gap-3 px-6 py-3",
                  isActive
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "hover:bg-gray-100 text-gray-700"
                )}
                title={isCollapsed || isMobile ? item.label : ""}
              >
                <Icon size={isCollapsed || isMobile ? 24 : 18} />
                <span
                  className={cn(
                    "transition-all duration-300",
                    (isCollapsed || isMobile)
                      ? "opacity-0 w-0 h-0"
                      : "opacity-100"
                  )}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
