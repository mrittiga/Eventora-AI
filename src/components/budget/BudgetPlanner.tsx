import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  AlertTriangle,
  TrendingDown,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Store,
  DollarSign,
  PieChart,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { BudgetItem, BudgetCategory } from '../../types';
import { getBudgetAdvice } from '../../services/api';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

export const BudgetPlanner: React.FC = () => {
  const {
    activeEvent,
    activeBudgetItems,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    updateEvent,
    formatCurrency,
  } = useEventContext();
  const { showToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<BudgetItem | null>(null);

  // AI Advice Modal state
  const [isAiAdviceOpen, setIsAiAdviceOpen] = useState(false);
  const [aiAdviceText, setAiAdviceText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Form State
  const [category, setCategory] = useState<BudgetCategory>('venue');
  const [title, setTitle] = useState('');
  const [estimatedAmount, setEstimatedAmount] = useState<number>(0);
  const [actualAmount, setActualAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Total calculations
  const totalBudget = activeEvent ? activeEvent.budget : 0;
  const totalEstimated = activeBudgetItems.reduce((sum, b) => sum + (b.estimatedAmount || 0), 0);
  const totalActual = activeBudgetItems.reduce((sum, b) => sum + (b.actualAmount || 0), 0);
  const totalPaid = activeBudgetItems.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const totalPendingBalance = Math.max(0, totalActual > 0 ? totalActual - totalPaid : totalEstimated - totalPaid);
  const variance = totalBudget - totalEstimated;
  const isOverBudget = variance < 0;

  const categories: { id: BudgetCategory; label: string }[] = [
    { id: 'venue', label: 'Venue & Accommodation' },
    { id: 'catering', label: 'Catering & Beverages' },
    { id: 'decorations', label: 'Decorations & Flowers' },
    { id: 'photography', label: 'Photography & Videography' },
    { id: 'entertainment', label: 'Entertainment & Music' },
    { id: 'invitations', label: 'Invitations & Stationery' },
    { id: 'attire_makeup', label: 'Clothing & Makeup' },
    { id: 'transportation', label: 'Transportation & Travel' },
    { id: 'gifts_favors', label: 'Gifts & Favors' },
    { id: 'rentals', label: 'Equipment & Rentals' },
    { id: 'contingency', label: 'Contingency Reserve' },
    { id: 'miscellaneous', label: 'Permits & Misc' },
  ];

  const handleOpenAdd = () => {
    setCategory('venue');
    setTitle('');
    setEstimatedAmount(0);
    setActualAmount(0);
    setPaidAmount(0);
    setDueDate('');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setCategory(item.category);
    setTitle(item.title);
    setEstimatedAmount(item.estimatedAmount);
    setActualAmount(item.actualAmount);
    setPaidAmount(item.paidAmount);
    setDueDate(item.dueDate || '');
    setNotes(item.notes || '');
  };

  const handleSaveItem = () => {
    if (!title.trim() || !activeEvent) return;

    if (editingItem) {
      updateBudgetItem({
        ...editingItem,
        category,
        title,
        estimatedAmount,
        actualAmount,
        paidAmount,
        dueDate: dueDate || undefined,
        notes: notes || undefined,
      });
      showToast(`Updated expense "${title}"`, 'success');
      setEditingItem(null);
    } else {
      addBudgetItem({
        eventId: activeEvent.id,
        category,
        title,
        estimatedAmount,
        actualAmount,
        paidAmount,
        dueDate: dueDate || undefined,
        notes: notes || undefined,
      });
      showToast(`Added expense "${title}"`, 'success');
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteItem = () => {
    if (!itemToDelete) return;
    deleteBudgetItem(itemToDelete.id);
    showToast(`Deleted expense item`, 'info');
    setItemToDelete(null);
  };

  const handleGetAiAdvice = async () => {
    if (!activeEvent) return;
    setIsAiLoading(true);
    setIsAiAdviceOpen(true);
    try {
      const { advice } = await getBudgetAdvice(
        activeBudgetItems,
        activeEvent.budget,
        activeEvent.currency,
        activeEvent.eventType
      );
      setAiAdviceText(advice);
    } catch {
      setAiAdviceText('Could not connect to Gemini API. Review category allocations manually.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Category', 'Expense Title', 'Due Date', 'Estimated Amount', 'Actual Quoted', 'Paid To Date', 'Balance Remaining', 'Notes'];
    const rows = activeBudgetItems.map((b) => [
      `"${b.category}"`,
      `"${b.title}"`,
      `"${b.dueDate || ''}"`,
      b.estimatedAmount,
      b.actualAmount,
      b.paidAmount,
      Math.max(0, b.actualAmount > 0 ? b.actualAmount - b.paidAmount : b.estimatedAmount - b.paidAmount),
      `"${b.notes || ''}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(activeEvent?.name || 'event').replace(/\s+/g, '_')}_budget_ledger.csv`;
    link.click();
    showToast('Budget ledger exported as CSV', 'success');
  };

  const [contingencyPercent, setContingencyPercent] = useState(5);
  const recommendedContingency = Math.round((totalBudget * contingencyPercent) / 100);

  const handleApplyContingency = () => {
    if (!activeEvent) return;
    const existing = activeBudgetItems.find((b) => b.category === 'contingency');
    if (existing) {
      updateBudgetItem({ ...existing, estimatedAmount: recommendedContingency });
      showToast(`Updated contingency reserve to ${formatCurrency(recommendedContingency)} (${contingencyPercent}%)`, 'success');
    } else {
      addBudgetItem({
        eventId: activeEvent.id,
        category: 'contingency',
        title: `Emergency Contingency Reserve (${contingencyPercent}%)`,
        estimatedAmount: recommendedContingency,
        actualAmount: 0,
        paidAmount: 0,
        notes: `Adjusted buffer for unexpected expenses and vendor surcharges.`,
      });
      showToast(`Added contingency reserve of ${formatCurrency(recommendedContingency)}`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Smart Budget Planner</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time financial tracking for <strong className="text-violet-300">{activeEvent?.name}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Currency Switcher */}
          {activeEvent && (
            <select
              value={activeEvent.currency}
              onChange={(e) => {
                const newCurr = e.target.value as any;
                updateEvent({ ...activeEvent, currency: newCurr });
                showToast(`Switched currency to ${newCurr}`, 'info');
              }}
              className="glass-input bg-slate-900 py-1.5 px-2.5 text-xs font-mono font-semibold text-violet-300"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-button text-xs font-semibold text-slate-300 hover:text-white"
          >
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleGetAiAdvice}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-button text-xs font-semibold text-cyan-300 hover:text-white"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Advice</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass-button-primary text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Contingency Buffer Adjustable Slider Card */}
      <div className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Adjustable Emergency Contingency Reserve</span>
            <span className="px-2 py-0.5 rounded-full bg-violet-600/30 text-violet-300 font-mono font-bold">
              {contingencyPercent}%
            </span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Recommended cushion: <strong className="text-cyan-300 font-mono">{formatCurrency(recommendedContingency)}</strong> of your {formatCurrency(totalBudget)} total budget.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min="3"
            max="18"
            step="1"
            value={contingencyPercent}
            onChange={(e) => setContingencyPercent(parseInt(e.target.value, 10))}
            className="w-32 accent-violet-500 cursor-pointer"
          />
          <button
            onClick={handleApplyContingency}
            className="px-3 py-1.5 rounded-lg glass-button text-xs font-medium text-white hover:border-violet-400"
          >
            Set Reserve
          </button>
        </div>
      </div>

      {/* Overrun Warning Banner */}
      {isOverBudget && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white">Budget Overrun Alert</span>
            <p className="text-slate-300">
              Your committed expenses exceed the total budget by{' '}
              <strong className="text-rose-400 font-mono">{formatCurrency(Math.abs(variance))}</strong>. Consider
              clicking "AI Budget Advice" to identify immediate cost reductions.
            </p>
          </div>
        </div>
      )}

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Budget</span>
          <div className="text-xl font-bold text-white font-mono tabular-nums">{formatCurrency(totalBudget)}</div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Flexibility:</span>
            <span className="capitalize text-violet-300 font-semibold">{activeEvent?.budgetFlexibility}</span>
          </div>
        </div>

        <div className="glass-card p-4 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Committed / Est.</span>
          <div className="text-xl font-bold text-slate-100 font-mono tabular-nums">{formatCurrency(totalEstimated)}</div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Utilization:</span>
            <span className={`font-semibold ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
              {totalBudget > 0 ? Math.round((totalEstimated / totalBudget) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="glass-card p-4 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Actual Paid</span>
          <div className="text-xl font-bold text-emerald-400 font-mono tabular-nums">{formatCurrency(totalPaid)}</div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Outstanding Balance:</span>
            <span className="font-mono text-slate-200">{formatCurrency(totalPendingBalance)}</span>
          </div>
        </div>

        <div className="glass-card p-4 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Remaining Cushion</span>
          <div className={`text-xl font-bold font-mono tabular-nums ${variance < 0 ? 'text-rose-400' : 'text-cyan-400'}`}>
            {formatCurrency(Math.max(0, variance))}
          </div>
          <div className="text-[11px] text-slate-400">
            {variance >= 0 ? 'Within approved limit' : 'Deficit to adjust'}
          </div>
        </div>
      </div>

      {/* Category Breakdown Progress Grid */}
      <div className="glass-panel p-5 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Category Allocations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const itemsInCat = activeBudgetItems.filter((b) => b.category === cat.id);
            const catEstimated = itemsInCat.reduce((sum, b) => sum + b.estimatedAmount, 0);
            const catActual = itemsInCat.reduce((sum, b) => sum + b.actualAmount, 0);
            const catPaid = itemsInCat.reduce((sum, b) => sum + b.paidAmount, 0);
            const catPercentOfBudget = totalBudget > 0 ? Math.round((catEstimated / totalBudget) * 100) : 0;

            if (itemsInCat.length === 0) return null;

            return (
              <div key={cat.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white truncate">{cat.label}</span>
                  <span className="text-violet-300 font-mono text-[11px]">{catPercentOfBudget}%</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Est: {formatCurrency(catEstimated)}</span>
                  <span>Paid: {formatCurrency(catPaid)}</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                    style={{ width: `${Math.min(100, (catPaid / (catEstimated || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expenses Ledger Table */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Expense Line Items ({activeBudgetItems.length})</h2>
          <span className="text-xs text-slate-400">Values strictly tracked as numeric records</span>
        </div>

        {activeBudgetItems.length === 0 ? (
          <div className="text-center p-8 text-xs text-slate-400">
            No expenses logged yet. Click "+ Add Expense" above to start budgeting.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Title & Category</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3 text-right">Estimated</th>
                  <th className="py-3 px-3 text-right">Actual</th>
                  <th className="py-3 px-3 text-right">Paid</th>
                  <th className="py-3 px-3 text-right">Balance</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeBudgetItems.map((item) => {
                  const balanceDue = Math.max(
                    0,
                    item.actualAmount > 0 ? item.actualAmount - item.paidAmount : item.estimatedAmount - item.paidAmount
                  );
                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{item.title}</div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {item.category.replace('_', ' ')}
                          {item.notes && <span className="ml-1 text-slate-500 truncate">· {item.notes}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {item.dueDate || '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200">
                        {formatCurrency(item.estimatedAmount)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200">
                        {item.actualAmount > 0 ? formatCurrency(item.actualAmount) : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-400">
                        {formatCurrency(item.paidAmount)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-cyan-300">
                        {formatCurrency(balanceDue)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            aria-label="Edit item"
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setItemToDelete(item)}
                            aria-label="Delete item"
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingItem}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit Expense Item' : 'Add New Expense Item'}
        subtitle="Manage amounts, categories, and payment deadlines"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Expense Title *</label>
            <input
              type="text"
              placeholder="e.g. Lawn Rental Deposit, Wedding Cake, Floral Mandap"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BudgetCategory)}
                className="glass-input bg-slate-900"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Payment Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Estimated Amount</label>
              <input
                type="number"
                step="100"
                min="0"
                value={estimatedAmount}
                onChange={(e) => setEstimatedAmount(parseFloat(e.target.value) || 0)}
                className="glass-input font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Actual Quoted</label>
              <input
                type="number"
                step="100"
                min="0"
                value={actualAmount}
                onChange={(e) => setActualAmount(parseFloat(e.target.value) || 0)}
                className="glass-input font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Paid to Date</label>
              <input
                type="number"
                step="100"
                min="0"
                value={paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="glass-input font-mono text-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Notes / Vendor Details</label>
            <input
              type="text"
              placeholder="e.g. 50% advance invoice paid via NEFT; balance due upon delivery."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="glass-input"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingItem(null);
              }}
              className="px-4 py-2 rounded-xl glass-button text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveItem}
              className="px-4 py-2 rounded-xl glass-button-primary text-xs font-semibold"
            >
              {editingItem ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title="Delete Expense"
        subtitle="Are you sure you want to delete this expense record?"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Delete <strong className="text-white">"{itemToDelete?.title}"</strong>? This will update your total budget
            calculations immediately.
          </p>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button onClick={() => setItemToDelete(null)} className="px-3 py-1.5 rounded-lg glass-button">
              Cancel
            </button>
            <button onClick={handleDeleteItem} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold">
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* AI Budget Advice Modal */}
      <Modal
        isOpen={isAiAdviceOpen}
        onClose={() => setIsAiAdviceOpen(false)}
        title="Gemini AI Budget Reallocation & Savings Advice"
        subtitle="Optimizations derived from your actual committed costs"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs">
          {isAiLoading ? (
            <div className="py-12 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-slate-300">Analyzing expense variances and vendor allocations...</p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-3 whitespace-pre-line text-slate-200 leading-relaxed max-h-96 overflow-y-auto">
              {aiAdviceText}
            </div>
          )}

          <div className="flex items-center justify-end pt-3 border-t border-white/10">
            <button
              onClick={() => setIsAiAdviceOpen(false)}
              className="px-4 py-2 rounded-xl glass-button-primary text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
