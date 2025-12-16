'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AuthGuard from '@/components/AuthGuard';
import DayDetailsModal from '@/components/DayDetailsModal';

interface TimeLog {
  id: string;
  date: string;
  hours: number;
  activity: string | null;
}

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [currentDate]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);

      const response = await fetch(
        `/api/time/get?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLogsForDate = (date: Date): TimeLog[] => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return logs.filter((l) => l.date === dateStr);
  };

  const getHoursForDate = (date: Date): number => {
    const dayLogs = getLogsForDate(date);
    return dayLogs.reduce((sum, log) => sum + log.hours, 0);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentDate);
  const totalMonthHours = logs.reduce((sum, log) => sum + log.hours, 0);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#FCF7FF] p-4 pb-8 flex items-center justify-center relative">
        {/* Spinning background decoration - cut off at bottom */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="fixed bottom-0 left-1/2 -translate-x-1/2 translate-y-[50%] z-0 pointer-events-none"
        >
          <img
            src="/spinny.png"
            alt="spinning decoration"
            className="w-[150vw] md:w-[1400px] h-auto max-w-none"
          />
        </motion.div>

        <div className="relative max-w-md mx-auto z-10">


  {/* Existing content */}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <button
              onClick={() => router.push('/')}
              className="text-[#3a061c] text-sm opacity-70 hover:opacity-100"
            >
              ← back
            </button>
            <h1 className="text-xl font-semibold text-[#3a061c]">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h1>
            <div className="w-12"></div>
          </motion.div>

          {/* Month Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-6"
          >
            <motion.button
              onClick={goToPreviousMonth}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm"
            >
              <svg
                className="w-6 h-6 text-[#3a061c]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </motion.button>

            <div className="text-center">
              <p className="text-[#a29166] text-xs mb-1">total this month</p>
              <p className="text-2xl font-semibold text-[#3a061c]">
                {Math.round(totalMonthHours * 10) / 10} hrs
              </p>
            </div>

            <motion.button
              onClick={goToNextMonth}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm"
            >
              <svg
                className="w-6 h-6 text-[#3a061c]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </motion.button>
          </motion.div>

          {/* Calendar Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg"
          >
            {/* Beaver Image */} <img src="/beaver.png" alt="Beaver" className="w-12 absolute -top-11 left-1/3 -translate-x-10" />
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs text-[#a29166] font-medium"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            {loading ? (
              <div className="text-center py-8 text-[#c0c0c0]">loading...</div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const hours = getHoursForDate(day);
                  const isToday =
                    day.toDateString() === new Date().toDateString();
                  const hasHours = hours > 0;

                  return (
                    <motion.button
                      key={day.toISOString()}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.01 }}
                      onClick={() => handleDayClick(day)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 cursor-pointer ${
                        isToday
                          ? 'bg-linear-to-br from-[#FFBBDF] to-[#EAD7F5]'
                          : hasHours
                          ? 'bg-[#fff4d8]'
                          : 'bg-white/60'
                      }`}
                    >
                      <span
                        className={`text-xs font-medium ${
                          isToday ? 'text-[#3a061c]' : 'text-[#a29166]'
                        }`}
                      >
                        {day.getDate()}
                      </span>
                      {hasHours && (
                        <span className="text-[10px] text-[#3a061c] font-medium mt-0.5">
                          {Math.round(hours * 10) / 10}h
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Day Details Modal */}
        {selectedDate && (
          <DayDetailsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            date={selectedDate}
            activities={getLogsForDate(selectedDate).map(log => ({
              id: log.id,
              hours: log.hours,
              activity: log.activity,
            }))}
            onRefresh={fetchLogs}
          />
        )}
      </div>
    </AuthGuard>
  );
}

