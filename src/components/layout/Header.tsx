import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LOGO_CLASS_HEADER, LOGO_SRC, SUPPORT_EMAIL } from "@/lib/brand";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, Mail } from "lucide-react";
import LogoHeader from "../../../public/Logo main Bold.png";

const navLinks = [
  { label: "Verify", href: "/#verify" },
  { label: "Peptides", href: "/products" },
  { label: "FAQ", href: "/#faq" },
  { label: "Order", href: "/#order" },
];

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-primary/10">
      <div className="container-bondcell">
        <div className="flex items-center justify-between gap-3 py-3 md:py-4">
          <Link to="/" className="shrink-0 py-1">
            <img
              src={LogoHeader}
              alt="Bond&Cell"
              className={LOGO_CLASS_HEADER}
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.href.startsWith("/#") ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium uppercase tracking-wider text-primary/70 hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className="px-4 py-2 text-sm font-medium uppercase tracking-wider text-primary/70 hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          <div className="hidden md:flex items-center gap-2 flex-1 justify-end max-w-md">
            <form
              onSubmit={handleSearch}
              className="flex-1 relative max-w-xs lg:max-w-sm"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search peptides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-md border-primary/15 bg-muted/50 focus:bg-white"
              />
            </form>
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Bulk%20order%20inquiry`}>
              <Button className="btn-bondcell rounded-md h-11 px-5 hidden xl:inline-flex">
                <Mail className="w-4 h-4 mr-2" />
                Bulk
              </Button>
            </a>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-4 border-t border-primary/10 animate-fade-in pb-6">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search peptides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-md border-primary/15"
              />
            </form>
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) =>
                link.href.startsWith("/#") ? (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-3 text-sm font-semibold uppercase tracking-wide border border-primary/15 rounded-md text-primary"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-3 text-sm font-semibold uppercase tracking-wide border border-primary/15 rounded-md text-primary"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
