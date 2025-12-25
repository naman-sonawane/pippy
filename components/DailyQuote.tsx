'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Quote {
  quote: string;
  author: string;
}

export default function DailyQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    fetchQuote();

    // Load saved rating from localStorage (if any)
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('dailyQuoteRating');
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 5) {
          setRating(parsed);
        }
      }
    }
  }, []);

  const fetchQuote = async () => {
    try {
      const response = await fetch('/api/quote');
      const data = await response.json();
      setQuote(data);
    } catch (error) {
      console.error('Failed to fetch quote:', error);
    }
  };

  if (!quote) {
    return (
      <div className="p-3 mb-3">
        <div className="text-[#c0c0c0] text-left text-[10px]">loading quote...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-3 mb-3 relative"
    >
      {/* Spinning image on the right, half cut off, behind all layers */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="fixed right-0 top-1/2 -translate-y-1/2 translate-x-[50%] -z-10 pointer-events-none"
      >
        <Image
          src="/spinny.png"
          alt="spinning decoration"
          width={300}
          height={300}
          className="w-[300px] h-[300px] md:w-[400px] md:h-[400px]"
        />
      </motion.div>

      <div className="relative z-10 pr-12">
        <p className="petit-formal-script-regular italic text-[#3a061c] text-left mb-3 text-sm leading-relaxed">
          "{quote.quote}"
        </p>
        <div className="flex justify-start items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              onClick={() => {
                setRating(star);
                if (typeof window !== 'undefined') {
                  window.localStorage.setItem('dailyQuoteRating', String(star));
                }
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="focus:outline-none"
            >
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                <svg
                  className="w-3 h-3"
                  fill={rating >= star ? '#ffe6a8' : 'none'}
                  stroke={rating >= star ? '#ffe6a8' : '#c0c0c0'}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

