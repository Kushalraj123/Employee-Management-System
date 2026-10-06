import React from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  X,
  Sparkles,
} from 'lucide-react';

export default function SearchFilter({
  search,
  setSearch,
  department,
  setDepartment,
  status,
  setStatus,
  sort,
  setSort,
  viewMode,
  setViewMode,
  totalResults,
  onReset,
}) {
  const departments = [
    'All Departments',
    'Engineering',
    'HR',
    'Sales',
    'Finance',
    'Marketing',
  ];

  const statuses = ['All Statuses', 'Active', 'On Leave', 'Inactive'];

  const sortOptions = [
    'Newest',
    'Oldest',
    'Name A–Z',
    'Name Z–A',
    'Department',
  ];

  const hasActiveFilters =
    search ||
    (department && department !== 'All Departments') ||
    (status && status !== 'All Statuses') ||
    sort !== 'Newest';

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/5 dark:border-white/10 bg-slate-900/60 dark:bg-slate-900/70 p-4 sm:p-5 backdrop-blur-xl shadow-xl transition-all">
      {/* Top Search & Action View Toggle */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees by name, email, designation..."
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* View Mode Toggle & Total Count */}
        <div className="flex items-center justify-between lg:justify-end gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950/60 p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              aria-label="Table View"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              aria-label="3D Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">3D Grid</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-white/5 bg-slate-950/40 px-3 py-2 text-xs font-medium text-slate-400">
            <span>Showing</span>
            <span className="font-bold text-indigo-400">{totalResults}</span>
            <span>records</span>
          </div>
        </div>
      </div>

      {/* Filter Options Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Department Selector */}
          <div className="relative">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="appearance-none rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 pr-8 text-xs font-medium text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept} className="bg-slate-900 text-white">
                  {dept}
                </option>
              ))}
            </select>
            <Filter className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Status Selector */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="appearance-none rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 pr-8 text-xs font-medium text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              {statuses.map((st) => (
                <option key={st} value={st} className="bg-slate-900 text-white">
                  {st}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-indigo-400" />
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 pr-8 text-xs font-medium text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-slate-900 text-white">
                  Sort: {opt}
                </option>
              ))}
            </select>
            <ArrowUpDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 py-1.5 px-2 rounded-lg hover:bg-rose-500/10 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Reset all filters
          </button>
        )}
      </div>
    </div>
  );
}
