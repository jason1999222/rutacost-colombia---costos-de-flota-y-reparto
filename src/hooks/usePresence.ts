import { useEffect, useRef, useState } from 'react';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { initFirebase } from '../services/firebase';
import { FirebaseClientConfig } from '../types/auth';

const PRESENCE_INTERVAL_MS = 30000; // Actualizar cada 30 segundos
const ONLINE_THRESHOLD_MS = 60000; // Considerar "en línea" si la última actividad fue hace menos de 60s

/**
 * Escribe el estado de presencia de un usuario en Firestore.
 *
 * - Colección `presence/{uid}`: isOnline + lastSeenAt (serverTimestamp) para los
 *   indicadores en tiempo real del panel de gestión de usuarios.
 * - Documento `users/{uid}`: isOnline + lastSeenAt (ISO) y, si es el inicio de
 *   sesión, también lastLoginAt. Así el perfil de cada usuario queda con la
 *   última conexión registrada aunque se cierre la app sin cerrar sesión.
 */
export async function setPresenceStatus(
  uid: string,
  firebaseConfig: FirebaseClientConfig | null | undefined,
  isOnline: boolean,
  isLogin: boolean = false
): Promise<void> {
  if (!uid || !firebaseConfig) return;

  const { db } = initFirebase(firebaseConfig);
  if (!db) return;

  const nowIso = new Date().toISOString();
  const userUpdate: Record<string, unknown> = { isOnline, lastSeenAt: nowIso };
  if (isLogin) {
    userUpdate.lastLoginAt = nowIso;
  }

  try {
    await Promise.all([
      setDoc(
        doc(db, 'presence', uid),
        { isOnline, lastSeenAt: serverTimestamp(), uid },
        { merge: true }
      ),
      setDoc(doc(db, 'users', uid), userUpdate, { merge: true })
    ]);
  } catch (e) {
    console.warn('Error actualizando presencia:', e);
  }
}

/**
 * Hook para manejar la presencia en tiempo real del usuario actual.
 *
 * - Al iniciar sesión: marca `isOnline: true` y registra `lastLoginAt` en su perfil.
 * - Cada 30 segundos (heartbeat): actualiza `lastSeenAt` mientras la app esté abierta.
 * - Al cerrar sesión o la página: marca `isOnline: false` y guarda la última conexión.
 *
 * Si el navegador se cierra abruptamente, el usuario queda automáticamente como
 * "sin conexión" cuando su `lastSeenAt` supere el umbral de 60 segundos.
 *
 * @param uid - UID del usuario actual
 * @param isAuthenticated - Si el usuario está autenticado
 * @param firebaseConfig - Configuración de Firebase
 */
export function usePresence(
  uid: string | undefined,
  isAuthenticated: boolean,
  firebaseConfig: FirebaseClientConfig | null
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!uid || !isAuthenticated || !firebaseConfig) return;

    // Marcar en línea y registrar la última conexión en el perfil (inicio de sesión)
    setPresenceStatus(uid, firebaseConfig, true, true);

    // Heartbeat: mantener lastSeenAt fresco mientras la app esté abierta
    intervalRef.current = setInterval(() => {
      setPresenceStatus(uid, firebaseConfig, true, false);
    }, PRESENCE_INTERVAL_MS);

    // Marcar desconectado al cerrar o recargar la página.
    // 'pagehide' es más confiable que 'beforeunload' en móviles y navegadores modernos.
    const handleLeave = () => {
      setPresenceStatus(uid, firebaseConfig, false);
    };
    window.addEventListener('pagehide', handleLeave);
    window.addEventListener('beforeunload', handleLeave);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('pagehide', handleLeave);
      window.removeEventListener('beforeunload', handleLeave);
      // Marcar desconectado al cerrar sesión o desmontar (queda la última conexión)
      setPresenceStatus(uid, firebaseConfig, false);
    };
  }, [uid, isAuthenticated, firebaseConfig]);
}

/**
 * Hook para escuchar la presencia de un usuario específico en tiempo real.
 *
 * @param targetUid - UID del usuario a escuchar
 * @param firebaseConfig - Configuración de Firebase
 * @returns Estado de presencia del usuario (se actualiza con cada snapshot)
 */
export function useUserPresence(
  targetUid: string | null,
  firebaseConfig: FirebaseClientConfig | null
): { isOnline: boolean; lastSeenAt: Date | null } {
  const [presence, setPresence] = useState<{ isOnline: boolean; lastSeenAt: Date | null }>({
    isOnline: false,
    lastSeenAt: null,
  });

  useEffect(() => {
    if (!targetUid || !firebaseConfig) return;

    const { db } = initFirebase(firebaseConfig);
    if (!db) return;

    const unsubscribe = onSnapshot(
      doc(db, 'presence', targetUid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const lastSeen = data.lastSeenAt?.toDate?.() || null;
          const isOnline = data.isOnline && lastSeen
            ? (Date.now() - lastSeen.getTime()) < ONLINE_THRESHOLD_MS
            : false;
          setPresence({ isOnline, lastSeenAt: lastSeen });
        } else {
          setPresence({ isOnline: false, lastSeenAt: null });
        }
      },
      (err) => {
        console.warn('Error escuchando presencia:', err);
      }
    );

    return () => unsubscribe();
  }, [targetUid, firebaseConfig]);

  return presence;
}

/**
 * Formatea una fecha como "hace X minutos/horas/días".
 *
 * @param date - Fecha a formatear
 * @returns String con el tiempo transcurrido
 */
export function formatLastSeen(date: Date | null): string {
  if (!date) return 'Nunca';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'Ahora mismo';
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;

  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formatea una fecha ISO en fecha y hora legible en español (Colombia).
 * Ej: "29 sept 2026, 08:27 p. m."
 */
export function formatDateTime(iso: string | undefined): string {
  if (!iso) return 'Sin registro';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'Sin registro';
  return d.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}
