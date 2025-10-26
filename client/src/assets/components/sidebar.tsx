import { Link, useLocation } from "wouter";
import { cn } from "@lib/utils";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  const navItems = [
    // {
    //   href: "/admin",
    //   label: "Dashboard",
    //   icon: "fas fa-tachometer-alt",
    // },
    {
      href: "/admin/tests",
      label: "All Tests",
      icon: "fas fa-file-alt",
    },
    {
      href: "/admin/create-reading-test",
      label: "Create Reading Test",
      icon: "fas fa-plus-circle",
    },
    {
      href: "/admin/create-listening-test",
      label: "Create Listening Test",
      icon: "fas fa-plus-circle",
    },

    {
      href: "/admin/create-writing-test",
      label: "Create Writing Test",
      icon: "fas fa-plus-circle",
    },
    {
      href: "/admin/create-speaking-test",
      label: "Create Speaking Test",
      icon: "fas fa-plus-circle",
    },
    // {
    //   href: "/admin/reading-tests",
    //   label: "Reading Tests",
    //   icon: "fas fa-book-reader",
    // },
    // {
    //   href: "/admin/listening-tests",
    //   label: "Listening Tests",
    //   icon: "fas fa-headphones",
    // },
    // {
    //   href: "/admin/writing-tests",
    //   label: "Writing Tests",
    //   icon: "fas fa-pen-fancy",
    // },
    // {
    //   href: "/admin/speaking-tests",
    //   label: "Speaking Tests",
    //   icon: "fas fa-microphone",
    // },
    {
      href: "/admin/users",
      label: "User Management",
      icon: "fas fa-users",
    },
    {
      href: "/practice/reading",
      label: "User Dashboard",
      icon: "fas fa-user",
    },
  ];

  const settingsItems = [
    {
      href: "/settings",
      label: "Settings",
      icon: "fas fa-cog",
    },
    {
      href: "/help",
      label: "Help & Support",
      icon: "fas fa-question-circle",
    },
  ];

  return (
    <aside className={cn("w-80 bg-white shadow-lg flex flex-col", className)}>
      {/* Logo and Brand */}
      <div className="px-6 py-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-graduation-cap text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">IELTS Admin</h1>
            <p className="text-sm text-gray-600">Test Management</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "sidebar-link",
                location === item.href && "active"
              )}
            >
              <i className={cn(item.icon, "w-5 h-5 mr-3")}></i>
              {item.label}
            </div>
          </Link>
        ))}

        {/* <div className="pt-4 border-t border-gray-200 mt-4">
          {settingsItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="sidebar-link">
                <i className={cn(item.icon, "w-5 h-5 mr-3")}></i>
                {item.label}
              </div>
            </Link>
          ))}
        </div> */}
      </nav>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              Admin User
            </p>
            <p className="text-xs text-gray-600 truncate">huynguyen@ielts.com</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}
