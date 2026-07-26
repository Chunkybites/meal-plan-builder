import { useState, type ReactNode } from 'react';
import { KeyRound } from 'lucide-react';
import { STORAGE_KEYS, loadJSON, saveJSON } from '../utils/storage';

/**
 * Low-friction beta access gate. Active only when VITE_BETA_CODE is set at build
 * time. This is a controlled-beta screen, NOT security: the code ships in the
 * client bundle. It exists to stop the unlisted URL being treated as a public
 * product and to set expectations before entry.
 */
const BETA_CODE = (import.meta.env.VITE_BETA_CODE ?? '').trim();

export function BetaGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean>(() =>
    BETA_CODE === '' ? true : loadJSON<boolean>(STORAGE_KEYS.betaUnlocked, false),
  );
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  if (unlocked) return <>{children}</>;

  const submit = () => {
    if (input.trim().toLowerCase() === BETA_CODE.toLowerCase()) {
      saveJSON(STORAGE_KEYS.betaUnlocked, true);
      setUnlocked(true);
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 px-4">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-volt-400 text-ink-950">
            <KeyRound className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Build Your Own Meal Plan</h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-volt-400">Private beta · v{__APP_VERSION__}</p>
          </div>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-ink-300">
          This is an invite-only beta of a meal-planning and nutrition-education tool. Enter the
          access code from your invitation to continue.
        </p>
        <label htmlFor="beta-code" className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-300">Access code</span>
          <input
            id="beta-code"
            type="password"
            className="input-field"
            value={input}
            autoFocus
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
          />
        </label>
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-300">
            That code was not recognised — check your invitation and try again.
          </p>
        )}
        <button type="button" className="btn-primary mt-4 w-full" onClick={submit}>
          Enter beta
        </button>
        <p className="mt-4 text-xs leading-relaxed text-ink-400">
          The beta provides general nutrition education for planning purposes. It does not diagnose,
          treat or replace advice from a doctor or registered dietitian.
        </p>
      </div>
    </div>
  );
}
