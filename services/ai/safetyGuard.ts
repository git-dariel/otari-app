const unsafePatterns = [
  /what .* should i buy/i,
  /should i (buy|sell|hold)/i,
  /price .* tomorrow/i,
  /trading signal/i,
  /crypto signal/i,
  /pump/i,
  /guaranteed return/i,
  /get rich fast/i,
  /avoid taxes/i,
  /bypass kyc/i,
];

export function isUnsafeFinancialRequest(question: string): boolean {
  return unsafePatterns.some((pattern) => pattern.test(question));
}

export function getSafetyRefusal(): string {
  return "I can't tell you what to buy, sell, or predict. I can explain the concept, risks, and questions you may consider before making your own decision.";
}
