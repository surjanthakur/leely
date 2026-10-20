import { Settings2, Trash2, Magicpen } from 'reicon-react';
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { CallAgent } from '../api/agent.api';
import { toast } from 'react-toastify';

/* ------------------------------------------------------------------ */
/*  Search configuration (mirrors the backend `SearchRequest` model)   */
/* ------------------------------------------------------------------ */

const MAX_RESULTS_OPTIONS = [3, 5, 10];

const SEARCH_DEPTH_OPTIONS = [
  { value: 'basic', label: 'Basic', hint: 'Balanced crawl for general topics' },
  { value: 'fast', label: 'Fast', hint: 'Quick lookup with low latency (default)' },
  { value: 'ultra-fast', label: 'Ultra-fast', hint: 'Fastest possible, minimal crawl' },
  { value: 'advanced', label: 'Advanced', hint: 'Deep crawl, best quality, slowest' },
];

const MAX_RESULTS_KEY = 'lily_max_results';
const SEARCH_DEPTH_KEY = 'lily_search_depth';

const DEFAULT_MAX_RESULTS = 5;
const DEFAULT_SEARCH_DEPTH = 'fast';

function getStoredMaxResults() {
  try {
    const stored = Number(localStorage.getItem(MAX_RESULTS_KEY));
    return MAX_RESULTS_OPTIONS.includes(stored) ? stored : DEFAULT_MAX_RESULTS;
  } catch {
    return DEFAULT_MAX_RESULTS;
  }
}

function getStoredSearchDepth() {
  try {
    const stored = localStorage.getItem(SEARCH_DEPTH_KEY);
    return SEARCH_DEPTH_OPTIONS.some((option) => option.value === stored)
      ? stored
      : DEFAULT_SEARCH_DEPTH;
  } catch {
    return DEFAULT_SEARCH_DEPTH;
  }
}

/* ------------------------------------------------------------------ */
/*  Reusable neo-brutalist toggle pill                                 */
/* ------------------------------------------------------------------ */

function OptionButton({ active, onClick, label, description }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={description}
      className={[
        'shrink-0 rounded-lg border-2 px-2.5 py-1.5 text-[11px] font-black uppercase leading-none tracking-wide transition-all duration-150',
        'focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-[#c4f75d]',
        active
          ? '-translate-y-0.5 border-black bg-[#c4f75d] text-black shadow-[2px_2px_0px_0px_#000]'
          : 'border-transparent text-neutral-500 hover:-translate-y-0.5 hover:border-black hover:bg-[#f4f4f0] hover:text-black hover:shadow-[2px_2px_0px_0px_#000] dark:text-neutral-400 dark:hover:border-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white dark:hover:shadow-[2px_2px_0px_0px_#c4f75d]',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

export default function DashboardInputSection({
  handleSettings,
  setChats,
  setIsAgentLoading,
  chats,
  isAgentLoading,
}) {
  // 🔽 search options — persisted so the user's choice survives reloads
  const [maxResults, setMaxResults] = useState(getStoredMaxResults);
  const [searchDepth, setSearchDepth] = useState(getStoredSearchDepth);

  const { register, handleSubmit, reset } = useForm();
  const textareaRef = useRef(null);

  // Persist search preferences
  useEffect(() => {
    try {
      localStorage.setItem(MAX_RESULTS_KEY, String(maxResults));
    } catch {
      /* storage unavailable — non critical */
    }
  }, [maxResults]);

  useEffect(() => {
    try {
      localStorage.setItem(SEARCH_DEPTH_KEY, searchDepth);
    } catch {
      /* storage unavailable — non critical */
    }
  }, [searchDepth]);

  const deleteAllChats = () => {
    setChats([]);
    localStorage.removeItem('lily_chats');
  };

  const handleInput = (e) => {
    const textarea = e.target;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  const onSubmit = async (data) => {
    const userQuery = data.user_query?.trim();

    if (!userQuery) return;

    setIsAgentLoading(true);

    const chatIndex = chats.length;

    setChats((prev) => [
      ...prev,
      {
        user_query: userQuery,
        found_resources: [],
      },
    ]);

    try {
      // 👇 payload matches the backend `SearchRequest` model
      const response = await CallAgent(userQuery, maxResults, searchDepth);

      const foundResources = response?.found_resources || [];

      setChats((prev) =>
        prev.map((chat, index) =>
          index === chatIndex
            ? {
                ...chat,
                found_resources: foundResources,
              }
            : chat
        )
      );
    } catch (error) {
      setChats((prev) => prev.filter((_, index) => index !== chatIndex));
      toast.error(error.response?.data?.detail || "Oop's Something went wrong. Please try again.");
    } finally {
      setIsAgentLoading(false);
      reset();

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const activeDepthHint =
    SEARCH_DEPTH_OPTIONS.find((option) => option.value === searchDepth)?.hint ?? '';

  return (
    <>
      <div className="shrink-0 bg-transparent px-4 py-6 sm:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-3xl border-4 border-black bg-white p-3 shadow-[8px_8px_0px_0px_#000] transition-colors duration-300 dark:border-neutral-600 dark:bg-neutral-800 dark:shadow-white/30"
          >
            {/* ---- Search options toolbar ---- */}
            <div
              className="mb-3 flex flex-col gap-2 border-b-2 border-dashed border-neutral-200 pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 dark:border-neutral-700"
              aria-label="Search options"
            >
              {/* Results count — 3 buttons */}
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  Results:
                </span>
                <div
                  role="group"
                  aria-label="Number of resources to return"
                  className="flex flex-wrap items-center gap-1.5"
                >
                  {MAX_RESULTS_OPTIONS.map((value) => (
                    <OptionButton
                      key={value}
                      active={maxResults === value}
                      onClick={() => setMaxResults(value)}
                      label={value}
                      description={`Return ${value} resources`}
                    />
                  ))}
                </div>
              </div>

              {/* Search depth */}
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  Depth:
                </span>
                <div
                  role="group"
                  aria-label="Search depth"
                  className="flex flex-wrap items-center gap-1.5"
                >
                  {SEARCH_DEPTH_OPTIONS.map((option) => (
                    <OptionButton
                      key={option.value}
                      active={searchDepth === option.value}
                      onClick={() => setSearchDepth(option.value)}
                      label={option.label}
                      description={option.hint}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ---- Prompt row ---- */}
            <div className="flex items-end gap-2">
              {/* Settings & Delete */}
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={handleSettings}
                  aria-label="Settings"
                  className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-transparent text-neutral-500 transition hover:border-black hover:bg-[#f4f4f0] hover:text-black hover:shadow-[2px_2px_0px_0px_#000] dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white dark:hover:shadow-[2px_2px_0px_0px_#c4f75d]"
                >
                  <Settings2 size={22} />
                </button>
                <button
                  type="button"
                  onClick={deleteAllChats}
                  aria-label="Delete all chats"
                  className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-transparent text-red-500 transition hover:border-black hover:bg-[#ff8ae2] hover:text-black hover:shadow-[2px_2px_0px_0px_#000] dark:hover:border-neutral-400 dark:hover:shadow-[2px_2px_0px_0px_#c4f75d]"
                >
                  <Trash2 size={22} />
                </button>
              </div>

              {/* Textarea */}
              <textarea
                {...register('user_query', {
                  required: 'Please enter a message.',
                  validate: (value) => value.trim().length > 0 || 'Message cannot be empty.',
                })}
                ref={(element) => {
                  textareaRef.current = element;
                  register('user_query').ref(element);
                }}
                rows={1}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="what you want to read today?"
                className="max-h-50 min-h-12 flex-1 resize-none overflow-y-auto bg-transparent px-3 py-3 text-base font-medium text-black outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
              />

              {/* Send Button */}
              <button
                type="submit"
                aria-label="Send message"
                disabled={isAgentLoading}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-lime-200 text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:bg-[#b0e64a] active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Magicpen size={22} />
              </button>
            </div>
          </form>

          {/* Helper Text */}
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="rounded-full border-2 border-black bg-fuchsia-200 px-3 py-1 text-xs font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-white/80">
              Press Enter to send · Shift + Enter for a new line
            </p>
            <p className="text-center text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              {maxResults} results · {activeDepthHint}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
