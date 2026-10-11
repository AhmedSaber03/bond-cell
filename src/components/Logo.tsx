import { Link } from "react-router-dom";
import { LOGO_CLASS_DEFAULT, LOGO_SRC } from "@/lib/brand";
import { cn } from "@/lib/utils";

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link to="/" className="flex items-center group">
      <img
        src={LOGO_SRC}
        alt="Bond&Cell"
        className={cn(
          LOGO_CLASS_DEFAULT,
          "hover:opacity-90 transition-opacity duration-300",
          className
        )}
      />
    </Link>
  );
};

export default Logo;
