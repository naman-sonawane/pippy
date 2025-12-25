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

type ViewMode = 'calendar' | 'list';

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [startDateRange, setStartDateRange] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDateRange, setEndDateRange] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchLogs();
  }, [currentDate, startDateRange, endDateRange]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const start = new Date(startDateRange);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDateRange);
      end.setHours(23, 59, 59, 999);

      const response = await fetch(
        `/api/time/get?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
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
  const totalRangeHours = logs.reduce((sum, log) => sum + log.hours, 0);

  // Calculate activity totals for list view
  const activityTotals = logs.reduce((acc, log) => {
    const activity = log.activity || 'uncategorized';
    if (!acc[activity]) {
      acc[activity] = 0;
    }
    acc[activity] += log.hours;
    return acc;
  }, {} as Record<string, number>);

  const sortedActivities = Object.entries(activityTotals)
    .map(([activity, hours]) => ({ activity, hours }))
    .sort((a, b) => b.hours - a.hours);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#FCF7FF] p-2 pb-6 flex items-center justify-center relative">
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

        <div className="relative max-w-md mx-auto z-10 w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-3"
          >
            <button
              onClick={() => router.push('/')}
              className="text-[#3a061c] text-[10px] opacity-70 hover:opacity-100"
            >
              ← back
            </button>
            <h1 className="text-sm font-semibold text-[#3a061c]">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h1>
            <div className="w-12"></div>
          </motion.div>

          {/* View Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center mb-3"
          >
            <div className="flex gap-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-sm">
              <motion.button
                onClick={() => setViewMode('calendar')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-1 rounded-md text-[10px] font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-[#fff4d8] text-[#3a061c]'
                    : 'text-[#a29166] hover:text-[#3a061c]'
                }`}
              >
                calendar
              </motion.button>
              <motion.button
                onClick={() => setViewMode('list')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-1 rounded-md text-[10px] font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#fff4d8] text-[#3a061c]'
                    : 'text-[#a29166] hover:text-[#3a061c]'
                }`}
              >
                list
              </motion.button>
            </div>
          </motion.div>

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <>
              {/* Month Navigation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between mb-3"
              >
                <motion.button
                  onClick={goToPreviousMonth}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm"
                >
                  <svg
                    className="w-4 h-4 text-[#3a061c]"
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
                  <p className="text-[#a29166] text-[9px] mb-0.5">this month</p>
                  <p className="text-sm font-semibold text-[#3a061c]">
                    {Math.round(
                      logs
                        .filter((log) => {
                          const logDate = new Date(log.date);
                          return (
                            logDate.getMonth() === currentDate.getMonth() &&
                            logDate.getFullYear() === currentDate.getFullYear()
                          );
                        })
                        .reduce((sum, log) => sum + log.hours, 0) *
                        10
                    ) / 10}{' '}
                    hrs
                  </p>
                </div>

                <motion.button
                  onClick={goToNextMonth}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm"
                >
                  <svg
                    className="w-4 h-4 text-[#3a061c]"
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
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-lg relative"
              >
                {/* Beaver Image */}
                <img
                  src="/beaver.png"
                  alt="Beaver"
                  className="w-8 absolute -top-8 left-1/3 -translate-x-8"
                />
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className="text-center text-[9px] text-[#a29166] font-medium"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                {loading ? (
                  <div className="text-center py-6 text-[#c0c0c0] text-[10px]">
                    loading...
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => {
                      if (!day) {
                        return (
                          <div key={`empty-${index}`} className="aspect-square" />
                        );
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
                          className={`aspect-square rounded-lg flex flex-col items-center justify-center p-0.5 cursor-pointer ${
                            isToday
                              ? 'bg-linear-to-br from-[#FFBBDF] to-[#EAD7F5]'
                              : hasHours
                              ? 'bg-[#fff4d8]'
                              : 'bg-white/60'
                          }`}
                        >
                          <span
                            className={`text-[9px] font-medium ${
                              isToday ? 'text-[#3a061c]' : 'text-[#a29166]'
                            }`}
                          >
                            {day.getDate()}
                          </span>
                          {hasHours && (
                            <span className="text-[8px] text-[#3a061c] font-medium mt-0.5">
                              {Math.round(hours * 10) / 10}h
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-lg"
            >
              {loading ? (
                <div className="text-center py-6 text-[#c0c0c0] text-[10px]">
                  loading...
                </div>
              ) : sortedActivities.length === 0 ? (
                <div className="text-center py-6 text-[#c0c0c0] text-[10px]">
                  no activities found
                </div>
              ) : (
                <div className="space-y-1.5">
                  {sortedActivities.map((item, index) => (
                    <motion.div
                      key={item.activity}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-2 bg-white/60 rounded-lg"
                    >
                      <span className="text-[10px] font-medium text-[#3a061c]">
                        {item.activity}
                      </span>
                      <span className="text-[10px] font-semibold text-[#3a061c]">
                        {Math.round(item.hours * 10) / 10} hrs
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Date Range Picker and Total */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 space-y-2"
          >
            {/* Date Range Picker */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <label className="text-[9px] text-[#a29166] font-medium flex-1">
                  start date
                </label>
                <input
                  type="date"
                  value={startDateRange}
                  onChange={(e) => setStartDateRange(e.target.value)}
                  className="flex-1 text-[10px] px-2 py-1 rounded-lg border border-[#a29166]/30 bg-white/60 text-[#3a061c] focus:outline-none focus:ring-1 focus:ring-[#a29166]"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[9px] text-[#a29166] font-medium flex-1">
                  end date
                </label>
                <input
                  type="date"
                  value={endDateRange}
                  onChange={(e) => setEndDateRange(e.target.value)}
                  className="flex-1 text-[10px] px-2 py-1 rounded-lg border border-[#a29166]/30 bg-white/60 text-[#3a061c] focus:outline-none focus:ring-1 focus:ring-[#a29166]"
                />
              </div>
            </motion.div>

            {/* Total Hours */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-sm text-center"
            >
              <p className="text-[#a29166] text-[9px] mb-0.5">total</p>
              <p className="text-base font-semibold text-[#3a061c]">
                {Math.round(totalRangeHours * 10) / 10} hrs
              </p>
            </motion.div>
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

