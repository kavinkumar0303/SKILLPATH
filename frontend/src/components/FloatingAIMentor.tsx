import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  User,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { useToast } from './Toast';
import client from '../api/client';

interface Message {
  id: string;
  role: 'user' | 'mentor';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

// Markdown and Link formatting helper
function FormattedMessage({ text }: { text: string }) {
  // Split into lines to identify bullets and paragraphs
  const lines = text.split('\n');

  const renderFormattedLine = (line: string, key: number) => {
    // Check if line is bullet
    const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
    const content = isBullet ? line.trim().substring(2) : line;

    // Convert markdown links [Label](url) or bare URLs
    const parts: React.ReactNode[] = [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s]+)/g;
    let lastIndex = 0;
    let match;

    const parseInlineStyles = (str: string, subKey: string) => {
      // Parse **bold**
      const boldParts = str.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bp, i) => {
        if (bp.startsWith('**') && bp.endsWith('**')) {
          return (
            <strong key={`${subKey}-${i}`} className="font-semibold text-[#10231C]">
              {bp.slice(2, -2)}
            </strong>
          );
        }
        return bp;
      });
    };

    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          ...parseInlineStyles(
            content.substring(lastIndex, match.index),
            `t-${key}-${lastIndex}`
          )
        );
      }

      if (match[1] && match[2]) {
        // [Label](url)
        parts.push(
          <a
            key={`l-${key}-${match.index}`}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0B3B2E] underline font-medium hover:text-[#072A21] inline-flex items-center gap-0.5"
          >
            <span>{match[1]}</span>
            <ExternalLink size={11} className="inline ml-0.5 opacity-70" />
          </a>
        );
      } else if (match[3]) {
        // Raw URL: shorten to friendly label
        const rawUrl = match[3];
        let label = 'Learning Resource';
        if (rawUrl.includes('developer.mozilla.org')) label = 'MDN Web Docs';
        else if (rawUrl.includes('react.dev')) label = 'React Documentation';
        else if (rawUrl.includes('nodejs.org')) label = 'Node.js Docs';
        else if (rawUrl.includes('python.org')) label = 'Python Docs';
        else if (rawUrl.includes('freecodecamp.org')) label = 'freeCodeCamp Guide';

        parts.push(
          <a
            key={`u-${key}-${match.index}`}
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0B3B2E] underline font-medium hover:text-[#072A21] inline-flex items-center gap-0.5"
          >
            <span>{label}</span>
            <ExternalLink size={11} className="inline ml-0.5 opacity-70" />
          </a>
        );
      }

      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(
        ...parseInlineStyles(content.substring(lastIndex), `end-${key}`)
      );
    }

    if (isBullet) {
      return (
        <li key={key} className="ml-4 list-disc text-sm leading-relaxed">
          {parts}
        </li>
      );
    }

    return (
      <p key={key} className="text-sm leading-relaxed min-h-[1.25rem]">
        {parts}
      </p>
    );
  };

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => renderFormattedLine(line, idx))}
    </div>
  );
}

// Global persistent state across page transitions
const initialMessages: Message[] = [
  {
    id: 'msg-init',
    role: 'mentor',
    content: 'Welcome back, Arjun! I am your AI Mentor. I continuously track your diagnostic progress, missing skills for Full Stack Development, and study roadmap. How can I assist your learning today?',
    timestamp: 'Just now',
    suggestions: [
      'Explain React useEffect dependency arrays',
      'What should I prioritize learning next?',
      'How does Promise.all work in Node.js?',
    ],
  },
];

export default function FloatingAIMentor() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, sending]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSend = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await client.post('/mentor/chat', { message: messageText });
      const mentorMsg: Message = {
        id: `mnt-${Date.now()}`,
        role: 'mentor',
        content: res.data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        // Limit to at most 3 quick-prompt chips
        suggestions: (res.data.suggestions || []).slice(0, 3),
      };
      setMessages((prev) => [...prev, mentorMsg]);

      if (!isOpen) {
        setHasUnread(true);
      }

      if (res.data.action_taken === 'ROADMAP_REGENERATED') {
        addToast({
          type: 'success',
          title: 'Curriculum Updated',
          message: 'The AI Mentor refreshed your personalized learning roadmap.',
        });
      }
    } catch {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'mentor',
        content: 'I apologize, but I could not reach the learning pipeline. Please check connection and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  // Get current active suggestions from latest mentor message (at most 3)
  const latestSuggestions = messages
    .filter((m) => m.role === 'mentor' && m.suggestions && m.suggestions.length > 0)
    .slice(-1)[0]?.suggestions?.slice(0, 3) || [];

  return (
    <>
      {/* Floating Round Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-14 h-14 rounded-full bg-[#C6F36B] hover:bg-[#B2E84F] text-[#0B3B2E] flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#C6F36B]/40 active:scale-95 relative"
          aria-label="Open AI Mentor"
          title="Ask AI Mentor"
        >
          <MessageSquare size={24} className="stroke-[2.2]" />
          
          {/* Small Red Dot for unread reply */}
          {hasUnread && !isOpen && (
            <span
              className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#B91C1C] rounded-full border-2 border-white animate-pulse"
              aria-label="New unread message"
            />
          )}
        </button>
      </div>

      {/* Floating Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-32px)] h-[min(600px,calc(100vh-120px))] rounded-[20px] bg-white border border-[#E8E4D2] shadow-2xl flex flex-col overflow-hidden max-sm:fixed max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:rounded-none max-sm:bottom-0 max-sm:right-0 max-sm:max-w-none"
          role="dialog"
          aria-label="AI Mentor Chat"
        >
          {/* Header */}
          <div className="bg-[#0B3B2E] text-[#F3F6EF] px-5 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#135443] text-[#C6F36B] flex items-center justify-center font-bold">
                <Bot size={18} />
              </div>
              <div>
                <div className="font-heading text-base font-semibold text-white leading-tight">
                  AI Mentor
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#A9BDB1]">
                  <span className="w-2 h-2 rounded-full bg-[#C6F36B] inline-block animate-pulse" />
                  <span>Online</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-[#A9BDB1] hover:text-white hover:bg-[#135443] transition-colors"
              aria-label="Close AI Mentor"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF7E8]/30">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[90%] ${
                  m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                    m.role === 'user'
                      ? 'bg-[#0B3B2E] text-[#C6F36B]'
                      : 'bg-[#C6F36B] text-[#0B3B2E]'
                  }`}
                >
                  {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>

                <div className="space-y-1 min-w-0">
                  <div
                    className={`p-3.5 rounded-2xl ${
                      m.role === 'user'
                        ? 'bg-[#0B3B2E] text-white rounded-tr-xs shadow-xs'
                        : 'bg-[#FAF7E8] text-[#10231C] border border-[#E8E4D2] rounded-tl-xs shadow-xs'
                    }`}
                  >
                    <FormattedMessage text={m.content} />
                  </div>
                  <div
                    className={`text-[11px] text-[#4B5E55] px-1 ${
                      m.role === 'user' ? 'text-right' : ''
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex gap-2.5 max-w-[80%]">
                <div className="w-7 h-7 rounded-full bg-[#C6F36B] text-[#0B3B2E] flex items-center justify-center shrink-0">
                  <Bot size={14} />
                </div>
                <div className="p-3 bg-[#FAF7E8] border border-[#E8E4D2] rounded-2xl rounded-tl-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0B3B2E] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#0B3B2E] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#0B3B2E] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* At Most 3 Quick-Prompt Chips */}
          {latestSuggestions.length > 0 && (
            <div className="px-4 py-2 bg-white border-t border-[#E8E4D2] flex flex-wrap gap-1.5 shrink-0">
              {latestSuggestions.slice(0, 3).map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  disabled={sending}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAF7E8] hover:bg-[#E4F4E8] text-[#0B3B2E] border border-[#E8E4D2] transition-colors truncate max-w-full text-left"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input & Send Form */}
          <div className="p-3 bg-white border-t border-[#E8E4D2] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask your AI Mentor..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 h-11 px-4 text-xs rounded-full border border-[#E8E4D2] bg-[#FAF7E8]/40 text-[#10231C] outline-none focus:border-[#0B3B2E] focus:ring-2 focus:ring-[#C6F36B]/30"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="w-11 h-11 rounded-full bg-[#0B3B2E] hover:bg-[#072A21] text-[#C6F36B] flex items-center justify-center shrink-0 transition-colors disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

