'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import confetti from 'canvas-confetti';

import AuthGuard from '@/components/AuthGuard';
import DailyQuote from '@/components/DailyQuote';
import AddHoursModal from '@/components/AddHoursModal';
import { SparklesCore } from '@/components/ui/sparkles';

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [totalHours, setTotalHours] = useState(0);
  const [weekHours, setWeekHours] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const triggerShortSideConfetti = () => {
    const duration = 300; // ~0.6s
    const end = Date.now() + duration;
    const colors = ['#a786ff', '#fd8bbc', '#eca184', '#f8deb1'];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 60,
        startVelocity: 45,
        origin: { x: 0, y: 0.5 },
        colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 60,
        startVelocity: 45,
        origin: { x: 1, y: 0.5 },
        colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  };

  useEffect(() => {
    fetchUser();
    fetchTotalHours();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      if (data.authenticated) {
        setUsername(data.username);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchTotalHours = async () => {
    try {
      const response = await fetch('/api/time/total');
      const data = await response.json();
      setTotalHours(Math.round(data.total * 10) / 10);
      setWeekHours(Math.round(data.week * 10) / 10);
    } catch (error) {
      console.error('Failed to fetch total hours:', error);
    }
  };

  const handleLogTime = async (hoursInput: string, date: string, activity?: string) => {
    if (!hoursInput || parseFloat(hoursInput) <= 0) return;

    setLoading(true);
    try {
      const response = await fetch('/api/time/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours: hoursInput, date, activity }),
      });

      if (response.ok) {
        fetchTotalHours();
        triggerShortSideConfetti();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to log time:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const formatDate = () => {
    const date = new Date();
    const months = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <AuthGuard>
      <div className="h-screen bg-[#FCF7FF] p-2 pb-10 relative flex flex-col overflow-hidden">
        <div className="max-w-md mx-auto space-y-3 relative z-10 flex-1 w-full">
          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#FFECF6] rounded-2xl p-4 relative overflow-hidden shadow-lg"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-pink-400/20 rounded-full -mr-8 -mt-8 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <Image
                  src="/logo.svg"
                  alt="logo"
                  width={40}
                  height={40}
                  className="w-8 h-8"
                />
                <button
                  onClick={handleLogout}
                  className="text-[#3a061c] text-[10px] opacity-70 hover:opacity-100"
                >
                  logout
                </button>
              </div>
              <h1 className="text-xl font-bold text-[#3a061c] mb-1">
                hello, {username}!
              </h1>
              <p className="text-[#3a061c] text-[10px] opacity-80 mb-2">
                welcome back 😛
              </p>
              <p className="petit-formal-script-regular text-pink-600 text-[9px] opacity-70">
                {formatDate()}
              </p>
              <div className="mt-3 bg-[#fff4d8] rounded-full p-2 flex items-center gap-2 shadow-lg">
                <div className="w-6 h-6 bg-[#ffe6a8] rounded-full flex items-center justify-center text-[#3a061c] font-semibold text-[10px]">
                  {weekHours}
                </div>
                <span className="text-[#a29166] text-[9px]">
                  hours clocked this week
                </span>
              </div>
            </div>
          </motion.div>

          {/* Quote Section */}
          <DailyQuote />
        </div>

        {/* Progress Card - Extending off screen by height, positioned at bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative overflow-hidden bg-white rounded-2xl p-4 shadow-lg -mb-6 pb-16"
          >
            <div className="pointer-events-none absolute inset-0">
              <SparklesCore
                className="absolute inset-0 h-full w-full"
                background="transparent"
                minSize={0.5}
                maxSize={2}
                speed={3}
                particleColor="#f75ece"
                particleDensity={260}
              />
              <div className="absolute inset-0 bg-linear-to-b from-white via-white/70 to-white" />
            </div>
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div>
                <p className="text-[#c0c0c0] text-[9px] mb-1">ur progress</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-2xl font-semibold text-[#3a061c]">
                    {totalHours}
                  </h2>
                  <span className="text-xl font-semibold text-[#3a061c]">hrs</span>
                  <span className="text-[#c0c0c0] text-[9px] ml-2">to date</span>
                </div>
              </div>
              <button
                onClick={() => router.push('/calendar')}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Image
                  src="/arrow.svg"
                  alt="view calendar"
                  width={24}
                  height={24}
                  className="w-5 h-5"
                />
              </button>
            </div>

            {/* Log Time Button with gradient border */}
            <div className="w-full rounded-full p-[2px] bg-linear-to-r from-[#FFBBDF] to-[#EAD7F5] shadow-lg relative z-10">
              <motion.button
                type="button"
                onClick={() => setIsModalOpen(true)}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-full bg-linear-to-r from-[#FFBBDF] to-[#EAD7F5] text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 petit-formal-script-regular"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>log hours</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add Hours Modal */}
      <AddHoursModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogTime}
        loading={loading}
      />
    </AuthGuard>
  );
}
