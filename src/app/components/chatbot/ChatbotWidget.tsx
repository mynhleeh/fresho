'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { ChatbotFaqEntry, ChatbotRole } from '@/lib/chatbot/chatbotFaq';
import { entriesForRole, matchChatbotQuestion } from '@/lib/chatbot/matchChatbotQuestion';
import { ChatbotAnswerCard } from './ChatbotAnswerCard';
import styles from './ChatbotWidget.module.css';

const TYPING_DELAY_MS = 700;

const GREETING_BY_ROLE: Record<ChatbotRole, string> = {
  farmer: 'Chào anh/chị! Mình là Cố vấn mùa vụ. Mình có thể gợi ý thời điểm đăng lô, mức giá theo thị trường, ảnh hưởng thời tiết và nên nhận đơn nào.',
  buyer: 'Chào anh/chị! Mình là Cố vấn mùa vụ. Mình có thể phân tích nên mua lô nào, thời điểm giá tốt, rủi ro thời tiết và cách chọn vận chuyển.',
};

const FALLBACK_TEXT = 'Mình chưa có phân tích cho câu hỏi này. Anh/chị thử một trong các câu gợi ý bên dưới nhé.';

type ChatMessage =
  | { id: number; from: 'user'; text: string }
  | { id: number; from: 'bot'; entry: ChatbotFaqEntry | null };

function SproutMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="var(--color-gold-cream)" />
      <path d="M8 36 Q24 30 40 36 L40 40 Q24 44 8 40 Z" fill="var(--color-cream-warm)" />
      <path d="M24 36 V22" stroke="var(--color-leaf-deep)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M24 26 C 16 26, 12 20, 13 13 C 20 13, 25 18, 24 26 Z" fill="var(--color-leaf-bright)" />
      <path d="M24 22 C 30 22, 35 17, 35 10 C 28 10, 23 15, 24 22 Z" fill="var(--color-leaf-mid)" />
    </svg>
  );
}

function SuggestionChips({ role, onPick }: { role: ChatbotRole; onPick: (question: string) => void }) {
  return (
    <div className={styles.chips}>
      {entriesForRole(role).map((entry) => (
        <button key={entry.id} type="button" className={styles.chip} onClick={() => onPick(entry.question)}>
          {entry.question}
        </button>
      ))}
    </div>
  );
}

function BotMessage({ entry, role, onPick }: { entry: ChatbotFaqEntry | null; role: ChatbotRole; onPick: (question: string) => void }) {
  if (entry) return <ChatbotAnswerCard answer={entry.answer} />;
  return (
    <div className={styles.botBubble}>
      <p>{FALLBACK_TEXT}</p>
      <SuggestionChips role={role} onPick={onPick} />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className={styles.typing} role="status" aria-label="Cố vấn đang soạn câu trả lời">
      <span /><span /><span />
    </div>
  );
}

function useChatConversation(role: ChatbotRole) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const nextId = useRef(0);

  function askQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isTyping) return;
    setMessages((current) => [...current, { id: nextId.current++, from: 'user', text: trimmed }]);
    setIsTyping(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, { id: nextId.current++, from: 'bot', entry: matchChatbotQuestion(trimmed, role) }]);
      setIsTyping(false);
    }, TYPING_DELAY_MS);
  }

  return { messages, isTyping, askQuestion };
}

function ChatPanel({ role, onClose }: { role: ChatbotRole; onClose: () => void }) {
  const { messages, isTyping, askQuestion } = useChatConversation(role);
  const [draft, setDraft] = useState('');
  const threadEnd = useRef<HTMLDivElement>(null);
  const latestMessage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTyping) threadEnd.current?.scrollIntoView({ block: 'end' });
    else latestMessage.current?.scrollIntoView({ block: 'start' });
  }, [messages.length, isTyping]);

  function submitDraft(event: FormEvent) {
    event.preventDefault();
    askQuestion(draft);
    setDraft('');
  }

  return (
    <section className={styles.panel} role="dialog" aria-label="Cố vấn mùa vụ">
      <header className={styles.panelHeader}>
        <SproutMark className={styles.headerMark} />
        <div className={styles.headerText}>
          <span className={styles.headerEyebrow}>Trợ lý AI · Tham khảo</span>
          <h3 className={styles.headerTitle}>Cố vấn mùa vụ</h3>
        </div>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Đóng cố vấn">×</button>
      </header>
      <div className={styles.thread} aria-live="polite">
        <div className={styles.botBubble}>
          <p>{GREETING_BY_ROLE[role]}</p>
          <SuggestionChips role={role} onPick={askQuestion} />
        </div>
        {messages.map((message, index) => (
          <div key={message.id} ref={index === messages.length - 1 ? latestMessage : undefined} className={styles.messageRow}>
            {message.from === 'user'
              ? <p className={styles.userBubble}>{message.text}</p>
              : <BotMessage entry={message.entry} role={role} onPick={askQuestion} />}
          </div>
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={threadEnd} />
      </div>
      <form className={styles.composer} onSubmit={submitDraft}>
        <input
          className={styles.composerInput}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Hỏi về giá, thời tiết, đơn hàng…"
          aria-label="Câu hỏi cho cố vấn"
        />
        <button type="submit" className={styles.sendButton} disabled={!draft.trim() || isTyping}>Gửi</button>
      </form>
    </section>
  );
}

export function ChatbotWidget({ role }: { role: ChatbotRole }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.widget}>
      {isOpen && <ChatPanel role={role} onClose={() => setIsOpen(false)} />}
      {!isOpen && (
        <button type="button" className={styles.launcher} onClick={() => setIsOpen(true)} aria-label="Mở cố vấn mùa vụ">
          <SproutMark className={styles.launcherMark} />
          <span className={styles.launcherLabel}>Hỏi cố vấn</span>
        </button>
      )}
    </div>
  );
}
