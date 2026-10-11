import { Shield } from "lucide-react";
import {
  AUTH_SYSTEM_LABEL,
  BRAND_NAME,
  LOGO_CLASS_FOOTER,
  LOGO_SRC,
  SUPPORT_EMAIL,
} from "@/lib/brand";

const SiteFooter = () => (
  <footer className="border-t border-primary/10 bg-white">
    <div className="container-bondcell py-12 md:py-14">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <img
          src={LOGO_SRC}
          alt={BRAND_NAME}
          className={LOGO_CLASS_FOOTER}
        />
        <div className="flex items-center gap-2 text-sm text-muted-foreground max-w-md">
          <Shield className="w-4 h-4 text-primary shrink-0" />
          <span>Protected by {AUTH_SYSTEM_LABEL}</span>
        </div>
        <div className="text-sm text-muted-foreground md:text-right">
          <p>Bulk peptide inquiries</p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-primary hover:text-primary-600 transition-colors"
          >
            {SUPPORT_EMAIL}
          </a>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-primary/10 text-center text-xs text-muted-foreground">
        <span>
          © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
        </span>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
