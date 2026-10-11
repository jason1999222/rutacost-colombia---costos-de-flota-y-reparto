import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, ROLE_DEFINITIONS } from '../types/auth';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  ShieldAlert,
  Truck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
  Phone,
  Building2,
  Navigation,
  BarChart3,
  Layers,
  Fuel,
  Sparkles,
  ChevronRight,
  Check
} from 'lucide-react';

interface AuthPortalProps {
  onOpenFirebaseConfig?: () => void;
  defaultTab?: 'login' | 'register' | 'recover';
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ 
  onOpenFirebaseConfig,
  defaultTab = 'login'
}) => {
  const {
    loginWithEmail,
    registerWithEmail,
    sendPasswordReset,
    isFirebaseConnected,
    sessionExpiredNotice,
    clearSessionExpiredNotice
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'recover'>(defaultTab);
  
  // Estados de Formulario
  const [email, setEmail] = useState(() => localStorage.getItem('scj_remembered_email') || 'jacson.munoz@gmail.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('SCJ');
  const [role, setRole] = useState<UserRole>('dispatcher');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [assignedRoute, setAssignedRoute] = useState('SCJ-001');
  const [rememberMe, setRememberMe] = useState(true);

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Manejar Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg("Por favor ingresa tu correo y contraseña.");
      return;
    }

    if (rememberMe) {
      localStorage.setItem('scj_remembered_email', email.trim());
    } else {
      localStorage.removeItem('scj_remembered_email');
    }
    clearSessionExpiredNotice();

    setLoading(true);
    try {
      await loginWithEmail(email, password);
      setSuccessMsg("¡Credenciales verificadas! Accediendo al sistema...");
    } catch (err: any) {
      setErrorMsg(err.message || "Correo o contraseña incorrectos. Verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  // Manejar Registro
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg("Ingresa tu nombre y apellido completos.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Ingresa un correo electrónico corporativo o personal.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Por seguridad, la contraseña debe contener mínimo 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden. Por favor verifícalas.");
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail({
        email,
        pass: password,
        name,
        role,
        phone,
        company: company.trim() || 'SCJ',
        assignedVehiclePlate: role === 'driver' ? vehiclePlate : undefined,
        assignedRouteId: role === 'driver' ? assignedRoute : undefined
      });
      setSuccessMsg("¡Cuenta registrada exitosamente! Tu solicitud está en proceso de autorización.");
    } catch (err: any) {
      setErrorMsg(err.message || "Error al registrar la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  // Manejar Recuperación de Contraseña
  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg("Ingresa tu correo electrónico para enviarte el enlace de recuperación.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSuccessMsg(`Enlace enviado con éxito a ${email}. Revisa tu bandeja de entrada o spam.`);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al enviar el correo de recuperación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Resplandor y Efectos de Fondo */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 blur-[160px] rounded-full pointer-events-none" />

      {/* Barra Superior */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 border border-blue-400/30 font-black text-sm">
            SCJ
          </div>
          <div>
            <div className="text-white font-black text-base tracking-tight flex items-center gap-2">
              <span>SCJ Transportes S.A.S.</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Operador Logístico
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Gestión Integral de Flota, Despachos & Control de Costos en Carretera
            </p>
          </div>
        </div>

        {/* Estado Firebase */}
        <div className="flex items-center gap-2">
          {isFirebaseConnected ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Cloud Firestore Activo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Acceso Seguro SSL/TLS
            </span>
          )}
        </div>
      </header>

      {/* Contenido Principal en 2 Columnas Split-Screen */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-10 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-center">
          
          {/* ============================================================== */}
          {/* COLUMNA IZQUIERDA: SHOWCASE CORPORATIVO E IMAGEN REFERENTE     */}
          {/* ============================================================== */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Titular Principal */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-500/30 text-blue-300 text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Plataforma Corporativa de Control Operativo</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Control Operativo de Flota, <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
                  Rutas & Costos en Carretera
                </span>
              </h1>
              
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
                Sistema centralizado para la administración de la red de rutas comerciales, liquidación en ruta por odómetros, auditoría de combustible ACPM, peajes y control progresivo de nómina patronal CST.
              </p>
            </div>

            {/* Imagen Corporativa Referente de Flota */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl shadow-black/80 group">
              <img 
                src="/scj_fleet_hero.jpg" 
                alt="Centro de Operaciones y Flota SCJ Transportes" 
                className="w-full h-56 sm:h-72 object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
              
              {/* Badges Superpuestos en la Imagen */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 z-10">
                <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-white font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>CEDI Operaciones Activo</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="bg-blue-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-blue-600/60 text-xs text-blue-200 font-bold">
                    Red de Rutas Homologadas
                  </span>
                  <span className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300 font-bold">
                    Flota Vehicular Monitoreada
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Pilares de Gestión Operativa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/20">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Liquidación de Despachos</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Control de odómetro inicial/final, anticipos y gastos menores de carretera.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/20">
                  <Fuel className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Auditoría ACPM & Peajes</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Rendimiento real Km/galón y liquidación contra tarifas oficiales vigentes.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5 border border-purple-500/20">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Nómina Día a Día Progresiva</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Asistencia del personal activo y liquidación patronal proporcional CST.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Balance Financiero P&L</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Fletes cobrados vs costos reales y reportes con gráficos vectoriales.</p>
                </div>
              </div>
            </div>

          </div>

          {/* ============================================================== */}
          {/* COLUMNA DERECHA: TARJETA DE AUTENTICACIÓN & ACCESO             */}
          {/* ============================================================== */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl shadow-2xl shadow-black/80 overflow-hidden border border-slate-200 text-slate-900">
              
              {/* Encabezado de la Tarjeta */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-inner shrink-0">
                    {mode === 'recover' ? <KeyRound className="w-5 h-5 text-amber-400" /> : mode === 'register' ? <User className="w-5 h-5 text-indigo-400" /> : <Lock className="w-5 h-5 text-blue-400" />}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-white tracking-tight">
                      {mode === 'login' && 'Ingreso Seguro al Sistema'}
                      {mode === 'register' && 'Solicitar Registro Corporativo'}
                      {mode === 'recover' && 'Recuperar Contraseña'}
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {mode === 'login' && 'Digita tus credenciales corporativas autorizadas'}
                      {mode === 'register' && 'Ingresa tus datos para autorizar tu nuevo usuario'}
                      {mode === 'recover' && 'Enlace seguro de restablecimiento por correo'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pestañas de Navegación del Portal */}
              <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
                  className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'border-blue-600 text-blue-600 bg-white font-extrabold shadow-2xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Iniciar Sesión
                </button>

                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
                  className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'border-blue-600 text-blue-600 bg-white font-extrabold shadow-2xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Solicitar Registro
                </button>
              </div>

              {/* Mensajes de Estado */}
              {sessionExpiredNotice === 'inactivity' && (
                <div className="m-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-3 animate-in fade-in shadow-xs">
                  <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg shrink-0 mt-0.5">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-950 text-xs">Sesión Cerrada por Inactividad</span>
                      <button
                        type="button"
                        onClick={clearSessionExpiredNotice}
                        className="text-amber-800 hover:text-amber-950 text-[10px] font-bold underline cursor-pointer"
                      >
                        Entendido
                      </button>
                    </div>
                    <p className="mt-1 text-slate-700 leading-relaxed text-[11px]">
                      Por políticas de seguridad corporativa y protección de datos, la sesión se cerró automáticamente al detectar que el equipo estuvo inactivo por más de 15 minutos. Ingresa nuevamente tus credenciales autorizadas.
                    </p>
                  </div>
                </div>
              )}
              {errorMsg && (
                <div className="m-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="m-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* CUERPO DEL MODO SELECCIONADO */}
              <div className="p-6">
                
                {/* -------------------------------------------------------- */}
                {/* 1. MODO: INICIAR SESIÓN CON EMAIL Y CONTRASEÑA           */}
                {/* -------------------------------------------------------- */}
                {mode === 'login' && (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Correo Electrónico Corporativo
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="usuario@scj.com"
                          className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-slate-50/50"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700">Contraseña</label>
                        <button
                          type="button"
                          onClick={() => setMode('recover')}
                          className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
                        >
                          ¿Olvidaste tu clave?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-slate-50/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 cursor-pointer"
                      />
                      <label htmlFor="rememberMe" className="text-xs text-slate-600 cursor-pointer select-none">
                        Recordar sesión en este equipo
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Validando credenciales...</span>
                      ) : (
                        <>
                          <span>Ingresar al Sistema</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="pt-2 text-center">
                      <p className="text-xs text-slate-500">
                        ¿No tienes cuenta aún?{' '}
                        <button
                          type="button"
                          onClick={() => setMode('register')}
                          className="text-blue-600 font-bold hover:underline cursor-pointer"
                        >
                          Solicitar Registro
                        </button>
                      </p>
                    </div>
                  </form>
                )}



                {/* -------------------------------------------------------- */}
                {/* 3. MODO: SOLICITAR CUENTA NUEVA                          */}
                {/* -------------------------------------------------------- */}
                {mode === 'register' && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nombre Completo</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Juan Manuel Pérez"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Correo Electrónico</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nombre@scj.com"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Contraseña</label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Mín. 6 caracteres"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Confirmar</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repite clave"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Cargo / Rol en la Empresa</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50 font-bold"
                      >
                        <option value="driver">Conductor Titular de Flota</option>
                        <option value="dispatcher">Despachador CEDI</option>
                        <option value="manager">Gerente de Operaciones</option>
                        <option value="admin">Administrador General</option>
                      </select>
                    </div>

                    {role === 'driver' && (
                      <div className="grid grid-cols-2 gap-2 pt-1 bg-blue-50/60 p-2.5 rounded-xl border border-blue-200">
                        <div>
                          <label className="block font-bold text-blue-900 mb-1">Placa Vehículo</label>
                          <input
                            type="text"
                            value={vehiclePlate}
                            onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                            placeholder="Ej. SPV-474"
                            className="w-full px-2.5 py-1.5 border border-blue-300 rounded-lg text-xs font-mono uppercase bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-blue-900 mb-1">Ruta Frecuente</label>
                          <input
                            type="text"
                            value={assignedRoute}
                            onChange={(e) => setAssignedRoute(e.target.value.toUpperCase())}
                            placeholder="SCJ-001"
                            className="w-full px-2.5 py-1.5 border border-blue-300 rounded-lg text-xs font-mono uppercase bg-white"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-all shadow-md mt-2"
                    >
                      {loading ? 'Registrando...' : 'Registrar Solicitud'}
                    </button>
                  </form>
                )}

                {/* -------------------------------------------------------- */}
                {/* 4. MODO: RECUPERAR CONTRASEÑA                            */}
                {/* -------------------------------------------------------- */}
                {mode === 'recover' && (
                  <form onSubmit={handleRecoverSubmit} className="space-y-4">
                    <p className="text-xs text-slate-600">
                      Ingresa el correo con el que estás registrado. Te enviaremos un correo con las instrucciones para restablecer tu clave.
                    </p>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu-correo@scj.com"
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-all shadow-xs"
                    >
                      {loading ? 'Enviando...' : 'Enviar Correo de Recuperación'}
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        ← Volver a Iniciar Sesión
                      </button>
                    </div>
                  </form>
                )}

              </div>

              {/* Pie de la Tarjeta */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 text-center">
                <p className="text-[11px] text-slate-500 font-medium">
                  🏢 SCJ Transportes S.A.S. · Acceso exclusivo para personal autorizado
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Pie de Página General */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between text-xs text-slate-500 border-t border-slate-900">
        <div>
          © 2026 SCJ Transportes S.A.S. Todos los derechos reservados.
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>CEDI Girardota / Medellín</span>
          <span>·</span>
          <span>Control Operativo & Nómina CST</span>
        </div>
      </footer>

    </div>
  );
};
