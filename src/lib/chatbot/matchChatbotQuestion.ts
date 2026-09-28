import { chatbotFaqEntries, type ChatbotFaqEntry, type ChatbotRole } from './chatbotFaq';

export function normalizeVietnameseText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countKeywordHits(normalizedInput: string, entry: ChatbotFaqEntry): number {
  const paddedInput = ` ${normalizedInput} `;
  return entry.keywords.filter((keyword) => paddedInput.includes(` ${keyword} `)).length;
}

export function entriesForRole(role: ChatbotRole): ChatbotFaqEntry[] {
  return chatbotFaqEntries.filter((entry) => entry.role === role);
}

export function matchChatbotQuestion(input: string, role: ChatbotRole): ChatbotFaqEntry | null {
  const normalizedInput = normalizeVietnameseText(input);
  let bestEntry: ChatbotFaqEntry | null = null;
  let bestScore = 0;
  for (const entry of entriesForRole(role)) {
    const score = countKeywordHits(normalizedInput, entry);
    if (score > bestScore) {
      bestEntry = entry;
      bestScore = score;
    }
  }
  return bestEntry;
}
