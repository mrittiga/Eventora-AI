import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Utensils,
  Edit2,
  Trash2,
  Copy,
  Check,
  Share2,
  Send,
  Eye,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { Guest, RsvpStatus, GuestGroup, InvitationStatus } from '../../types';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

export const GuestManager: React.FC = () => {
  const {
    activeEvent,
    activeGuests,
    addGuest,
    updateGuest,
    deleteGuest,
    importGuestsFromCSV,
  } = useEventContext();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);

  // CSV Import Modal
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [group, setGroup] = useState<GuestGroup>('family');
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>('pending');
  const [additionalGuests, setAdditionalGuests] = useState<number>(0);
  const [dietaryPreferences, setDietaryPreferences] = useState('');
  const [accessibilityNotes, setAccessibilityNotes] = useState('');
  const [tableOrSeating, setTableOrSeating] = useState('');
  const [invitationStatus, setInvitationStatus] = useState<InvitationStatus>('not_sent');
  const [notes, setNotes] = useState('');

  // Aggregated Stats
  const totalInvitedGuests = activeGuests.reduce((sum, g) => sum + 1 + (g.additionalGuests || 0), 0);
  const confirmedAttendance = activeGuests.reduce(
    (sum, g) => (g.rsvpStatus === 'attending' ? sum + 1 + (g.additionalGuests || 0) : sum),
    0
  );
  const pendingCount = activeGuests.filter((g) => g.rsvpStatus === 'pending').length;
  const declinedCount = activeGuests.filter((g) => g.rsvpStatus === 'declined').length;

  // Dietary Summary
  const dietaryBreakdown = activeGuests.reduce((acc, g) => {
    if (g.dietaryPreferences && g.rsvpStatus === 'attending') {
      const diets = g.dietaryPreferences.split(',').map((d) => d.trim().toLowerCase());
      diets.forEach((d) => {
        if (d) acc[d] = (acc[d] || 0) + 1 + (g.additionalGuests || 0);
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const filteredGuests = activeGuests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.contact.toLowerCase().includes(search.toLowerCase()) ||
      (g.tableOrSeating || '').toLowerCase().includes(search.toLowerCase());
    const matchesRsvp = rsvpFilter === 'all' || g.rsvpStatus === rsvpFilter;
    const matchesGroup = groupFilter === 'all' || g.group === groupFilter;
    return matchesSearch && matchesRsvp && matchesGroup;
  });

  const handleOpenAdd = () => {
    setName('');
    setContact('');
    setGroup('family');
    setRsvpStatus('pending');
    setAdditionalGuests(0);
    setDietaryPreferences('');
    setAccessibilityNotes('');
    setTableOrSeating('');
    setInvitationStatus('not_sent');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (g: Guest) => {
    setEditingGuest(g);
    setName(g.name);
    setContact(g.contact);
    setGroup(g.group);
    setRsvpStatus(g.rsvpStatus);
    setAdditionalGuests(g.additionalGuests);
    setDietaryPreferences(g.dietaryPreferences || '');
    setAccessibilityNotes(g.accessibilityNotes || '');
    setTableOrSeating(g.tableOrSeating || '');
    setInvitationStatus(g.invitationStatus);
    setNotes(g.notes || '');
  };

  const handleSave = () => {
    if (!name.trim() || !activeEvent) return;

    if (editingGuest) {
      updateGuest({
        ...editingGuest,
        name,
        contact,
        group,
        rsvpStatus,
        additionalGuests,
        dietaryPreferences: dietaryPreferences || undefined,
        accessibilityNotes: accessibilityNotes || undefined,
        tableOrSeating: tableOrSeating || undefined,
        invitationStatus,
        notes: notes || undefined,
      });
      showToast(`Updated "${name}"`, 'success');
      setEditingGuest(null);
    } else {
      addGuest({
        eventId: activeEvent.id,
        name,
        contact,
        group,
        rsvpStatus,
        additionalGuests,
        dietaryPreferences: dietaryPreferences || undefined,
        accessibilityNotes: accessibilityNotes || undefined,
        tableOrSeating: tableOrSeating || undefined,
        invitationStatus,
        notes: notes || undefined,
      });
      showToast(`Added guest "${name}"`, 'success');
      setIsAddModalOpen(false);
    }
  };

  const handleDelete = () => {
    if (!guestToDelete) return;
    deleteGuest(guestToDelete.id);
    showToast('Guest record removed', 'info');
    setGuestToDelete(null);
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Contact', 'Group', 'RSVP Status', 'Additional Guests', 'Dietary Preferences', 'Seating Table', 'Invitation Status'];
    const rows = activeGuests.map((g) => [
      `"${g.name}"`,
      `"${g.contact}"`,
      `"${g.group}"`,
      `"${g.rsvpStatus}"`,
      g.additionalGuests,
      `"${g.dietaryPreferences || ''}"`,
      `"${g.tableOrSeating || ''}"`,
      `"${g.invitationStatus}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(activeEvent?.name || 'event').replace(/\s+/g, '_')}_guest_list.csv`;
    link.click();
    showToast('Guest list exported to CSV', 'success');
  };

  const handleToggleInvitationStatus = (guest: Guest) => {
    const nextStatus: InvitationStatus =
      guest.invitationStatus === 'not_sent'
        ? 'sent'
        : guest.invitationStatus === 'sent'
        ? 'opened'
        : 'not_sent';
    updateGuest({
      ...guest,
      invitationStatus: nextStatus,
    });
    showToast(`Updated invite to "${nextStatus.replace('_', ' ')}" for ${guest.name}`, 'info');
  };

  const handleToggleRsvpStatus = (guest: Guest) => {
    const nextRsvp: RsvpStatus =
      guest.rsvpStatus === 'pending'
        ? 'attending'
        : guest.rsvpStatus === 'attending'
        ? 'declined'
        : 'pending';
    updateGuest({
      ...guest,
      rsvpStatus: nextRsvp,
    });
    showToast(`Marked ${guest.name} as ${nextRsvp}`, 'info');
  };

  const handleLoadSampleCSV = () => {
    const sample = `Name, Contact, Group, Dietary, AdditionalGuests
Meera Nambiar, +91 98450 12345, family, Vegetarian, 1
Devansh Verma, devansh@techstartup.in, friends, None, 1
Ananya Deshmukh, ananya.d@designstudio.org, colleagues, Vegan, 0
Dr. Rajesh Varma, +91 99201 55678, vip, Jain, 2`;
    setCsvContent(sample);
  };

  // Preview parsed CSV lines
  const parsedPreviewRows = React.useMemo(() => {
    if (!csvContent.trim()) return [];
    const lines = csvContent.trim().split('\n');
    const result: Array<{ name: string; contact: string; group: string; dietary: string; guests: number }> = [];
    lines.forEach((line, idx) => {
      if (idx === 0 && line.toLowerCase().includes('name')) return;
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 1 && parts[0]) {
        result.push({
          name: parts[0],
          contact: parts[1] || '—',
          group: parts[2] || 'general',
          dietary: parts[3] || 'None',
          guests: parseInt(parts[4] || '0', 10) || 0,
        });
      }
    });
    return result;
  }, [csvContent]);

  const handleImportCSVSubmit = () => {
    if (!csvContent.trim() || !activeEvent) return;
    const { added } = importGuestsFromCSV(csvContent, activeEvent.id);
    showToast(`Imported ${added} guest(s) successfully!`, 'success');
    setIsCsvModalOpen(false);
    setCsvContent('');
  };

  const handleCopyInviteDraft = () => {
    const text = `Warm Greetings! 
You are cordially invited to celebrate with us at "${activeEvent?.name}"!
📅 Date: ${activeEvent?.date}
⏰ Time: ${activeEvent?.startTime} onwards
📍 Venue: ${activeEvent?.venueName || activeEvent?.location}

Please kindly RSVP with your dietary preferences so we may arrange the best hospitality for you. Looking forward to seeing you!`;
    navigator.clipboard.writeText(text);
    showToast('Invitation text copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Guest Management & RSVPs</h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracking attendance and dietary preferences for <strong className="text-violet-300">{activeEvent?.name}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleCopyInviteDraft}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-button text-xs font-semibold text-slate-200"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Copy Invite Text</span>
          </button>
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-button text-xs font-semibold text-slate-200"
          >
            <Upload className="w-3.5 h-3.5 text-violet-400" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-button text-xs font-semibold text-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-button-primary text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Headcount</span>
          <div className="text-xl font-bold text-white font-mono tabular-nums">{totalInvitedGuests}</div>
          <span className="text-[11px] text-slate-400">Across {activeGuests.length} invitations</span>
        </div>

        <div className="glass-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Confirmed Attending</span>
          <div className="text-xl font-bold text-emerald-400 font-mono tabular-nums">{confirmedAttendance}</div>
          <span className="text-[11px] text-slate-400">
            {activeEvent?.guestCount ? `${Math.round((confirmedAttendance / activeEvent.guestCount) * 100)}% of target capacity` : '0%'}
          </span>
        </div>

        <div className="glass-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Pending RSVPs</span>
          <div className="text-xl font-bold text-amber-400 font-mono tabular-nums">{pendingCount}</div>
          <span className="text-[11px] text-slate-400">Awaiting response</span>
        </div>

        <div className="glass-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Declined</span>
          <div className="text-xl font-bold text-rose-400 font-mono tabular-nums">{declinedCount}</div>
          <span className="text-[11px] text-slate-400">Unable to attend</span>
        </div>
      </div>

      {/* Dietary Summary Bar if attending */}
      {Object.keys(dietaryBreakdown).length > 0 && (
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
            <Utensils className="w-4 h-4" />
            <span>Dietary Requirements Summary:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(dietaryBreakdown).map(([diet, count]) => (
              <span
                key={diet}
                className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200 capitalize"
              >
                {diet}: <strong className="text-white font-mono">{count}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="glass-panel p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by guest name, phone, or seating table..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <select
            value={rsvpFilter}
            onChange={(e) => setRsvpFilter(e.target.value)}
            className="glass-input bg-slate-900 py-2 text-xs"
          >
            <option value="all">All RSVP States</option>
            <option value="attending">Attending</option>
            <option value="pending">Pending</option>
            <option value="declined">Declined</option>
          </select>

          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="glass-input bg-slate-900 py-2 text-xs"
          >
            <option value="all">All Groups</option>
            <option value="family">Family</option>
            <option value="friends">Friends</option>
            <option value="colleagues">Colleagues</option>
            <option value="vip">VIP</option>
            <option value="community">Community</option>
            <option value="general">General</option>
          </select>
        </div>
      </div>

      {/* Guest Table */}
      <div className="glass-panel p-4 overflow-hidden">
        {filteredGuests.length === 0 ? (
          <div className="text-center p-8 text-xs text-slate-400 space-y-2">
            <Users className="w-8 h-8 text-slate-500 mx-auto opacity-50" />
            <p>No guests match the selected filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Guest Name & Group</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">RSVP Status</th>
                  <th className="py-3 px-3">Invite Status</th>
                  <th className="py-3 px-3 text-center">+Guests</th>
                  <th className="py-3 px-3">Dietary / Accessibility</th>
                  <th className="py-3 px-3">Seating / Table</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{guest.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{guest.group}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                      {guest.contact || '—'}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleRsvpStatus(guest)}
                        title="Click to toggle RSVP: pending -> attending -> declined"
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 transition-transform active:scale-95 cursor-pointer ${
                          guest.rsvpStatus === 'attending'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                            : guest.rsvpStatus === 'declined'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                        }`}
                      >
                        {guest.rsvpStatus === 'attending' && <CheckCircle className="w-3 h-3" />}
                        {guest.rsvpStatus === 'declined' && <XCircle className="w-3 h-3" />}
                        {guest.rsvpStatus === 'pending' && <Clock className="w-3 h-3" />}
                        <span>{guest.rsvpStatus}</span>
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleInvitationStatus(guest)}
                        title="Click to advance: not sent -> sent -> opened"
                        className={`px-2 py-0.5 rounded text-[10px] font-medium inline-flex items-center gap-1 transition-transform active:scale-95 cursor-pointer ${
                          guest.invitationStatus === 'opened'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30'
                            : guest.invitationStatus === 'sent'
                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30'
                            : 'bg-slate-700/40 text-slate-400 border border-white/10 hover:bg-slate-700/60'
                        }`}
                      >
                        {guest.invitationStatus === 'opened' && <Eye className="w-3 h-3" />}
                        {guest.invitationStatus === 'sent' && <Send className="w-3 h-3" />}
                        {guest.invitationStatus === 'not_sent' && <Mail className="w-3 h-3" />}
                        <span className="capitalize">{guest.invitationStatus.replace('_', ' ')}</span>
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-200">
                      +{guest.additionalGuests}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-300">
                      {guest.dietaryPreferences || guest.accessibilityNotes ? (
                        <span>
                          {guest.dietaryPreferences}
                          {guest.accessibilityNotes && ` (${guest.accessibilityNotes})`}
                        </span>
                      ) : (
                        <span className="text-slate-500">None</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-violet-300 font-medium">
                      {guest.tableOrSeating || 'Unassigned'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(guest)}
                          aria-label="Edit guest"
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setGuestToDelete(guest)}
                          aria-label="Delete guest"
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Guest Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingGuest}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingGuest(null);
        }}
        title={editingGuest ? 'Edit Guest' : 'Add Guest to List'}
        subtitle="Guest contact, RSVP status, and dietary requirements"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Guest / Family Name *</label>
            <input
              type="text"
              placeholder="e.g. Kunal Verma or The Sharma Family"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Contact Number or Email</label>
              <input
                type="text"
                placeholder="+91 98765 00000"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="glass-input"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Affiliation Group</label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value as GuestGroup)}
                className="glass-input bg-slate-900"
              >
                <option value="family">Family</option>
                <option value="friends">Friends</option>
                <option value="colleagues">Colleagues</option>
                <option value="vip">VIP</option>
                <option value="community">Community</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">RSVP Status</label>
              <select
                value={rsvpStatus}
                onChange={(e) => setRsvpStatus(e.target.value as RsvpStatus)}
                className="glass-input bg-slate-900"
              >
                <option value="pending">Pending</option>
                <option value="attending">Attending</option>
                <option value="declined">Declined</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Accompanying (+Guests)</label>
              <input
                type="number"
                min="0"
                value={additionalGuests}
                onChange={(e) => setAdditionalGuests(parseInt(e.target.value, 10) || 0)}
                className="glass-input font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Dietary Preferences</label>
              <input
                type="text"
                placeholder="e.g. Jain, Vegetarian, Vegan, Nut allergy"
                value={dietaryPreferences}
                onChange={(e) => setDietaryPreferences(e.target.value)}
                className="glass-input"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Table / Seating Assigned</label>
              <input
                type="text"
                placeholder="e.g. Table 1 (Family Elders)"
                value={tableOrSeating}
                onChange={(e) => setTableOrSeating(e.target.value)}
                className="glass-input"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Accessibility / Special Notes</label>
            <input
              type="text"
              placeholder="e.g. Wheelchair assistance required from parking lot"
              value={accessibilityNotes}
              onChange={(e) => setAccessibilityNotes(e.target.value)}
              className="glass-input"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingGuest(null);
              }}
              className="px-4 py-2 rounded-xl glass-button text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl glass-button-primary text-xs font-semibold"
            >
              {editingGuest ? 'Save Changes' : 'Add Guest'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Guest Confirmation */}
      <Modal
        isOpen={!!guestToDelete}
        onClose={() => setGuestToDelete(null)}
        title="Remove Guest"
        subtitle="Are you sure you want to delete this guest record?"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Remove <strong className="text-white">"{guestToDelete?.name}"</strong> from this event's guest list?
          </p>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button onClick={() => setGuestToDelete(null)} className="px-3 py-1.5 rounded-lg glass-button">
              Cancel
            </button>
            <button onClick={handleDelete} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold">
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* CSV Import Modal */}
      <Modal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        title="Import Guests from CSV"
        subtitle="Paste your comma-separated guest records or load sample data"
        maxWidth="xl"
      >
        <div className="space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-slate-300">
              Expected format: <code className="text-cyan-300 font-mono text-[11px]">Name, Contact, Group, Dietary, AdditionalGuests</code>
            </p>
            <button
              type="button"
              onClick={handleLoadSampleCSV}
              className="text-violet-400 hover:text-violet-300 underline font-medium text-xs self-start sm:self-auto"
            >
              Load Sample Template
            </button>
          </div>

          <textarea
            rows={5}
            placeholder={`Aarav Sharma, +91 98000 11111, family, Vegetarian, 1\nPriya Sen, priya@example.com, friends, Vegan, 0\nDr. K. Patel, +91 98111 22222, vip, Jain, 2`}
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            className="w-full glass-input font-mono text-xs"
          />

          {/* Parsed Preview Table */}
          {parsedPreviewRows.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Preview ({parsedPreviewRows.length} valid guest{parsedPreviewRows.length === 1 ? '' : 's'} detected)</span>
                </span>
                <span className="text-[11px] text-slate-400">Review before committing to guest book</span>
              </div>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-black/40">
                <table className="w-full text-left text-[11px] text-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-slate-400 uppercase text-[9px]">
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Contact</th>
                      <th className="py-2 px-3">Group</th>
                      <th className="py-2 px-3">Dietary</th>
                      <th className="py-2 px-3 text-center">+Guests</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {parsedPreviewRows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="py-2 px-3 font-sans font-medium text-white">{row.name}</td>
                        <td className="py-2 px-3 text-slate-400">{row.contact}</td>
                        <td className="py-2 px-3 capitalize font-sans text-cyan-300">{row.group}</td>
                        <td className="py-2 px-3 font-sans text-slate-300">{row.dietary}</td>
                        <td className="py-2 px-3 text-center text-slate-200">+{row.guests}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedPreviewRows.length > 5 && (
                  <div className="p-2 text-center text-[10px] text-slate-500 bg-white/[0.02]">
                    + {parsedPreviewRows.length - 5} more guest(s) will be imported
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              onClick={() => {
                setIsCsvModalOpen(false);
                setCsvContent('');
              }}
              className="px-4 py-2 rounded-xl glass-button text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleImportCSVSubmit}
              disabled={parsedPreviewRows.length === 0}
              className="px-4 py-2 rounded-xl glass-button-primary text-xs font-semibold disabled:opacity-50"
            >
              Confirm & Import ({parsedPreviewRows.length} Guest{parsedPreviewRows.length === 1 ? '' : 's'})
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
