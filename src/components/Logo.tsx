import { Link } from "react-router-dom";
import logo from "../../public/NexaLogo.png";

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      <div className="relative">
        <img
          src={logo}
          alt="logo"
          className={`"place-self-center hover:scale-105 transition-all duration-300" ${className}`}
        />
      </div>
    </Link>
  );
};

export default Logo;
