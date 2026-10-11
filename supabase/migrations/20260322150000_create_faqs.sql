-- FAQ management for homepage accordion
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS faqs_category_sort_idx
  ON public.faqs (category, sort_order);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published FAQs are publicly readable" ON public.faqs;
CREATE POLICY "Published FAQs are publicly readable"
ON public.faqs
FOR SELECT
USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage FAQs" ON public.faqs;
CREATE POLICY "Admins can manage FAQs"
ON public.faqs
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'super_admin')
);

DROP TRIGGER IF EXISTS update_faqs_updated_at ON public.faqs;
CREATE TRIGGER update_faqs_updated_at
BEFORE UPDATE ON public.faqs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default FAQs (idempotent: only if empty)
INSERT INTO public.faqs (category, question, answer, sort_order)
SELECT * FROM (VALUES
  (
    'Verification',
    'Where do I find my serial number and verification code?',
    'The serial number is printed on the box label, next to the barcode. The 8-character verification code is under a scratch-off panel inside the box. Enter both on the verification page.',
    1
  ),
  (
    'Verification',
    'Why does the verification page ask for two codes?',
    'The serial number identifies the product and batch; the one-time code proves the unit is genuine. Counterfeiters can copy a printed serial, but they can''t reuse a code that has already been consumed — so a copied serial won''t pass.',
    2
  ),
  (
    'Verification',
    'The site says "already verified" but this is my first time. What now?',
    'Treat the product as suspect and do not use it. Every code works exactly once, so a previous verification means either the code was copied or the unit was sold before. Email sales@nexabiotech.net with a photo of the packaging and where you bought it; we investigate within 2 business days.',
    3
  ),
  (
    'Verification',
    'What does the batch COA show?',
    'The certificate of analysis (COA) for your batch includes the lab''s identity (Lingda Laboratory), test date, analytical methods (HPLC purity, spectrometric identity), measured purity against our ≥ 99% release specification, and a report number. That report number can be checked independently at lingdalab.com — so you never have to take our word for it.',
    4
  ),
  (
    'Quality & testing',
    'Who tests your products?',
    'Every batch is analyzed by Lingda Laboratory, an independent third-party lab, before release. We never self-certify. Each report carries a number that can be verified online at lingdalab.com, and full COAs are downloadable per batch from every successful verification.',
    5
  ),
  (
    'Quality & testing',
    'What purity can I expect?',
    'Our release specification is ≥ 99% purity by HPLC, with identity confirmed by spectrometry. The exact measured value for your vial appears on the verification result and in the batch COA — check yours rather than trusting a generic number.',
    6
  ),
  (
    'Quality & testing',
    'How should I store products after delivery?',
    'Keep lyophilized products sealed, cool, dry, and away from light (2–8 °C is fine for most). The expiry date on your verification result applies to unopened, correctly stored units. Once reconstituted, follow your lab''s standard handling procedures.',
    7
  ),
  (
    'Orders & shipping',
    'Who can order from Nexa Biotech?',
    'Qualified institutional and commercial research customers — universities, contract research organizations, and licensed laboratories — ordering in bulk. We do not sell to individuals or single-unit retail buyers, and we may ask for institutional documentation before fulfilling an order.',
    8
  ),
  (
    'Orders & shipping',
    'Where do you ship, and who handles customs?',
    'We ship bulk orders worldwide. Orders are typically dispatched within 14 days of confirmation, tracked and insured. The buyer is responsible for customs clearance in the destination country — including any import permits, duties, or taxes. Check your local import requirements for research compounds before ordering.',
    9
  ),
  (
    'Orders & shipping',
    'What is your return / replacement policy?',
    'If verification fails, the product arrives damaged, or a batch is recalled, we replace or refund at no cost. For any other issue, contact us within 14 days of delivery.',
    10
  ),
  (
    'RUO policy',
    'What does "research use only" mean?',
    'It means our products are sold strictly as laboratory research materials. They are not intended for human or veterinary use — not for consumption, injection, diagnosis, treatment, or any clinical purpose — and they have not been evaluated by the FDA or any other regulator for such use.',
    11
  ),
  (
    'RUO policy',
    'Can I use these products for personal use?',
    'No. Purchasing confirms you are a qualified researcher acquiring materials for laboratory research. Misuse is a breach of our terms, and products that have left a controlled research context cannot be returned for safety reasons.',
    12
  ),
  (
    'RUO policy',
    'Are your products legal in my country?',
    'Import and possession rules for research compounds vary by jurisdiction and can change. It is the purchaser''s responsibility to confirm local regulations and secure any required import permits before ordering; we cannot provide legal advice.',
    13
  )
) AS seed(category, question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.faqs LIMIT 1);
