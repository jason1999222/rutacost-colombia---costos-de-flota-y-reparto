import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  UserProfile,
  UserRole,
  UserStatus,
  RolePermissions,
  ROLE_DEFINITIONS,
  getEffectivePermissions,
  FirebaseClientConfig
} from '../types/auth';
import {
  Users,
  UserCheck,
  ShieldCheck,
  Clock,
  X,
  Check,
  AlertCircle,
  Search,
  Sliders,
  Truck,
  Mail,
  Phone,
  Building2,
  Trash2,
  Save,
  CheckCircle2,
  RotateCcw,
  Layers,
  Navigation,
  Calculator,
  Database,
  BarChart3,
  Shield,
  Eye,
  Edit3,
  Wifi,
  WifiOff
} from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { initFirebase } from '../services/firebase';
import { formatLastSeen, formatDateTime } from '../hooks/usePresence';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Componente para mostrar el estado de presencia de un usuario
const PresenceIndicator: React.FC<{ user: UserProfile; firebaseConfig: FirebaseClientConfig | null }> = ({ user, firebaseConfig }) => {
  const [presence, setPresence] = useState<{ isOnline: boolean; lastSeenAt: Date | null }>({
    isOnline: false,
    lastSeenAt: null,
  });

  useEffect(() => {
    if (!firebaseConfig || user.uid.startsWith('demo-') || user.uid.startsWith('local-')) {
      return;
    }

    const { db } = initFirebase(firebaseConfig);
    if (!db) return;

    const presenceRef = doc(db, 'presence', user.uid);
    const unsubscribe = onSnapshot(presenceRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const lastSeen = data.lastSeenAt?.toDate?.() || null;
        const isOnline = data.isOnline && lastSeen
          ? (Date.now() - lastSeen.getTime()) < 60000
          : false;
        setPresence({ isOnline, lastSeenAt: lastSeen });
      }
    }, () => {
      // Silenciar errores de permisos
    });

    return () => unsubscribe();
  }, [user.uid, firebaseConfig]);

  // Para usuarios demo o locales, mostrar como "en línea" si son el usuario actual
  const isDemoUser = user.uid.startsWith('demo-') || user.uid.startsWith('local-');

  if (isDemoUser) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
        <Wifi className="w-3 h-3 text-slate-400" />
        <span>Usuario demo</span>
      </span>
    );
  }

  return (
    <span className={`flex items-center gap-1 text-[10px] font-semibold ${presence.isOnline ? 'text-emerald-600' : 'text-slate-500'}`}>
      {presence.isOnline ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>En línea</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Últ. conexión: {formatLastSeen(presence.lastSeenAt)}</span>
        </>
      )}
      {user.lastLoginAt && (
        <span className="font-normal text-slate-400" title="Último acceso registrado en Firebase">
          · Acceso: {formatDateTime(user.lastLoginAt)}
        </span>
      )}
    </span>
  );
};

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    currentUser,
    allUsers,
    pendingUsersCount,
    refreshAllUsers,
    approveUser,
    rejectUser,
    updateUserByAdmin,
    deleteUserByAdmin,
    firebaseConfig
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<UserProfile | null>(null);

  // Formulario de edición de usuario
  const [editRole, setEditRole] = useState<UserRole>('dispatcher');
  const [editStatus, setEditStatus] = useState<UserStatus>('approved');
  const [editVehiclePlate, setEditVehiclePlate] = useState('');
  const [editRouteId, setEditRouteId] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editPermissions, setEditPermissions] = useState<RolePermissions>(ROLE_DEFINITIONS.dispatcher.permissions);

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  // Abrir editor de un usuario
  const handleOpenEdit = (user: UserProfile) => {
    setSelectedUserToEdit(user);
    setEditRole(user.role);
    setEditStatus(user.status);
    setEditVehiclePlate(user.assignedVehiclePlate || '');
    setEditRouteId(user.assignedRouteId || 'SCJ-001');
    setEditDisplayName(user.displayName || '');
    setEditPhone(user.phone || '');
    setEditCompany(user.company || 'SCJ');
    setEditPermissions(getEffectivePermissions(user));
  };

  // Restablecer permisos del editor a los del rol seleccionado
  const handleResetToRoleDefaults = (role: UserRole) => {
    setEditRole(role);
    setEditPermissions(ROLE_DEFINITIONS[role].permissions);
  };

  // Guardar cambios del usuario editado
  const handleSaveUserChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserToEdit) return;

    setIsSaving(true);
    try {
      const updates: Partial<UserProfile> = {
        displayName: editDisplayName.trim(),
        role: editRole,
        status: editStatus,
        phone: editPhone.trim(),
        company: editCompany.trim(),
        assignedVehiclePlate: editRole === 'driver' ? editVehiclePlate.trim() : undefined,
        assignedRouteId: editRole === 'driver' ? editRouteId.trim() : undefined,
        customPermissions: editPermissions,
        approvedBy: editStatus === 'approved' ? (selectedUserToEdit.approvedBy || currentUser?.uid) : undefined,
        approvedByName: editStatus === 'approved' ? (selectedUserToEdit.approvedByName || currentUser?.displayName) : undefined,
        approvedAt: editStatus === 'approved' ? (selectedUserToEdit.approvedAt || new Date().toISOString()) : undefined,
      };

      await updateUserByAdmin(selectedUserToEdit.uid, updates);
      setActionSuccess(`Perfil de "${editDisplayName || selectedUserToEdit.email}" actualizado exitosamente.`);
      setTimeout(() => setActionSuccess(null), 3500);
      setSelectedUserToEdit(null);
    } catch (err: any) {
      alert("Error al actualizar usuario: " + (err.message || ''));
    } finally {
      setIsSaving(false);
    }
  };

  // Aprobación rápida con 1 clic
  const handleQuickApprove = async (user: UserProfile) => {
    try {
      await approveUser(user.uid, user.role, undefined, {
        assignedVehiclePlate: user.assignedVehiclePlate,
        assignedRouteId: user.assignedRouteId
      });
      setActionSuccess(`Acceso aprobado para ${user.displayName || user.email}. Ya puede ingresar.`);
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (e: any) {
      alert("Error aprobando usuario: " + (e.message || ''));
    }
  };

  // Rechazo rápido con 1 clic
  const handleQuickReject = async (user: UserProfile) => {
    if (confirm(`¿Estás seguro de declinar el acceso para ${user.displayName || user.email}?`)) {
      try {
        await rejectUser(user.uid);
        setActionSuccess(`Acceso declinado para ${user.displayName || user.email}.`);
        setTimeout(() => setActionSuccess(null), 3500);
      } catch (e: any) {
        alert("Error rechazando usuario: " + (e.message || ''));
      }
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (user: UserProfile) => {
    if (user.email === 'jacson.munoz@gmail.com') {
      alert("No se puede eliminar la cuenta del Superadministrador Principal.");
      return;
    }
    if (confirm(`¿Deseas eliminar definitivamente de Firestore la cuenta de ${user.displayName || user.email}?`)) {
      try {
        await deleteUserByAdmin(user.uid);
        setActionSuccess(`Usuario ${user.displayName || user.email} eliminado.`);
        setTimeout(() => setActionSuccess(null), 3500);
      } catch (e: any) {
        alert("Error eliminando usuario: " + (e.message || ''));
      }
    }
  };

  // Filtrado de usuarios
  const filteredUsers = allUsers.filter(u => {
    if (filterTab === 'pending' && u.status !== 'pending') return false;
    if (filterTab === 'approved' && u.status !== 'approved') return false;
    if (filterTab === 'rejected' && u.status !== 'rejected') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.displayName.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchRole = u.role.toLowerCase().includes(q);
      const matchPlate = u.assignedVehiclePlate?.toLowerCase().includes(q);
      return matchName || matchEmail || matchRole || matchPlate;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col my-auto max-h-[92vh]">

        {/* Cabecera Principal */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-8">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-400 flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-white">
                    Gestión de Perfiles, Roles y Permisos
                  </h3>
                  {pendingUsersCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-slate-950 animate-pulse">
                      {pendingUsersCount} Pendiente{pendingUsersCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300">
                  Panel exclusivo de Administración · Autoriza nuevas cuentas y define acceso granular por página
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={refreshAllUsers}
              className="px-3.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors self-start sm:self-center cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>Actualizar Lista</span>
            </button>
          </div>
        </div>

        {/* Notificación de éxito */}
        {actionSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{actionSuccess}</span>
          </div>
        )}

        {/* Barra de Filtros y Búsqueda */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">

          {/* Tabs de Filtro */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
              }`}
            >
              Todos ({allUsers.length})
            </button>

            <button
              onClick={() => setFilterTab('pending')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterTab === 'pending'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pendientes ({allUsers.filter(u => u.status === 'pending').length})</span>
            </button>

            <button
              onClick={() => setFilterTab('approved')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterTab === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Aprobados ({allUsers.filter(u => u.status === 'approved').length})</span>
            </button>

            <button
              onClick={() => setFilterTab('rejected')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterTab === 'rejected'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
              }`}
            >
              <X className="w-3.5 h-3.5" />
              <span>Rechazados ({allUsers.filter(u => u.status === 'rejected').length})</span>
            </button>
          </div>

          {/* Buscador */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, correo, placa..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

        </div>

        {/* Lista de Usuarios */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3 max-h-[60vh]">
          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-sm">No se encontraron usuarios con el filtro seleccionado</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const rDef = ROLE_DEFINITIONS[user.role] || ROLE_DEFINITIONS.dispatcher;
              const isSuperAdmin = user.email === 'jacson.munoz@gmail.com';

              return (
                <div
                  key={user.uid}
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    user.status === 'pending'
                      ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-300/30 shadow-xs'
                      : user.status === 'rejected'
                      ? 'bg-rose-50/30 border-rose-200 opacity-80'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >

                  {/* Información Principal del Usuario */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 uppercase shadow-xs">
                      {user.displayName.slice(0, 2) || 'SC'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-sm truncate">
                          {user.displayName}
                        </h4>

                        {/* Badge de Rol */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rDef.badgeClass}`}>
                          {rDef.label}
                        </span>

                        {/* Badge de Estado */}
                        {user.status === 'pending' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>Esperando Aprobación</span>
                          </span>
                        )}
                        {user.status === 'approved' && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Habilitado</span>
                          </span>
                        )}
                        {user.status === 'rejected' && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                            <X className="w-3 h-3 text-rose-600" />
                            <span>Acceso Declinado</span>
                          </span>
                        )}

                        {isSuperAdmin && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-900 text-amber-300">
                            SUPERADMIN
                          </span>
                        )}

                        {/* Indicador de Presencia en Tiempo Real */}
                        <PresenceIndicator user={user} firebaseConfig={firebaseConfig} />
                      </div>

                      <div className="flex items-center gap-3 text-slate-500 text-xs mt-1 flex-wrap">
                        <span className="flex items-center gap-1 font-mono text-slate-700">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{user.email}</span>
                        </span>

                        {user.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{user.phone}</span>
                          </span>
                        )}

                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{user.company || 'SCJ'}</span>
                        </span>

                        {user.assignedVehiclePlate && (
                          <span className="flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono text-[11px]">
                            <Truck className="w-3 h-3 text-emerald-600" />
                            <span>{user.assignedVehiclePlate}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones para el Administrador */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">

                    {/* Botones de Aprobación Rápida si está pendiente */}
                    {user.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleQuickApprove(user)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                          title="Aprobar inmediatamente el acceso de este usuario al sistema"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aprobar Acceso</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickReject(user)}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors border border-rose-200 cursor-pointer"
                          title="Declinar solicitud de acceso"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Rechazar</span>
                        </button>
                      </>
                    )}

                    {/* Botón de Configuración Completa de Permisos */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(user)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors border border-blue-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Sliders className="w-3.5 h-3.5 text-blue-600" />
                      <span>Configurar Rol & Permisos</span>
                    </button>

                    {/* Botón Eliminar (no permitido al superadmin) */}
                    {!isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Eliminar usuario de la base de datos"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Pie del Modal */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Los cambios de rol y permisos se guardan y aplican inmediatamente en Firebase Firestore</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Panel
          </button>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* MODAL / SUB-PANEL: EDICIÓN DE ROL Y MATRIZ DE PERMISOS GRANULARES   */}
      {/* ===================================================================== */}
      {selectedUserToEdit && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col my-auto max-h-[95vh]">

            {/* Cabecera del Editor */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 relative">
              <button
                type="button"
                onClick={() => setSelectedUserToEdit(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-white font-black text-base flex items-center justify-center uppercase">
                  {selectedUserToEdit.displayName.slice(0, 2) || 'SC'}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Configurar Perfil: {selectedUserToEdit.displayName}
                  </h3>
                  <p className="text-xs text-blue-200 font-mono">
                    {selectedUserToEdit.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario de Configuración Granular */}
            <form onSubmit={handleSaveUserChanges} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs max-h-[75vh]">

              {/* 1. Estado de Autorización de la Cuenta */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="font-bold text-slate-800 text-xs block">
                  Estado de Acceso y Autorización:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditStatus('approved')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      editStatus === 'approved'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-emerald-50/30'
                    }`}
                  >
                    ✅ Aprobado / Activo
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus('pending')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      editStatus === 'pending'
                        ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-amber-50/30'
                    }`}
                  >
                    ⏳ Pendiente
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus('rejected')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      editStatus === 'rejected'
                        ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-rose-50/30'
                    }`}
                  >
                    ⛔ Declinado
                  </button>
                </div>
              </div>

              {/* 2. Selector de Rol */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Rol Principal Asignado:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleResetToRoleDefaults(editRole)}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                    title="Restablece los permisos por página a los valores estándar de este rol"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Cargar Permisos por Defecto</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((rKey) => {
                    const r = ROLE_DEFINITIONS[rKey];
                    const isSelected = editRole === rKey;
                    return (
                      <button
                        key={rKey}
                        type="button"
                        onClick={() => handleResetToRoleDefaults(rKey)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between text-slate-900">
                          <span>{r.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-snug">
                          {r.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Datos del Camión (si es conductor) */}
              {editRole === 'driver' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2.5">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                    <Truck className="w-4 h-4 text-emerald-700" />
                    <span>Asignación de Vehículo y Ruta (Modo Conductor):</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-emerald-900 block mb-1">Placa Vehicular Asignada:</label>
                      <input
                        type="text"
                        value={editVehiclePlate}
                        onChange={(e) => setEditVehiclePlate(e.target.value)}
                        placeholder="Ej: WGB-342"
                        className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-emerald-900 block mb-1">Ruta Predeterminada:</label>
                      <input
                        type="text"
                        value={editRouteId}
                        onChange={(e) => setEditRouteId(e.target.value)}
                        placeholder="Ej: SCJ-001"
                        className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Matriz de Permisos Granulares por Página / Módulo */}
              <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>Permisos Específicos por Módulo / Página:</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Personaliza exactamente qué puede ver y editar
                  </span>
                </div>

                <div className="space-y-3">

                  {/* Módulo 1: Despachos & Salidas */}
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-800 text-xs">Módulo Despachos & Entradas</div>
                        <div className="text-[10px] text-slate-500">Registro de salidas con odómetro, entradas y liquidaciones</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={editPermissions.canViewDispatch}
                          onChange={(e) => setEditPermissions(prev => ({ ...prev, canViewDispatch: e.target.checked }))}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-[11px]">Ver</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={editPermissions.canEditDispatch}
                          onChange={(e) => setEditPermissions(prev => ({
                            ...prev,
                            canEditDispatch: e.target.checked,
                            canCreateDispatches: e.target.checked,
                            canSettleVehicles: e.target.checked
                          }))}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-[11px]">Editar / Crear</span>
                      </label>
                    </div>
                  </div>

                  {/* Módulo 2: Rutas & Mapa */}
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-800 text-xs">Módulo Rutas & Mapa Google Maps</div>
                        <div className="text-[10px] text-slate-500">Matriz de rutas comerciales, georreferenciación y tarifas de flete</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={editPermissions.canViewRoutes}
                          onChange={(e) => setEditPermissions(prev => ({ ...prev, canViewRoutes: e.target.checked }))}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-[11px]">Ver</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={editPermissions.canEditRoutes}
                          onChange={(e) => setEditPermissions(prev => ({ ...prev, canEditRoutes: e.target.checked }))}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-[11px]">Editar / Crear</span>
                      </label>
                    </div>
                  </div>

                  {/* Módulo 3: Base de Cálculo & Nómina */}
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-800 text-xs">Base de Cálculo & Nómina CST</div>
                        <div className="text-[10px] text-slate-500">Precios ACPM, recargos nocturnos, festivos y peajes</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={editPermissions.canViewCalcBasis}
                          onChange={(e) => setEditPermissions(prev => ({ ...prev, canViewCalcBasis: e.target.checked }))}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-[11px]">Ver</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={editPermissions.canEditCalcBasis}
                          onChange={(e) => setEditPermissions(prev => ({
                            ...prev,
                            canEditCalcBasis: e.target.checked,
                            canConfigureCosts: e.target.checked
                          }))}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-[11px]">Editar Parámetros</span>
                      </label>
                    </div>
                  </div>

                  {/* Módulo 4: Base de Datos */}
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-800 text-xs">Base de Datos (Vehículos, Tiendas, Personal)</div>
                        <div className="text-[10px] text-slate-500">Plantilla vehicular SCJ, personal y directorio de locales</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={editPermissions.canViewDatabase}
                          onChange={(e) => setEditPermissions(prev => ({ ...prev, canViewDatabase: e.target.checked }))}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-[11px]">Ver</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={editPermissions.canEditDatabase}
                          onChange={(e) => setEditPermissions(prev => ({ ...prev, canEditDatabase: e.target.checked }))}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-[11px]">Editar Catálogos</span>
                      </label>
                    </div>
                  </div>

                  {/* Módulo 5: P&L y Ganancias */}
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-800 text-xs">P&L, Ganancias y Balances</div>
                        <div className="text-[10px] text-slate-500">Márgenes de rentabilidad, gastos vs fletes e historial</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={editPermissions.canViewPnl}
                          onChange={(e) => setEditPermissions(prev => ({ ...prev, canViewPnl: e.target.checked }))}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-[11px]">Ver Balances</span>
                      </label>
                    </div>
                  </div>

                  {/* Módulo 6: Administración y Firebase */}
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-800 text-xs">Gobernanza & Seguridad</div>
                        <div className="text-[10px] text-slate-500">Gestión de usuarios, autorizaciones y sincronización Cloud</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={editPermissions.canManageUsers}
                          onChange={(e) => setEditPermissions(prev => ({ ...prev, canManageUsers: e.target.checked }))}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        <span className="text-[11px]">Gestionar Usuarios</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={editPermissions.canSyncFirebase}
                          onChange={(e) => setEditPermissions(prev => ({ ...prev, canSyncFirebase: e.target.checked }))}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        <span className="text-[11px]">Firebase Cloud</span>
                      </label>
                    </div>
                  </div>

                </div>
              </div>

              {/* 5. Datos Personales */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="font-bold text-slate-800 text-xs">
                  Datos de Identificación del Colaborador:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-1">Nombre Completo:</label>
                    <input
                      type="text"
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-1">Teléfono:</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+57 300 000 0000"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-1">Sede / Empresa:</label>
                    <input
                      type="text"
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      placeholder="SCJ"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Botones del Formulario */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedUserToEdit(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Guardando en Firestore...' : 'Guardar y Aplicar Permisos'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
