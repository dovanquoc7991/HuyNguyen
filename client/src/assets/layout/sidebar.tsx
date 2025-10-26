import { 
  Home, 
  BookOpen, 
  Headphones, 
  TrendingUp, 
  History,
  UserPlus,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { me } from "@/assets/hooks/use-user";

export default function Sidebar() {
  const [location] = useLocation();
  const { data: user} = me();

  const navigationItems = [
    { path: "/", icon: Home, label: "Dashboard" },
  ];

  const practiceItems = [
    { path: "/reading", icon: BookOpen, label: "Reading Practice" },
    { path: "/listening", icon: Headphones, label: "Listening Practice" },
  ];

  const trackingItems = [
    { path: "/progress", icon: TrendingUp, label: "Performance" },
  ];

  const settingItems = [
    { path: "/register", icon: UserPlus, label: "Add user" },
  ];

  const NavItem = ({ path, icon: Icon, label }: { path: string; icon: any; label: string }) => {
    const isActive = location === path;
    
    return (
      <Link href={path}>
        <a className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
          isActive 
            ? "bg-green-light text-primary-green font-medium" 
            : "text-secondary hover:bg-green-light hover:text-primary-green"
        }`}>
          <Icon size={20} />
          <span>{label}</span>
        </a>
      </Link>
    );
  };

  return (
    <aside className="w-60 bg-white shadow-sm border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto">
      <div className="p-6">
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
          
          <div className="pt-4">
            <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3 text-left">
              Practice Skills
            </h3>
            {practiceItems.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </div>

          <div className="pt-4">
            <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3 text-left">
              Track Progress
            </h3>
            {trackingItems.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </div>

          {user?.role === "admin" && (
            <div className="pt-4">
              <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3 text-left">
                Settings
              </h3>
              {settingItems.map((item) => (
                <NavItem key={item.path} {...item} />
              ))}
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
}
