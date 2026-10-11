import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Mail, HelpCircle } from "lucide-react";
import {
  FALLBACK_FAQS,
  FAQ_INTRO,
  FAQ_BOTTOM,
  FAQ_CATEGORIES,
  type FaqItem,
} from "@/data/faqContent";

const FaqSection = () => {
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

  return (
    <section id="faq" className="mt-32 scroll-mt-28">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-6">
          <HelpCircle className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">FAQ</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-primary mb-4">
          Frequently asked questions
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed">{FAQ_INTRO}</p>
      </div>

      <div className="space-y-8 max-w-4xl mx-auto">
        {isLoading ? (
          <div className="card-premium p-8 text-center text-muted-foreground">
            Loading FAQs...
          </div>
        ) : (
          grouped.map(([category, items]) => (
            <div key={category} className="card-premium p-6 md:p-8">
              <h3 className="text-xl font-bold text-primary mb-4">
                {category}
              </h3>
              <Accordion type="single" collapsible className="w-full">
                {items.map((faq, index) => (
                  <AccordionItem
                    key={faq.id || `${category}-${index}`}
                    value={faq.id || `${category}-${index}`}
                    className="border-border"
                  >
                    <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 leading-relaxed text-[15px]">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
        )}

        <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-white to-blue-50 p-8 text-center space-y-5">
          <h3 className="text-xl font-bold text-primary">Still stuck?</h3>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {FAQ_BOTTOM}
          </p>
          <Button asChild className="btn-hero">
            <a href="mailto:sales@nexabiotech.net">
              <Mail className="w-4 h-4 mr-2" />
              Contact support
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
