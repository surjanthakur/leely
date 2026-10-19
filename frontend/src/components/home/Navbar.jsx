import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';
import LeelyLogo from '../../assets/read_with_leely_logo.png';
import { DashboardRedirectButton } from '../export.js';
import { EASE, NAV } from './homeData.js';
import { Marquee } from './homeShared.jsx';

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-black bg-[#f7f6f0]/85 backdrop-blur-md">
      <div className="border-b-2 border-black bg-black py-1.5 text-white">
        <Marquee
          speed={34}
          itemClassName="font-mono text-[10px] uppercase tracking-[0.22em]"
          items={[
            "it's free now",
            "it's free now",
            "it's free now",
            "it's free now",
            "it's free now",
            "it's free now",
            "it's free now",
            "it's free now",
            "it's free now",
            "it's free now",
          ]}
        />
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-12">
        <a href="#home" className="group flex items-center gap-2.5">
          <img src={LeelyLogo} alt="" className="h-18 w-18 object-contain" />
          <span className="font-serif text-xl text-black font-bold leading-none tracking-tight">
            my personal Leely
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-full px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-black/70 transition-colors hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              {n.label}
            </a>
          ))}
          <Link
            to="/why"
            className="rounded-full px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-black/70 transition-colors hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            why i build this?
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <DashboardRedirectButton />
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-xl border-2 border-black bg-white shadow-[3px_3px_0_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none md:hidden"
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute left-0 h-0.5 w-4 bg-black transition-all ${
                  open ? 'top-1.5 rotate-45' : 'top-0'
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-0.5 w-4 bg-black transition-all ${
                  open ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute left-0 h-0.5 w-4 bg-black transition-all ${
                  open ? 'top-1.5 -rotate-45' : 'top-3'
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="overflow-hidden border-t-2 border-black bg-[#f7f6f0] md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl border-2 border-black bg-white px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider shadow-[3px_3px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  {n.label}
                </a>
              ))}
              <Link
                to="/why"
                onClick={() => setOpen(false)}
                className="rounded-xl border-2 border-black bg-white px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider shadow-[3px_3px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                why i build this?
              </Link>
              <div className="mt-2 sm:hidden">
                <DashboardRedirectButton />
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
