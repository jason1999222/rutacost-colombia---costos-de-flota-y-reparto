import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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
  DEMO_USERS, 
  getStoredFirebaseConfig, 
  saveFirebaseConfig, 
  clearFirebaseConfig, 
  initFirebase,
  fetchAllUsersFromFirestore,
  updateUserInFirestore,
  deleteUserFromFirestore,
  sanitizeForFirestore,
  isSuperAdminEmail
} from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { usePresence, setPresenceStatus } from '../hooks/usePresence';

export interface RegisterUserData {
  email: string;
  pass: string;
  name: string;
  role: UserRole;
  phone?: string;
  company?: string;
  assignedVehiclePlate?: string;
  assignedRouteId?: string;
}

export const getFirebaseErrorMessage = (err: any): string => {
  const code = err?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Correo o contraseña incorrectos. Verifica tus datos o recupera tu contraseña.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta registrada con este correo electrónico. Por favor inicia sesión o recupera tu cuenta.';
    case 'auth/weak-password':
      return 'La contraseña es muy corta o débil. Debe tener al menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'El formato del correo electrónico no es válido.';
    case 'auth/network-request-failed':
      return 'Error de conexión a internet con Firebase. Revisa tu red.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos consecutivos. Por seguridad, espera unos minutos o recupera tu contraseña.';
    case 'auth/operation-not-allowed':
      return 'El método de inicio de sesión con Correo/Contraseña no está habilitado en Firebase Console. Por favor actívalo en Authentication > Sign-in method.';
    default:
      return err?.message || 'Error en la autenticación. Intenta nuevamente.';
  }
};

interface AuthContextType {
  currentUser: UserProfile | null;
  userRole: UserRole;
  permissions: RolePermissions;
  isFirebaseConnected: boolean;
  firebaseConfig: FirebaseClientConfig | null;
  authLoading: boolean;
  allUsers: UserProfile[];
  pendingUsersCount: number;
  loginAsDemoUser: (role: UserRole) => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (data: RegisterUserData) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  changeUserRole: (newRole: UserRole, extra?: { assignedVehiclePlate?: string; assignedRouteId?: string }) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  refreshCurrentUser: () => Promise<UserProfile | null>;
  refreshAllUsers: () => Promise<void>;
  approveUser: (
    uid: string, 
    assignedRole: UserRole, 
    customPermissions?: Partial<RolePermissions>, 
    extra?: { assignedVehiclePlate?: string; assignedRouteId?: string }
  ) => Promise<void>;
  rejectUser: (uid: string) => Promise<void>;
  updateUserByAdmin: (uid: string, updates: Partial<UserProfile>) => Promise<void>;
  deleteUserByAdmin: (uid: string) => Promise<void>;
  saveNewFirebaseConfig: (config: FirebaseClientConfig) => boolean;
  disconnectFirebase: () => void;
  inactivityWarning: boolean;
  inactivitySecondsLeft: number;
  extendSession: () => void;
  sessionExpiredNotice: string | null;
  clearSessionExpiredNotice: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_STORAGE_KEY = 'scj_active_user';
const LAST_ACTIVITY_KEY = 'scj_last_activity_time';
const SESSION_EXPIRED_KEY = 'scj_session_expired_notice';
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos de inactividad
const WARNING_THRESHOLD_MS = 60 * 1000; // Alerta 60 segundos antes

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseClientConfig | null>(() => getStoredFirebaseConfig());
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Estado del aviso de expiración de sesión
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState<string | null>(() => {
    return localStorage.getItem(SESSION_EXPIRED_KEY);
  });
  const [inactivityWarning, setInactivityWarning] = useState<boolean>(false);
  const [inactivitySecondsLeft, setInactivitySecondsLeft] = useState<number>(60);
  const lastActivityRef = useRef<number>(Date.now());
  const isLoggingOutRef = useRef<boolean>(false);

  const clearSessionExpiredNotice = () => {
    localStorage.removeItem(SESSION_EXPIRED_KEY);
    setSessionExpiredNotice(null);
  };

  const extendSession = () => {
    const now = Date.now();
    lastActivityRef.current = now;
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    setInactivityWarning(false);
    setInactivitySecondsLeft(60);
  };

  // Sesión del usuario actual (inicia desde localStorage sólo si no ha expirado el tiempo de inactividad)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(LOCAL_USER_STORAGE_KEY);
    const lastActivityStr = localStorage.getItem(LAST_ACTIVITY_KEY);
    const now = Date.now();

    if (saved && lastActivityStr) {
      const lastActivity = Number(lastActivityStr);
      if (now - lastActivity > INACTIVITY_TIMEOUT_MS) {
        // La sesión expiró por tiempo prolongado fuera del sistema
        localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
        localStorage.setItem(SESSION_EXPIRED_KEY, 'inactivity');
        return null;
      }
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.uid && parsed.role && !parsed.uid.startsWith('demo-')) {
          const cleanEmail = (parsed.email || '').toLowerCase().trim();
          const isSuperAdmin = cleanEmail === 'jacson.munoz@gmail.com';
          return {
            ...parsed,
            role: isSuperAdmin ? 'admin' : parsed.role,
            status: isSuperAdmin ? 'approved' : (parsed.status || 'approved')
          };
        }
      } catch (e) {}
    }
    return null;
  });

  // Guardar en localStorage cuando cambia currentUser
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
    }
  }, [currentUser]);

  // Actualizar presencia en tiempo real (isOnline + lastSeenAt en Firestore)
  usePresence(
    currentUser && !currentUser.uid.startsWith('demo-') && !currentUser.uid.startsWith('local-') ? currentUser.uid : undefined,
    !!currentUser,
    firebaseConfig
  );

  // Cerrar sesión automáticamente por inactividad o tiempo fuera del sistema
  const handleAutoLogout = async (reason = 'inactivity') => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;
    setInactivityWarning(false);

    if (currentUser && !currentUser.uid.startsWith('demo-') && !currentUser.uid.startsWith('local-')) {
      await setPresenceStatus(currentUser.uid, firebaseConfig, false).catch(() => {});
    }

    const { auth } = initFirebase(firebaseConfig);
    if (auth) {
      try {
        await fbSignOut(auth);
      } catch (e) {}
    }
    localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
    localStorage.setItem(SESSION_EXPIRED_KEY, reason);
    setSessionExpiredNotice(reason);
    setCurrentUser(null);
    isLoggingOutRef.current = false;
  };

  // Detector de Inactividad y Presencia del Usuario (15 minutos)
  useEffect(() => {
    if (!currentUser) {
      setInactivityWarning(false);
      return;
    }

    const now = Date.now();
    lastActivityRef.current = now;
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now));

    let lastUpdateStorage = now;
    const onUserInteraction = () => {
      const cur = Date.now();
      lastActivityRef.current = cur;
      if (inactivityWarning) {
        setInactivityWarning(false);
      }
      if (cur - lastUpdateStorage > 5000) {
        lastUpdateStorage = cur;
        localStorage.setItem(LAST_ACTIVITY_KEY, String(cur));
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(evt => window.addEventListener(evt, onUserInteraction, { passive: true }));

    // Validar cuando el usuario vuelve a abrir o enfocar la pestaña
    const onVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        const stored = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || Date.now());
        const elapsed = Date.now() - Math.max(lastActivityRef.current, stored);
        if (elapsed >= INACTIVITY_TIMEOUT_MS) {
          handleAutoLogout('inactivity');
        } else {
          const fresh = Date.now();
          lastActivityRef.current = fresh;
          localStorage.setItem(LAST_ACTIVITY_KEY, String(fresh));
        }
      }
    };

    document.addEventListener('visibilitychange', onVisibilityOrFocus);
    window.addEventListener('focus', onVisibilityOrFocus);

    // Verificador periódico de inactividad cada 1 segundo
    const timer = setInterval(() => {
      const cur = Date.now();
      const stored = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || cur);
      const effectiveLast = Math.max(lastActivityRef.current, stored);
      const elapsed = cur - effectiveLast;
      const remainingMs = INACTIVITY_TIMEOUT_MS - elapsed;

      if (remainingMs <= 0) {
        clearInterval(timer);
        handleAutoLogout('inactivity');
      } else if (remainingMs <= WARNING_THRESHOLD_MS) {
        setInactivityWarning(true);
        setInactivitySecondsLeft(Math.ceil(remainingMs / 1000));
      } else {
        if (inactivityWarning) {
          setInactivityWarning(false);
        }
      }
    }, 1000);

    return () => {
      events.forEach(evt => window.removeEventListener(evt, onUserInteraction));
      document.removeEventListener('visibilitychange', onVisibilityOrFocus);
      window.removeEventListener('focus', onVisibilityOrFocus);
      clearInterval(timer);
    };
  }, [currentUser]);

  const isRegisteringRef = useRef<boolean>(false);

  // Listener oficial de Firebase Authentication
  useEffect(() => {
    const { app, auth, db } = initFirebase(firebaseConfig);
    if (app && auth) {
      setIsFirebaseConnected(true);

      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          if (isRegisteringRef.current) {
            setAuthLoading(false);
            return;
          }

          // Si el usuario estuvo inactivo por más de 15 minutos, forzar reingreso
          const lastActivityStr = localStorage.getItem(LAST_ACTIVITY_KEY);
          const isExpired = localStorage.getItem(SESSION_EXPIRED_KEY) === 'inactivity' || 
            (lastActivityStr && Date.now() - Number(lastActivityStr) > INACTIVITY_TIMEOUT_MS);

          if (isExpired) {
            fbSignOut(auth).catch(() => {});
            localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
            setAuthLoading(false);
            return;
          }

          try {
            const cleanEmail = (fbUser.email || '').toLowerCase().trim();
            const isSuperAdmin = isSuperAdminEmail(cleanEmail);

            if (db) {
              const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
              if (userDoc.exists()) {
                const data = userDoc.data() as UserProfile;
                const synced: UserProfile = {
                  ...data,
                  uid: fbUser.uid,
                  email: fbUser.email || cleanEmail,
                  displayName: data.displayName || fbUser.displayName || cleanEmail.split('@')[0],
                  company: (!data.company || data.company.includes('Hogar y Moda')) ? 'SCJ' : data.company,
                  role: isSuperAdmin ? 'admin' : (data.role || 'dispatcher'),
                  status: isSuperAdmin ? 'approved' : (data.status || 'pending')
                };
                // La sesión actual (incluida la restaurada al reabrir el navegador)
                // queda registrada como última conexión del perfil
                setCurrentUser({ ...synced, lastLoginAt: new Date().toISOString() });
                setAuthLoading(false);
                return;
              }
            }

            // Si es un usuario recién autenticado sin doc en Firestore
            const newProfile: UserProfile = {
              uid: fbUser.uid,
              email: cleanEmail,
              displayName: fbUser.displayName || cleanEmail.split('@')[0] || 'Usuario',
              role: isSuperAdmin ? 'admin' : 'dispatcher',
              status: isSuperAdmin ? 'approved' : 'pending',
              company: 'SCJ',
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            };

            if (db) {
              await setDoc(doc(db, 'users', fbUser.uid), sanitizeForFirestore(newProfile), { merge: true });
            }
            setCurrentUser(newProfile);
          } catch (e) {
            console.error("Error sincronizando perfil de usuario desde Firestore:", e);
          }
        }
        setAuthLoading(false);
      });

      return () => unsubscribe();
    } else {
      setIsFirebaseConnected(false);
      setAuthLoading(false);
    }
  }, [firebaseConfig]);

  // Cargar lista de usuarios si el usuario activo tiene rol administrador o gerente
  const refreshAllUsers = async () => {
    try {
      const users = await fetchAllUsersFromFirestore();
      setAllUsers(users);
    } catch (e) {
      console.error("Error refrescando lista de usuarios:", e);
    }
  };

  useEffect(() => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager')) {
      refreshAllUsers();
    }
  }, [currentUser?.uid, currentUser?.role]);

  // Refrescar datos del usuario actual desde Firestore (útil para comprobar aprobación)
  const refreshCurrentUser = async (): Promise<UserProfile | null> => {
    if (!currentUser) return null;
    const { db } = initFirebase(firebaseConfig);
    if (db && !currentUser.uid.startsWith('demo-') && !currentUser.uid.startsWith('local-')) {
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          const cleanEmail = (currentUser.email || '').toLowerCase().trim();
          const isSuperAdmin = cleanEmail === 'jacson.munoz@gmail.com';
          const updated: UserProfile = {
            ...data,
            uid: currentUser.uid,
            role: isSuperAdmin ? 'admin' : (data.role || 'dispatcher'),
            status: isSuperAdmin ? 'approved' : (data.status || 'pending')
          };
          setCurrentUser(updated);
          return updated;
        }
      } catch (e) {
        console.error("Error refrescando usuario actual:", e);
      }
    }
    return currentUser;
  };

  // Iniciar sesión con email y contraseña
  const loginWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const isSuperAdmin = isSuperAdminEmail(cleanEmail);
    const { auth, db } = initFirebase(firebaseConfig);

    if (auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        if (db) {
          const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            const profile: UserProfile = {
              ...data,
              uid: cred.user.uid,
              role: isSuperAdmin ? 'admin' : (data.role || 'dispatcher'),
              status: isSuperAdmin ? 'approved' : (data.status || 'pending'),
              lastLoginAt: new Date().toISOString()
            };
            setCurrentUser(profile);
            setDoc(doc(db, 'users', cred.user.uid), { lastLoginAt: new Date().toISOString() }, { merge: true }).catch(() => {});
            return;
          }
        }
        const profile: UserProfile = {
          uid: cred.user.uid,
          email: cred.user.email || cleanEmail,
          displayName: cred.user.displayName || cleanEmail.split('@')[0],
          role: isSuperAdmin ? 'admin' : 'dispatcher',
          status: isSuperAdmin ? 'approved' : 'pending',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        setCurrentUser(profile);
      } catch (err: any) {
        throw new Error(getFirebaseErrorMessage(err));
      }
    } else {
      // Modo local si no hay Firebase configurado
      const demo = DEMO_USERS.find(u => u.email.toLowerCase() === cleanEmail);
      if (demo) {
        setCurrentUser({ ...demo, lastLoginAt: new Date().toISOString() });
      } else {
        const localUser: UserProfile = {
          uid: `local-${Date.now()}`,
          email: cleanEmail,
          displayName: cleanEmail.split('@')[0],
          role: isSuperAdmin ? 'admin' : 'dispatcher',
          status: isSuperAdmin ? 'approved' : 'pending',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        setCurrentUser(localUser);
      }
    }
  };

  // Crear y registrar nueva cuenta
  // IMPORTANTE: Nuevas cuentas creadas entran en status: 'pending' (salvo el superadmin)
  const registerWithEmail = async (data: RegisterUserData) => {
    isRegisteringRef.current = true;
    const cleanEmail = data.email.trim().toLowerCase();
    const isSuperAdmin = isSuperAdminEmail(cleanEmail);
    const { auth, db } = initFirebase(firebaseConfig);

    if (auth) {
      try {
        let targetUid = '';
        try {
          const cred = await createUserWithEmailAndPassword(auth, cleanEmail, data.pass);
          targetUid = cred.user.uid;
          await updateProfile(cred.user, { displayName: data.name.trim() });
        } catch (authErr: any) {
          if (authErr?.code === 'auth/email-already-in-use') {
            try {
              const signCred = await signInWithEmailAndPassword(auth, cleanEmail, data.pass);
              targetUid = signCred.user.uid;
              await updateProfile(signCred.user, { displayName: data.name.trim() });
            } catch (signErr) {
              if (auth.currentUser?.email?.toLowerCase() === cleanEmail) {
                targetUid = auth.currentUser.uid;
              } else {
                throw authErr;
              }
            }
          } else {
            throw authErr;
          }
        }

        const newProfile: UserProfile = {
          uid: targetUid,
          email: cleanEmail,
          displayName: data.name.trim(),
          role: isSuperAdmin ? 'admin' : (data.role || 'dispatcher'),
          status: isSuperAdmin ? 'approved' : 'pending',
          phone: data.phone?.trim() || '',
          company: data.company?.trim() || 'SCJ',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };

        if (data.assignedVehiclePlate?.trim()) {
          newProfile.assignedVehiclePlate = data.assignedVehiclePlate.trim();
        }
        if (data.assignedRouteId?.trim()) {
          newProfile.assignedRouteId = data.assignedRouteId.trim();
        }

        if (db && targetUid) {
          await setDoc(doc(db, 'users', targetUid), sanitizeForFirestore(newProfile), { merge: true });
        }
        setCurrentUser(newProfile);
      } catch (err: any) {
        throw new Error(getFirebaseErrorMessage(err));
      } finally {
        isRegisteringRef.current = false;
      }
    } else {
      const localUser: UserProfile = {
        uid: `local-${Date.now()}`,
        email: cleanEmail,
        displayName: data.name.trim(),
        role: isSuperAdmin ? 'admin' : (data.role || 'dispatcher'),
        status: isSuperAdmin ? 'approved' : 'pending',
        phone: data.phone?.trim() || '',
        company: data.company?.trim() || 'SCJ',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      if (data.assignedVehiclePlate?.trim()) {
        localUser.assignedVehiclePlate = data.assignedVehiclePlate.trim();
      }
      if (data.assignedRouteId?.trim()) {
        localUser.assignedRouteId = data.assignedRouteId.trim();
      }
      setCurrentUser(localUser);
      isRegisteringRef.current = false;
    }
  };

  // Cambiar rol operativo de trabajo (solo permitido a administradores o gerencia)
  const changeUserRole = async (newRole: UserRole, extra?: { assignedVehiclePlate?: string; assignedRouteId?: string }) => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      role: newRole,
      assignedVehiclePlate: extra?.assignedVehiclePlate !== undefined ? extra.assignedVehiclePlate : currentUser.assignedVehiclePlate,
      assignedRouteId: extra?.assignedRouteId !== undefined ? extra.assignedRouteId : currentUser.assignedRouteId,
      lastLoginAt: new Date().toISOString()
    };
    setCurrentUser(updated);

    const { db } = initFirebase(firebaseConfig);
    if (db && !currentUser.uid.startsWith('demo-') && !currentUser.uid.startsWith('local-')) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), sanitizeForFirestore(updated), { merge: true });
      } catch (e) {
        console.error("Error actualizando rol en Firestore:", e);
      }
    }
  };

  // Enviar correo de recuperación
  const sendPasswordReset = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const { auth } = initFirebase(firebaseConfig);
    if (auth) {
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
      } catch (err: any) {
        throw new Error(getFirebaseErrorMessage(err));
      }
    } else {
      console.log(`[Modo Local] Correo de recuperación a: ${cleanEmail}`);
    }
  };

  // Demostración
  const loginAsDemoUser = (role: UserRole) => {
    const found = DEMO_USERS.find(u => u.role === role) || DEMO_USERS[0];
    setCurrentUser({
      ...found,
      lastLoginAt: new Date().toISOString()
    });
  };

  // Cerrar sesión
  const logout = async () => {
    clearSessionExpiredNotice();
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    // Registrar la desconexión en Firebase (última conexión en el perfil)
    // antes de cerrar la sesión del usuario
    if (currentUser && !currentUser.uid.startsWith('demo-') && !currentUser.uid.startsWith('local-')) {
      await setPresenceStatus(currentUser.uid, firebaseConfig, false);
    }

    const { auth } = initFirebase(firebaseConfig);
    if (auth) {
      try {
        await fbSignOut(auth);
      } catch (e) {}
    }
    localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
    setCurrentUser(null);
  };

  // Actualizar datos personales de la cuenta propia (Nombre, Teléfono, Sede)
  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      // Seguridad: Un usuario común NO puede cambiar su propio rol ni su estado mediante este método
      const safeUpdates: Partial<UserProfile> = {
        displayName: updates.displayName !== undefined ? updates.displayName : prev.displayName,
        phone: updates.phone !== undefined ? updates.phone : prev.phone,
        company: updates.company !== undefined ? updates.company : prev.company,
        photoURL: updates.photoURL !== undefined ? updates.photoURL : prev.photoURL,
        assignedVehiclePlate: updates.assignedVehiclePlate !== undefined ? updates.assignedVehiclePlate : prev.assignedVehiclePlate,
        assignedRouteId: updates.assignedRouteId !== undefined ? updates.assignedRouteId : prev.assignedRouteId,
      };

      const updated = { ...prev, ...safeUpdates };
      const { db } = initFirebase(firebaseConfig);
      if (db && !prev.uid.startsWith('demo-') && !prev.uid.startsWith('local-')) {
        setDoc(doc(db, 'users', prev.uid), sanitizeForFirestore(safeUpdates), { merge: true }).catch(console.error);
      }
      return updated;
    });
  };

  // =========================================================================
  // GESTIÓN DE USUARIOS POR PARTE DEL ADMINISTRADOR O GERENTE
  // =========================================================================

  // Aprobar un usuario pendiente
  const approveUser = async (
    uid: string, 
    assignedRole: UserRole, 
    customPermissions?: Partial<RolePermissions>, 
    extra?: { assignedVehiclePlate?: string; assignedRouteId?: string }
  ) => {
    const updates: Partial<UserProfile> = {
      status: 'approved',
      role: assignedRole,
      customPermissions: customPermissions || undefined,
      assignedVehiclePlate: extra?.assignedVehiclePlate?.trim() || undefined,
      assignedRouteId: extra?.assignedRouteId?.trim() || undefined,
      approvedBy: currentUser?.uid,
      approvedByName: currentUser?.displayName || currentUser?.email || 'Administrador',
      approvedAt: new Date().toISOString()
    };
    await updateUserInFirestore(uid, updates);
    setAllUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...updates } : u));
  };

  // Rechazar / Bloquear acceso a un usuario
  const rejectUser = async (uid: string) => {
    const updates: Partial<UserProfile> = {
      status: 'rejected',
      approvedBy: currentUser?.uid,
      approvedByName: currentUser?.displayName || currentUser?.email || 'Administrador',
      approvedAt: new Date().toISOString()
    };
    await updateUserInFirestore(uid, updates);
    setAllUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...updates } : u));
  };

  // Modificar rol, permisos por página y datos de cualquier usuario
  const updateUserByAdmin = async (uid: string, updates: Partial<UserProfile>) => {
    await updateUserInFirestore(uid, updates);
    setAllUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...updates } : u));
    if (currentUser?.uid === uid) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  // Eliminar usuario
  const deleteUserByAdmin = async (uid: string) => {
    await deleteUserFromFirestore(uid);
    setAllUsers(prev => prev.filter(u => u.uid !== uid));
  };

  const saveNewFirebaseConfig = (config: FirebaseClientConfig): boolean => {
    saveFirebaseConfig(config);
    setFirebaseConfig(config);
    const { app } = initFirebase(config);
    return !!app;
  };

  const disconnectFirebase = () => {
    clearFirebaseConfig();
    setFirebaseConfig(null);
    setIsFirebaseConnected(false);
  };

  const userRole: UserRole = currentUser?.role || 'dispatcher';
  const permissions: RolePermissions = getEffectivePermissions(currentUser);
  const pendingUsersCount = allUsers.filter(u => u.status === 'pending').length;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userRole,
        permissions,
        isFirebaseConnected,
        firebaseConfig,
        authLoading,
        allUsers,
        pendingUsersCount,
        loginAsDemoUser,
        loginWithEmail,
        registerWithEmail,
        sendPasswordReset,
        logout,
        changeUserRole,
        updateUserProfile,
        refreshCurrentUser,
        refreshAllUsers,
        approveUser,
        rejectUser,
        updateUserByAdmin,
        deleteUserByAdmin,
        saveNewFirebaseConfig,
        disconnectFirebase,
        inactivityWarning,
        inactivitySecondsLeft,
        extendSession,
        sessionExpiredNotice,
        clearSessionExpiredNotice
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
