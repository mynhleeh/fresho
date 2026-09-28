import { describe, expect, it } from 'vitest';
import { chatbotFaqEntries } from './chatbotFaq';
import { matchChatbotQuestion, normalizeVietnameseText } from './matchChatbotQuestion';

describe('normalizeVietnameseText', () => {
  it('strips diacritics and punctuation', () => {
    expect(normalizeVietnameseText('Đặt giá bao nhiêu?')).toBe('dat gia bao nhieu');
  });
});

describe('matchChatbotQuestion', () => {
  it('matches a farmer price question typed with diacritics', () => {
    expect(matchChatbotQuestion('Giá dưa leo hiện tại bao nhiêu vậy?', 'farmer')?.id).toBe('farmer-price-setting');
  });

  it('matches a buyer weather question', () => {
    expect(matchChatbotQuestion('mưa bão có ảnh hưởng đơn của tôi không', 'buyer')?.id).toBe('buyer-weather-risk');
  });

  it('never returns an entry meant for the other role', () => {
    expect(matchChatbotQuestion('tôi nên trồng gì vụ tới', 'buyer')?.role).not.toBe('farmer');
  });

  it('returns null when nothing matches', () => {
    expect(matchChatbotQuestion('xin chào', 'farmer')).toBeNull();
  });

  it('matches every suggested question to its own entry', () => {
    for (const entry of chatbotFaqEntries) {
      expect(matchChatbotQuestion(entry.question, entry.role)?.id).toBe(entry.id);
    }
  });
});
