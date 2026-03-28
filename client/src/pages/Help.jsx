import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    q: 'How do I start a campaign?',
    a:
      'To start a campaign, you need to sign up for a free account, then click the "Start Campaign" button in the navigation bar. Fill in the details, goal amount, and upload an image. Once submitted, it will be reviewed by an Admin before it goes live.'
  },
  {
    q: 'How long does admin approval take?',
    a:
      'Admin approval typically takes 24-48 hours. Our team reviews campaigns to ensure they meet our safety guidelines and prevent fraudulent activities.'
  },
  {
    q: 'Are my donations secure?',
    a:
      'Yes! All donations are processed securely through Razorpay using industry-standard encryption. We do not store your credit card or UPI details on our servers.'
  },
  {
    q: 'Can I leave a private review?',
    a:
      'Yes, on any campaign page, you can see a "Suggestions & Reviews" section if you are logged in. Leaving a review there is completely private and only the campaign creator and admins will be able to read it.'
  }
];

const STOP = new Set([
  'the',
  'a',
  'an',
  'is',
  'are',
  'was',
  'how',
  'do',
  'does',
  'did',
  'can',
  'could',
  'would',
  'should',
  'i',
  'my',
  'me',
  'we',
  'you',
  'your',
  'to',
  'for',
  'of',
  'and',
  'or',
  'on',
  'it',
  'its',
  'if',
  'what',
  'when',
  'where',
  'why',
  'who',
  'be',
  'this',
  'that',
  'there',
  'about',
  'with',
  'from',
  'into',
  'at',
  'in',
  'as',
  'by'
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => !STOP.has(t));
}

function matchFaqAnswer(userQuery) {
  const trimmed = userQuery.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  for (const faq of FAQS) {
    if (faq.q.toLowerCase() === lower) return faq.a;
  }

  const qTokens = tokenize(trimmed);
  if (qTokens.length === 0) return null;

  let best = { score: 0, faq: null };
  for (const faq of FAQS) {
    const hay = `${faq.q} ${faq.a}`.toLowerCase();
    let score = 0;
    for (const t of qTokens) {
      if (t.length < 2) continue;
      if (hay.includes(t)) score += 2;
    }
    const qLower = faq.q.toLowerCase();
    for (const t of qTokens) {
      if (qLower.includes(t)) score += 1;
    }
    if (score > best.score) best = { score, faq };
  }

  if (best.faq && best.score >= 3) return best.faq.a;
  if (best.faq && best.score >= 1) return best.faq.a;

  return null;
}

const SUGGESTED_CHIPS = [
  { label: 'Start a campaign', prompt: 'How do I start a campaign?' },
  { label: 'Admin approval time', prompt: 'How long does admin approval take?' },
  { label: 'Donation security', prompt: 'Are my donations secure?' },
  { label: 'Private reviews', prompt: 'Can I leave a private review?' }
];

const Help = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      text:
        'Hi! I can answer common questions about Donte using our Help Center. Pick a topic below or type your question.'
    }
  ]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text) => {
    const q = text.trim();
    if (!q) return;

    const answer = matchFaqAnswer(q);
    const fallback =
      answer ??
      "I don't have a specific answer for that in our Help Center yet. Try rephrasing, or browse the questions below. If you still need help, reach us on the Contact page.";

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: q },
      { role: 'assistant', text: fallback, showContactLink: !answer }
    ]);
    setInput('');
  };

  const onSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Help Center</h1>
        <p className="mt-4 text-xl text-gray-500">Everything you need to know about the platform.</p>
      </div>

      <section className="mb-12 rounded-2xl border border-slate-300/60 bg-gradient-to-b from-slate-50/90 to-white p-6 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-white font-bold text-sm"
            aria-hidden
          >
            AI
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Assistant</h2>
            <p className="text-sm text-gray-600">Quick answers from our FAQ. No account required.</p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {SUGGESTED_CHIPS.map((chip) => (
            <button
              key={chip.prompt}
              type="button"
              onClick={() => sendMessage(chip.prompt)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div
          className="mb-4 max-h-72 overflow-y-auto rounded-xl border border-slate-200/80 bg-white/90 p-4 space-y-3"
          role="log"
          aria-live="polite"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-slate-700 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}
              >
                <p>{m.text}</p>
                {m.showContactLink && (
                  <p className="mt-2 pt-2 border-t border-gray-200/80">
                    <Link to="/contact" className="font-semibold text-slate-700 underline underline-offset-2 hover:text-slate-900">
                      Go to Contact
                    </Link>
                  </p>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={onSubmit} className="flex gap-2">
          <label htmlFor="help-assistant-input" className="sr-only">
            Ask a question
          </label>
          <input
            id="help-assistant-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about using Donte…"
            className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            autoComplete="off"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Send
          </button>
        </form>
      </section>

      <div className="space-y-6">
        {FAQS.map((faq, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{faq.q}</h3>
            <p className="text-gray-600 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Help;
