export type UserRole = 'admin' | 'manager' | 'dispatcher' | 'driver' | 'auditor';

export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface RolePermissions {
  // Módulo 1: Despachos & Salidas
  canViewDispatch: boolean;
  canEditDispatch: boolean;
  canCreateDispatches: boolean; // Alias compatibilidad
  canSettleVehicles: boolean;   // Alias compatibilidad

  // Módulo 2: Rutas, Mapa & Fletes
  canViewRoutes: boolean;
  canEditRoutes: boolean;

  // Módulo 3: Base de Cálculo & Nómina
  canViewCalcBasis: boolean;
  canEditCalcBasis: boolean;
  canConfigureCosts: boolean;   // Alias compatibilidad

  // Módulo 4: Base de Datos (Personal, Vehículos, Tiendas)
  canViewDatabase: boolean;
  canEditDatabase: boolean;

  // Módulo 5: P&L y Ganancias
  canViewPnl: boolean;

  // Módulo 6: Seguridad & Administración
  canManageUsers: boolean;
  canSyncFirebase: boolean;
  canExportReports: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  photoURL?: string;
  company?: string;
  assignedVehiclePlate?: string; // Para conductores (ej: "WGB-342")
  assignedRouteId?: string; // Para conductores (ej: "SCJ-001")
  customPermissions?: Partial<RolePermissions>;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  createdAt: string;
  lastLoginAt?: string;
  isOnline?: boolean; // Estado de conexión en tiempo real
  lastSeenAt?: string; // Última vez que el usuario estuvo activo
}

export const ROLE_DEFINITIONS: Record<UserRole, {
  label: string;
  description: string;
  color: string;
  bgLight: string;
  borderLight: string;
  badgeClass: string;
  permissions: RolePermissions;
}> = {
  admin: {
    label: 'Administrador / Gerencia',
    description: 'Control absoluto del sistema, gestión de perfiles de usuario, roles, asignación de permisos por página, costos, nómina y sincronización Cloud.',
    color: 'text-rose-700',
    bgLight: 'bg-rose-50',
    borderLight: 'border-rose-200',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    permissions: {
      canViewDispatch: true,
      canEditDispatch: true,
      canCreateDispatches: true,
      canSettleVehicles: true,
      canViewRoutes: true,
      canEditRoutes: true,
      canViewCalcBasis: true,
      canEditCalcBasis: true,
      canConfigureCosts: true,
      canViewDatabase: true,
      canEditDatabase: true,
      canViewPnl: true,
      canManageUsers: true,
      canSyncFirebase: true,
      canExportReports: true,
    }
  },
  manager: {
    label: 'Gerente de Operaciones',
    description: 'Supervisión integral de logística y despachos, autorización de colaboradores, asignación de camiones, balance P&L y auditoría.',
    color: 'text-indigo-700',
    bgLight: 'bg-indigo-50',
    borderLight: 'border-indigo-200',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    permissions: {
      canViewDispatch: true,
      canEditDispatch: true,
      canCreateDispatches: true,
      canSettleVehicles: true,
      canViewRoutes: true,
      canEditRoutes: true,
      canViewCalcBasis: true,
      canEditCalcBasis: true,
      canConfigureCosts: true,
      canViewDatabase: true,
      canEditDatabase: true,
      canViewPnl: true,
      canManageUsers: true,
      canSyncFirebase: true,
      canExportReports: true,
    }
  },
  dispatcher: {
    label: 'Coordinador de Despacho',
    description: 'Gestión operativa de rutas diarias, asignación de camiones, registro de salidas con odómetro, entradas y despacho por WhatsApp.',
    color: 'text-blue-700',
    bgLight: 'bg-blue-50',
    borderLight: 'border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    permissions: {
      canViewDispatch: true,
      canEditDispatch: true,
      canCreateDispatches: true,
      canSettleVehicles: true,
      canViewRoutes: true,
      canEditRoutes: true,
      canViewCalcBasis: false,
      canEditCalcBasis: false,
      canConfigureCosts: false,
      canViewDatabase: true,
      canEditDatabase: false,
      canViewPnl: false,
      canManageUsers: false,
      canSyncFirebase: false,
      canExportReports: true,
    }
  },
  driver: {
    label: 'Conductor / Operador',
    description: 'Visualización de hoja de ruta asignada, mapa interactivo de paradas en tiendas Hogar y Moda, peajes en efectivo e inicio de navegación GPS.',
    color: 'text-emerald-700',
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-200',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    permissions: {
      canViewDispatch: true,
      canEditDispatch: false,
      canCreateDispatches: false,
      canSettleVehicles: false,
      canViewRoutes: true,
      canEditRoutes: false,
      canViewCalcBasis: false,
      canEditCalcBasis: false,
      canConfigureCosts: false,
      canViewDatabase: false,
      canEditDatabase: false,
      canViewPnl: false,
      canManageUsers: false,
      canSyncFirebase: false,
      canExportReports: false,
    }
  },
  auditor: {
    label: 'Auditor Financiero',
    description: 'Acceso de solo lectura a balances P&L, márgenes de flete, histórico de liquidaciones y exportación de informes fiscales.',
    color: 'text-purple-700',
    bgLight: 'bg-purple-50',
    borderLight: 'border-purple-200',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    permissions: {
      canViewDispatch: true,
      canEditDispatch: false,
      canCreateDispatches: false,
      canSettleVehicles: false,
      canViewRoutes: true,
      canEditRoutes: false,
      canViewCalcBasis: true,
      canEditCalcBasis: false,
      canConfigureCosts: false,
      canViewDatabase: true,
      canEditDatabase: false,
      canViewPnl: true,
      canManageUsers: false,
      canSyncFirebase: false,
      canExportReports: true,
    }
  }
};

export function getEffectivePermissions(user: UserProfile | null): RolePermissions {
  if (!user) return ROLE_DEFINITIONS.dispatcher.permissions;
  const base = ROLE_DEFINITIONS[user.role]?.permissions || ROLE_DEFINITIONS.dispatcher.permissions;
  if (!user.customPermissions) return base;

  const merged = { ...base, ...user.customPermissions };
  // Sincronizar alias si fueron sobrescritos
  if (user.customPermissions.canEditDispatch !== undefined) {
    merged.canCreateDispatches = user.customPermissions.canEditDispatch;
    merged.canSettleVehicles = user.customPermissions.canEditDispatch;
  }
  if (user.customPermissions.canEditCalcBasis !== undefined) {
    merged.canConfigureCosts = user.customPermissions.canEditCalcBasis;
  }
  return merged;
}

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}
