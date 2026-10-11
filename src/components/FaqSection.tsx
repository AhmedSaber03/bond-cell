import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import {
  FALLBACK_FAQS,
  FAQ_INTRO,
  FAQ_BOTTOM,
  FAQ_CATEGORIES,
  type FaqItem,
} from "@/data/faqContent";
import { SUPPORT_EMAIL } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface FaqSectionProps {
  layout?: "default" | "split";
  className?: string;
}

const FaqSection = ({ layout = "default", className }: FaqSectionProps) => {
  const [faqs, setFaqs] = useState<FaqItem[]>(FALLBACK_FAQS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data, error } = await supabase
        .from("faqs")
        .select("id, category, question, answer, sort_order, is_published")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        setFaqs(data as FaqItem[]);
      }
      setIsLoading(false);
    };

    fetchFaqs();
  }, []);

  const grouped = useMemo(() => {
    const result: [string, FaqItem[]][] = [];
    const seen = new Set<string>();

    for (const category of FAQ_CATEGORIES) {
      const items = faqs.filter((f) => f.category === category);
      if (items.length > 0) {
        result.push([category, items]);
        seen.add(category);
      }
    }

    for (const faq of faqs) {
      if (!seen.has(faq.category)) {
        result.push([
          faq.category,
          faqs.filter((f) => f.category === faq.category),
        ]);
        seen.add(faq.category);
      }
    }

    return result;
  }, [faqs]);

  const headerBlock = (
    <>
      <span className="accent-chip mb-6">Step 03 · FAQ</span>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-extralight text-primary mb-4 leading-tight">
        Answers for labs
        <span className="block font-normal">and procurement teams</span>
      </h2>
      <p className="text-muted-foreground text-lg leading-relaxed">{FAQ_INTRO}</p>
    </>
  );

  const faqList = (
    <div className="space-y-6">
      {isLoading ? (
        <div className="card-premium p-8 text-center text-muted-foreground">
          Loading FAQs...
        </div>
      ) : (
        grouped.map(([category, items]) => (
          <div key={category} className="border border-primary/10 bg-white p-6 md:p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-4">
              {category}
            </h3>
            <Accordion type="single" collapsible className="w-full">
              {items.map((faq, index) => (
                <AccordionItem
                  key={faq.id || `${category}-${index}`}
                  value={faq.id || `${category}-${index}`}
                  className="border-primary/10"
                >
                  <AccordionTrigger className="text-left text-base font-medium text-primary hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-[15px] pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))
      )}

      <div className="border border-primary/10 bg-muted/40 p-8 space-y-5">
        <h3 className="text-lg font-semibold text-primary">Still stuck?</h3>
        <p className="text-muted-foreground leading-relaxed">{FAQ_BOTTOM}</p>
        <Button asChild className="btn-hero rounded-md">
          <a href={`mailto:${SUPPORT_EMAIL}`}>
            <Mail className="w-4 h-4 mr-2" />
            Contact support
          </a>
        </Button>
      </div>
    </div>
  );

  if (layout === "split") {
    return (
      <section id="faq" className={cn("scroll-mt-28", className)}>
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-32">{headerBlock}</div>
          <div className="lg:col-span-8">{faqList}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="faq" className={cn("mt-32 scroll-mt-28", className)}>
      <div className="text-center max-w-3xl mx-auto mb-12">{headerBlock}</div>
      <div className="space-y-8 max-w-4xl mx-auto">{faqList}</div>
    </section>
  );
};

export default FaqSection;
