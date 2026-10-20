import { Router, Request, Response } from 'express';
import { db, getRelativeDate } from '../db';
import { authenticate, requireRole } from './auth';
import { DoctorUser } from '../types';

export const adminRouter = Router();

// Protect all admin routes with authentication and 'admin' role check
adminRouter.use(authenticate);
adminRouter.use(requireRole(['admin']));

// 1. Hospital System Statistics
adminRouter.get('/stats', (_req: Request, res: Response) => {
  const totalPatients = db.patients.length;
  const totalDoctors = db.doctors.length;
  const totalAppointments = db.appointments.length;
  const scheduledCount = db.appointments.filter((a) => a.status === 'Scheduled').length;
  const completedCount = db.appointments.filter((a) => a.status === 'Completed').length;
  const cancelledCount = db.appointments.filter((a) => a.status === 'Cancelled').length;
  const totalEhrRecords = db.ehrRecords.length;

  const todayStr = getRelativeDate(0);
  const todayAppointments = db.appointments.filter((a) => a.date === todayStr);

  // Locked accounts count across patients, doctors, and admins
  const now = Date.now();
  const allUsers = [...db.patients, ...db.doctors, ...db.admins];
  const lockedUsers = allUsers.filter((u) => {
    if (!u.lockUntil) return false;
    return new Date(u.lockUntil).getTime() > now;
  });

  // Calculate estimated consultation revenue
  const totalRevenue = db.appointments
    .filter((a) => a.status === 'Completed')
    .reduce((sum, apt) => {
      const doc = db.doctors.find((d) => d.id === apt.doctorId);
      return sum + (doc?.consultationFee || 120);
    }, 0);

  // Department counts
  const departmentCounts: Record<string, number> = {};
  for (const doc of db.doctors) {
    departmentCounts[doc.department] = (departmentCounts[doc.department] || 0) + 1;
  }

  res.json({
    totalPatients,
    totalDoctors,
    totalAppointments,
    scheduledCount,
    completedCount,
    cancelledCount,
    totalEhrRecords,
    todayAppointmentsCount: todayAppointments.length,
    lockedAccountsCount: lockedUsers.length,
    totalRevenue,
    departmentCounts,
    systemStatus: 'Operational',
  });
});

// 2. Doctors Management
adminRouter.get('/doctors', (_req: Request, res: Response) => {
  const doctorsWithStats = db.doctors.map((doc) => {
    const docAppointments = db.appointments.filter((a) => a.doctorId === doc.id);
    const activeScheduled = docAppointments.filter((a) => a.status === 'Scheduled').length;
    const completed = docAppointments.filter((a) => a.status === 'Completed').length;
    return {
      ...doc,
      scheduledAppointmentsCount: activeScheduled,
      completedAppointmentsCount: completed,
    };
  });
  res.json({ doctors: doctorsWithStats });
});

adminRouter.post('/doctors', (req: Request, res: Response) => {
  const { name, email, phone, department, qualification, room, bio, experienceYears, consultationFee } = req.body;

  if (!name || !email || !department || !qualification) {
    return res.status(400).json({ error: 'Name, email, department, and qualification are required.' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'A user with this email already exists in the system.' });
  }

  const newDoctor: DoctorUser = {
    id: `doc_${Date.now()}`,
    role: 'doctor',
    name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
    email: email.trim().toLowerCase(),
    phone: phone || '+1 (555) 000-0000',
    password: 'Password123!',
    department,
    qualification,
    room: room || 'Suite 100',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    bio: bio || 'Board-certified medical physician dedicated to patient care and clinical excellence.',
    experienceYears: Number(experienceYears) || 5,
    consultationFee: Number(consultationFee) || 150,
    unavailableDates: [],
    failedLoginAttempts: 0,
    lockUntil: null,
    createdAt: new Date().toISOString(),
  };

  db.doctors.push(newDoctor);

  res.status(201).json({
    message: `Doctor ${newDoctor.name} added to hospital roster successfully.`,
    doctor: newDoctor,
  });
});

adminRouter.put('/doctors/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = db.doctors.find((d) => d.id === id);
  if (!doc) {
    return res.status(404).json({ error: 'Doctor not found.' });
  }

  const { department, qualification, room, bio, experienceYears, consultationFee, phone } = req.body;
  if (department) doc.department = department;
  if (qualification) doc.qualification = qualification;
  if (room) doc.room = room;
  if (bio) doc.bio = bio;
  if (experienceYears !== undefined) doc.experienceYears = Number(experienceYears);
  if (consultationFee !== undefined) doc.consultationFee = Number(consultationFee);
  if (phone) doc.phone = phone;

  res.json({ message: 'Doctor details updated successfully.', doctor: doc });
});

// 3. Patients Directory
adminRouter.get('/patients', (_req: Request, res: Response) => {
  const patientsWithHistory = db.patients.map((pat) => {
    const patientAppointments = db.appointments.filter((a) => a.patientId === pat.id);
    const patientEhr = db.ehrRecords.filter((e) => e.patientId === pat.id);
    return {
      id: pat.id,
      name: pat.name,
      email: pat.email,
      phone: pat.phone,
      dob: pat.dob,
      gender: pat.gender,
      bloodGroup: pat.bloodGroup,
      emergencyContact: pat.emergencyContact,
      failedLoginAttempts: pat.failedLoginAttempts,
      lockUntil: pat.lockUntil,
      createdAt: pat.createdAt,
      totalAppointments: patientAppointments.length,
      totalEhrRecords: patientEhr.length,
    };
  });
  res.json({ patients: patientsWithHistory });
});

// 4. All Hospital Appointments
adminRouter.get('/appointments', (req: Request, res: Response) => {
  const { status, department, doctorId } = req.query;
  let appointments = [...db.appointments];

  if (status && typeof status === 'string') {
    appointments = appointments.filter((a) => a.status.toLowerCase() === status.toLowerCase());
  }
  if (department && typeof department === 'string') {
    appointments = appointments.filter((a) => a.department.toLowerCase() === department.toLowerCase());
  }
  if (doctorId && typeof doctorId === 'string') {
    appointments = appointments.filter((a) => a.doctorId === doctorId);
  }

  // Sort by date descending
  appointments.sort((a, b) => new Date(`${b.date} ${b.timeSlot}`).getTime() - new Date(`${a.date} ${a.timeSlot}`).getTime());

  res.json({ appointments });
});

// Administrative update on appointment status
adminRouter.patch('/appointments/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  const appointment = db.appointments.find((a) => a.id === id);
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  if (!['Scheduled', 'Completed', 'Cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid appointment status.' });
  }

  appointment.status = status;
  if (reason) {
    appointment.cancellationReason = reason;
  }
  appointment.updatedAt = new Date().toISOString();

  // Send notification to patient
  db.notifications.push({
    id: `notif_${Date.now()}`,
    userId: appointment.patientId,
    title: `Appointment ${status}`,
    message: `Hospital Administration updated your appointment on ${appointment.date} at ${appointment.timeSlot} with ${appointment.doctorName} to: ${status}${reason ? ` (${reason})` : ''}.`,
    type: status === 'Cancelled' ? 'appointment_cancelled' : 'appointment_rescheduled',
    read: false,
    createdAt: new Date().toISOString(),
  });

  res.json({ message: `Appointment status updated to ${status}.`, appointment });
});

// 5. Security & Account Locks
adminRouter.get('/security/accounts', (_req: Request, res: Response) => {
  const allUsers = [
    ...db.patients.map((u) => ({ ...u, role: 'patient' as const })),
    ...db.doctors.map((u) => ({ ...u, role: 'doctor' as const })),
    ...db.admins.map((u) => ({ ...u, role: 'admin' as const })),
  ];

  const now = Date.now();
  const accounts = allUsers.map((u) => {
    const isLocked = !!(u.lockUntil && new Date(u.lockUntil).getTime() > now);
    const lockMinutesRemaining = isLocked && u.lockUntil ? Math.ceil((new Date(u.lockUntil).getTime() - now) / 60000) : 0;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      failedLoginAttempts: u.failedLoginAttempts || 0,
      isLocked,
      lockMinutesRemaining,
      lockUntil: u.lockUntil,
      createdAt: u.createdAt,
    };
  });

  res.json({ accounts });
});

// Admin unlock user account
adminRouter.post('/security/unlock', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'User email is required.' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = null;

  res.json({ message: `Account lock cleared and login attempts reset for ${user.name} (${user.email}).` });
});
