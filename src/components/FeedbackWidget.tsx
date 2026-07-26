import { useState } from 'react';
import { Check, MessageSquarePlus, Send } from 'lucide-react';
import { Modal } from './common';

/**
 * "Send Feedback" — small floating button + modal. Posts JSON to the configured
 * form endpoint (VITE_FEEDBACK_ENDPOINT, e.g. Formspree). Collects only what is
 * useful for triage: category, description, optional contact, current page hash,
 * app version, timestamp and user agent. No health data, no tracking.
 */
const ENDPOINT = (import.meta.env.VITE_FEEDBACK_ENDPOINT ?? '').trim();
const FALLBACK_EMAIL = (import.meta.env.VITE_FEEDBACK_EMAIL ?? '').trim();

const CATEGORIES = [
  'Bug',
  'Meal plan issue',
  'Food/nutrition data issue',
  'Feature suggestion',
  'Confusing interface',
  'Other',
] as const;

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('Bug');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  if (!ENDPOINT && !FALLBACK_EMAIL) return null; // nothing configured — hide entirely

  const submit = async () => {
    if (!description.trim()) return;
    setStatus('sending');
    const payload = {
      type: 'tester-feedback',
      category,
      description: description.trim(),
      contact: contact.trim() || undefined,
      page: window.location.hash || '#planner',
      appVersion: __APP_VERSION__,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    };
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('sent');
      setDescription('');
      setContact('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setStatus('idle');
        }}
        className="no-print fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-800/95 px-4 py-2.5 text-sm font-semibold text-ink-100 shadow-card backdrop-blur transition-colors hover:border-volt-400 hover:text-volt-300"
        aria-label="Send feedback about the beta"
      >
        <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
        Send Feedback
      </button>

      {open && (
        <Modal title="Send Feedback" onClose={() => setOpen(false)}>
          {status === 'sent' ? (
            <div className="space-y-4">
              <p className="flex items-center gap-2 text-sm text-volt-300">
                <Check className="h-5 w-5" aria-hidden="true" />
                Thank you — your feedback has been sent.
              </p>
              <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-ink-400">
                Beta v{__APP_VERSION__}. Your report includes the current page, app version and
                browser type — nothing else is collected automatically.
              </p>
              <label htmlFor="fb-cat" className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-300">Feedback type</span>
                <select
                  id="fb-cat"
                  className="input-field"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label htmlFor="fb-desc" className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-300">What happened?</span>
                <textarea
                  id="fb-desc"
                  className="input-field min-h-28"
                  placeholder="Describe the bug, confusing screen or suggestion. Steps to reproduce help a lot."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
              <label htmlFor="fb-contact" className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-300">
                  Email or name <span className="normal-case text-ink-400">(optional — only if you want a reply)</span>
                </span>
                <input
                  id="fb-contact"
                  type="text"
                  className="input-field"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </label>
              {status === 'error' && (
                <p role="alert" className="text-sm text-red-300">
                  Sending failed{FALLBACK_EMAIL ? (
                    <> — please email your feedback to <a className="underline" href={`mailto:${FALLBACK_EMAIL}`}>{FALLBACK_EMAIL}</a>.</>
                  ) : ' — please try again.'}
                </p>
              )}
              {!ENDPOINT && FALLBACK_EMAIL ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
                  <a
                    className={`btn-primary ${description.trim() ? '' : 'pointer-events-none opacity-40'}`}
                    href={`mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent(
                      `[Beta v${__APP_VERSION__}] ${category} — Meal Plan Builder`,
                    )}&body=${encodeURIComponent(
                      `${description.trim()}\n\n—\nPage: ${window.location.hash || '#planner'}\nVersion: v${__APP_VERSION__}\nBrowser: ${navigator.userAgent}`,
                    )}`}
                    onClick={() => setStatus('sent')}
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                    Open email to send
                  </a>
                </div>
              ) : (
                <div className="flex justify-end gap-2">
                  <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={!description.trim() || status === 'sending'}
                    onClick={submit}
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                    {status === 'sending' ? 'Sending…' : 'Send'}
                  </button>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
