'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AddHoursModal from './AddHoursModal';

interface ActivityEntry {
  id: string;
  hours: number;
  activity: string | null;
}

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  activities: ActivityEntry[];
  onRefresh: () => void;
}

export default function DayDetailsModal({ isOpen, onClose, date, activities, onRefresh }: DayDetailsModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!date) return null;

  const formatDate = (date: Date) => {
    const months = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (wholeHours === 0 && minutes === 0) {
      return '0h';
    }
    
    const parts = [];
    if (wholeHours > 0) {
      parts.push(`${wholeHours}h`);
    }
    if (minutes > 0) {
      parts.push(`${minutes}m`);
    }
    
    return parts.join(' ');
  };

  const totalHours = activities.reduce((sum, entry) => sum + entry.hours, 0);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/time/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        onRefresh();
        setDeletingId(null);
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const handleUpdate = async (id: string, hours: string, activity?: string) => {
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const response = await fetch('/api/time/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, hours, activity, date: dateStr }),
      });

      if (response.ok) {
        onRefresh();
        setEditingId(null);
      }
    } catch (error) {
      console.error('Failed to update entry:', error);
    }
  };

  const handleAdd = async (hours: string, activity?: string) => {
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const response = await fetch('/api/time/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours, date: dateStr, activity }),
      });

      if (response.ok) {
        onRefresh();
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to add entry:', error);
    }
  };

  return (
    <>
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
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#FFBBDF] to-[#EAD7F5] p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#3a061c] petit-formal-script-regular">
                      {formatDate(date)}
                    </h2>
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
                  {totalHours > 0 && (
                    <p className="text-sm text-[#3a061c] opacity-70 mt-2">
                      {formatDuration(totalHours)}
                    </p>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                  {activities.length > 0 ? (
                    <div className="space-y-3">
                      {activities.map((entry) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-50 rounded-2xl p-4"
                        >
                          {editingId === entry.id ? (
                            <EditActivityForm
                              entry={entry}
                              onSave={(hours, activity) => handleUpdate(entry.id, hours, activity)}
                              onCancel={() => setEditingId(null)}
                            />
                          ) : (
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm text-[#c0c0c0] mb-1">activity</p>
                                <p className="text-base font-medium text-[#3a061c] capitalize mb-2">
                                  {entry.activity || 'no activity specified'}
                                </p>
                                <p className="text-sm text-[#c0c0c0] mb-1">duration</p>
                                <p className="text-xl font-semibold text-[#3a061c]">
                                  {formatDuration(entry.hours)}
                                </p>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <button
                                  onClick={() => setEditingId(entry.id)}
                                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
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
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => setDeletingId(entry.id)}
                                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                  <svg
                                    className="w-5 h-5 text-red-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[#c0c0c0] text-base">
                        no hours logged for this day
                      </p>
                    </div>
                  )}

                  {/* Add Activity Button */}
                  <motion.button
                    onClick={() => setIsAddModalOpen(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-4 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#FFBBDF] to-[#EAD7F5] text-white font-medium flex items-center justify-center gap-2"
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
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="petit-formal-script-regular">add activity</span>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingId(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6"
              >
                <p className="text-lg font-medium text-[#3a061c] mb-4">
                  delete this activity?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeletingId(null)}
                    className="flex-1 py-2 px-4 rounded-2xl bg-gray-100 text-[#3a061c] font-medium hover:bg-gray-200 transition-colors"
                  >
                    cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deletingId)}
                    className="flex-1 py-2 px-4 rounded-2xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                  >
                    delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Hours Modal */}
      <AddHoursModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAdd}
        loading={false}
      />
    </>
  );
}

function EditActivityForm({ entry, onSave, onCancel }: { entry: ActivityEntry; onSave: (hours: string, activity?: string) => void; onCancel: () => void }) {
  const [hoursInput, setHoursInput] = useState('');
  const [minutesInput, setMinutesInput] = useState('');
  const [activity, setActivity] = useState(entry.activity || '');
  const [customActivity, setCustomActivity] = useState('');

  useEffect(() => {
    const wholeHours = Math.floor(entry.hours);
    const minutes = Math.round((entry.hours - wholeHours) * 60);
    setHoursInput(wholeHours.toString());
    setMinutesInput(minutes.toString());
    if (entry.activity && !['tkd', 'hospital', 'shadowing', 'retirement home'].includes(entry.activity)) {
      setCustomActivity(entry.activity);
      setActivity('other');
    } else {
      setActivity(entry.activity || '');
    }
  }, [entry]);

  const activities = [
    { id: 'tkd', label: 'tkd' },
    { id: 'hospital', label: 'hospital' },
    { id: 'shadowing', label: 'shadowing' },
    { id: 'retirement home', label: 'retirement home' },
    { id: 'other', label: 'other' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = parseInt(hoursInput) || 0;
    const minutes = parseInt(minutesInput) || 0;
    const totalHours = hours + (minutes / 60);
    const finalActivity = activity === 'other' ? customActivity : activity;
    onSave(totalHours.toString(), finalActivity || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs text-[#c0c0c0] mb-2">activity</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {activities.map((act) => (
            <button
              key={act.id}
              type="button"
              onClick={() => {
                setActivity(act.id);
                if (act.id !== 'other') setCustomActivity('');
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activity === act.id
                  ? 'bg-gradient-to-r from-[#FFBBDF] to-[#EAD7F5] text-[#3a061c]'
                  : 'bg-gray-200 text-[#3a061c] hover:bg-gray-300'
              }`}
            >
              {act.label}
            </button>
          ))}
        </div>
        {activity === 'other' && (
          <input
            type="text"
            value={customActivity}
            onChange={(e) => setCustomActivity(e.target.value)}
            placeholder="enter activity"
            className="w-full px-3 py-2 text-sm text-[#3a061c] border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FFBBDF]"
          />
        )}
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs text-[#c0c0c0] mb-1">hours</label>
          <input
            type="number"
            min="0"
            value={hoursInput}
            onChange={(e) => setHoursInput(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0).toString())}
            className="w-full px-3 py-2 text-base font-semibold text-[#3a061c] border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FFBBDF]"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-[#c0c0c0] mb-1">minutes</label>
          <input
            type="number"
            min="0"
            max="59"
            value={minutesInput}
            onChange={(e) => setMinutesInput(e.target.value === '' ? '' : Math.max(0, Math.min(59, parseInt(e.target.value) || 0)).toString())}
            className="w-full px-3 py-2 text-base font-semibold text-[#3a061c] border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FFBBDF]"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 px-3 rounded-xl bg-gray-100 text-[#3a061c] text-sm font-medium hover:bg-gray-200"
        >
          cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#FFBBDF] to-[#EAD7F5] text-white text-sm font-medium"
        >
          save
        </button>
      </div>
    </form>
  );
}
