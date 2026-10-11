import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// import Logo from "@/components/Logo";
import logo from "../../../public/NexaLogo.png"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Package, Menu, X } from "lucide-react";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div className="container-nexatech">
        <div className="flex items-center justify-between gap-4 py-4">
          {/* <Logo /> */}
          <Link  to="/">
          <img src={logo} alt="logo" className="w-32 h-22"/>
          </Link>
          {/* Desktop Search & Navigation */}
          <div className="hidden lg:flex items-center gap-6 flex-1 justify-center max-w-2xl">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search authentic products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base"
              />
            </form>
          </div>

          <nav className="hidden md:flex items-center gap-3">
            <Link to="/products">
              <Button variant="ghost" className="font-semibold hover:bg-primary/5 hover:text-primary">
                <Package className="w-4 h-4 mr-2" />
                Browse Products
              </Button>
            </Link>
            {/* <Link to="/admin/login">
              <Button className="btn-nexatech">
                Admin Portal
              </Button>
            </Link> */}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-gray-200 animate-fade-in">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200"
              />
            </form>
            <div className="flex flex-col gap-2">
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button variant="outline" className="w-full justify-start">
                  <Package className="w-4 h-4 mr-2" />
                  Browse Products
                </Button>
              </Link>
              {/* <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button className="w-full btn-nexatech">
                  Admin Portal
                </Button>
              </Link> */}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;