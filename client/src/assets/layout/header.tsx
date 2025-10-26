import { Bell, BookOpen, Flame, GraduationCap, Headphones, HomeIcon, LayoutDashboard, LogOut, Menu, Mic, Pencil, Settings, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/assets/ui/button";
import { me } from "@/assets/hooks/use-user";
import { useAuth } from "@/assets/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { TOKEN_KEY } from "../lib/queryClient";
import { COMPANY_NAME } from "../Constants";
import { useEffect, useRef, useState } from "react";
import { MdLockReset } from "react-icons/md";

export default function Header() {
  const { data: user } = me();
  const { logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  const menuItems = [
    { label: "Home", href: "/home", icon: HomeIcon }, 
    { label: "Reading Tests", href: "/practice/reading", icon: BookOpen },
    { label: "Listening Tests", href: "/practice/listening", icon: Headphones },
    { label: "Speaking Tests", href: "/practice/speaking", icon: Mic },
    { label: "Writing Tests", href: "/practice/writing", icon: Pencil },
  ];

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const savedToken = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
      const res = await logout(savedToken);
    } catch (error: any) {
    }

    setLocation('/');
  };

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-green rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white" size={18} />
            </div>
            <Link href="/">
              <span className="font-bold text-xl text-primary cursor-pointer">
                {COMPANY_NAME}
              </span>
            </Link>
          </div>
        </div>

        {/* Remove the navigation bar */}
        {/* <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <span className={`text-secondary hover:text-primary-green transition-colors font-medium cursor-pointer ${
                location === item.path ? "text-primary-green" : ""
              }`}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav> */}

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {/* Avatar + context menu */}
            <div className="relative" ref={avatarRef}>
              <div
                className="w-8 h-8 bg-primary-green rounded-full flex items-center justify-center cursor-pointer"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <span className="text-white font-medium text-sm">
                  {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
                </span>
              </div>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                  {/* support change password*/}
                  <button
                    className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => setLocation("/change-password")}
                  >
                    <MdLockReset size={18} className="text-primary-green" />
                    Change Password
                  </button>

                  {user?.role === "admin" && (
                    <Link
                      href="/register"
                      className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      onClick={() => setMenuOpen(false)}
                    >
                      <UserPlus size={16} className="text-primary-green" />
                      Add User
                    </Link>
                  )}

                  {user?.role === "admin" && (
                    <Link
                      href="/admin"
                      className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LayoutDashboard size={16} className="text-primary-green" />
                      Admin Dashboard
                    </Link>
                  )}
                </div>

              )}
            </div>
            {/* Nút logout cũ */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="p-2"
              title="Logout"
            >
              <LogOut size={18} />
            </Button>
            <div className="md:hidden block">
              <Menu
                size={28}
                className="cursor-pointer"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              />
            </div>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-50 flex"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-white w-64 h-full shadow-lg p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-3 px-2 py-3 cursor-pointer hover:bg-gray-100 text-gray-700">
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
