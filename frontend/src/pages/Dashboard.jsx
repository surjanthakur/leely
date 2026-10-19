import { Settings2, Trash2, ArrowToDownLeft, Magicpen, Home6 } from 'reicon-react';
import { useRef, useState, useEffect } from 'react';
import { SettingsPopupWindow } from '../components/export.js';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { CallAgent } from '../api/agent.api.js';
import { AgentLoader } from '../components/export.js';
import LeelyLogo from '../assets/read_with_leely_logo.png';
import { Link } from 'react-router-dom';
import useThemeContext from '../context/useThemeContext.js';

/* ------------------------------------------------------------------ */
/*  Search configuration (mirrors the backend `SearchRequest` model)   */
/* ------------------------------------------------------------------ */

const MAX_RESULTS_OPTIONS = [3, 5, 10];

const SEARCH_DEPTH_OPTIONS = [
  { value: 'basic', label: 'Basic', hint: 'Balanced crawl for general topics' },
  { value: 'fast', label: 'Fast', hint: 'Quick lookup with low latency (default)' },
  { value: 'ultra-fast', label: 'Ultra', hint: 'Fastest possible, minimal crawl' },
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

/* ------------------------------------------------------------------ */
/*  Dashboard                                                          */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const { theme } = useThemeContext();
  const [openSettings, setOpenSettings] = useState(false);
  const [isAgentLoading, setIsAgentLoading] = useState(false);

  // 🔽 search options — persisted so the user's choice survives reloads
  const [maxResults, setMaxResults] = useState(getStoredMaxResults);
  const [searchDepth, setSearchDepth] = useState(getStoredSearchDepth);

  const [chats, setChats] = useState(() => {
    try {
      const storedChats = localStorage.getItem('lily_chats');
      return storedChats ? JSON.parse(storedChats) : [];
    } catch {
      toast.error("faild to load chat's try again!");
      return [];
    }
  });

  const textareaRef = useRef(null);
  const chatWindowRef = useRef(null);

  const { register, handleSubmit, reset } = useForm();

  // Persist chats
  useEffect(() => {
    if (chats.length === 0) {
      localStorage.removeItem('lily_chats');
    } else {
      localStorage.setItem('lily_chats', JSON.stringify(chats));
    }
  }, [chats]);

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

  // Auto scroll
  useEffect(() => {
    const chatWindow = chatWindowRef.current;

    if (chatWindow) {
      chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
    }
  }, [chats, isAgentLoading]);

  const handleSettings = () => {
    setOpenSettings((prev) => !prev);
  };

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
    <section
      className="h-dvh overflow-hidden bg-[#f4f4f0] font-sans text-neutral-900 transition-colors duration-300 selection:bg-[#fcabe7bd] selection:text-black dark:bg-neutral-950 dark:text-neutral-100"
      style={{
        backgroundImage:
          theme === 'dark'
            ? 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)'
            : 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col bg-transparent">
        {/* Header - Neo Brutalist Style */}
        <header className="flex h-16 shrink-0 items-center justify-between bg-transparent px-4 sm:px-8">
          <Link
            to="/"
            aria-label="Go to home page"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-fuchsia-200 shadow-[2px_2px_0px_0px_#000] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-none dark:border-neutral-700 dark:shadow-[2px_2px_0px_0px_#c4f75d]"
          >
            <Home6 size={25} />
          </Link>
        </header>

        {/* Main Chat Area */}
        <div className="relative flex min-h-0 flex-1 flex-col">
          <main
            ref={chatWindowRef}
            className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-10"
          >
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
              {/* Empty State - Floating Card */}
              {chats.length === 0 && !isAgentLoading && (
                <div className="flex min-h-[50vh] items-center justify-center">
                  <div className="relative max-w-lg -rotate-1 rounded-3xl border-4 border-black bg-lime-200 p-8 text-center shadow-[12px_12px_0px_0px_#000] dark:border-0 dark:shadow-white/30">
                    <img
                      src={LeelyLogo}
                      alt="LeelyAgent"
                      className="mx-auto mb-4 h-30 w-30 object-cover"
                    />

                    <h1 className="font-serif text-3xl font-bold tracking-tight text-black sm:text-4xl">
                      Tell me what you want to learn.
                    </h1>
                    <div className="mt-4 text-left text-base font-medium leading-6 text-neutral-700">
                      <p className="font-bold">For example, ask about:</p>
                      <ul className="mt-2 list-disc space-y-1 pl-6">
                        <li>First-principles thinking 🤔.</li>
                        <li>Database management systems 💻.</li>
                        <li>World War II ⚠️.</li>
                        <li>CORS, explained from first principles 🧠.</li>
                        <li>Context engineering 🤖.</li>
                        <li>Personal finance and budgeting tips 🤑.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat History */}
              {chats.map((chat, chatIndex) => (
                <div key={chatIndex} className="space-y-6 sm:space-y-8">
                  {/* User Message Bubble */}
                  <div className="flex justify-end">
                    <div className="w-fit max-w-[92%] sm:max-w-[75%]">
                      <div className="rounded-2xl rounded-br-sm border-2 border-black bg-[#1a1a1a] px-5 py-4 shadow-[4px_4px_0px_0px_#c4f75d]">
                        <p className="wrap-break-word text-base font-medium leading-6 text-white">
                          {chat.user_query}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Agent Resources */}
                  {chat.found_resources?.length > 0 && (
                    <div className="flex justify-start">
                      <div className="w-full max-w-[98%] space-y-4 sm:max-w-[85%]">
                        {chat.found_resources.map((resource, resourceIndex) => (
                          <article
                            key={`${resource.url}-${resourceIndex}`}
                            className="rounded-2xl rounded-tl-sm border-2 border-black bg-[#fcf6c5] p-5 shadow-[6px_6px_0px_0px_#000] transition-colors duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#000] dark:border-neutral-600 dark:bg-neutral-800 dark:shadow-white/30"
                          >
                            <h3 className="wrap-break-word py-2 text-lg font-black leading-7 text-black dark:text-white sm:text-xl">
                              {resource.title}
                            </h3>

                            <div className="mt-2 flex items-center gap-2">
                              <span className="flex items-center rounded-md border-2 border-black bg-[#ff8ae2] px-2 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_#000]">
                                read <ArrowToDownLeft size={16} className="ml-1" />
                              </span>

                              <span className="rounded-md border-2 border-black bg-[#c4f75d] px-2 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_#000] dark:text-black">
                                score: {((resource.score || 0) * 100).toFixed(0)}%
                              </span>
                            </div>

                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-4 block break-all text-sm font-bold text-blue-700 underline decoration-2 underline-offset-2 hover:text-blue-900 dark:text-sky-300 dark:hover:text-sky-200"
                            >
                              {resource.url}
                            </a>

                            <div className="mt-4 rounded-xl border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_#000] transition-colors duration-300 dark:border-neutral-600 dark:bg-neutral-900">
                              <p className="wrap-break-word text-sm font-medium leading-6 text-neutral-800 dark:text-neutral-200">
                                <span className="mb-1 block font-black text-black dark:text-white">
                                  About this resource:
                                </span>{' '}
                                {resource.content?.split(/\s+/).slice(0, 50).join(' ')}...
                              </p>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Agent Loading State */}
              {isAgentLoading && (
                <div className="flex justify-start">
                  <div className="w-full max-w-[98%] sm:max-w-[85%]">
                    <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_#000] transition-colors duration-300 dark:border-neutral-600 dark:bg-neutral-800 dark:shadow-[4px_4px_0px_0px_#c4f75d]">
                      <AgentLoader />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* Input Area - Floating Brutalist Box */}
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
        </div>
      </div>

      {/* Settings Popup */}
      <SettingsPopupWindow openSetting={openSettings} setSetting={handleSettings} />
    </section>
  );
}
