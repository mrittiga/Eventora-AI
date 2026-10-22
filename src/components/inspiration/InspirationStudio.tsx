import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Plus,
  Trash2,
  Copy,
  Check,
  Lightbulb,
  Search,
  Filter,
  Share2,
  Loader2,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { InspirationItem } from '../../types';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { generateAIInspirations } from '../../services/api';

export const InspirationStudio: React.FC = () => {
  const {
    activeEvent,
    activeInspirations,
    addInspiration,
    deleteInspiration,
  } = useEventContext();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<InspirationItem['category']>('theme');
  const [colorsText, setColorsText] = useState('#8B5CF6, #22D3EE, #F472B6');
  const [tagsText, setTagsText] = useState('Decor, Lighting, Ambiance');

  // AI Brainstorming State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiFocusPrompt, setAiFocusPrompt] = useState('');
  const [aiIdeas, setAiIdeas] = useState<any[]>([]);

  // Curated Preset Inspiration Ideas to explore
  const presetInspirations = [
    {
      title: 'Celestial Twilight Fairy Canopy',
      category: 'decor',
      description: 'Micro warm white 2700K fairy lights strung at alternating depths beneath sheer lavender chiffon swags to mimic starry night constellations.',
      palette: ['#1E1B4B', '#8B5CF6', '#FDE047', '#F8FAFC'],
      tags: ['Twilight', 'Fairy Lights', 'Ethereal', 'Wedding'],
    },
    {
      title: 'Artisanal Clay Kulhad Beverage Bar',
      category: 'menu',
      description: 'Earthy unglazed terracotta cups for serving chilled saffron thandai, kokum sparklers, and ginger masala chai. Biodegradable and visually rustic.',
      palette: ['#B45309', '#F59E0B', '#FEF3C7', '#78350F'],
      tags: ['Zero Waste', 'Traditional', 'Catering', 'Drinks'],
    },
    {
      title: 'Retro Wave Pastel Neon Wall',
      category: 'theme',
      description: 'Matte macaron-colored balloon organic arches framing a bespoke warm-white LED script neon sign saying "Forever Begins Tonight".',
      palette: ['#F472B6', '#38BDF8', '#C084FC', '#FDF2F8'],
      tags: ['Birthday', 'Neon', 'Photo Booth', 'Modern'],
    },
    {
      title: 'Plantable Seed-Paper RSVP Invites',
      category: 'diy',
      description: 'Recycled cotton stationery embedded with marigold and basil seeds. Guests plant the invitation card in soil post-event to bloom flowers.',
      palette: ['#059669', '#10B981', '#D1FAE5', '#374151'],
      tags: ['Eco', 'Stationery', 'DIY', 'Sustainable'],
    },
    {
      title: 'Acoustic Sitar & Handpan Twilight Ragas',
      category: 'entertainment',
      description: 'Live instrumental crossover blending meditative sitar harmonies with melodic steel handpan rhythms as guests arrive during golden hour.',
      palette: ['#4F46E5', '#6366F1', '#E0E7FF', '#111827'],
      tags: ['Live Music', 'Acoustic', 'Atmospheric', 'Welcome'],
    },
    {
      title: 'Regal Rajputana & Imperial Indigo',
      category: 'palette',
      description: 'Deep midnight blue accented by metallic antique gold, rich ruby crimson, and ivory silks for royal heritage ceremonies.',
      palette: ['#1E1B4B', '#D97706', '#991B1B', '#F8FAFC'],
      tags: ['Royal', 'Traditional', 'Heritage', 'Colors'],
    },
  ];

  const filteredInspirations = activeInspirations.filter((ins) => {
    const matchesSearch =
      ins.title.toLowerCase().includes(search.toLowerCase()) ||
      ins.description.toLowerCase().includes(search.toLowerCase()) ||
      ins.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || ins.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveCustom = () => {
    if (!title.trim() || !description.trim()) return;

    const palette = colorsText
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.startsWith('#') || c.length >= 3);
    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addInspiration({
      eventId: activeEvent?.id,
      title,
      description,
      category,
      palette: palette.length > 0 ? palette : undefined,
      tags,
    });

    showToast(`Saved "${title}" to your inspiration board!`, 'success');
    setIsAddModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleBookmarkPreset = (preset: (typeof presetInspirations)[0]) => {
    addInspiration({
      eventId: activeEvent?.id,
      title: preset.title,
      category: preset.category as any,
      description: preset.description,
      palette: preset.palette,
      tags: preset.tags,
    });
    showToast(`Added "${preset.title}" to saved ideas!`, 'success');
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied description to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAiModal = () => {
    setAiFocusPrompt(activeEvent?.theme || 'Modern Elegant Celebration');
    setAiIdeas([]);
    setIsAiModalOpen(true);
  };

  const handleRunAiBrainstorm = async () => {
    setIsGeneratingAi(true);
    try {
      const eventType = activeEvent?.eventType || 'event';
      const prompt = aiFocusPrompt || activeEvent?.theme || 'Creative celebration';
      const res = await generateAIInspirations(eventType, prompt);
      if (res && Array.isArray(res.ideas) && res.ideas.length > 0) {
        setAiIdeas(res.ideas);
        showToast(`AI brainstormed ${res.ideas.length} fresh concepts!`, 'success');
      } else {
        showToast('Generated fresh concepts', 'info');
      }
    } catch (err) {
      showToast('Brainstorm generated fallback concepts', 'info');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSaveAiIdea = (idea: any) => {
    addInspiration({
      eventId: activeEvent?.id,
      title: idea.title || 'Creative Concept',
      category: (idea.category || 'theme') as any,
      description: idea.description || '',
      palette: Array.isArray(idea.palette) ? idea.palette : ['#8B5CF6', '#22D3EE'],
      tags: Array.isArray(idea.tags) ? idea.tags : ['AI-Generated', 'Concept'],
    });
    showToast(`Saved "${idea.title}" to your inspiration board!`, 'success');
  };

  const handleSaveAllAiIdeas = () => {
    aiIdeas.forEach((idea) => {
      addInspiration({
        eventId: activeEvent?.id,
        title: idea.title || 'Creative Concept',
        category: (idea.category || 'theme') as any,
        description: idea.description || '',
        palette: Array.isArray(idea.palette) ? idea.palette : ['#8B5CF6', '#22D3EE'],
        tags: Array.isArray(idea.tags) ? idea.tags : ['AI-Generated', 'Concept'],
      });
    });
    showToast(`Saved all ${aiIdeas.length} ideas to your board!`, 'success');
    setIsAiModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Inspiration & Theme Studio</h1>
          <p className="text-xs text-slate-400 mt-1">
            Curate color palettes, visual concepts, and creative decor for <strong className="text-violet-300">{activeEvent?.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleOpenAiModal}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-lg shadow-purple-900/30 transition-transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
            <span>AI Brainstorm Ideas</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl glass-button text-xs font-semibold hover:border-violet-500/50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Idea</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="glass-panel p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search saved inspirations, themes, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-white/5 rounded-xl border border-white/10 shrink-0 text-xs">
          {[
            { id: 'all', label: 'All Ideas' },
            { id: 'theme', label: 'Themes' },
            { id: 'palette', label: 'Palettes' },
            { id: 'decor', label: 'Decor' },
            { id: 'menu', label: 'Menu & Drinks' },
            { id: 'entertainment', label: 'Music & Play' },
            { id: 'diy', label: 'Eco & DIY' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Saved Inspiration Board Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-cyan-400" />
            <span>Saved Inspiration Board ({filteredInspirations.length})</span>
          </h2>
          <span className="text-xs text-slate-400">Pinned to your active event</span>
        </div>

        {filteredInspirations.length === 0 ? (
          <div className="glass-panel p-8 text-center text-xs text-slate-400 space-y-2">
            <Palette className="w-8 h-8 text-slate-500 mx-auto opacity-50" />
            <p>No saved ideas found in this category. Browse recommendations below or add your own.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInspirations.map((item) => (
              <div
                key={item.id}
                className="glass-card p-5 space-y-3.5 flex flex-col justify-between hover:border-violet-500/50 transition-all text-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-violet-600/20 text-violet-300 text-[10px] uppercase font-bold border border-violet-500/30">
                      {item.category}
                    </span>
                    <button
                      onClick={() => deleteInspiration(item.id)}
                      aria-label="Remove item"
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-slate-300 leading-relaxed text-xs">{item.description}</p>

                  {/* Color Swatches if palette present */}
                  {item.palette && item.palette.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1">
                      {item.palette.map((hex, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-lg border border-white/20 shadow-sm"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono">
                    {new Date(item.savedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleCopyText(item.id, `${item.title}: ${item.description}`)}
                    className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-white"
                  >
                    {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Curated AI Inspiration Ideas Explorer */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Curated Theme & Concept Explorer</span>
            </h2>
            <p className="text-xs text-slate-400">Hand-crafted creative prompts to spark your imagination</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presetInspirations.map((preset, idx) => (
            <div key={idx} className="glass-card p-5 space-y-3.5 flex flex-col justify-between text-xs">
              <div className="space-y-2.5">
                <span className="px-2 py-0.5 rounded bg-cyan-600/20 text-cyan-300 text-[10px] uppercase font-bold border border-cyan-500/30 inline-block">
                  {preset.category}
                </span>

                <h3 className="text-sm font-bold text-white">{preset.title}</h3>
                <p className="text-slate-300 leading-relaxed text-xs">{preset.description}</p>

                <div className="flex items-center gap-1.5 pt-1">
                  {preset.palette.map((hex, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-lg border border-white/20 shadow-sm"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {preset.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => handleBookmarkPreset(preset)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-button text-cyan-300 hover:text-white font-medium text-xs"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save to Board</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Custom Idea Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Creative Inspiration"
        subtitle="Save custom palettes, styling concepts, or menu ideas"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Concept Title *</label>
            <input
              type="text"
              placeholder="e.g. Amber Lotus Floating Mandap"
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
                onChange={(e) => setCategory(e.target.value as any)}
                className="glass-input bg-slate-900"
              >
                <option value="theme">Theme</option>
                <option value="palette">Color Palette</option>
                <option value="decor">Decor Concept</option>
                <option value="menu">Menu / Drinks</option>
                <option value="entertainment">Entertainment</option>
                <option value="diy">DIY / Eco</option>
                <option value="tagline">Tagline / Invites</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Hex Palette (Comma separated)</label>
              <input
                type="text"
                placeholder="#8B5CF6, #22D3EE, #F472B6"
                value={colorsText}
                onChange={(e) => setColorsText(e.target.value)}
                className="glass-input font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Concept Description *</label>
            <textarea
              rows={3}
              placeholder="Describe materials, lighting ambiance, or special presentation style..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Keywords / Tags (Comma separated)</label>
            <input
              type="text"
              placeholder="Lighting, Mandap, Royal, Floral"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className="glass-input"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl glass-button text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCustom}
              className="px-4 py-2 rounded-xl glass-button-primary text-xs font-semibold"
            >
              Save Idea
            </button>
          </div>
        </div>
      </Modal>

      {/* AI Brainstorm Modal */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title="AI Theme & Concept Brainstorm"
        subtitle={`Generate creative decor, palette, and experience ideas for ${activeEvent?.name || 'your event'}`}
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="block font-medium text-slate-300">
              Creative Theme & Vibe Focus:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Celestial Twilight with Fairy Canopies, or Eco-Rustic Minimalist"
                value={aiFocusPrompt}
                onChange={(e) => setAiFocusPrompt(e.target.value)}
                className="glass-input flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleRunAiBrainstorm();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleRunAiBrainstorm}
                disabled={isGeneratingAi}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center gap-1.5 shrink-0 disabled:opacity-50 transition-all shadow-md shadow-violet-700/20"
              >
                {isGeneratingAi ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Concepts</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Idea Starters */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-400">Quick Themes:</span>
            {[
              'Royal Heritage & Velvet',
              'Neon Cyber-Retro Disco',
              'Zero-Waste Eco Woodland',
              'Minimalist Sunset Pastels',
            ].map((themeSuggestion) => (
              <button
                key={themeSuggestion}
                type="button"
                onClick={() => setAiFocusPrompt(themeSuggestion)}
                className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[10px] transition-colors"
              >
                {themeSuggestion}
              </button>
            ))}
          </div>

          {/* AI Result Area */}
          {isGeneratingAi && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-violet-500/20 border-t-cyan-400 animate-spin" />
                <Sparkles className="w-5 h-5 text-violet-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Gemini is composing custom theme palettes, textures, and sensory experiences...
              </p>
            </div>
          )}

          {!isGeneratingAi && aiIdeas.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">
                  Generated Concepts ({aiIdeas.length})
                </span>
                <button
                  type="button"
                  onClick={handleSaveAllAiIdeas}
                  className="px-3 py-1 rounded-lg bg-violet-600/80 hover:bg-violet-600 text-white font-semibold text-[11px] transition-colors"
                >
                  Save All Ideas to Board
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                {aiIdeas.map((idea, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-violet-500/40 transition-all flex flex-col justify-between gap-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-bold text-white text-xs">{idea.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          {idea.category || 'decor'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {idea.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                      {/* Palette chips */}
                      {Array.isArray(idea.palette) && idea.palette.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">Palette:</span>
                          <div className="flex -space-x-1">
                            {idea.palette.map((color: string, cIdx: number) => (
                              <div
                                key={cIdx}
                                className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSaveAiIdea(idea)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-violet-600 text-white text-[10px] font-semibold transition-colors ml-auto"
                      >
                        <Bookmark className="w-3 h-3" />
                        <span>Save to Board</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isGeneratingAi && aiIdeas.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400 space-y-2 border border-dashed border-white/10 rounded-xl">
              <Lightbulb className="w-7 h-7 text-amber-400/80 mx-auto" />
              <p>Type your desired vibe or pick a quick theme above, then click "Generate Concepts".</p>
            </div>
          )}

          <div className="flex items-center justify-end pt-3 border-t border-white/10">
            <button
              onClick={() => setIsAiModalOpen(false)}
              className="px-4 py-2 rounded-xl glass-button text-xs font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
