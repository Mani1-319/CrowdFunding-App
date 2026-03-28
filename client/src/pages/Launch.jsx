import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const STORAGE_KEY = 'donte_launch_seen';

const Launch = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) {
      navigate('/home', { replace: true });
      return;
    }
    const t = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(t);
  }, [navigate]);

  const goHome = () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    sessionStorage.setItem(STORAGE_KEY, '1');
    navigate('/home', { replace: true });
  };

  const onExitAnimationComplete = () => {
    goHome();
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(30,58,138,0.38),transparent_52%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(59,130,246,0.14),transparent_42%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.2),rgba(15,23,42,0.96))]" />

      <motion.div
        className="pointer-events-none absolute inset-0 opacity-20"
        animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
        style={{
          backgroundImage:
            'linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)',
          backgroundSize: '200% 200%',
        }}
      />

      <button
        type="button"
        onClick={goHome}
        className="absolute bottom-8 right-8 z-20 text-sm font-medium text-white/40 hover:text-white/90 transition-colors"
      >
        Skip
      </button>

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6">
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 28, filter: 'blur(14px)' }}
          animate={
            visible
              ? { opacity: 1, y: 0, filter: 'blur(0px)' }
              : { opacity: 0, y: -36, scale: 1.12, filter: 'blur(10px)' }
          }
          transition={{
            duration: visible ? 0.85 : 0.75,
            ease: visible ? [0.22, 1, 0.36, 1] : [0.65, 0, 0.35, 1],
          }}
          onAnimationComplete={() => {
            if (!visible) onExitAnimationComplete();
          }}
        >
          <motion.div
            className="mb-6 h-20 w-20 rounded-2xl bg-gradient-to-br from-slate-500 via-blue-700 to-indigo-900 p-[2px] shadow-2xl shadow-blue-900/35"
            initial={{ scale: 0.75, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.12, type: 'spring', stiffness: 220, damping: 20 }}
          >
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950/90">
              <span className="text-4xl font-black tracking-tighter text-white">D</span>
            </div>
          </motion.div>

          <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl md:text-8xl">
            <span className="bg-gradient-to-r from-slate-200 via-sky-200 to-blue-300 bg-clip-text text-transparent">
              Donte
            </span>
          </h1>
          <p className="mt-4 text-sm font-medium text-slate-300/70 sm:text-base">
            Crowdfunding that matters
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Launch;
