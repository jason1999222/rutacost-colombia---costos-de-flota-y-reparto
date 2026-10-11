import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FirebaseClientConfig } from '../types/auth';
import { uploadAllDataToFirestore } from '../services/firebase';
import { DeliveryRoute, VehicleProfile, LaborConfig } from '../types/logistics';
import {
  Database,
  CloudUpload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  X,
  Loader2,
  ShieldAlert,
  Sparkles,
  Key,
  Layers,
  Copy,
  Check
} from 'lucide-react';

interface FirebaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  routes: DeliveryRoute[];
  vehicles: VehicleProfile[];
  laborConfig: LaborConfig;
}

export const FirebaseSyncModal: React.FC<FirebaseSyncModalProps> = ({
  isOpen,
  onClose,
  routes,
  vehicles,
  laborConfig
}) => {
  const {
    firebaseConfig,
    isFirebaseConnected,
    saveNewFirebaseConfig,
    disconnectFirebase,
    permissions
  } = useAuth();

  const [activeStep, setActiveStep] = useState<'config' | 'sync' | 'guide'>('sync');
  const [apiKey, setApiKey] = useState(firebaseConfig?.apiKey || '');
  const [projectId, setProjectId] = useState(firebaseConfig?.projectId || '');
  const [authDomain, setAuthDomain] = useState(firebaseConfig?.authDomain || '');
  const [storageBucket, setStorageBucket] = useState(firebaseConfig?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(firebaseConfig?.messagingSenderId || '');
  const [appId, setAppId] = useState(firebaseConfig?.appId || '');

  const [rawConfigJson, setRawConfigJson] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Pegar automáticamente desde el snippet de Firebase Console
  const handleParseRawJson = () => {
    try {
      setErrorMsg(null);
      // Extrae campos clave si el usuario pega const firebaseConfig = { ... }
      const extractField = (name: string) => {
        const regex = new RegExp(`["']?${name}["']?\\s*:\\s*["']([^"']+)["']`, 'i');
        const match = rawConfigJson.match(regex);
        return match ? match[1] : '';
      };

      const parsedKey = extractField('apiKey');
      const parsedProj = extractField('projectId');
      const parsedAuth = extractField('authDomain');
      const parsedBucket = extractField('storageBucket');
      const parsedSender = extractField('messagingSenderId');
      const parsedApp = extractField('appId');

      if (!parsedKey || !parsedProj) {
        throw new Error("No se encontraron apiKey ni projectId válidos en el texto pegado.");
      }

      setApiKey(parsedKey);
      setProjectId(parsedProj);
      if (parsedAuth) setAuthDomain(parsedAuth);
      if (parsedBucket) setStorageBucket(parsedBucket);
      if (parsedSender) setMessagingSenderId(parsedSender);
      if (parsedApp) setAppId(parsedApp);

      setRawConfigJson('');
    } catch (e: any) {
      setErrorMsg(e.message || "Formato no reconocido. Asegúrate de copiar el objeto de configuración de Firebase.");
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!apiKey.trim() || !projectId.trim()) {
      setErrorMsg("apiKey y projectId son obligatorios.");
      return;
    }

    const newConfig: FirebaseClientConfig = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim() || "1234567890",
      appId: appId.trim() || "1:1234567890:web:abcdef"
    };

    const ok = saveNewFirebaseConfig(newConfig);
    if (ok) {
      setActiveStep('sync');
    } else {
      setErrorMsg("Error al inicializar Firebase con estos parámetros. Verifica la API Key.");
    }
  };

  const handleSyncToFirestore = async () => {
    setErrorMsg(null);
    setUploadResult(null);
    setIsUploading(true);

    try {
      const res = await uploadAllDataToFirestore(routes, vehicles, laborConfig, (msg) => {
        setUploadStatus(msg);
      });
      setUploadResult(res);
    } catch (e: any) {
      setErrorMsg(e.message || "Error al subir datos a Firebase Firestore.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col">

        {/* Cabecera */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-blue-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white tracking-tight">
                  Integración con Google Firebase & Cloud Firestore
                </h3>
                {isFirebaseConnected ? (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Conectado
                  </span>
                ) : (
                  <span className="bg-slate-700 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Sin Conexión
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Elimina proyectos viejos, conecta el nuevo y sube la matriz completa de rutas y tiendas con 1 clic
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveStep('sync')}
            className={`flex-1 py-3 border-b-2 text-center flex items-center justify-center gap-2 transition-colors ${
              activeStep === 'sync'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CloudUpload className="w-4 h-4 text-blue-600" />
            <span>1. Cargar Base de Datos a Firestore</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('config')}
            className={`flex-1 py-3 border-b-2 text-center flex items-center justify-center gap-2 transition-colors ${
              activeStep === 'config'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Key className="w-4 h-4 text-amber-600" />
            <span>2. Credenciales Web App</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('guide')}
            className={`flex-1 py-3 border-b-2 text-center flex items-center justify-center gap-2 transition-colors ${
              activeStep === 'guide'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>3. Guía: Borrar Proyecto Viejo</span>
          </button>
        </div>

        {/* Mensajes de Estado */}
        {errorMsg && (
          <div className="m-5 mb-0 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="p-6 overflow-y-auto space-y-5 text-xs">

          {/* PASO 1: CARGAR BASE DE DATOS A CLOUD FIRESTORE */}
          {activeStep === 'sync' && (
            <div className="space-y-4">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-blue-950 text-sm flex items-center gap-2">
                    <CloudUpload className="w-4 h-4 text-blue-600" />
                    <span>Migración y Carga Automática de Datos a Firebase</span>
                  </h4>
                  <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                    1-Clic
                  </span>
                </div>
                <p className="text-blue-900 leading-relaxed text-xs">
                  Esta acción subirá de inmediato toda la estructura maestra del sistema logístico a las
                  colecciones de tu nuevo proyecto en Cloud Firestore:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                  <div className="bg-white p-2 rounded-lg border border-blue-200 text-center">
                    <span className="text-blue-600 font-bold block text-sm">{routes.length}</span>
                    <span className="text-slate-600 text-[10px]">Rutas en 'routes'</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-emerald-200 text-center">
                    <span className="text-emerald-600 font-bold block text-sm">
                      {(() => {
                        try {
                          const r = localStorage.getItem('rutacost_dispatches');
                          return r ? JSON.parse(r).filter((d: any) => Boolean(d && d.id)).length : 0;
                        } catch { return 0; }
                      })()}
                    </span>
                    <span className="text-slate-600 text-[10px]">Salidas en 'dispatches'</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-blue-200 text-center">
                    <span className="text-emerald-600 font-bold block text-sm">56</span>
                    <span className="text-slate-600 text-[10px]">Tiendas en 'stores'</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-blue-200 text-center">
                    <span className="text-amber-600 font-bold block text-sm">23</span>
                    <span className="text-slate-600 text-[10px]">Peajes en 'tolls'</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-blue-200 text-center">
                    <span className="text-purple-600 font-bold block text-sm">{vehicles.length}</span>
                    <span className="text-slate-600 text-[10px]">Perfiles en 'vehicles'</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-blue-200 text-center">
                    <span className="text-indigo-600 font-bold block text-sm">9</span>
                    <span className="text-slate-600 text-[10px]">Camiones 'fleet_units'</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-blue-200 text-center">
                    <span className="text-teal-600 font-bold block text-sm">25</span>
                    <span className="text-slate-600 text-[10px]">Nómina 'conductores'</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-blue-200 text-center">
                    <span className="text-rose-600 font-bold block text-sm">5</span>
                    <span className="text-slate-600 text-[10px]">Gastos 'expense_concepts'</span>
                  </div>
                </div>
              </div>

              {/* Botón de Sincronización */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">
                    ¿Listo para subir los datos al nuevo proyecto?
                  </h5>
                  <p className="text-slate-500 text-[11px]">
                    {isFirebaseConnected
                      ? `Conectado al proyecto: ${firebaseConfig?.projectId}`
                      : 'Puedes configurar las credenciales en la pestaña "2. Credenciales Web App" o subir en modo simulado.'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleSyncToFirestore}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Subiendo a Firestore...</span>
                    </>
                  ) : (
                    <>
                      <CloudUpload className="w-4 h-4" />
                      <span>Cargar Base de Datos Ahora</span>
                    </>
                  )}
                </button>
              </div>

              {/* Estado en Vivo de la Subida */}
              {uploadStatus && (
                <div className="p-3 bg-slate-900 text-white rounded-xl font-mono text-xs flex items-center gap-2 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                  <span>{uploadStatus}</span>
                </div>
              )}

              {/* Resultado Exitoso */}
              {uploadResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>{uploadResult.message}</span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    Se han creado los documentos correspondientes en Cloud Firestore con todas las colecciones maestras y operativas.
                  </p>
                  {uploadResult.count && (
                    <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                        {uploadResult.count.routes} Rutas
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-300 font-bold">
                        {uploadResult.count.dispatches || 0} Salidas ('dispatches')
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                        {uploadResult.count.stores} Tiendas
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                        {uploadResult.count.tolls} Peajes
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                        {uploadResult.count.staff || 0} Nómina ('conductores')
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                        {uploadResult.count.fleet || 0} Flota ('fleet_units')
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                        {uploadResult.count.expenses || 0} Gastos ('expense_concepts')
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PASO 2: FORMULARIO DE CREDENCIALES DE FIREBASE */}
          {activeStep === 'config' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-700" />
                  <span>Pegar Configuración de Firebase Console:</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  En Firebase Console &gt; Configuración del Proyecto &gt; Tus apps &gt; Copia el bloque <code>const firebaseConfig = &#123; ... &#125;</code> y pégalo aquí para rellenar los campos automáticamente.
                </p>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={rawConfigJson}
                    onChange={(e) => setRawConfigJson(e.target.value)}
                    placeholder="Pega aquí el código de configuración de Firebase..."
                    className="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleParseRawJson}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs"
                  >
                    Extraer
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">API Key (*):</label>
                    <input
                      type="text"
                      required
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Project ID (*):</label>
                    <input
                      type="text"
                      required
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      placeholder="rutacost-colombia"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Auth Domain:</label>
                    <input
                      type="text"
                      value={authDomain}
                      onChange={(e) => setAuthDomain(e.target.value)}
                      placeholder="proyecto.firebaseapp.com"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">App ID:</label>
                    <input
                      type="text"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      placeholder="1:1234567890:web:..."
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Guardar y Conectar Firebase
                  </button>

                  {isFirebaseConnected && (
                    <button
                      type="button"
                      onClick={disconnectFirebase}
                      className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Desconectar
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* PASO 3: GUÍA PASO A PASO PARA BORRAR EL PROYECTO VIEJO */}
          {activeStep === 'guide' && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-rose-950 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <span>Instrucciones para Borrar el Proyecto Anterior en Firebase</span>
                </div>
                <p className="text-rose-900 leading-relaxed text-xs">
                  Por seguridad y prevención de pérdida irreversible de datos de Google Cloud, el borrado de
                  proyectos de Firebase se realiza directamente desde la consola oficial con autenticación de dueño:
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-900 block mb-0.5">Ingresar a Firebase Console:</strong>
                    <span className="text-slate-600">
                      Entra a <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline inline-flex items-center gap-1">console.firebase.google.com <ExternalLink className="w-3 h-3" /></a> con tu cuenta de Google.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-900 block mb-0.5">Opción A: Borrar Todo el Proyecto Viejo:</strong>
                    <span className="text-slate-600">
                      Selecciona el proyecto anterior &gt; Haz clic en el engranaje ⚙️ (Configuración del Proyecto) &gt; Pestaña General &gt; Baja hasta el final &gt; Clic en <strong>"Borrar proyecto" (Delete project)</strong>.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-900 block mb-0.5">Opción B: Limpiar Solo la Base de Datos (Firestore):</strong>
                    <span className="text-slate-600">
                      Si quieres reutilizar el mismo proyecto pero con datos limpios: Ve a <strong>Firestore Database</strong> &gt; Haz clic en los tres puntos de cada colección antigua (ej: <code>routes</code>, <code>users</code>) &gt; Selecciona <strong>"Borrar colección"</strong>.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    4
                  </div>
                  <div>
                    <strong className="text-slate-900 block mb-0.5">Crear o Seleccionar el Nuevo Proyecto:</strong>
                    <span className="text-slate-600">
                      Crea el nuevo proyecto (ej: <code>rutacost-colombia</code>), habilita <strong>Authentication</strong> y <strong>Cloud Firestore</strong>, copia las credenciales en la pestaña 2 y presiona <strong>"Cargar Base de Datos Ahora"</strong>.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Pie */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            Estructura compatible con Firebase Auth & Cloud Firestore 2026.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
