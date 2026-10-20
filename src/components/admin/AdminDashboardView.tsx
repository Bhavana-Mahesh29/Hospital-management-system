import React, { useState, useEffect } from 'react';
import { api, ApiError } from '../../lib/api';
import { AdminStats, AdminAccountItem, Doctor, Appointment } from '../../types';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Building2,
  DollarSign,
  UserCheck,
  Lock,
  Unlock,
  Clock,
  Activity,
  Filter,
} from 'lucide-react';

interface AdminDashboardViewProps {
  initialSubTab?: 'dashboard' | 'doctors' | 'appointments' | 'patients' | 'security';
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ initialSubTab = 'dashboard' }) => {
  const [subTab, setSubTab] = useState<'dashboard' | 'doctors' | 'appointments' | 'patients' | 'security'>(
    initialSubTab
  );

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [securityAccounts, setSecurityAccounts] = useState<AdminAccountItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters
  const [doctorSearch, setDoctorSearch] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('All');
  const [appointmentDeptFilter, setAppointmentDeptFilter] = useState('All Departments');

  // Add Doctor Modal
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocEmail, setNewDocEmail] = useState('');
  const [newDocPhone, setNewDocPhone] = useState('+1 (555) 789-9999');
  const [newDocDept, setNewDocDept] = useState('Cardiology');
  const [newDocQualification, setNewDocQualification] = useState('MD - Harvard Medical School');
  const [newDocRoom, setNewDocRoom] = useState('Suite 405');
  const [newDocFee, setNewDocFee] = useState('160');
  const [newDocBio, setNewDocBio] = useState('Experienced medical clinician specializing in patient-first healthcare.');
  const [isSubmittingDoctor, setIsSubmittingDoctor] = useState(false);

  // Load all admin data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, docsRes, aptsRes, patsRes, secRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminDoctors(),
        api.getAdminAppointments(),
        api.getAdminPatients(),
        api.getAdminSecurityAccounts(),
      ]);

      setStats(statsRes);
      setDoctors(docsRes.doctors || []);
      setAppointments(aptsRes.appointments || []);
      setPatients(patsRes.patients || []);
      setSecurityAccounts(secRes.accounts || []);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      setActionMessage({ type: 'error', text: 'Error loading administrative records.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Unlock account handler
  const handleUnlockAccount = async (email: string) => {
    try {
      const res = await api.unlockAdminAccount(email);
      setActionMessage({ type: 'success', text: res.message || `Account ${email} unlocked successfully.` });
      // Refresh accounts and stats
      const [secRes, statsRes] = await Promise.all([
        api.getAdminSecurityAccounts(),
        api.getAdminStats(),
      ]);
      setSecurityAccounts(secRes.accounts || []);
      setStats(statsRes);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to unlock account.' });
    }
  };

  // Update appointment status
  const handleUpdateAppointmentStatus = async (id: string, status: 'Completed' | 'Cancelled') => {
    try {
      const reason = status === 'Cancelled' ? 'Administrative schedule adjustment' : undefined;
      await api.updateAdminAppointmentStatus(id, status, reason);
      setActionMessage({
        type: 'success',
        text: `Appointment status updated to ${status}. Patient notified.`,
      });
      // Refresh appointments and stats
      const [aptsRes, statsRes] = await Promise.all([
        api.getAdminAppointments(),
        api.getAdminStats(),
      ]);
      setAppointments(aptsRes.appointments || []);
      setStats(statsRes);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to update appointment.' });
    }
  };

  // Add doctor form submit
  const handleAddDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDoctor(true);
    setActionMessage(null);

    try {
      const res = await api.addAdminDoctor({
        name: newDocName,
        email: newDocEmail,
        phone: newDocPhone,
        department: newDocDept,
        qualification: newDocQualification,
        room: newDocRoom,
        consultationFee: Number(newDocFee),
        bio: newDocBio,
      });

      setActionMessage({ type: 'success', text: res.message || 'Doctor added successfully!' });
      setIsAddDoctorModalOpen(false);
      setNewDocName('');
      setNewDocEmail('');

      // Refresh doctor list and stats
      const [docsRes, statsRes] = await Promise.all([
        api.getAdminDoctors(),
        api.getAdminStats(),
      ]);
      setDoctors(docsRes.doctors || []);
      setStats(statsRes);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to add physician.' });
    } finally {
      setIsSubmittingDoctor(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Admin Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              CarePulse Hospital Administration System • SuperAdmin Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hospital Operations & Administrative Governance
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time administrative command center: manage physician roster, oversee patient bookings across all
              medical departments, review electronic health statistics, and enforce HIPAA security lockouts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddDoctorModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Physician
            </button>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Quick Tabs Bar */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-indigo-800/40">
          <button
            onClick={() => setSubTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              subTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Overview & Metrics
          </button>
          <button
            onClick={() => setSubTab('doctors')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              subTab === 'doctors'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            Physicians ({doctors.length})
          </button>
          <button
            onClick={() => setSubTab('appointments')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              subTab === 'appointments'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Appointments ({appointments.length})
          </button>
          <button
            onClick={() => setSubTab('patients')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              subTab === 'patients'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Patients ({patients.length})
          </button>
          <button
            onClick={() => setSubTab('security')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              subTab === 'security'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Security & Account Locks {stats?.lockedAccountsCount ? `(${stats.lockedAccountsCount} locked)` : ''}
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-medium flex items-center justify-between shadow-sm animate-in fade-in ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* ------------------- SUB-TAB 1: OVERVIEW & KPI METRICS ------------------- */}
      {subTab === 'dashboard' && stats && (
        <div className="space-y-6">
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Registered Patients</span>
                <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.totalPatients}</div>
              <p className="text-[11px] text-teal-700 mt-1 font-medium">Digital patient profiles active</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Medical Specialists</span>
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Stethoscope className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.totalDoctors}</div>
              <p className="text-[11px] text-indigo-700 mt-1 font-medium">Across 6 clinical departments</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Consultations</span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.totalAppointments}</div>
              <div className="flex items-center gap-2 mt-1 text-[11px]">
                <span className="text-emerald-600 font-bold">{stats.scheduledCount} Scheduled</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">{stats.completedCount} Done</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Completed Revenue</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">${stats.totalRevenue}</div>
              <p className="text-[11px] text-emerald-700 mt-1 font-medium">Billed clinical consultations</p>
            </div>
          </div>

          {/* Secondary Details Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Department Staffing */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  Physician Department Distribution
                </h3>
                <span className="text-xs text-slate-400">{Object.keys(stats.departmentCounts).length} Departments</span>
              </div>
              <div className="space-y-3 pt-2">
                {Object.entries(stats.departmentCounts).map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{dept}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${(count / stats.totalDoctors) * 100}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-900 w-4 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Electronic Health Records Overview */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600" />
                  EHR Clinical Records System
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  HIPAA Compliant
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hospital doctors maintain live electronic diagnoses, vital telemetry, and confidential prescriptions.
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total EHR Patient Files:</span>
                  <span className="font-bold text-slate-900">{stats.totalEhrRecords} Files</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Consultations:</span>
                  <span className="font-bold text-teal-700">{stats.scheduledCount} Visits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cancelled / No-Show Rate:</span>
                  <span className="font-bold text-slate-700">
                    {stats.totalAppointments > 0
                      ? Math.round((stats.cancelledCount / stats.totalAppointments) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Security & Access Protection status */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Access Security Safeguards
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                  <span>15-Minute Doctor Inactivity Timeout:</span>
                  <span className="font-bold text-emerald-700">Enforced</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                  <span>5 Failed Attempts Security Lockout:</span>
                  <span className="font-bold text-emerald-700">15-Min Lock</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                  <span>Currently Locked Accounts:</span>
                  <span
                    className={`font-bold ${stats.lockedAccountsCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}
                  >
                    {stats.lockedAccountsCount} Accounts
                  </span>
                </div>
              </div>
              {stats.lockedAccountsCount > 0 ? (
                <button
                  onClick={() => setSubTab('security')}
                  className="w-full py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition"
                >
                  Manage Locked Accounts ({stats.lockedAccountsCount})
                </button>
              ) : (
                <div className="text-[11px] text-slate-400 text-center pt-2">
                  No accounts are locked currently.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------- SUB-TAB 2: DOCTORS MANAGEMENT ------------------- */}
      {subTab === 'doctors' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Physicians & Specialist Staff</h2>
              <p className="text-xs text-slate-500">
                Review credentialing, department placement, consultation fees, and active patient workload.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search doctor or specialty..."
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={() => setIsAddDoctorModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Physician
              </button>
            </div>
          </div>

          {/* Doctors Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Qualification</th>
                  <th className="py-3 px-4">Consultation Fee</th>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Scheduled Visits</th>
                  <th className="py-3 px-4">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctors
                  .filter((d) =>
                    doctorSearch
                      ? d.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
                        d.department.toLowerCase().includes(doctorSearch.toLowerCase())
                      : true
                  )
                  .map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-3">
                        <img
                          src={doc.avatarUrl}
                          alt={doc.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div>{doc.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{doc.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {doc.department}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-600" title={doc.qualification}>
                        {doc.qualification}
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-700">${doc.consultationFee}</td>
                      <td className="py-3 px-4 text-slate-600">{doc.room}</td>
                      <td className="py-3 px-4 font-bold text-indigo-700">
                        {doc.scheduledAppointmentsCount || 0}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-600">
                        {doc.completedAppointmentsCount || 0}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------- SUB-TAB 3: ALL APPOINTMENTS ------------------- */}
      {subTab === 'appointments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Hospital-Wide Patient Appointments</h2>
              <p className="text-xs text-slate-500">
                Comprehensive booking ledger. Filter by clinical status or department and manage consultations.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={appointmentStatusFilter}
                onChange={(e) => setAppointmentStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select
                value={appointmentDeptFilter}
                onChange={(e) => setAppointmentDeptFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All Departments">All Departments</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Dermatology">Dermatology</option>
                <option value="General Medicine">General Medicine</option>
              </select>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments
                  .filter((a) => {
                    if (appointmentStatusFilter !== 'All' && a.status !== appointmentStatusFilter) return false;
                    if (appointmentDeptFilter !== 'All Departments' && a.department !== appointmentDeptFilter) return false;
                    return true;
                  })
                  .map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{apt.patientName}</div>
                        <div className="text-[10px] text-slate-400">{apt.patientEmail}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{apt.doctorName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {apt.department}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{apt.date}</div>
                        <div className="text-[10px] text-slate-500">{apt.timeSlot}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            apt.status === 'Scheduled'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : apt.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        {apt.status === 'Scheduled' && (
                          <>
                            <button
                              onClick={() => handleUpdateAppointmentStatus(apt.id, 'Completed')}
                              className="px-2 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded border border-emerald-200 transition"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleUpdateAppointmentStatus(apt.id, 'Cancelled')}
                              className="px-2 py-1 text-[11px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded border border-rose-200 transition"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------- SUB-TAB 4: PATIENTS DIRECTORY ------------------- */}
      {subTab === 'patients' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Hospital Patient Directory</h2>
              <p className="text-xs text-slate-500">
                Registered patient profiles, contact details, blood groups, and medical history volume.
              </p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patient name or email..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">DOB / Age</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Emergency Contact</th>
                  <th className="py-3 px-4">Total Appointments</th>
                  <th className="py-3 px-4">EHR Records</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients
                  .filter((p) =>
                    patientSearch
                      ? p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
                        p.email.toLowerCase().includes(patientSearch.toLowerCase())
                      : true
                  )
                  .map((pat) => (
                    <tr key={pat.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div>{pat.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{pat.email}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{pat.phone}</td>
                      <td className="py-3 px-4 text-slate-600">{pat.dob || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          {pat.bloodGroup || 'Unspecified'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{pat.emergencyContact || 'None provided'}</td>
                      <td className="py-3 px-4 font-bold text-indigo-700">{pat.totalAppointments || 0}</td>
                      <td className="py-3 px-4 font-bold text-teal-700">{pat.totalEhrRecords || 0} files</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------- SUB-TAB 5: SECURITY & ACCOUNT LOCKS ------------------- */}
      {subTab === 'security' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              Security Audit & Account Lockouts (US-2 & US-3 Compliance)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              CarePulse monitors consecutive failed authentication attempts. Accounts with 5 consecutive failures
              are locked for 15 minutes to thwart brute-force breaches. Hospital administrators can review security status
              and unlock accounts instantly with one click.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Failed Attempts</th>
                  <th className="py-3 px-4">Security Status</th>
                  <th className="py-3 px-4">Lock Time Remaining</th>
                  <th className="py-3 px-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {securityAccounts.map((acc) => (
                  <tr key={acc.id} className={`hover:bg-slate-50 transition ${acc.isLocked ? 'bg-amber-50/50' : ''}`}>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>{acc.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{acc.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                          acc.role === 'admin'
                            ? 'bg-indigo-100 text-indigo-800'
                            : acc.role === 'doctor'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {acc.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">
                      <span className={acc.failedLoginAttempts > 0 ? 'text-rose-600' : 'text-slate-500'}>
                        {acc.failedLoginAttempts} / 5 attempts
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {acc.isLocked ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <Lock className="w-3 h-3" />
                          Locked Out
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <Unlock className="w-3 h-3" />
                          Active & Clean
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {acc.isLocked ? (
                        <span className="font-semibold text-rose-700 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          ~{acc.lockMinutesRemaining} min(s) remaining
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {acc.isLocked || acc.failedLoginAttempts > 0 ? (
                        <button
                          onClick={() => handleUnlockAccount(acc.email)}
                          className="px-3 py-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition flex items-center gap-1 ml-auto"
                        >
                          <Unlock className="w-3 h-3" />
                          Unlock Account
                        </button>
                      ) : (
                        <span className="text-slate-300 text-[10px]">No action required</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------- MODAL: ADD NEW PHYSICIAN ------------------- */}
      {isAddDoctorModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-6 text-white relative">
              <button
                onClick={() => setIsAddDoctorModalOpen(false)}
                className="absolute top-4 right-4 text-indigo-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Add New Medical Physician</h3>
                  <p className="text-xs text-indigo-200">
                    Register a licensed doctor to the hospital roster and appointment schedule.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddDoctorSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Physician Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arthur Miller"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Hospital Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="arthur.miller@hospital.org"
                  value={newDocEmail}
                  onChange={(e) => setNewDocEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={newDocDept}
                    onChange={(e) => setNewDocDept(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="General Medicine">General Medicine</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Consultation Fee ($)</label>
                  <input
                    type="number"
                    required
                    value={newDocFee}
                    onChange={(e) => setNewDocFee(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medical Qualification & School</label>
                <input
                  type="text"
                  required
                  placeholder="MD, FACS - Johns Hopkins University"
                  value={newDocQualification}
                  onChange={(e) => setNewDocQualification(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Clinic / Suite</label>
                  <input
                    type="text"
                    required
                    placeholder="Suite 405"
                    value={newDocRoom}
                    onChange={(e) => setNewDocRoom(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 789-9999"
                    value={newDocPhone}
                    onChange={(e) => setNewDocPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Biography</label>
                <textarea
                  rows={2}
                  value={newDocBio}
                  onChange={(e) => setNewDocBio(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddDoctorModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDoctor}
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:bg-indigo-300"
                >
                  {isSubmittingDoctor ? 'Adding...' : 'Add Physician'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
