import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  ShieldCheck,
  Cpu,
  Database,
  CheckCircle2,
  AlertTriangle,
  User,
  Sparkles,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

export const SettingsPage: React.FC = () => {
  const {
    events,
    budgetItems,
    tasks,
    vendors,
    guests,
    inspirations,
    resetToDemoData,
    clearAllData,
  } = useEventContext();
  const { showToast } = useToast();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // Profile Form state
  const [organizerName, setOrganizerName] = useState(() => {
    return localStorage.getItem('EVENTORA_ORGANIZER_NAME') || 'Event Lead Organizer';
  });
  const [organizerEmail, setOrganizerEmail] = useState(() => {
    return localStorage.getItem('EVENTORA_ORGANIZER_EMAIL') || 'planner@eventora.ai';
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('EVENTORA_ORGANIZER_NAME', organizerName);
    localStorage.setItem('EVENTORA_ORGANIZER_EMAIL', organizerEmail);
    showToast('Organizer profile preferences saved', 'success');
  };

  const handleExportAllJSON = () => {
    const fullBackup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      events,
      budgetItems,
      tasks,
      vendors,
      guests,
      inspirations,
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eventora_ai_master_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Full application data exported as JSON!', 'success');
  };

  const handleImportJSONFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed && Array.isArray(parsed.events)) {
          localStorage.setItem('EVENTORA_AI_DATA_V1', text);
          window.location.reload();
        } else {
          showToast('Invalid backup format: missing events array', 'error');
        }
      } catch (err) {
        showToast('Error parsing JSON backup file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmReset = () => {
    resetToDemoData();
    setIsResetModalOpen(false);
    showToast('Seeded demo events restored successfully', 'success');
  };

  const handleConfirmClear = () => {
    clearAllData();
    setIsClearModalOpen(false);
    showToast('All stored event data has been cleared', 'info');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings & Data Controls</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure preferences, inspect Gemini model connectivity, and manage local data backups
        </p>
      </div>

      {/* Profile Preferences */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <User className="w-4 h-4 text-violet-400" />
          <span>Organizer Profile</span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Lead Planner Name</label>
              <input
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                className="glass-input"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Notification Email</label>
              <input
                type="email"
                value={organizerEmail}
                onChange={(e) => setOrganizerEmail(e.target.value)}
                className="glass-input"
              />
            </div>
          </div>

          <button type="submit" className="px-4 py-2 rounded-xl glass-button text-xs font-semibold text-white">
            Save Profile Preferences
          </button>
        </form>
      </div>

      {/* AI & System Telemetry Status */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>AI Architecture & Model Runtime</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Active & Operational</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Primary GenAI Engine</span>
            <span className="font-bold text-white font-mono">Gemini 3.8 Flash</span>
            <span className="text-[11px] text-slate-400 block">Server-side proxy routes via @google/genai</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Data Persistence</span>
            <span className="font-bold text-white font-mono">Isolated localStorage</span>
            <span className="text-[11px] text-slate-400 block">{events.length} events, {budgetItems.length} expenses logged</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Execution Mode</span>
            <span className="font-bold text-cyan-300 font-mono">Full-Stack Resilience</span>
            <span className="text-[11px] text-slate-400 block">Seamless fallback engine available</span>
          </div>
        </div>
      </div>

      {/* Data Import & Export Controls */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Backup, Import & Export</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Export a complete, self-contained JSON snapshot of all your planned events, vendors, budgets, tasks, and
          guest lists to preserve offline or migrate between devices.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleExportAllJSON}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-button text-xs font-semibold text-white hover:border-emerald-500/50"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Complete JSON Backup</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-button text-xs font-semibold text-white hover:border-violet-500/50 cursor-pointer">
            <Upload className="w-4 h-4 text-violet-400" />
            <span>Restore from JSON File</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSONFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Reset & Wipe Danger Zone */}
      <div className="glass-panel p-6 space-y-4 border border-rose-500/25">
        <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Demo Data Management & Reset</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          You can re-seed the three curated showcase events (Dream Wedding, Birthday Celebration, and EcoFest) with
          fresh future dates at any time, or completely wipe application storage.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-button text-xs font-semibold text-slate-200 hover:text-white"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>Reset to Fresh Demo Events</span>
          </button>

          <button
            onClick={() => setIsClearModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/30 hover:bg-rose-600 border border-rose-500/40 text-xs font-semibold text-rose-200 hover:text-white transition-colors"
          >
            <Trash2 className="w-4 h-4 text-rose-300" />
            <span>Clear All Application Data</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Demo Data"
        subtitle="Restore initial sample events"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            This will replace current events with the 3 freshly dated demo scenarios (Dream Wedding, Birthday Celebration,
            and Community Gathering).
          </p>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button onClick={() => setIsResetModalOpen(false)} className="px-3 py-1.5 rounded-lg glass-button">
              Cancel
            </button>
            <button onClick={handleConfirmReset} className="px-3 py-1.5 rounded-lg glass-button-primary font-semibold">
              Confirm Reset
            </button>
          </div>
        </div>
      </Modal>

      {/* Clear Confirmation Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Clear All Data"
        subtitle="Irreversible storage reset"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Are you sure you want to completely erase all events, tasks, vendors, and guest records from your browser?
          </p>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button onClick={() => setIsClearModalOpen(false)} className="px-3 py-1.5 rounded-lg glass-button">
              Cancel
            </button>
            <button onClick={handleConfirmClear} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold">
              Erase Everything
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
