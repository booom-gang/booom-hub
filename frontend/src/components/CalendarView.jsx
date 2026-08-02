import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, Trash2, Edit3, Plus } from 'lucide-react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, isToday } from 'date-fns';
import EventBadge from './EventBadge.jsx';
import EventModal from './EventModal.jsx';
import ConfirmModal from './ConfirmModal.jsx';
import { StarDoodle } from './Decorations.jsx';
import eventService from '../services/eventService.js';
import useAuth from '../hooks/useAuth.js';
import { formatTime } from '../utils/formatDate.js';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { user } = useAuth();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const fetchEvents = async () => {
    setLoading(true);
    try { const data = await eventService.getEvents(month, year); setEvents(data); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, [month, year]);

  const calendarDays = useMemo(() => {
    const s = startOfWeek(startOfMonth(currentDate));
    const e = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start: s, end: e });
  }, [currentDate]);

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((ev) => { const k = format(new Date(ev.date), 'yyyy-MM-dd'); if (!map[k]) map[k] = []; map[k].push(ev); });
    return map;
  }, [events]);

  const selectedDayEvents = selectedDate ? eventsByDate[format(selectedDate, 'yyyy-MM-dd')] || [] : [];

  const prevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month, 1));
  const goToday = () => setCurrentDate(new Date());

  const handleSave = async (data) => {
    if (editingEvent) await eventService.updateEvent(editingEvent._id, data);
    else await eventService.createEvent(data);
    fetchEvents();
  };

  const handleDelete = async (id) => {
    setDeleteTarget(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try { await eventService.deleteEvent(deleteTarget); fetchEvents(); } catch (err) { console.error(err); }
    setDeleteTarget(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative">
      <StarDoodle className="absolute -top-4 right-8" size={18} />

      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-colors">
              <ChevronLeft size={16} style={{ color: 'var(--text-secondary)' }} />
            </button>
            <h2 className="text-base font-bold min-w-[140px] text-center" style={{ color: 'var(--text-primary)' }}>
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button onClick={nextMonth} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-colors">
              <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goToday} className="text-xs px-3 py-1.5 rounded-full font-medium hover:bg-[var(--bg-tertiary)] transition-colors" style={{ color: 'var(--text-muted)' }}>Today</button>
            <motion.button onClick={() => { setEditingEvent(null); setModalOpen(true); }} className="btn-accent text-xs py-1.5 px-3 flex items-center gap-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Plus size={12} /> Event
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-1.5 text-center text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px">
          {calendarDays.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayEv = eventsByDate[key] || [];
            const inMonth = isSameMonth(day, currentDate);
            const selected = selectedDate && isSameDay(day, selectedDate);
            const today = isToday(day);

            return (
              <motion.button
                key={key}
                onClick={() => setSelectedDate(day)}
                className={`relative min-h-[56px] sm:min-h-[72px] p-1.5 text-left rounded-xl transition-colors ${inMonth ? '' : 'opacity-25'}`}
                style={{
                  backgroundColor: selected ? 'var(--accent)' : today ? 'var(--bg-tertiary)' : 'transparent',
                  color: selected ? '#fff' : 'var(--text-primary)',
                }}
                whileHover={{ scale: 1.05 }}
              >
                <span className={`text-xs font-bold ${today && !selected ? 'inline-flex items-center justify-center w-6 h-6 rounded-full' : ''}`}
                  style={today && !selected ? { backgroundColor: 'var(--accent)', color: '#fff' } : {}}>
                  {format(day, 'd')}
                </span>
                {dayEv.length > 0 && (
                  <div className="mt-0.5 hidden sm:flex gap-0.5">
                    {dayEv.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selected ? '#fff' : 'var(--accent)' }} />
                    ))}
                  </div>
                )}
                {dayEv.length > 0 && <div className="sm:hidden mt-0.5"><EventBadge count={dayEv.length} /></div>}
              </motion.button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:w-[280px] card-dark">
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {format(selectedDate, 'EEE, MMM d')}
          </h3>
          {selectedDayEvents.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>no events</p>
          ) : (
            <div className="space-y-2">
              {selectedDayEvents.map((ev) => (
                <div key={ev._id} className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{ev.title}</h4>
                    {ev.created_by?._id === user?._id && (
                      <div className="flex gap-0.5">
                        <button onClick={() => { setEditingEvent(ev); setModalOpen(true); }} className="w-5 h-5 rounded flex items-center justify-center hover:bg-[var(--bg-tertiary)]"><Edit3 size={10} style={{ color: 'var(--text-muted)' }} /></button>
                        <button onClick={() => handleDelete(ev._id)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-[var(--bg-tertiary)]"><Trash2 size={10} style={{ color: 'var(--danger)' }} /></button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1"><Clock size={10} style={{ color: 'var(--text-muted)' }} /><span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{formatTime(ev.date)}</span></div>
                  {ev.description && <p className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>{ev.description}</p>}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      <div className="hidden lg:block mt-auto pt-4">
        <div className="flex items-center gap-3">
          <p className="text-xs font-bold" style={{ color: 'var(--accent)' }}>You've got this! 💪</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Make today amazing.</p>
        </div>
      </div>

      <EventModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingEvent(null); }} onSave={handleSave} event={editingEvent} />
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setDeleteTarget(null); }}
        onConfirm={confirmDelete}
        title="Delete event?"
        message="This action cannot be undone."
        confirmText="Delete it"
      />
    </div>
  );
};

export default CalendarView;
