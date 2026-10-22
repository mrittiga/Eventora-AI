import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Wallet,
  Clock,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Trash2,
  Edit3,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { EventItem, EventType } from '../../types';
import { NavigationPage } from '../navigation/Sidebar';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

interface MyEventsPageProps {
  onNavigate: (page: NavigationPage) => void;
}

export const MyEventsPage: React.FC<MyEventsPageProps> = ({ onNavigate }) => {
  const {
    events,
    activeEvent,
    setActiveEventId,
    updateEvent,
    deleteEvent,
    formatCurrency,
    getEventReadiness,
  } = useEventContext();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);

  // Edit Event State
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<EventType>('wedding');
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editVenueName, setEditVenueName] = useState('');
  const [editGuestCount, setEditGuestCount] = useState<number>(100);
  const [editBudget, setEditBudget] = useState<number>(500000);
  const [editCurrency, setEditCurrency] = useState('INR');
  const [editTheme, setEditTheme] = useState('');
  const [editCoverImage, setEditCoverImage] = useState('');

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.name.toLowerCase().includes(search.toLowerCase()) ||
      ev.location.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || ev.eventType === selectedType;
    return matchesSearch && matchesType;
  });

  const getDaysRemaining = (targetDate?: string) => {
    if (!targetDate) return 0;
    const diff = new Date(targetDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const handleOpenEdit = (ev: EventItem) => {
    setEventToEdit(ev);
    setEditName(ev.name);
    setEditType(ev.eventType);
    setEditDate(ev.date);
    setEditStartTime(ev.startTime || '18:00');
    setEditLocation(ev.location);
    setEditVenueName(ev.venueName || '');
    setEditGuestCount(ev.guestCount);
    setEditBudget(ev.budget);
    setEditCurrency(ev.currency || 'INR');
    setEditTheme(ev.theme || '');
    setEditCoverImage(ev.coverImage || '');
  };

  const handleSaveEdit = () => {
    if (!eventToEdit || !editName.trim()) return;

    updateEvent({
      ...eventToEdit,
      name: editName.trim(),
      eventType: editType,
      date: editDate,
      startTime: editStartTime || eventToEdit.startTime || '18:00',
      endTime: eventToEdit.endTime || '23:00',
      location: editLocation.trim(),
      venueName: editVenueName.trim() || undefined,
      guestCount: Number(editGuestCount) || 50,
      budget: Number(editBudget) || 100000,
      currency: editCurrency as 'INR' | 'USD' | 'EUR' | 'GBP',
      theme: editTheme.trim() || undefined,
      coverImage: editCoverImage.trim() || undefined,
    });

    showToast(`Updated "${editName}" successfully!`, 'success');
    setEventToEdit(null);
  };

  const handleDelete = () => {
    if (!eventToDelete) return;
    deleteEvent(eventToDelete.id);
    showToast(`Deleted "${eventToDelete.name}" successfully`, 'info');
    setEventToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Events</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your ongoing, upcoming, and past organized events
          </p>
        </div>
        <button
          onClick={() => onNavigate('create_event')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-button-primary text-xs font-semibold self-start sm:self-auto transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events by title or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Category Segmented Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-white/5 rounded-xl border border-white/10 shrink-0">
          {['all', 'wedding', 'birthday', 'community', 'corporate'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                selectedType === type
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {type === 'all' ? 'All Events' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="glass-panel p-12 text-center space-y-4">
          <Calendar className="w-12 h-12 text-slate-500 mx-auto opacity-50" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">No events found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search || selectedType !== 'all'
                ? 'Try adjusting your search query or filter tags.'
                : 'You have not created any events yet. Launch the AI wizard to create your first plan!'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('create_event')}
            className="px-4 py-2 rounded-xl glass-button-primary text-xs font-semibold"
          >
            Launch Event Creator
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => {
            const isActive = ev.id === activeEvent?.id;
            const daysLeft = getDaysRemaining(ev.date);
            const readiness = getEventReadiness(ev.id);

            return (
              <div
                key={ev.id}
                className={`glass-card overflow-hidden flex flex-col group transition-all duration-300 ${
                  isActive
                    ? 'border-violet-500/80 ring-1 ring-violet-500/40 shadow-xl shadow-violet-500/15'
                    : 'hover:border-white/25'
                }`}
              >
                {/* Image Cover */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  {ev.coverImage ? (
                    <img
                      src={ev.coverImage}
                      alt={ev.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-violet-950 via-indigo-900 to-slate-900 flex items-center justify-center text-slate-500">
                      <Sparkles className="w-8 h-8 opacity-40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] uppercase font-bold text-cyan-300 border border-white/10">
                      {ev.eventType}
                    </span>
                    {isActive && (
                      <span className="px-2 py-1 rounded-md bg-violet-600/90 backdrop-blur-md text-[10px] font-semibold text-white">
                        Active Focus
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-white/10 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{daysLeft}d left</span>
                  </div>

                  {/* Bottom Text Over Image */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-base font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                      {ev.name}
                    </h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      <span>{ev.venueName || ev.location}</span>
                    </p>
                  </div>
                </div>

                {/* Card Content & Stats */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="grid grid-cols-3 gap-2 py-2 border-b border-white/10 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Date</span>
                      <span className="font-semibold text-slate-200">{ev.date.split('-').slice(1).join('/')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Guests</span>
                      <span className="font-semibold text-slate-200">{ev.guestCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Budget</span>
                      <span className="font-semibold text-violet-300 font-mono">
                        {formatCurrency(ev.budget, ev.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Readiness Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">Readiness Score</span>
                      <span className="font-bold text-white tabular-nums">{readiness.score}%</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                        style={{ width: `${readiness.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/10">
                    <div className="flex items-center gap-1">
                      {!isActive && (
                        <button
                          onClick={() => {
                            setActiveEventId(ev.id);
                            showToast(`Switched active event to "${ev.name}"`);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          Select
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEdit(ev)}
                        aria-label="Edit event details"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEventToDelete(ev)}
                        aria-label="Delete event"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setActiveEventId(ev.id);
                        onNavigate('event_plan');
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg glass-button text-xs font-semibold text-cyan-300 hover:text-white transition-colors"
                    >
                      <span>View Plan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Event Details Modal */}
      <Modal
        isOpen={!!eventToEdit}
        onClose={() => setEventToEdit(null)}
        title="Edit Event Details"
        subtitle="Update core event metadata, date, venue, budget, or theme"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Event Name *</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="glass-input font-medium"
              placeholder="e.g. Maya & Arjun's Sangeet & Reception"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Event Type</label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value as EventType)}
                className="glass-input bg-slate-900 capitalize"
              >
                <option value="wedding">Wedding / Engagement</option>
                <option value="birthday">Birthday / Anniversary</option>
                <option value="corporate">Corporate / Conference</option>
                <option value="community">Community / Fest</option>
                <option value="other">Other Celebration</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Theme / Aesthetic Vibe</label>
              <input
                type="text"
                value={editTheme}
                onChange={(e) => setEditTheme(e.target.value)}
                className="glass-input"
                placeholder="e.g. Royal Marigold & Twilight Lanterns"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Date *</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="glass-input"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Start Time</label>
              <input
                type="time"
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
                className="glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Location / City *</label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="glass-input"
                placeholder="e.g. Udaipur, Rajasthan"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Venue Name</label>
              <input
                type="text"
                value={editVenueName}
                onChange={(e) => setEditVenueName(e.target.value)}
                className="glass-input"
                placeholder="e.g. Jagmandir Island Palace"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Expected Guests</label>
              <input
                type="number"
                min={1}
                value={editGuestCount}
                onChange={(e) => setEditGuestCount(Number(e.target.value))}
                className="glass-input font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Total Budget</label>
              <input
                type="number"
                min={1000}
                step={10000}
                value={editBudget}
                onChange={(e) => setEditBudget(Number(e.target.value))}
                className="glass-input font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Currency</label>
              <select
                value={editCurrency}
                onChange={(e) => setEditCurrency(e.target.value)}
                className="glass-input bg-slate-900 font-mono"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Cover Image URL (Optional)</label>
            <input
              type="text"
              value={editCoverImage}
              onChange={(e) => setEditCoverImage(e.target.value)}
              className="glass-input font-mono text-xs"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              onClick={() => setEventToEdit(null)}
              className="px-4 py-2 rounded-xl glass-button text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={!editName.trim()}
              className="px-4 py-2 rounded-xl glass-button-primary text-xs font-semibold disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        title="Delete Event"
        subtitle="This action cannot be undone."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-white">"{eventToDelete?.name}"</strong>?
            All associated budget items, tasks, vendors, and guest RSVPs will also be removed.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => setEventToDelete(null)}
              className="px-4 py-2 rounded-xl glass-button text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
