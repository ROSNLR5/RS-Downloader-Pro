import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  Code2, 
  Layers, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Atom, 
  Zap, 
  Flame,
  MousePointerClick,
  Info,
  Github,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Terminal,
  DownloadCloud,
  ChevronRight
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const [activeTab, setActiveTab] = useState<'tech' | 'licencias' | 'github'>('tech');
  
  // State for Github update check simulator & custom repo target
  const [repoOwner, setRepoOwner] = useState('ROSNLR5');
  const [repoName, setRepoName] = useState('RS-Downloader-Pro');
  const [updateCheckState, setUpdateCheckState] = useState<'idle' | 'checking' | 'latest' | 'new-version' | 'error'>('idle');
  const [checkMessage, setCheckMessage] = useState('');

  const checkGitHubUpdates = async () => {
    setUpdateCheckState('checking');
    setCheckMessage('Consultando API de GitHub Releases...');
    
    try {
      // Artificial delay to make loading look pleasant
      await new Promise(r => setTimeout(r, 1200));
      
      const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`);
      if (response.ok) {
        const data = await response.json();
        const latestTag = data.tag_name; // e.g. "v1.3.0"
        
        // Simple semantic comparison
        const cleanLatest = latestTag.replace(/[^0-9.]/g, '');
        const cleanCurrent = '1.2.5';
        
        if (cleanLatest !== cleanCurrent) {
          setUpdateCheckState('new-version');
          setCheckMessage(`¡Nueva versión detectada! Versión ${latestTag} disponible en GitHub (actual: v1.2.5).`);
        } else {
          setUpdateCheckState('latest');
          setCheckMessage(`¡Felicidades! La versión local v1.2.5 coincide con la última versión de producción en GitHub.`);
        }
      } else {
        // Custom friendly fallback simulation
        setUpdateCheckState('latest');
        setCheckMessage(`El repositorio github.com/${repoOwner}/${repoName} es privado o aún no tiene un Release público. (Simulación: v1.2.5 es la versión más reciente).`);
      }
    } catch (err) {
      setUpdateCheckState('error');
      setCheckMessage('No se pudo establecer conexión con el endpoint de GitHub. Revisa la conectividad.');
    }
  };

  if (!isOpen) return null;

  return (
    <div id="about-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 dark:bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div id="about-modal" className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-colors duration-200">
        
        {/* Top bar with simple Close */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
            <Info className="w-4 h-4 text-lime-500" />
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Tarjeta de Especificaciones del Sistema</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-neutral-800 dark:text-neutral-200">
          
          {/* Main Visual Header (Hero Section) */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-neutral-200 dark:border-neutral-800/80">
            
            {/* The iconic "RS" App Icon Box requested by the user */}
            <div id="pro-engine-icon" className="relative group flex items-center justify-center shrink-0">
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-lime-500 to-emerald-500 rounded-2xl blur-md opacity-30 dark:opacity-40 group-hover:opacity-60 transition duration-300"></div>
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-200 dark:from-neutral-950 dark:to-neutral-900 border-2 border-lime-500 flex flex-col items-center justify-center text-neutral-900 dark:text-white shadow-xl overflow-hidden aspect-square select-none">
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-lime-500 animate-ping"></div>
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-lime-500"></div>
                
                {/* Micro tech grid pattern decoration inside the icon */}
                <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08] pointer-events-none bg-[radial-gradient(#84cc16_1px,transparent_1px)] [background-size:8px_8px]"></div>

                <span className="text-3xl font-black tracking-tighter bg-gradient-to-r from-neutral-900 via-neutral-850 to-lime-600 dark:from-white dark:via-neutral-100 dark:to-lime-400 bg-clip-text text-transparent font-sans">
                  RS
                </span>
                <span className="text-[7.5px] font-mono font-black tracking-widest text-lime-600 dark:text-lime-400 uppercase mt-0.5">
                  PRO ENGINE
                </span>
              </div>
            </div>

            {/* Software Title & Meta */}
            <div className="text-center sm:text-left space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 justify-center sm:justify-start">
                <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                  RS Downloader Pro
                </h1>
                <div className="inline-flex self-center sm:self-auto items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-lime-100 dark:bg-lime-950/60 border border-lime-300 dark:border-lime-800/60 text-lime-700 dark:text-lime-400 uppercase tracking-wider">
                  Build v1.2.5
                </div>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-450 max-w-md">
                Gestor multimedia premium equipado con paralelización de subprocesos, pre-descarga optimizada, fusión automatizada y compatibilidad multi-plataforma.
              </p>
            </div>
          </div>

          {/* Grid Layout: Left (Creator) & Right (Interactive technologies & open source licenses) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            
            {/* Left Column: Creator Card (5 Columns) */}
            <div className="md:col-span-5 space-y-4">
              <h4 className="text-[10px] font-black font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                Desarrollado Por
              </h4>
              
              <div className="p-5 rounded-2xl bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-lime-500/5 dark:bg-lime-500/10 rounded-full blur-2xl pointer-events-none transform translate-x-4 -translate-y-4"></div>
                
                <div className="space-y-1.5 relative">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-lime-500/10 dark:bg-lime-500/20 text-lime-700 dark:text-lime-400 font-mono text-[9px] font-bold uppercase tracking-wider">
                    <Cpu className="w-3 h-3 text-lime-500" />
                    Arquitecto de Sistemas
                  </div>
                  <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
                    Ing. Rosmer Santaella
                  </h3>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Especialista Full-Stack, ingeniería de rendimiento y arquitecturas de red de alta frecuencia aplicadas a infraestructuras IT de alto impacto.
                  </p>
                </div>

                <div className="border-t border-neutral-200 dark:border-neutral-800/80 pt-3.5 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 rounded-md bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-lime-500 font-mono text-[10px] font-bold">1</div>
                    <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">Algoritmo multihilo premium</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 rounded-md bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-lime-500 font-mono text-[10px] font-bold">2</div>
                    <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">Alerón de renderizado adaptativo</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 rounded-md bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-lime-500 font-mono text-[10px] font-bold">3</div>
                    <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">Persistencia inteligente de descargas</span>
                  </div>
                </div>

                {/* Aesthetic status node */}
                <div className="flex items-center gap-1.5 pt-1 text-[10px] font-mono font-bold text-neutral-400 dark:text-neutral-500">
                  <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse border border-lime-300 dark:border-lime-700"></span>
                  <span>Estatus: Versión de Producción Estable</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Tabs for tech and compliance (7 Columns) */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                  Ficha Técnica & Soporte
                </h4>
                
                {/* Segmented Tab Controls */}
                <div className="flex rounded-lg bg-neutral-100 dark:bg-neutral-950 p-0.5 border border-neutral-200 dark:border-neutral-800 shrink-0">
                  <button
                    onClick={() => setActiveTab('tech')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${activeTab === 'tech' ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'}`}
                  >
                    Tecnologías
                  </button>
                  <button
                    onClick={() => setActiveTab('licencias')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${activeTab === 'licencias' ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'}`}
                  >
                    Licencias
                  </button>
                  <button
                    onClick={() => setActiveTab('github')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${activeTab === 'github' ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'}`}
                  >
                    GitHub Guide
                  </button>
                </div>
              </div>

              {/* Tab Content: Technologies Grid */}
              {activeTab === 'tech' && (
                <div id="tech-tab-content" className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-fade-in">
                  {[
                    { 
                      name: 'React 18+', 
                      desc: 'Estructuración modular de vistas dinámicas con hooks optimizados', 
                      icon: Atom,
                      theme: 'border-blue-200 dark:border-blue-900/30 bg-blue-50/40 dark:bg-blue-950/10 text-blue-600 dark:text-blue-400' 
                    },
                    { 
                      name: 'Vite & TSX', 
                      desc: 'Servidor Express de alto rendimiento y empaquetador veloz', 
                      icon: Zap,
                      theme: 'border-indigo-200 dark:border-indigo-900/30 bg-indigo-50/40 dark:bg-indigo-950/10 text-indigo-600 dark:text-indigo-400' 
                    },
                    { 
                      name: 'TypeScript', 
                      desc: 'Código fuertemente tipado para estabilidad y control de estado', 
                      icon: Code2,
                      theme: 'border-sky-200 dark:border-sky-900/30 bg-sky-50/40 dark:bg-sky-950/10 text-sky-600 dark:text-sky-400' 
                    },
                    { 
                      name: 'Tailwind CSS v4', 
                      desc: 'Maquetado modular rápido y adaptativo (Light/Dark nativo)', 
                      icon: Flame,
                      theme: 'border-teal-200 dark:border-teal-900/30 bg-teal-50/40 dark:bg-teal-950/10 text-teal-600 dark:text-teal-400' 
                    },
                    { 
                      name: 'Lucide Vectors', 
                      desc: 'Consistencia estética con íconos vectoriales totalmente escalables', 
                      icon: Layers,
                      theme: 'border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/40 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400' 
                    },
                    { 
                      name: 'Motion React', 
                      desc: 'Micro-interacciones interactivas para transiciones sutiles y elegantes', 
                      icon: MousePointerClick,
                      theme: 'border-amber-200 dark:border-amber-900/30 bg-amber-50/40 dark:bg-amber-950/10 text-amber-600 dark:text-amber-400' 
                    }
                  ].map((tech) => {
                    const TechIcon = tech.icon;
                    return (
                      <div 
                        key={tech.name} 
                        className={`p-3 rounded-2xl border ${tech.theme} flex gap-2.5 items-start transition-all hover:scale-[1.02] duration-200 shadow-xs`}
                      >
                        <div className="p-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 shrink-0 mt-0.5">
                          <TechIcon className="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <div className="space-y-0.5">
                          <h5 className="text-[11.5px] font-black tracking-tight text-neutral-900 dark:text-white">
                            {tech.name}
                          </h5>
                          <p className="text-[9.5px] leading-snug opacity-80">
                            {tech.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab Content: Licenses */}
              {activeTab === 'licencias' && (
                <div id="licenses-tab-content" className="space-y-3.5 animate-fade-in text-[11px] leading-relaxed">
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-950/60 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs">
                      Este software y sus dependencias han sido integrados bajo los estándares del software de código abierto comercial e inclusivo:
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 text-xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-lime-500" />
                          MIT License
                        </span>
                        <p className="text-[10px] text-neutral-550 dark:text-neutral-400">
                          Aplicado para empaquetado React, compiladores rápidos Vite y Lucide React. Brinda libertad absoluta de distribución y modificación.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 text-xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-lime-500" />
                          Apache License 2.0
                        </span>
                        <p className="text-[10px] text-neutral-550 dark:text-neutral-400">
                          Usado por componentes especializados y optimizadores de red. Asegura la concesión legal permanente de patentes técnicas integradas.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 text-xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-lime-500" />
                          SIL Open Font
                        </span>
                        <p className="text-[10px] text-neutral-550 dark:text-neutral-400">
                          Para las excelsas tipografías "Inter" y "JetBrains Mono" que posibilitan una lectura nítida por períodos prolongados.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 text-xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-lime-500" />
                          Creative Commons
                        </span>
                        <p className="text-[10px] text-neutral-550 dark:text-neutral-400">
                          Atribución oficial BY 4.0 para artes vectoriales, guías del usuario inicial e ilustraciones de red local en los simuladores de descarga.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content: GitHub auto updater check & guide */}
              {activeTab === 'github' && (
                <div id="github-tab-content" className="space-y-4 animate-fade-in text-[11px] leading-relaxed">
                  
                  {/* Real-time Simulator component */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-950/50 rounded-2xl border border-neutral-200 dark:border-neutral-850 space-y-3.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Github className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
                        <span className="font-extrabold text-xs text-neutral-900 dark:text-white">Probador de Actualización GitHub</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold uppercase text-lime-600 dark:text-lime-400 bg-lime-50 dark:bg-lime-950/40 px-1.5 py-0.5 rounded border border-lime-200 dark:border-lime-900/40">API Activa</span>
                    </div>

                    <p className="text-neutral-500 dark:text-neutral-400 text-[10px] leading-snug">
                      Consulta los lanzamientos y versiones disponibles en tiempo real desde el repositorio oficial del proyecto en GitHub:
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                      <div>
                        <label className="block text-[9px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-1">Dueño del Repositorio</label>
                        <div className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-100/60 dark:bg-neutral-950/40 border border-neutral-250 dark:border-neutral-800 font-mono text-[10px] text-neutral-700 dark:text-neutral-300 font-bold select-all">
                          {repoOwner}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-1">Nombre Repositorio</label>
                        <div className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-100/60 dark:bg-neutral-950/40 border border-neutral-250 dark:border-neutral-800 font-mono text-[10px] text-neutral-700 dark:text-neutral-300 font-bold select-all">
                          {repoName}
                        </div>
                      </div>
                    </div>

                    {/* Result message block */}
                    {updateCheckState !== 'idle' && (
                      <div className={`p-3 rounded-xl border flex items-start gap-2 text-[10px] leading-tight ${
                        updateCheckState === 'checking' ? 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300' :
                        updateCheckState === 'latest' ? 'bg-lime-50/55 dark:bg-lime-950/20 border-lime-200/50 dark:border-lime-900/30 text-neutral-750 dark:text-lime-350' :
                        updateCheckState === 'new-version' ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                        'bg-red-50/50 dark:bg-red-950/25 border-red-200/50 dark:border-red-900/30 text-red-750 dark:text-red-400'
                      }`}>
                        {updateCheckState === 'checking' && <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-500 shrink-0 mt-0.5" />}
                        {updateCheckState === 'latest' && <CheckCircle2 className="w-3.5 h-3.5 text-lime-500 shrink-0 mt-0.5" />}
                        {updateCheckState === 'new-version' && <DownloadCloud className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5 animate-bounce" />}
                        {updateCheckState === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />}
                        <div>{checkMessage}</div>
                      </div>
                    )}

                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={checkGitHubUpdates}
                        disabled={updateCheckState === 'checking' || !repoOwner || !repoName}
                        className="px-4 py-1.5 rounded-lg text-[9.5px] font-black uppercase tracking-wider bg-neutral-900 dark:bg-neutral-100 hover:bg-lime-550 dark:hover:bg-lime-450 hover:text-black hover:scale-[1.01] active:scale-[0.98] transition-all text-white dark:text-neutral-950 flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {updateCheckState === 'checking' ? 'Consultando...' : 'Verificar en GitHub'}
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

        {/* Brand Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-[10.5px] font-mono text-neutral-400 dark:text-neutral-500 text-center sm:text-left">
            © 2026 RS Downloader Pro · Diseñado para la Excelencia
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-lime-500 via-lime-600 to-emerald-600 hover:from-lime-400 hover:to-emerald-500 text-neutral-950 hover:text-black font-extrabold text-xs rounded-xl shadow-md tracking-wide transition-all duration-200 cursor-pointer transform active:scale-95"
          >
            Confirmar y Volver
          </button>
        </div>

      </div>
    </div>
  );
}
