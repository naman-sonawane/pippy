'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'login failed');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError('something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FCF7FF]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
          <div className="flex items-center justify-center mb-6">
                <Image
                  src="/logo.svg"
                  alt="logo"
                  width={60}
                  height={60}
                  className="w-12 h-12"
                />
          </div>
          
          <h1 className="text-3xl font-semibold text-center mb-2 text-[#3a061c]">
            welcome back
          </h1>
          <p className="text-center text-[#a29166] mb-8 text-sm">
            sign in to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#fff4d8] border border-[#ffe6a8] text-[#3a061c] placeholder-[#c0c0c0] focus:outline-none focus:ring-2 focus:ring-[#db8cb6]"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#fff4d8] border border-[#ffe6a8] text-[#3a061c] placeholder-[#c0c0c0] focus:outline-none focus:ring-2 focus:ring-[#db8cb6]"
                required
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#db8cb6] to-[#ead7f5] text-white font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'signing in...' : 'sign in'}
            </motion.button>
          </form>

          <p className="text-center text-[#a29166] text-sm mt-6">
            don't have an account?{' '}
            <button
              onClick={() => router.push('/signup')}
              className="text-[#3a061c] font-medium hover:underline"
            >
              sign up
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

