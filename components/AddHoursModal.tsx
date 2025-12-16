'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (hours: string, date: string, activity?: string) => Promise<void>;
  loading: boolean;
}

export default function AddHoursModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
}: AddHoursModalProps) {
  const [hoursInput, setHoursInput] = useState('');
  const [minutesInput, setMinutesInput] = useState('');
  const [activity, setActivity] = useState('');
  const [customActivity, setCustomActivity] = useState('');
  const [error, setError] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [isDateEditing, setIsDateEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHoursInput('');
      setMinutesInput('');
      setActivity('');
      setCustomActivity('');
      setError('');

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      setDateInput(todayStr);
      setIsDateEditing(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hours = parseInt(hoursInput) || 0;
    const minutes = parseInt(minutesInput) || 0;
    
    if (hours === 0 && minutes === 0) {
      setError('Please enter hours or minutes');
      return;
    }

    if (minutes < 0 || minutes >= 60) {
      setError('Minutes must be between 0 and 59');
      return;
    }

    // Convert to decimal hours
    const totalHours = hours + minutes / 60;

    if (!dateInput) {
      setError('Please pick a date');
      return;
    }

    setError('');
    const finalActivity = activity === 'other' ? customActivity : activity;
    await onConfirm(totalHours.toString(), dateInput, finalActivity || undefined);
    if (!loading) {
      onClose();
    }
  };

  const activities = [
    { id: 'tkd', label: 'tkd' },
    { id: 'hospital', label: 'hospital' },
    { id: 'shadowing', label: 'shadowing' },
    { id: 'retirement home', label: 'retirement home' },
    { id: 'other', label: 'other' },
  ];

  const quickHours = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8];

  const convertDecimalToHoursMinutes = (decimalHours: number) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return { hours, minutes };
  };

  const getCurrentDecimalHours = () => {
    const hours = parseInt(hoursInput) || 0;
    const minutes = parseInt(minutesInput) || 0;
    return hours + (minutes / 60);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop + Modal Wrapper */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#FFBBDF] to-[#EAD7F5] p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#3a061c] petit-formal-script-regular">log hours</h2>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-[#3a061c]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-6">
                  {/* Activity Selection */}
                  <div className="mb-6">
                    <label className="block text-[#3a061c] text-sm font-medium mb-3">
                      activity?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {activities.map((act) => (
                        <motion.button
                          key={act.id}
                          type="button"
                          onClick={() => {
                            setActivity(act.id);
                            if (act.id !== 'other') {
                              setCustomActivity('');
                            }
                            setError('');
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            activity === act.id
                              ? 'bg-gradient-to-r from-[#FFBBDF] to-[#EAD7F5] text-[#3a061c]'
                              : 'bg-gray-100 text-[#3a061c] hover:bg-gray-200'
                          }`}
                        >
                          {act.label}
                        </motion.button>
                      ))}
                    </div>
                    {activity === 'other' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3"
                      >
                        <input
                          type="text"
                          value={customActivity}
                          onChange={(e) => {
                            setCustomActivity(e.target.value);
                            setError('');
                          }}
                          placeholder="enter activity"
                          className="w-full px-4 py-3 text-sm text-[#3a061c] border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#FFBBDF] transition-colors"
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Date Selection */}
                  <div className="mb-6">
                    <label className="block text-[#3a061c] text-sm font-medium mb-3">
                      date
                    </label>
                    {!isDateEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsDateEditing(true)}
                        className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-left text-sm text-[#3a061c] bg-white hover:border-[#FFBBDF] transition-colors"
                      >
                        today
                      </button>
                    ) : (
                      <input
                        type="date"
                        value={dateInput}
                        onChange={(e) => {
                          setDateInput(e.target.value);
                          setError('');
                        }}
                        className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm text-[#3a061c] focus:outline-none focus:border-[#FFBBDF] transition-colors"
                      />
                    )}
                  </div>

                  <label className="block text-[#3a061c] text-sm font-medium mb-3">
                    time?
                  </label>
                  
                  {/* Hours and Minutes Inputs */}
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        min="0"
                        value={hoursInput}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0).toString();
                          setHoursInput(val);
                          setError('');
                        }}
                        placeholder="0"
                        className="w-full px-4 py-4 text-2xl font-semibold text-[#3a061c] border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#FFBBDF] transition-colors"
                        autoFocus
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c0c0c0] text-lg">
                        hrs
                      </span>
                    </div>
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={minutesInput}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(0, Math.min(59, parseInt(e.target.value) || 0)).toString();
                          setMinutesInput(val);
                          setError('');
                        }}
                        placeholder="0"
                        className="w-full px-4 py-4 text-2xl font-semibold text-[#3a061c] border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#FFBBDF] transition-colors"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c0c0c0] text-lg">
                        mins
                      </span>
                    </div>
                  </div>

                  {/* Quick select buttons */}
                  <div className="mb-4">
                    <p className="text-xs text-[#c0c0c0] mb-2">quick select:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickHours.map((decimalHour) => {
                        const { hours, minutes } = convertDecimalToHoursMinutes(decimalHour);
                        const currentDecimal = getCurrentDecimalHours();
                        const isSelected = Math.abs(currentDecimal - decimalHour) < 0.01; // Small tolerance for floating point comparison
                        const label = decimalHour % 1 === 0 
                          ? `${decimalHour}h` 
                          : `${decimalHour}h`;
                        return (
                          <motion.button
                            key={decimalHour}
                            type="button"
                            onClick={() => {
                              setHoursInput(hours.toString());
                              setMinutesInput(minutes.toString());
                              setError('');
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                              isSelected
                                ? 'bg-gradient-to-r from-[#FFBBDF] to-[#EAD7F5] text-[#3a061c]'
                                : 'bg-gray-100 text-[#3a061c] hover:bg-gray-200'
                            }`}
                          >
                            {label}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2"
                    >
                      {error}
                    </motion.p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-3 px-4 rounded-2xl bg-gray-100 text-[#3a061c] font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={loading || (hoursInput === '' && minutesInput === '')}
                    whileHover={{ scale: loading ? 1 : 1.05 }}
                    whileTap={{ scale: loading ? 1 : 0.95 }}
                    className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#FFBBDF] to-[#EAD7F5] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <svg
                        className="animate-spin h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

