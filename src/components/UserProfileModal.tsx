import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLE_DEFINITIONS, UserRole } from '../types/auth';
import {
  User,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  Check,
  X,
  LogOut,
  Truck,
  Layers,
  Database,
  Sparkles,
  Save,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { formatDateTime } from '../hooks/usePresence';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLoginModal?: () => void;
  onOpenFirebaseConfig: () => void;
  onOpenUserManagement?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenFirebaseConfig,
  onOpenUserManagement
}) => {
  const {
    currentUser,
    userRole,
    permissions,
    logout,
    changeUserRole,
    updateUserProfile,
    isFirebaseConnected
  } = useAuth();

  const currentCompanyVal = currentUser?.company?.includes('Hogar y Moda') || !currentUser?.company ? 'SCJ' : currentUser.company;
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [company, setCompany] = useState(currentCompanyVal);
  const [vehiclePlate, setVehiclePlate] = useState(currentUser?.assignedVehiclePlate || 'WGB-342');
  const [assignedRoute, setAssignedRoute] = useState(currentUser?.assignedRouteId || 'SCJ-001');
  const [roleChangeSuccess, setRoleChangeSuccess] = useState<string | null>(null);

  // Sincronizar estado si currentUser cambia
  React.useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setPhone(currentUser.phone || '');
      setCompany(currentUser.company?.includes('Hogar y Moda') || !currentUser.company ? 'SCJ' : currentUser.company);
      setVehiclePlate(currentUser.assignedVehiclePlate || 'WGB-342');
      setAssignedRoute(currentUser.assignedRouteId || 'SCJ-001');
    }
  }, [currentUser]);

  if (!isOpen || !currentUser) return null;

  const roleDef = ROLE_DEFINITIONS[userRole];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      displayName: displayName.trim(),
      phone: phone.trim(),
      company: company.trim() || 'SCJ',
      assignedVehiclePlate: userRole === 'driver' ? vehiclePlate.trim() : currentUser.assignedVehiclePlate,
      assignedRouteId: userRole === 'driver' ? assignedRoute.trim() : currentUser.assignedRouteId
    });
    setIsEditing(false);
    setRoleChangeSuccess("Perfil actualizado correctamente");
    setTimeout(() => setRoleChangeSuccess(null), 3000);
  };

  const handleQuickRoleSwitch = async (newRole: UserRole) => {
    try {
      await changeUserRole(newRole, {
        assignedVehiclePlate: newRole === 'driver' ? (vehiclePlate || 'WGB-342') : undefined,
        assignedRouteId: newRole === 'driver' ? (assignedRoute || 'SCJ-001') : undefined
      });
      setRoleChangeSuccess(`Rol actualizado a: ${ROLE_DEFINITIONS[newRole].label}`);
      setTimeout(() => setRoleChangeSuccess(null), 3500);
    } catch (e) {
      console.error("Error cambiando de rol:", e);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col my-auto">

        {/* Cabecera */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 border-2 border-white/20 text-white font-black text-2xl flex items-center justify-center shadow-lg uppercase">
              {currentUser.displayName.slice(0, 2) || 'SC'}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-lg text-white truncate">
                {currentUser.displayName}
              </h3>
              <p className="text-xs text-slate-300 truncate font-mono">{currentUser.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${roleDef.badgeClass}`}>
                  {roleDef.label}
                </span>
                {isFirebaseConnected && (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Sincronizado Firestore
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de éxito al cambiar rol o perfil */}
        {roleChangeSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{roleChangeSuccess}</span>
          </div>
        )}

        {/* Contenido */}
        <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">

          {/* ========================================================= */}
          {/* 1. GOBERNANZA DE ROLES Y PERMISOS                         */}
          {/* ========================================================= */}
          {permissions.canManageUsers || userRole === 'admin' || userRole === 'manager' ? (
            <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Control de Usuarios & Seguridad:</span>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                  Panel de Administrador
                </span>
              </div>

              <p className="text-[11px] text-blue-900 leading-snug">
                Solo el Administrador o Gerente puede autorizar nuevos colaboradores, cambiar sus roles y configurar qué páginas puede ver y editar cada usuario.
              </p>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenUserManagement) onOpenUserManagement();
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/25"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Gestionar Usuarios, Roles y Permisos Granulares</span>
              </button>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Rol Operativo Asignado:</span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${roleDef.badgeClass}`}>
                  {roleDef.label}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-snug">
                {roleDef.description}
              </p>

              <div className="pt-1 text-[10px] text-slate-400 italic">
                * Para solicitar cambios de funciones o permisos adicionales de página, contacte a la Gerencia o Administrador.
              </div>
            </div>
          )}

          {/* Configuración especial si el rol actual es Conductor */}
          {userRole === 'driver' && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2.5">
              <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span>Datos del Camión Asignado (Modo Conductor):</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">Placa Vehicular:</label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-emerald-900 block mb-1">Ruta Predeterminada:</label>
                  <input
                    type="text"
                    value={assignedRoute}
                    onChange={(e) => setAssignedRoute(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  updateUserProfile({
                    assignedVehiclePlate: vehiclePlate.trim(),
                    assignedRouteId: assignedRoute.trim()
                  });
                  setRoleChangeSuccess("Datos del vehículo asignado actualizados");
                  setTimeout(() => setRoleChangeSuccess(null), 3000);
                }}
                className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Asignación de Camión</span>
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. DATOS DEL PERFIL Y MODO EDICIÓN                       */}
          {/* ========================================================= */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-3 p-4 border border-blue-200 bg-blue-50/40 rounded-2xl">
              <div className="font-bold text-blue-950 text-xs flex items-center gap-1.5 mb-1">
                <User className="w-4 h-4 text-blue-600" />
                <span>Editar Información de Usuario:</span>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nombre Completo:</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Teléfono / Celular:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+57 300 000 0000"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Área / Sede / Empresa:</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="SCJ"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-200/60 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Correo:</span>
                </span>
                <span className="font-bold text-slate-900 font-mono">{currentUser.email}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/70">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Teléfono:</span>
                </span>
                <span className="font-semibold text-slate-800">{currentUser.phone || 'No registrado'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/70">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sede / Empresa:</span>
                </span>
                <span className="font-semibold text-slate-800">{currentCompanyVal}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/70">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Última conexión:</span>
                </span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2" title="Conectado ahora">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {currentUser.lastLoginAt ? formatDateTime(currentUser.lastLoginAt) : 'Sin registro'}
                </span>
              </div>

              {currentUser.assignedVehiclePlate && (
                <div className="flex items-center justify-between py-1.5 bg-emerald-50 px-2.5 rounded-lg border border-emerald-200">
                  <span className="text-emerald-800 font-medium flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Camión Asignado:</span>
                  </span>
                  <span className="font-bold text-emerald-950 font-mono">{currentUser.assignedVehiclePlate}</span>
                </div>
              )}

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                >
                  Editar mis datos personales
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. MATRIZ DE PERMISOS DEL ROL                            */}
          {/* ========================================================= */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Permisos Habilitados para {roleDef.label}:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className={permissions.canEditRoutes ? 'text-emerald-600 font-bold' : 'text-slate-300'}>
                  {permissions.canEditRoutes ? '✓' : '✕'}
                </span>
                <span className={permissions.canEditRoutes ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}>
                  Editar y Crear Rutas
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={permissions.canCreateDispatches ? 'text-emerald-600 font-bold' : 'text-slate-300'}>
                  {permissions.canCreateDispatches ? '✓' : '✕'}
                </span>
                <span className={permissions.canCreateDispatches ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}>
                  Despachar Camiones
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={permissions.canConfigureCosts ? 'text-emerald-600 font-bold' : 'text-slate-300'}>
                  {permissions.canConfigureCosts ? '✓' : '✕'}
                </span>
                <span className={permissions.canConfigureCosts ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}>
                  Configurar Costos y Salarios
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={permissions.canViewPnl ? 'text-emerald-600 font-bold' : 'text-slate-300'}>
                  {permissions.canViewPnl ? '✓' : '✕'}
                </span>
                <span className={permissions.canViewPnl ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}>
                  Ver Estados P&L y Finanzas
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={permissions.canSyncFirebase ? 'text-emerald-600 font-bold' : 'text-slate-300'}>
                  {permissions.canSyncFirebase ? '✓' : '✕'}
                </span>
                <span className={permissions.canSyncFirebase ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}>
                  Sincronizar Cloud Firebase
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={permissions.canExportReports ? 'text-emerald-600 font-bold' : 'text-slate-300'}>
                  {permissions.canExportReports ? '✓' : '✕'}
                </span>
                <span className={permissions.canExportReports ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}>
                  Exportar CSV e Informes
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Pie del Modal con Acciones de Cuenta */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenFirebaseConfig();
            }}
            className="text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Database className="w-4 h-4 text-blue-600" />
            <span>Base de Datos</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Cierra tu sesión y te regresa al portal de inicio de sesión"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

      </div>
    </div>
  );
};
