import React, { useState } from 'react';
import {
  Store,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Sparkles,
  Edit2,
  Trash2,
  Star,
  FileText,
  Copy,
  Check,
  Clock,
  DollarSign,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { Vendor, VendorCategory, BookingStatus, ContractStatus } from '../../types';
import { generateVendorInquiry } from '../../services/api';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

export const VendorManager: React.FC = () => {
  const {
    activeEvent,
    activeVendors,
    addVendor,
    updateVendor,
    deleteVendor,
    formatCurrency,
  } = useEventContext();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  // AI Inquiry Draft Modal
  const [inquiryModalVendor, setInquiryModalVendor] = useState<Vendor | null>(null);
  const [inquiryDraft, setInquiryDraft] = useState('');
  const [isInquiryLoading, setIsInquiryLoading] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<VendorCategory>('venue');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [city, setCity] = useState('');
  const [quotedAmount, setQuotedAmount] = useState<number>(0);
  const [advancePayment, setAdvancePayment] = useState<number>(0);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('shortlisted');
  const [contractStatus, setContractStatus] = useState<ContractStatus>('under_review');
  const [paymentDueDate, setPaymentDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number>(5);

  const categories: { id: VendorCategory; label: string }[] = [
    { id: 'venue', label: 'Venue' },
    { id: 'caterer', label: 'Caterer' },
    { id: 'photographer', label: 'Photographer' },
    { id: 'videographer', label: 'Videographer' },
    { id: 'decorator', label: 'Decorator & Florals' },
    { id: 'dj_entertainment', label: 'DJ & Entertainment' },
    { id: 'makeup_artist', label: 'Makeup & Styling' },
    { id: 'transport', label: 'Transport & Logistics' },
    { id: 'rentals', label: 'Rentals & Equipment' },
    { id: 'coordinator', label: 'Event Coordinator' },
    { id: 'other', label: 'Other Supplier' },
  ];

  const filteredVendors = activeVendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      v.city.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || v.bookingStatus === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenAdd = () => {
    setName('');
    setCategory('venue');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setWebsite('');
    setCity(activeEvent?.location || '');
    setQuotedAmount(0);
    setAdvancePayment(0);
    setBookingStatus('researching');
    setContractStatus('none');
    setPaymentDueDate('');
    setNotes('');
    setRating(5);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (v: Vendor) => {
    setEditingVendor(v);
    setName(v.name);
    setCategory(v.category);
    setContactPerson(v.contactPerson);
    setPhone(v.phone);
    setEmail(v.email);
    setWebsite(v.website || '');
    setCity(v.city);
    setQuotedAmount(v.quotedAmount);
    setAdvancePayment(v.advancePayment);
    setBookingStatus(v.bookingStatus);
    setContractStatus(v.contractStatus);
    setPaymentDueDate(v.paymentDueDate || '');
    setNotes(v.notes || '');
    setRating(v.rating || 5);
  };

  const handleSave = () => {
    if (!name.trim() || !activeEvent) return;

    if (editingVendor) {
      updateVendor({
        ...editingVendor,
        name,
        category,
        contactPerson,
        phone,
        email,
        website: website || undefined,
        city,
        quotedAmount,
        advancePayment,
        bookingStatus,
        contractStatus,
        paymentDueDate: paymentDueDate || undefined,
        notes: notes || undefined,
        rating,
      });
      showToast(`Updated vendor "${name}"`, 'success');
      setEditingVendor(null);
    } else {
      addVendor({
        eventId: activeEvent.id,
        name,
        category,
        contactPerson,
        phone,
        email,
        website: website || undefined,
        city,
        quotedAmount,
        advancePayment,
        bookingStatus,
        contractStatus,
        paymentDueDate: paymentDueDate || undefined,
        notes: notes || undefined,
        rating,
      });
      showToast(`Added vendor "${name}"`, 'success');
      setIsAddModalOpen(false);
    }
  };

  const handleDelete = () => {
    if (!vendorToDelete) return;
    deleteVendor(vendorToDelete.id);
    showToast('Vendor record deleted', 'info');
    setVendorToDelete(null);
  };

  const handleGenerateInquiryDraft = async (v: Vendor) => {
    setInquiryModalVendor(v);
    setIsInquiryLoading(true);
    setInquiryDraft('');
    try {
      const { result } = await generateVendorInquiry(v, activeEvent);
      setInquiryDraft(result);
    } catch {
      setInquiryDraft('Unable to generate AI inquiry draft. Please check connection.');
    } finally {
      setIsInquiryLoading(false);
    }
  };

  const handleCopyInquiry = () => {
    navigator.clipboard.writeText(inquiryDraft);
    setCopiedDraft(true);
    showToast('Email draft copied to clipboard!', 'success');
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);

  const { addBudgetItem } = useEventContext();

  const handleSyncVendorToBudget = (v: Vendor) => {
    if (!activeEvent) return;
    let budgetCat: any = 'miscellaneous';
    if (v.category === 'venue') budgetCat = 'venue';
    else if (v.category === 'caterer') budgetCat = 'catering';
    else if (v.category === 'photographer' || v.category === 'videographer') budgetCat = 'photography';
    else if (v.category === 'decorator' || v.category === 'florist') budgetCat = 'decorations';
    else if (v.category === 'dj_entertainment') budgetCat = 'entertainment';
    else if (v.category === 'rentals') budgetCat = 'rentals';
    else if (v.category === 'transport') budgetCat = 'transportation';

    addBudgetItem({
      eventId: activeEvent.id,
      category: budgetCat,
      title: `${v.name} (${v.category})`,
      estimatedAmount: v.quotedAmount,
      actualAmount: v.quotedAmount,
      paidAmount: v.advancePayment,
      vendorId: v.id,
      dueDate: v.paymentDueDate,
      notes: `Synced from Vendor Manager. Quoted: ${formatCurrency(v.quotedAmount)}, Advance: ${formatCurrency(v.advancePayment)}`,
    });
    showToast(`Linked "${v.name}" to Budget Planner!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Vendor & Supplier Manager</h1>
          <p className="text-xs text-slate-400 mt-1">
            Contract tracking and quotes for <strong className="text-violet-300">{activeEvent?.name}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-button text-xs font-semibold text-slate-200 hover:text-white"
          >
            <span>Compare Quotes</span>
          </button>

          <button
            onClick={() => setIsQuestionsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-button text-xs font-semibold text-cyan-300 hover:text-white"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interview Guide</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-button-primary text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendors by company, contact person, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="glass-input bg-slate-900 py-2 text-xs"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="glass-input bg-slate-900 py-2 text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="researching">Researching</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="booked">Booked</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Vendor Grid */}
      {filteredVendors.length === 0 ? (
        <div className="glass-panel p-12 text-center text-xs text-slate-400 space-y-3">
          <Store className="w-8 h-8 text-slate-500 mx-auto opacity-50" />
          <p>No vendors found matching your current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => {
            const balanceRemaining = Math.max(0, vendor.quotedAmount - vendor.advancePayment);
            const isBooked = vendor.bookingStatus === 'booked';

            return (
              <div
                key={vendor.id}
                className="glass-card p-5 space-y-4 flex flex-col justify-between hover:border-violet-500/50 transition-all text-xs"
              >
                <div className="space-y-3">
                  {/* Top Bar: Category & Status */}
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-violet-600/25 border border-violet-500/30 text-[10px] font-bold text-violet-300 uppercase">
                      {vendor.category.replace('_', ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        isBooked
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : vendor.bookingStatus === 'shortlisted'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {vendor.bookingStatus}
                    </span>
                  </div>

                  {/* Company Name & Contact Person */}
                  <div>
                    <h3 className="text-base font-bold text-white truncate">{vendor.name}</h3>
                    <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1.5">
                      <span>Contact: {vendor.contactPerson}</span>
                      {vendor.city && <span>· {vendor.city}</span>}
                    </p>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5 font-mono text-[11px]">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Quoted:</span>
                      <span className="font-bold text-white tabular-nums">{formatCurrency(vendor.quotedAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-400">
                      <span>Advance Paid:</span>
                      <span className="tabular-nums">{formatCurrency(vendor.advancePayment)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/10 text-cyan-300 font-semibold">
                      <span>Balance Due:</span>
                      <span className="tabular-nums">{formatCurrency(balanceRemaining)}</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-slate-300 text-[11px]">
                    {vendor.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span className="font-mono">{vendor.phone}</span>
                      </div>
                    )}
                    {vendor.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{vendor.email}</span>
                      </div>
                    )}
                  </div>

                  {vendor.notes && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 italic bg-black/20 p-2 rounded-lg">
                      "{vendor.notes}"
                    </p>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleGenerateInquiryDraft(vendor)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg glass-button text-cyan-300 hover:text-white text-xs font-medium"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Inquiry</span>
                    </button>
                    <button
                      onClick={() => handleSyncVendorToBudget(vendor)}
                      title="Sync this vendor quote and deposit to Budget Planner"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg glass-button text-violet-300 hover:text-white text-xs font-medium"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>To Budget</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(vendor)}
                      aria-label="Edit vendor"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setVendorToDelete(vendor)}
                      aria-label="Delete vendor"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Vendor Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingVendor}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingVendor(null);
        }}
        title={editingVendor ? 'Edit Vendor Record' : 'Add New Vendor'}
        subtitle="Manage quotation, contract status, and communication"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Business Name *</label>
              <input
                type="text"
                placeholder="e.g. Shahi Rasoi Caterers"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Vendor Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as VendorCategory)}
                className="glass-input bg-slate-900"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Contact Person</label>
              <input
                type="text"
                placeholder="e.g. Chef Anand Sharma"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="glass-input"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="glass-input"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                placeholder="vendor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Quoted Amount</label>
              <input
                type="number"
                step="500"
                value={quotedAmount}
                onChange={(e) => setQuotedAmount(parseFloat(e.target.value) || 0)}
                className="glass-input font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Advance Deposit</label>
              <input
                type="number"
                step="500"
                value={advancePayment}
                onChange={(e) => setAdvancePayment(parseFloat(e.target.value) || 0)}
                className="glass-input font-mono text-emerald-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Booking Status</label>
              <select
                value={bookingStatus}
                onChange={(e) => setBookingStatus(e.target.value as BookingStatus)}
                className="glass-input bg-slate-900"
              >
                <option value="researching">Researching</option>
                <option value="contacted">Contacted</option>
                <option value="quoted">Quoted</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="booked">Booked</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Contract Status</label>
              <select
                value={contractStatus}
                onChange={(e) => setContractStatus(e.target.value as ContractStatus)}
                className="glass-input bg-slate-900"
              >
                <option value="none">No Contract</option>
                <option value="pending">Pending Draft</option>
                <option value="under_review">Under Review</option>
                <option value="signed">Signed & Executed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Notes / Terms</label>
            <input
              type="text"
              placeholder="e.g. Tasting session scheduled; outside sound curfew 10 PM."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="glass-input"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingVendor(null);
              }}
              className="px-4 py-2 rounded-xl glass-button text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl glass-button-primary text-xs font-semibold"
            >
              {editingVendor ? 'Save Changes' : 'Create Vendor'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Vendor Confirmation */}
      <Modal
        isOpen={!!vendorToDelete}
        onClose={() => setVendorToDelete(null)}
        title="Delete Vendor"
        subtitle="Are you sure you want to delete this vendor record?"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Delete <strong className="text-white">"{vendorToDelete?.name}"</strong>?
          </p>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button onClick={() => setVendorToDelete(null)} className="px-3 py-1.5 rounded-lg glass-button">
              Cancel
            </button>
            <button onClick={handleDelete} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold">
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* AI Inquiry Draft Modal */}
      <Modal
        isOpen={!!inquiryModalVendor}
        onClose={() => setInquiryModalVendor(null)}
        title={`AI Vendor Inquiry: ${inquiryModalVendor?.name}`}
        subtitle="Custom email draft & key negotiation questions"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs">
          {isInquiryLoading ? (
            <div className="py-12 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-slate-300">Drafting tailored inquiry and interview questions...</p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 whitespace-pre-line text-slate-200 font-mono text-xs leading-relaxed max-h-96 overflow-y-auto">
              {inquiryDraft}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <button
              onClick={handleCopyInquiry}
              disabled={isInquiryLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-button text-xs font-semibold"
            >
              {copiedDraft ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedDraft ? 'Copied' : 'Copy Email Draft'}</span>
            </button>

            <button
              onClick={() => setInquiryModalVendor(null)}
              className="px-4 py-2 rounded-xl glass-button-primary text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>

      {/* Quotation Comparison Modal */}
      <Modal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        title="Vendor Quotation & Deposit Comparison"
        subtitle="Side-by-side analysis of all supplier packages and balances"
        maxWidth="4xl"
      >
        <div className="space-y-4 text-xs">
          {activeVendors.length === 0 ? (
            <p className="text-slate-400 py-6 text-center">No vendors logged yet to compare.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Supplier Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Quoted Amount</th>
                    <th className="py-2.5 px-3 text-right">Advance Paid</th>
                    <th className="py-2.5 px-3 text-right">Balance Due</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Contact Person</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeVendors.map((v) => {
                    const balance = Math.max(0, v.quotedAmount - v.advancePayment);
                    return (
                      <tr key={v.id} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3 font-semibold text-white">{v.name}</td>
                        <td className="py-2.5 px-3 capitalize text-slate-400">{v.category.replace('_', ' ')}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-200">{formatCurrency(v.quotedAmount)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-400">{formatCurrency(v.advancePayment)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-cyan-300">{formatCurrency(balance)}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            v.bookingStatus === 'booked' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-400'
                          }`}>
                            {v.bookingStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{v.contactPerson}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-end pt-3 border-t border-white/10">
            <button
              onClick={() => setIsCompareModalOpen(false)}
              className="px-4 py-2 rounded-xl glass-button-primary text-xs font-semibold"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </Modal>

      {/* Interview Questions Guide Modal */}
      <Modal
        isOpen={isQuestionsModalOpen}
        onClose={() => setIsQuestionsModalOpen(false)}
        title="Vendor Interview & Negotiation Checklist"
        subtitle="Critical questions to ask before signing contracts or paying deposits"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
            <span className="font-bold text-cyan-300 text-sm block">🏰 Venues & Banquet Lawns</span>
            <ul className="space-y-1 text-slate-300 list-disc list-inside">
              <li>Are outside catering and decor teams permitted, or is there an exclusive vendor royalty?</li>
              <li>What is the strict outdoor sound curfew and decibel policy?</li>
              <li>Is automatic diesel generator backup power included in the base booking fee?</li>
              <li>What are the exact check-in and checkout hours for decor setup and teardown?</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
            <span className="font-bold text-violet-300 text-sm block">🍲 Catering & Live Food Counters</span>
            <ul className="space-y-1 text-slate-300 list-disc list-inside">
              <li>Do you offer a scheduled tasting session before final menu sign-off?</li>
              <li>How do you handle separate Jain, Vegan, or severe allergy meal preparations?</li>
              <li>What is your buffer capacity if 10-15 additional guests show up unexpectedly?</li>
              <li>Are service staff, crockery, cutlery, and banquet chafing dishes fully included?</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
            <span className="font-bold text-pink-300 text-sm block">📸 Photography & Cinematography</span>
            <ul className="space-y-1 text-slate-300 list-disc list-inside">
              <li>How many primary shooters will be present on site throughout the day?</li>
              <li>What is the promised turnaround time for raw footage, teasers, and final edited albums?</li>
              <li>Do you have certified drone operators for aerial ceremony sweeps?</li>
            </ul>
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-white/10">
            <button
              onClick={() => setIsQuestionsModalOpen(false)}
              className="px-4 py-2 rounded-xl glass-button-primary text-xs font-semibold"
            >
              Got It
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
