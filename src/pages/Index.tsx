import { Link } from "react-router-dom";
import VerificationForm from "@/components/VerificationForm";
import FaqSection from "@/components/FaqSection";
import Header from "@/components/layout/Header";
import SiteFooter from "@/components/layout/SiteFooter";
import { BRAND_NAME, LOGO_CLASS_HERO, LOGO_SRC, SUPPORT_EMAIL } from "@/lib/brand";
import {
  ArrowUpRight,
  FlaskConical,
  Microscope,
  Package,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    num: "01",
    title: "Verify",
    body: "Confirm every vial with serial + scratch code before it enters your workflow.",
    href: "#verify",
    external: false,
  },
  {
    num: "02",
    title: "Peptides",
    body: "Explore SKUs, purity specs, and batch documentation in the catalog.",
    href: "/products",
    external: false,
  },
  {
    num: "03",
    title: "FAQ",
    body: "RUO policy, shipping, and what to do if a code was already used.",
    href: "#faq",
    external: false,
  },
  {
    num: "04",
    title: "Order",
    body: "Qualified labs request bulk availability and institutional pricing.",
    href: "#order",
    external: false,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-surface-bondcell">
      <Header />

      {/* —— Editorial hero (logo-first, not form-first) —— */}
      <section className="relative pt-28 md:pt-32 pb-0">
        <div
          className="pointer-events-none absolute top-36 right-8 z-0 w-20 h-20 lg:w-28 lg:h-28 bg-primary/90 hidden lg:block"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-44 right-40 z-0 w-14 h-14 bg-primary/15 hidden xl:block"
          aria-hidden
        />

        <div className="container-bondcell relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end pb-12 md:pb-16 border-b border-primary/10">
            <div className="lg:col-span-7 space-y-6 md:space-y-8 min-w-0">
              <span className="accent-chip">Research use only</span>
              <img
                src={LOGO_SRC}
                alt={BRAND_NAME}
                width={480}
                height={120}
                className={LOGO_CLASS_HERO}
              />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extralight tracking-tight text-primary leading-[1.15] max-w-xl">
                Peptide authenticity,
                <span className="block font-normal">built into every unit.</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-lg leading-relaxed">
                {BRAND_NAME} connects verification, catalog discovery, and bulk
                ordering for research teams who need traceability—not guesswork.
              </p>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-3 md:gap-4">
              {[
                { icon: Shield, label: "Anti-counterfeit serials" },
                { icon: Microscope, label: "Batch COA on verify" },
                { icon: FlaskConical, label: "Lab-grade peptides" },
                { icon: Package, label: "Bulk for institutions" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="aspect-square flex flex-col justify-between p-4 md:p-5 bg-white border border-primary/10 shadow-sm"
                >
                  <Icon className="w-6 h-6 text-primary" strokeWidth={1.25} />
                  <p className="text-sm font-medium text-primary leading-snug">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* —— Quick pillar rail —— */}
      <section className="border-b border-primary/10 bg-white">
        <div className="container-bondcell">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-primary/10">
            {pillars.map((item) => {
              const inner = (
                <>
                  <span className="text-4xl font-extralight text-primary/25 tabular-nums">
                    {item.num}
                  </span>
                  <span className="text-sm font-semibold uppercase tracking-widest text-primary mt-2">
                    {item.title}
                  </span>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                    {item.body}
                  </p>
                  <ArrowUpRight className="w-4 h-4 text-primary mt-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </>
              );
              const className =
                "group flex flex-col p-6 md:p-8 hover:bg-muted/40 transition-colors min-h-[180px]";

              if (item.href.startsWith("#")) {
                return (
                  <a key={item.num} href={item.href} className={className}>
                    {inner}
                  </a>
                );
              }
              return (
                <Link key={item.num} to={item.href} className={className}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* —— Verify band (full-width primary — distinct from old split hero) —— */}
      <section
        id="verify"
        className="relative scroll-mt-28 bg-primary text-white py-16 md:py-24"
      >
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden
        />
        <div className="container-bondcell relative grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
              Step 01 · Verify
            </span>
            <h2 className="text-3xl md:text-4xl font-light leading-tight">
              Authenticate your peptide
              <span className="block font-normal">in under three seconds.</span>
            </h2>
            <ul className="space-y-4 text-white/85 text-base leading-relaxed">
              <li className="flex gap-3">
                <span className="w-8 h-8 shrink-0 flex items-center justify-center bg-white/10 text-sm font-semibold">
                  1
                </span>
                Locate serial on the label and code under the scratch panel.
              </li>
              <li className="flex gap-3">
                <span className="w-8 h-8 shrink-0 flex items-center justify-center bg-white/10 text-sm font-semibold">
                  2
                </span>
                Submit both fields—codes are consumed on first successful check.
              </li>
              <li className="flex gap-3">
                <span className="w-8 h-8 shrink-0 flex items-center justify-center bg-white/10 text-sm font-semibold">
                  3
                </span>
                View product details, COA links, and batch data for 60 minutes.
              </li>
            </ul>
          </div>
          <VerificationForm showLogo={false} />
        </div>
      </section>

      {/* —— Bento: catalog + bulk —— */}
      <section className="py-16 md:py-24">
        <div className="container-bondcell">
          <div className="grid md:grid-cols-12 gap-4 md:gap-5">
            <Link
              to="/products"
              className="md:col-span-7 group relative min-h-[320px] p-8 md:p-10 bg-white border border-primary/10 flex flex-col justify-between overflow-hidden"
            >
              <div
                className="absolute -right-8 -top-8 w-40 h-40 bg-primary/5"
                aria-hidden
              />
              <div>
                <span className="accent-chip mb-6">Step 02 · Peptides</span>
                <h3 className="text-2xl md:text-3xl font-light text-primary mb-3">
                  Explore the research catalog
                </h3>
                <p className="text-muted-foreground max-w-md leading-relaxed">
                  Search by name, review specifications, and open full product
                  sheets before you verify or order.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary group-hover:gap-3 transition-all">
                Open catalog
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </Link>

            <div
              id="order"
              className="md:col-span-5 scroll-mt-28 min-h-[320px] p-8 md:p-10 bg-primary text-white flex flex-col justify-between"
            >
              <div>
                <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-white/70 mb-6">
                  Step 04 · Order
                </span>
                <h3 className="text-2xl font-light mb-3">Bulk & institutional</h3>
                <p className="text-white/80 leading-relaxed">
                  Volume pricing for universities, CROs, and licensed labs. Tell
                  us what you need—we respond within two business days.
                </p>
              </div>
              <Button
                asChild
                className="w-full bg-white text-primary hover:bg-white/90 rounded-md h-12 font-semibold"
              >
                <a href={`mailto:${SUPPORT_EMAIL}?subject=Bulk%20peptide%20order%20inquiry`}>
                  Request bulk quote
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>

            <div className="md:col-span-12 grid sm:grid-cols-3 gap-4 md:gap-5">
              {[
                "Third-party COA per batch",
                "One-time verification codes",
                "Global tracked shipping",
              ].map((text) => (
                <div
                  key={text}
                  className="p-5 bg-muted/60 border border-primary/5 text-center text-sm font-medium text-primary"
                >
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container-bondcell pb-20">
        <FaqSection layout="split" className="mt-0" />
      </div>

      <SiteFooter />
    </div>
  );
};

export default Index;
