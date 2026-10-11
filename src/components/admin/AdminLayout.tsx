import { ReactNode, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LOGO_CLASS_DEFAULT, LOGO_SRC } from "@/lib/brand";
import {
  LayoutDashboard,
  Package,
  Key,
  BarChart3,
  ShoppingCart,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Package, label: "Products", path: "/admin/products" },
    { icon: Key, label: "Serial Numbers", path: "/admin/serials" },
    { icon: ShoppingCart, label: "Stock Requests", path: "/admin/stock-requests" },
    { icon: HelpCircle, label: "FAQ", path: "/admin/faqs" },
    { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300
                    ${sidebarOpen ? "w-50" : "w-20"}`}
      >
        {/* Logo */}
        {/* <div className="p-4 border-b border-sidebar-border">
          <Logo variant="light" showText={sidebarOpen} />
        </div> */}
        <Link to="/" className={`${sidebarOpen ? "p-8" : "p-4"}`}>
          <img
            src={LOGO_SRC}
            alt="Bond&Cell"
            className={`${LOGO_CLASS_DEFAULT} place-self-center hover:opacity-90 transition-opacity duration-300`}
          />
        </Link>

        {/* Navigation */}
        <nav className={`flex-1 p-4 space-y-5 ${sidebarOpen ? "" : "place-self-center"}`}>
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`sidebar-item w-full flex items-center gap-3 ${
                isActive(item.path) ? "active" : ""
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-sidebar-border space-y-2 ${sidebarOpen ? "" : "place-self-center"}`}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sidebar-item w-full flex items-center gap-3"
          >
            <ChevronLeft
              className={`w-5 h-5 flex-shrink-0 transition-transform ${
                !sidebarOpen ? "rotate-180" : ""
              }`}
            />
            {sidebarOpen && <span>Collapse</span>}
          </button>
          <button
            onClick={handleLogout}
            className="sidebar-item w-full flex items-center gap-3 text-destructive"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center justify-between p-4">
          <img src={LOGO_SRC} alt="Bond&Cell" className={LOGO_CLASS_DEFAULT} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="bg-sidebar border-t border-sidebar-border p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`sidebar-item w-full ${
                  isActive(item.path) ? "active" : ""
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="sidebar-item w-full text-destructive"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 pt-20 md:pt-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
