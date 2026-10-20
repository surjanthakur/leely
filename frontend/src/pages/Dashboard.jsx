import { ArrowToDownLeft, Home6 } from 'reicon-react';
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
/*  Dashboard                                                          */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const { theme } = useThemeContext();
  const [openSettings, setOpenSettings] = useState(false);
  const [isAgentLoading, setIsAgentLoading] = useState(false);

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

  const { reset } = useForm();

  // Persist chats
  useEffect(() => {
    if (chats.length === 0) {
      localStorage.removeItem('lily_chats');
    } else {
      localStorage.setItem('lily_chats', JSON.stringify(chats));
    }
  }, [chats]);

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
        </div>
      </div>

      {/* Settings Popup */}
      <SettingsPopupWindow openSetting={openSettings} setSetting={handleSettings} />
    </section>
  );
}
