export interface FaqItem {
  id?: string;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
  is_published?: boolean;
}

export const FAQ_CATEGORIES = [
  "Verification",
  "Quality & testing",
  "Orders & shipping",
  "RUO policy",
] as const;

export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

export const FAQ_INTRO =
  'Everything about verifying your product, our testing standards, ordering, and what "research use only" means. Can\'t find your answer? Email sales@nexabiotech.net — we reply within 2 business days.';

export const FAQ_BOTTOM =
  "Still stuck? Send us your serial number (not the scratch-off code), a photo of the packaging if relevant, and where you purchased the product. We reply within 2 business days.";

/** Used when the faqs table is empty or not yet migrated. */
export const FALLBACK_FAQS: FaqItem[] = [
  {
    category: "Verification",
    question: "Where do I find my serial number and verification code?",
    answer:
      "The serial number is printed on the box label, next to the barcode. The 8-character verification code is under a scratch-off panel inside the box. Enter both on the verification page.",
    sort_order: 1,
  },
  {
    category: "Verification",
    question: "Why does the verification page ask for two codes?",
    answer:
      "The serial number identifies the product and batch; the one-time code proves the unit is genuine. Counterfeiters can copy a printed serial, but they can't reuse a code that has already been consumed — so a copied serial won't pass.",
    sort_order: 2,
  },
  {
    category: "Verification",
    question:
      'The site says "already verified" but this is my first time. What now?',
    answer:
      "Treat the product as suspect and do not use it. Every code works exactly once, so a previous verification means either the code was copied or the unit was sold before. Email sales@nexabiotech.net with a photo of the packaging and where you bought it; we investigate within 2 business days.",
    sort_order: 3,
  },
  {
    category: "Verification",
    question: "What does the batch COA show?",
    answer:
      "The certificate of analysis (COA) for your batch includes the lab's identity (Lingda Laboratory), test date, analytical methods (HPLC purity, spectrometric identity), measured purity against our ≥ 99% release specification, and a report number. That report number can be checked independently at lingdalab.com — so you never have to take our word for it.",
    sort_order: 4,
  },
  {
    category: "Quality & testing",
    question: "Who tests your products?",
    answer:
      "Every batch is analyzed by Lingda Laboratory, an independent third-party lab, before release. We never self-certify. Each report carries a number that can be verified online at lingdalab.com, and full COAs are downloadable per batch from every successful verification.",
    sort_order: 5,
  },
  {
    category: "Quality & testing",
    question: "What purity can I expect?",
    answer:
      "Our release specification is ≥ 99% purity by HPLC, with identity confirmed by spectrometry. The exact measured value for your vial appears on the verification result and in the batch COA — check yours rather than trusting a generic number.",
    sort_order: 6,
  },
  {
    category: "Quality & testing",
    question: "How should I store products after delivery?",
    answer:
      "Keep lyophilized products sealed, cool, dry, and away from light (2–8 °C is fine for most). The expiry date on your verification result applies to unopened, correctly stored units. Once reconstituted, follow your lab's standard handling procedures.",
    sort_order: 7,
  },
  {
    category: "Orders & shipping",
    question: "Who can order from Nexa Biotech?",
    answer:
      "Qualified institutional and commercial research customers — universities, contract research organizations, and licensed laboratories — ordering in bulk. We do not sell to individuals or single-unit retail buyers, and we may ask for institutional documentation before fulfilling an order.",
    sort_order: 8,
  },
  {
    category: "Orders & shipping",
    question: "Where do you ship, and who handles customs?",
    answer:
      "We ship bulk orders worldwide. Orders are typically dispatched within 14 days of confirmation, tracked and insured. The buyer is responsible for customs clearance in the destination country — including any import permits, duties, or taxes. Check your local import requirements for research compounds before ordering.",
    sort_order: 9,
  },
  {
    category: "Orders & shipping",
    question: "What is your return / replacement policy?",
    answer:
      "If verification fails, the product arrives damaged, or a batch is recalled, we replace or refund at no cost. For any other issue, contact us within 14 days of delivery.",
    sort_order: 10,
  },
  {
    category: "RUO policy",
    question: 'What does "research use only" mean?',
    answer:
      "It means our products are sold strictly as laboratory research materials. They are not intended for human or veterinary use — not for consumption, injection, diagnosis, treatment, or any clinical purpose — and they have not been evaluated by the FDA or any other regulator for such use.",
    sort_order: 11,
  },
  {
    category: "RUO policy",
    question: "Can I use these products for personal use?",
    answer:
      "No. Purchasing confirms you are a qualified researcher acquiring materials for laboratory research. Misuse is a breach of our terms, and products that have left a controlled research context cannot be returned for safety reasons.",
    sort_order: 12,
  },
  {
    category: "RUO policy",
    question: "Are your products legal in my country?",
    answer:
      "Import and possession rules for research compounds vary by jurisdiction and can change. It is the purchaser's responsibility to confirm local regulations and secure any required import permits before ordering; we cannot provide legal advice.",
    sort_order: 13,
  },
];
