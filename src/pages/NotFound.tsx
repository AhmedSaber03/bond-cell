import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-nexatech flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="flex justify-center mb-8">
          <Logo className="w-40" />
        </div>

        <div className="card-premium p-12 space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
            <AlertCircle className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-8xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            404
          </h1>

          <h2 className="text-3xl font-bold text-primary">Page Not Found</h2>

          <p className="text-gray-600 text-lg max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist. It might have been
            moved or deleted.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link to="/">
              <Button className="btn-nexatech w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link to="/products">
              <Button
                variant="outline"
                className="btn-outline-nexatech w-full sm:w-auto"
              >
                Browse Products
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Error Code: 404 • Page Not Found
        </p>
      </div>
    </div>
  );
};

export default NotFound;
