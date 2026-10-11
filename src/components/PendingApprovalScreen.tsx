import React, { useState } from 'react';
import { UserProfile, ROLE_DEFINITIONS } from '../types/auth';
import { 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  RotateCw, 
  LogOut, 
  Mail, 
  Phone, 
  Building2, 
  UserCheck, 
  Truck,
  AlertTriangle,
  Lock
} from 'lucide-react';

interface PendingApprovalScreenProps {
  user: UserProfile;
  onRefreshStatus: () => Promise<UserProfile | null>;
  onLogout: () => Promise<void>;
}

export const PendingApprovalScreen: React.FC<PendingApprovalScreenProps> = ({
  user,
  onRefreshStatus,
  onLogout
}) => {
  const [checking, setChecking] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isSuccess: boolean } | null>(null);

  const roleDef = ROLE_DEFINITIONS[user.role] || ROLE_DEFINITIONS.dispatcher;
  const isRejected = user.status === 'rejected';

  const handleCheckNow = async () => {
    setChecking(true);
    setFeedbackMsg(null);
    try {
      const updated = await onRefreshStatus();
      if (updated && updated.status === 'approved') {
        setFeedbackMsg({
          text: '¡Tu cuenta ha sido aprobada por la administración! Ingresando al sistema...',
          isSuccess: true
        });
      } else if (updated && updated.status === 'rejected') {
        setFeedbackMsg({
          text: 'Tu solicitud de acceso ha sido rechazada por la administración.',
          isSuccess: false
        });
      } else {
        setFeedbackMsg({
          text: 'Tu solicitud sigue en proceso de revisión por el Administrador. Por favor espera o reintenta más tarde.',
          isSuccess: false
        });
      }
    } catch (e) {
      setFeedbackMsg({
        text: 'No se pudo conectar con el servidor. Revisa tu conexión a internet.',
        isSuccess: false
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col justify-between p-4 sm:p-6 text-slate-100 select-none relative overflow-hidden">
      
      {/* Luces y Resplandores de Fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Cabecera Superior Corporativa */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-500/30">
            SCJ
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
              <span>SCJ Transportes</span>
              <span className="text-blue-400 font-semibold text-xs font-sans">· Control de Flota</span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Operador Logístico de Transporte · SCJ Independiente
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/80 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span>Cerrar Sesión</span>
        </button>
      </header>

      {/* Contenido Central: Tarjeta de Estado de Autorización */}
      <main className="max-w-md w-full mx-auto my-auto relative z-10">
        <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 text-center relative overflow-hidden">
          
          {/* Barra superior de acento */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${
            isRejected 
              ? 'bg-gradient-to-r from-rose-500 via-red-600 to-rose-700' 
              : 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 animate-pulse'
          }`} />

          {/* Ícono de Estado */}
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center relative shadow-lg">
            {isRejected ? (
              <div className="w-full h-full rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-full h-full rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
            )}
          </div>

          {/* Título y Mensaje de Bienvenida */}
          <h2 className="text-xl font-black text-white tracking-tight">
            {isRejected ? 'Acceso No Autorizado' : 'Cuenta en Espera de Autorización'}
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            Hola <strong className="text-white">{user.displayName || user.email}</strong>, bienvenido a la plataforma de SCJ.
          </p>

          {/* Caja Explicativa de Seguridad */}
          <div className={`mt-4 p-3.5 rounded-2xl text-left text-xs border ${
            isRejected
              ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
              : 'bg-amber-950/30 border-amber-800/50 text-amber-200/90'
          }`}>
            <div className="flex items-start gap-2.5">
              {isRejected ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed text-[11.5px]">
                {isRejected ? (
                  <span>
                    Tu solicitud de acceso ha sido <strong>rechazada o revocada</strong> por la administración. Si consideras que es un error, por favor ponte en contacto con la Dirección de Operaciones o el Administrador del sistema.
                  </span>
                ) : (
                  <span>
                    Por estrictas políticas de seguridad y control operativo, <strong>toda nueva cuenta debe ser validada y autorizada por un Administrador o Gerente</strong> antes de permitir el ingreso a los módulos de despachos, rutas y costos.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Resumen de la Solicitud Registrada */}
          <div className="mt-5 p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-left space-y-2 text-xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-800/60 flex items-center justify-between">
              <span>Datos Registrados de la Cuenta</span>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] border ${
                isRejected 
                  ? 'bg-rose-950 text-rose-300 border-rose-800' 
                  : 'bg-amber-950 text-amber-300 border-amber-800'
              }`}>
                {isRejected ? 'RECHAZADA' : 'PENDIENTE DE AUTORIZACIÓN'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Correo:</span>
              </span>
              <span className="font-mono text-white font-semibold truncate max-w-[210px]">{user.email}</span>
            </div>

            {user.phone && (
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Teléfono:</span>
                </span>
                <span className="text-white font-medium">{user.phone}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Sede / Empresa:</span>
              </span>
              <span className="text-white font-medium">{user.company || 'SCJ'}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Rol Solicitado:</span>
              </span>
              <span className="font-bold text-blue-400">{roleDef.label}</span>
            </div>

            {user.assignedVehiclePlate && (
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Placa de Camión:</span>
                </span>
                <span className="font-mono font-bold text-emerald-400">{user.assignedVehiclePlate}</span>
              </div>
            )}
          </div>

          {/* Feedback interactivo */}
          {feedbackMsg && (
            <div className={`mt-4 p-3 rounded-xl text-xs text-left flex items-start gap-2 animate-in fade-in duration-200 ${
              feedbackMsg.isSuccess
                ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                : 'bg-slate-800/80 border border-slate-700 text-slate-300'
            }`}>
              {feedbackMsg.isSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="mt-6 space-y-2.5">
            {!isRejected && (
              <button
                type="button"
                onClick={handleCheckNow}
                disabled={checking}
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
              >
                <RotateCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                <span>{checking ? 'Consultando autorización en Firestore...' : 'Comprobar Autorización en Vivo'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs border border-slate-700"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>

        </div>
      </main>

      {/* Pie Corporativo */}
      <footer className="max-w-4xl w-full mx-auto py-3 text-center text-[11px] text-slate-500 relative z-10">
        SCJ Transporte Logístico · Seguridad de Acceso & Gobernanza de Usuarios
      </footer>

    </div>
  );
};
