import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  AlertCircle,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  User,
  ListFilter,
  CalendarDays,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEventContext } from '../../context/EventContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

export const TimelineTasks: React.FC = () => {
  const {
    activeEvent,
    activeTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
  } = useEventContext();
  const { showToast } = useToast();

  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'category'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in_progress' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Logistics');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assignee, setAssignee] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);

  const totalTasks = activeTasks.length;
  const completedTasks = activeTasks.filter((t) => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = activeTasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.assignee || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleToggle = (taskId: string) => {
    const task = activeTasks.find((t) => t.id === taskId);
    toggleTaskStatus(taskId);
    if (task && task.status !== 'completed') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}
      showToast(`Completed "${task.title}"! 🎉`, 'success');
    }
  };

  const handleOpenAdd = () => {
    setTitle('');
    setDescription('');
    setCategory('General');
    setDueDate(todayStr);
    setPriority('medium');
    setAssignee('');
    setEstimatedCost(0);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setCategory(task.category);
    setDueDate(task.dueDate);
    setPriority(task.priority);
    setAssignee(task.assignee || '');
    setEstimatedCost(task.estimatedCost || 0);
  };

  const handleSave = () => {
    if (!title.trim() || !activeEvent) return;

    if (editingTask) {
      updateTask({
        ...editingTask,
        title,
        description: description || undefined,
        category,
        dueDate,
        priority,
        assignee: assignee || undefined,
        estimatedCost: estimatedCost || undefined,
      });
      showToast(`Updated task "${title}"`, 'success');
      setEditingTask(null);
    } else {
      addTask({
        eventId: activeEvent.id,
        title,
        description: description || undefined,
        category,
        dueDate,
        priority,
        status: 'todo',
        assignee: assignee || undefined,
        estimatedCost: estimatedCost || undefined,
      });
      showToast(`Added new task "${title}"`, 'success');
      setIsAddModalOpen(false);
    }
  };

  const handleDelete = () => {
    if (!taskToDelete) return;
    deleteTask(taskToDelete.id);
    showToast('Task removed', 'info');
    setTaskToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Timeline & Tasks</h1>
          <p className="text-xs text-slate-400 mt-1">
            Actionable milestone schedule for <strong className="text-violet-300">{activeEvent?.name}</strong>
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-button-primary text-xs font-semibold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Task</span>
        </button>
      </div>

      {/* Progress & AI Priority Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Bar Card */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white uppercase tracking-wider">Overall Completion</span>
            <span className="font-mono text-emerald-400 font-bold">{completionRate}%</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{completedTasks} completed</span>
            <span>{totalTasks - completedTasks} remaining</span>
          </div>
        </div>

        {/* AI Weekly Focus */}
        <div className="md:col-span-2 glass-card p-5 space-y-2 border border-cyan-500/20">
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Director's Critical Week Focus</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Prioritize booking the core catering tasting and distributing digital invitation links. Unconfirmed guest
            headcounts will cascade into seating and linen rental delays.
          </p>
        </div>
      </div>

      {/* Controls: Search, View Mode, Filters */}
      <div className="glass-panel p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks, categories, or assignees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Filter by Status */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-white/5 rounded-xl border border-white/10 shrink-0 text-xs">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'todo', label: 'To Do' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                statusFilter === st.id
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 text-xs shrink-0">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="glass-input bg-slate-900 py-1.5 text-xs"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10 shrink-0 text-xs">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              viewMode === 'list' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('category')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              viewMode === 'category' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Board
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              viewMode === 'timeline' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Timeline
          </button>
        </div>
      </div>

      {/* Task Content: List vs Timeline */}
      {filteredTasks.length === 0 ? (
        <div className="glass-panel p-12 text-center text-xs text-slate-400 space-y-3">
          <CheckCircle2 className="w-8 h-8 text-slate-500 mx-auto opacity-50" />
          <p>No tasks match the active filters or search terms.</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="glass-panel p-4 divide-y divide-white/5">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isOverdue = !isCompleted && task.dueDate < todayStr;

            return (
              <div
                key={task.id}
                className={`py-3.5 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl transition-colors ${
                  isCompleted ? 'opacity-60 bg-white/[0.01]' : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggle(task.id)}
                    aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                    className="mt-0.5 text-slate-400 hover:text-cyan-400 transition-colors shrink-0"
                  >
                    {isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-semibold truncate ${
                          isCompleted ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-slate-300 font-mono">
                        {task.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          task.priority === 'urgent'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : task.priority === 'high'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-white/5 text-slate-400'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400 line-clamp-1">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-0.5">
                      <span className={`flex items-center gap-1 font-mono ${isOverdue ? 'text-rose-400 font-bold' : ''}`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{task.dueDate}</span>
                        {isOverdue && <span className="text-[10px] uppercase tracking-wider">(Overdue)</span>}
                      </span>

                      {task.assignee && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <User className="w-3.5 h-3.5 text-violet-400" />
                          <span>{task.assignee}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleOpenEdit(task)}
                    aria-label="Edit task"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTaskToDelete(task)}
                    aria-label="Delete task"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'category' ? (
        /* Kanban Board View by Status */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'todo', label: 'To Do', border: 'border-slate-500/30', headerColor: 'text-slate-300' },
            { id: 'in_progress', label: 'In Progress', border: 'border-violet-500/30', headerColor: 'text-violet-300' },
            { id: 'completed', label: 'Completed', border: 'border-emerald-500/30', headerColor: 'text-emerald-300' },
          ].map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className={`glass-panel p-4 space-y-3 ${col.border}`}>
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
                  <span className={`font-bold ${col.headerColor}`}>{col.label}</span>
                  <span className="font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-300">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {colTasks.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-[11px] italic">
                      No tasks in this column
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-violet-500/40 transition-colors space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`font-semibold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-white'}`}>
                            {task.title}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold shrink-0 ${
                              task.priority === 'urgent'
                                ? 'bg-rose-500/20 text-rose-300'
                                : task.priority === 'high'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-white/5 text-slate-400'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2">{task.description}</p>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-slate-400">
                          <span>{task.dueDate}</span>
                          {task.assignee && <span className="text-violet-300">@{task.assignee}</span>}
                        </div>

                        {/* Quick Status Advancers */}
                        <div className="flex items-center justify-between pt-1 gap-1">
                          <div className="flex items-center gap-1">
                            {task.status !== 'todo' && (
                              <button
                                onClick={() => updateTask({ ...task, status: 'todo' })}
                                className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] text-slate-300"
                              >
                                ← To Do
                              </button>
                            )}
                            {task.status !== 'in_progress' && (
                              <button
                                onClick={() => updateTask({ ...task, status: 'in_progress' })}
                                className="px-1.5 py-0.5 rounded bg-violet-600/20 hover:bg-violet-600/40 text-[10px] text-violet-300"
                              >
                                {task.status === 'todo' ? 'Start →' : '← Active'}
                              </button>
                            )}
                            {task.status !== 'completed' && (
                              <button
                                onClick={() => handleToggle(task.id)}
                                className="px-1.5 py-0.5 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-[10px] text-emerald-300 font-semibold"
                              >
                                Done ✓
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(task)}
                              className="p-1 rounded text-slate-400 hover:text-white"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setTaskToDelete(task)}
                              className="p-1 rounded text-slate-400 hover:text-rose-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Timeline View */
        <div className="glass-panel p-6 space-y-6">
          <div className="relative border-l-2 border-violet-500/30 ml-3 pl-6 space-y-6">
            {filteredTasks
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .map((task) => (
                <div key={task.id} className="relative space-y-1 text-xs">
                  <div
                    className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full ring-4 ring-[#080B1A] ${
                      task.status === 'completed'
                        ? 'bg-emerald-500'
                        : task.priority === 'urgent'
                        ? 'bg-rose-500'
                        : 'bg-violet-600'
                    }`}
                  />
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-300 text-[11px] font-bold">{task.dueDate}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{task.category}</span>
                  </div>
                  <h4
                    className={`text-sm font-semibold ${
                      task.status === 'completed' ? 'line-through text-slate-400' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </h4>
                  {task.description && <p className="text-slate-400 text-xs">{task.description}</p>}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Add / Edit Task Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingTask}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTask(null);
        }}
        title={editingTask ? 'Edit Task' : 'Add New Task'}
        subtitle="Manage task milestone and assignee"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Task Title *</label>
            <input
              type="text"
              placeholder="e.g. Schedule final tasting with caterer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Description / Instructions</label>
            <textarea
              rows={2}
              placeholder="Add key notes, reference numbers, or requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g. Catering, Venue, Decor"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="glass-input"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="glass-input bg-slate-900"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Assignee</label>
              <input
                type="text"
                placeholder="e.g. Bride, Groom, Uncle Rajesh"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="glass-input"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingTask(null);
              }}
              className="px-4 py-2 rounded-xl glass-button text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl glass-button-primary text-xs font-semibold"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        title="Delete Task"
        subtitle="Are you sure you want to delete this task?"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Delete <strong className="text-white">"{taskToDelete?.title}"</strong>?
          </p>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button onClick={() => setTaskToDelete(null)} className="px-3 py-1.5 rounded-lg glass-button">
              Cancel
            </button>
            <button onClick={handleDelete} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
