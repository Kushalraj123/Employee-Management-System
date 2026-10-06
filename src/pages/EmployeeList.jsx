import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Trash2,
  Download,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Layers,
} from 'lucide-react';
import SearchFilter from '../components/SearchFilter';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeCard from '../components/EmployeeCard';
import EmployeeModal from '../components/EmployeeModal';
import DeleteModal from '../components/DeleteModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { useToast } from '../context/ToastContext';
import api from '../api';

export default function EmployeeList() {
  const { showSuccess, showError, showInfo } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters and state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [department, setDepartment] = useState(searchParams.get('department') || 'All Departments');
  const [status, setStatus] = useState(searchParams.get('status') || 'All Statuses');
  const [sort, setSort] = useState(searchParams.get('sort') || 'Newest');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getEmployees({
        search,
        department,
        status,
        sort,
      });
      setEmployees(response.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Unable to load workforce directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, department, status, sort]);

  const handleResetFilters = () => {
    setSearch('');
    setDepartment('All Departments');
    setStatus('All Statuses');
    setSort('Newest');
  };

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingEmployee) {
        const id = editingEmployee._id || editingEmployee.id;
        await api.updateEmployee(id, formData);
        showSuccess(`Updated details for ${formData.name}`);
      } else {
        await api.createEmployee(formData);
        showSuccess(`Successfully created employee profile for ${formData.name}`);
      }
      setModalOpen(false);
      fetchEmployees();
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (emp) => {
    setDeletingEmployee(emp);
    setIsBulkDelete(false);
    setDeleteModalOpen(true);
  };

  const handleOpenBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setIsBulkDelete(true);
    setDeletingEmployee(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (isBulkDelete) {
        await api.bulkDeleteEmployees(selectedIds);
        showSuccess(`Deleted ${selectedIds.length} employees`);
        setSelectedIds([]);
      } else if (deletingEmployee) {
        const id = deletingEmployee._id || deletingEmployee.id;
        await api.deleteEmployee(id);
        showSuccess(`Removed ${deletingEmployee.name} from directory`);
      }
      setDeleteModalOpen(false);
      fetchEmployees();
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Users className="h-7 w-7 text-indigo-400" />
            Employees
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your organization's people, designations, and departmental permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Add Employee</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <SearchFilter
        search={search}
        setSearch={setSearch}
        department={department}
        setDepartment={setDepartment}
        status={status}
        setStatus={setStatus}
        sort={sort}
        setSort={setSort}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalResults={employees.length}
        onReset={handleResetFilters}
      />

      {/* Bulk Action Bar (when selected) */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-indigo-500/30 bg-indigo-950/40 p-4 backdrop-blur-xl shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <CheckCircle2 className="h-4 w-4 text-indigo-400" />
            <span>{selectedIds.length} employees selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5"
            >
              Deselect All
            </button>
            <button
              onClick={handleOpenBulkDelete}
              className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 transition-colors shadow"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <LoadingSkeleton variant={viewMode === 'table' ? 'table' : 'grid'} count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchEmployees} />
      ) : employees.length === 0 ? (
        <EmptyState
          title="No employees found"
          message={
            search || department !== 'All Departments' || status !== 'All Statuses'
              ? 'No employee matched your filter criteria. Try adjusting your search query or reset filters.'
              : 'Your workforce directory is currently empty. Add your first employee to get started.'
          }
          isFilter={Boolean(search || department !== 'All Departments' || status !== 'All Statuses')}
          onAction={
            search || department !== 'All Departments' || status !== 'All Statuses'
              ? handleResetFilters
              : handleOpenAdd
          }
          actionText={
            search || department !== 'All Departments' || status !== 'All Statuses'
              ? 'Reset All Filters'
              : '+ Add First Employee'
          }
        />
      ) : viewMode === 'table' ? (
        <EmployeeTable
          employees={employees}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {employees.map((emp) => (
            <EmployeeCard
              key={emp._id || emp.id}
              employee={emp}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingEmployee}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        employee={deletingEmployee}
        isDeleting={isDeleting}
        count={isBulkDelete ? selectedIds.length : 1}
      />
    </div>
  );
}
