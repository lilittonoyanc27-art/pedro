import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Target, 
  Eye, 
  User, 
  Lock, 
  Terminal, 
  Zap, 
  ChevronRight, 
  RotateCcw,
  AlertTriangle,
  Fingerprint,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Types ---

interface Question {
  id: number;
  mission: string;
  context: string;
  options: string[];
  correct: string;
  translation: string;
  explanation: string;
}

// --- Data ---

const AGENT_MISSIONS: Question[] = [
  // Venir vs Ir
  {
    id: 1,
    mission: "Secret agent Pedro needs to reach the target location.",
    context: "Mañana (yo) ___ a la base secreta.",
    options: ["vengo", "voy"],
    correct: "voy",
    translation: "Վաղը ես գնում եմ գաղտնի բազա:",
    explanation: "'Ir' (voy) is used for movement AWAY from the speaker's current location."
  },
  {
    id: 2,
    mission: "The backup is arriving.",
    context: "Mis amigos ___ a ayudarme ahora mismo.",
    options: ["vienen", "van"],
    correct: "vienen",
    translation: "Իմ ընկերները հենց հիմա գալիս են ինձ օգնելու:",
    explanation: "'Venir' (vienen) is used for movement TOWARDS the speaker."
  },
  {
    id: 3,
    mission: "Pedro asks his contact if they can meet.",
    context: "¿Puedes ___ a mi oficina a las 8?",
    options: ["ir", "venir"],
    correct: "venir",
    translation: "Կարո՞ղ ես գալ իմ գրասենյակ ժամը 8-ին:",
    explanation: "Asking someone to come to where you are."
  },
  {
    id: 4,
    mission: "Pedro is informing headquarters about his movement.",
    context: "(Yo) ___ al laboratorio para extraer los datos.",
    options: ["voy", "vengo"],
    correct: "voy",
    translation: "Ես գնում եմ լաբորատորիա՝ տվյալները հանելու համար:",
    explanation: "Movement towards a destination away from the current spot."
  },
  {
    id: 5,
    mission: "A mysterious caller speaks to Pedro.",
    context: "Pedro, nosotros ___ de camino.",
    options: ["vamos", "venimos"],
    correct: "vamos",
    translation: "Պեդրո, մենք ճանապարհին ենք (քեզ մոտ գալու ճանապարհին):",
    explanation: "Wait, if the caller is moving TOWARDS Pedro, they use 'ir' or 'venir'? In Spanish, 'venir' is towards speaker. 'Ir' is away or towards someone else. Example: 'Ya voy' (I'm coming/going to you)."
  },
  
  // Saber vs Conocer
  {
    id: 6,
    mission: "Pedro knows the enemy's password.",
    context: "Pedro ___ la contraseña del sistema.",
    options: ["sabe", "conoce"],
    correct: "sabe",
    translation: "Պեդրոն գիտի համակարգի գաղտնաբառը:",
    explanation: "Use 'Saber' for facts, information, or passwords."
  },
  {
    id: 7,
    mission: "Pedro is familiar with the streets of Madrid.",
    context: "Pedro ___ muy bien las calles de Madrid.",
    options: ["sabe", "conoce"],
    correct: "conoce",
    translation: "Պեդրոն շատ լավ ճանաչում է Մադրիդի փողոցները:",
    explanation: "Use 'Conocer' for familiarity with places or people."
  },
  {
    id: 8,
    mission: "Does Pedro know how to fly a helicopter?",
    context: "Pedro ___ pilotar un helicóptero.",
    options: ["sabe", "conoce"],
    correct: "sabe",
    translation: "Պեդրոն գիտի (կարողանում է) ուղղաթիռ վարել:",
    explanation: "Use 'Saber' + infinitive for skills/how to do something."
  },
  {
    id: 9,
    mission: "Meeting a double agent.",
    context: "¿(Tú) ___ al agente secreto 'X'?",
    options: ["sabes", "conoces"],
    correct: "conoces",
    translation: "Ճանաչո՞ւմ ես գաղտնի գործակալ 'X'-ին:",
    explanation: "Use 'Conocer' for people."
  },
  {
    id: 10,
    mission: "Headquarters needs information.",
    context: "Necesito ___ cuándo empieza la misión.",
    options: ["saber", "conocer"],
    correct: "saber",
    translation: "Ինձ պետք է իմանալ, թե երբ է սկսվում առաքելությունը:",
    explanation: "Use 'Saber' for finding out information/facts."
  },
  {
    id: 11,
    mission: "In the spy world, things are not what they seem.",
    context: "Ella ___ que soy un espía.",
    options: ["sabe", "conoce"],
    correct: "sabe",
    translation: "Նա գիտի, որ ես լրտես եմ:",
    explanation: "Knowledge of a specific fact."
  },
  {
    id: 12,
    mission: "Have you been to the secret bunker?",
    context: "¿(Tú) ___ el búnker secreto de los Alpes?",
    options: ["sabes", "conoces"],
    correct: "conoces",
    translation: "Ճանաչո՞ւմ ես (եղե՞լ ես) Ալպերի գաղտնի բունկերը:",
    explanation: "Familiarity with a place."
  }
];

// --- Sub-components ---

const PedroAvatar = ({ status = 'idle' }: { status?: 'idle' | 'success' | 'fail' }) => (
  <div className="relative group">
    <div className={`absolute inset-0 blur-[40px] transition-colors duration-500 rounded-full
      ${status === 'fail' ? 'bg-red-600/40' : status === 'success' ? 'bg-emerald-600/40' : 'bg-red-600/20 group-hover:bg-red-600/40'}
    `} />
    <motion.div 
      className="relative w-48 h-64 border-4 border-stone-800 bg-stone-900 shadow-2xl flex flex-col items-center justify-end rounded-b-2xl rounded-t-[100px]"
      animate={status === 'fail' ? {
        x: [0, -100, 100, -100, 100, 0],
        rotate: [0, -5, 5, -5, 5, 0],
      } : {}}
      transition={status === 'fail' ? { duration: 1, repeat: 1 } : {}}
    >
       {/* Funny Agent Hat */}
       <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 z-30">
          <div className="w-32 h-6 bg-stone-800 rounded-full relative">
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-20 h-16 bg-stone-800 rounded-t-lg border-b-4 border-red-600" />
          </div>
       </div>

       {/* Pedro high quality funny agent image */}
       <img 
          src="https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=400" 
          alt="Agent Pedro" 
          className="w-full h-full object-cover rounded-t-[100px] rounded-b-xl grayscale contrast-125 pt-8"
          referrerPolicy="no-referrer"
       />
       
       {/* Overlay vignette */}
       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 rounded-t-[100px]" />
       
       {/* Status Face Overlays */}
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {status === 'success' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1.5 }} className="text-emerald-500 font-black text-4xl drop-shadow-lg">
              GOOD!
            </motion.div>
          )}
          {status === 'fail' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1.5 }} className="text-red-500 font-black text-4xl drop-shadow-lg">
              OH NO!
            </motion.div>
          )}
       </div>
    </motion.div>
    
    {/* Identity Bar */}
    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded font-mono text-xs tracking-widest font-black uppercase whitespace-nowrap">
      Pedro: The Funny Spía
    </div>

    {/* Speech Bubble for feedback */}
    <AnimatePresence>
      {status !== 'idle' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0, x: 80 }}
          animate={{ opacity: 1, scale: 1, x: 80 }}
          exit={{ opacity: 0, scale: 0, x: 80 }}
          className="absolute top-0 right-0 z-50 bg-white text-black px-4 py-2 rounded-2xl rounded-bl-none font-black uppercase text-sm border-2 border-stone-800 shadow-xl"
        >
          {status === 'success' ? 'Хорошо!' : '¡A correr!'}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const SecurityScanner = ({ active }: { active: boolean }) => (
  <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0'}`}>
    <div className="w-full h-[2px] bg-red-600/50 absolute top-0 left-0 shadow-[0_0_20px_red] animate-scan" />
    <style>{`
      @keyframes scan {
        0% { top: 0; }
        100% { top: 100%; }
      }
      .animate-scan { animation: scan 3s linear infinite; }
    `}</style>
  </div>
);

// --- Main App ---

export default function AgentPedroApp() {
  const [view, setView] = useState<'intro' | 'dossier' | 'mission' | 'debrief'>('intro');
  const [currentTask, setCurrentTask] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'fail'>('idle');

  const handleStart = () => setView('dossier');

  const acceptMission = () => {
    setView('mission');
    setCurrentTask(0);
    setScore(0);
  };

  const handleAnswer = (option: string) => {
    setSelectedOption(option);
    const isCorrect = option === AGENT_MISSIONS[currentTask].correct;
    
    if (isCorrect) {
      setScore(s => s + 1);
      setStatus('success');
      confetti({ particleCount: 20, spread: 40, colors: ['#ff0000', '#ffffff'], gravity: 1.2 });
    } else {
      setStatus('fail');
    }

    setTimeout(() => {
      setSelectedOption(null);
      setStatus('idle');
      if (currentTask < AGENT_MISSIONS.length - 1) {
        setCurrentTask(t => t + 1);
      } else {
        setView('debrief');
      }
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-stone-200 font-mono selection:bg-red-600 selection:text-white overflow-hidden relative">
      
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#333_1px,_transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-red-600/20" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10 min-h-screen flex flex-col">
        
        {/* Top HUD */}
        <header className="flex justify-between items-center border-b border-stone-800 pb-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 p-2 rounded">
              <Shield className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter">Mission: <span className="text-red-600 italic">Espía Local</span></h1>
              <p className="text-[10px] text-stone-500 uppercase tracking-widest">Operation: Red Language // Secure Level 5</p>
            </div>
          </div>
          <div className="hidden md:flex gap-8 text-right">
             <div>
               <p className="text-[10px] text-stone-500 uppercase">Agent Status</p>
               <p className="text-sm font-bold text-red-600">ACTIVE</p>
             </div>
             <div>
               <p className="text-[10px] text-stone-500 uppercase">Signal</p>
               <p className="text-sm font-bold text-emerald-500 font-mono">007-LINK-STABLE</p>
             </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {view === 'intro' && (
              <motion.div 
                key="intro"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-12"
              >
                <div className="flex justify-center">
                  <PedroAvatar />
                </div>
                <div className="space-y-4">
                  <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">AGENT <span className="text-red-600">007</span></h2>
                  <p className="text-stone-500 max-w-lg mx-auto text-sm leading-relaxed tracking-wide">
                    Identity: Pedro. Specialization: Spanish Verbs. Mission: Infiltrate the linguistic network and neutralize grammar errors.
                  </p>
                </div>
                <button 
                  onClick={handleStart}
                  className="group relative bg-transparent border-2 border-red-600 text-red-600 px-12 py-4 rounded font-black uppercase tracking-[0.3em] overflow-hidden hover:text-white transition-colors"
                >
                  <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 -z-10" />
                  Initialize Mission
                </button>
              </motion.div>
            )}

            {view === 'dossier' && (
              <motion.div 
                key="dossier"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-12"
              >
                <div className="flex justify-center gap-12 items-center flex-col md:flex-row">
                  <PedroAvatar status={status} />
                  
                  <div className="space-y-8 flex-1">
                    <div className="space-y-2 text-center md:text-left">
                       <h2 className="text-3xl font-black uppercase italic border-l-4 border-red-600 pl-4 tracking-tighter">Mission Dossier</h2>
                       <p className="text-xs text-stone-500 uppercase tracking-widest font-black">Top Secret - Eye only</p>
                    </div>
                    
                    <div className="space-y-4 bg-stone-900/50 p-6 rounded border border-stone-800">
                      <div className="flex items-center gap-3 text-red-600 font-bold text-xs uppercase italic">
                        <Target size={16} /> Objective 01: Venir & Ir
                        <p className="ml-auto text-stone-500 text-[10px]">P-88</p>
                      </div>
                      <p className="text-stone-400 text-sm italic">Master the movement. Control the flow of agents coming and going from headquarters.</p>
                    </div>

                    <div className="space-y-4 bg-stone-900/50 p-6 rounded border border-stone-800">
                      <div className="flex items-center gap-3 text-red-600 font-bold text-xs uppercase italic">
                        <Lock size={16} /> Objective 02: Saber & Conocer
                        <p className="ml-auto text-stone-500 text-[10px]">P-42</p>
                      </div>
                      <p className="text-stone-400 text-sm italic">Information is power. Know the facts, recognize the faces. Distinguish between 'Knowing' and 'Being Familiar'.</p>
                    </div>

                    <button 
                      onClick={acceptMission}
                      className="w-full bg-red-600 text-white py-4 rounded font-black uppercase tracking-widest hover:bg-stone-100 hover:text-red-600 transition-all flex items-center justify-center gap-3"
                    >
                      Accept Mission <ChevronRight />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'mission' && (
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  <div className="flex-1 w-full space-y-8 relative">
                    <SecurityScanner active={status !== 'idle'} />
                    
                    <div className="flex justify-between items-end border-l-2 border-red-600 pl-6">
                       <div>
                         <p className="text-[10px] font-black uppercase text-red-600 mb-1 tracking-widest flex items-center gap-2">
                           <Fingerprint size={12} /> Task {currentTask + 1} / {AGENT_MISSIONS.length}
                         </p>
                         <h3 className="text-xl md:text-2xl font-black uppercase italic text-stone-300">
                           {AGENT_MISSIONS[currentTask].mission}
                         </h3>
                       </div>
                       <div className="text-right">
                         <p className="text-xs text-stone-600 font-black tracking-widest">Score</p>
                         <p className="text-2xl font-black italic text-red-600">{score.toString().padStart(2, '0')}</p>
                       </div>
                    </div>

                    <div className="bg-stone-900 border border-stone-800 p-10 rounded-2xl relative overflow-hidden group">
                      <Terminal className="absolute top-4 right-4 text-stone-800 group-hover:text-red-900 transition-colors" />
                      
                      <div className="space-y-6 text-center max-w-xl mx-auto">
                        <p className="text-3xl md:text-5xl font-black italic uppercase leading-none tracking-tighter text-white">
                          {AGENT_MISSIONS[currentTask].context.split('___')[0]}
                          <span className="text-red-600 font-black"> ___ </span>
                          {AGENT_MISSIONS[currentTask].context.split('___')[1]}
                        </p>
                        <p className="text-lg font-bold text-stone-500 italic opacity-60">
                          {AGENT_MISSIONS[currentTask].translation}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {AGENT_MISSIONS[currentTask].options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => handleAnswer(opt)}
                            disabled={selectedOption !== null}
                            className={`
                              p-8 rounded font-black text-2xl italic uppercase transition-all relative overflow-hidden flex items-center justify-center gap-4
                              ${selectedOption === opt 
                                ? (status === 'success' ? 'bg-emerald-600/30 border-2 border-emerald-500 text-emerald-400' : 'bg-red-600/30 border-2 border-red-500 text-red-400') 
                                : 'bg-stone-900/40 border border-stone-800 text-stone-500 hover:border-red-600 hover:text-white'
                              }
                              ${selectedOption !== null && opt === AGENT_MISSIONS[currentTask].correct && status === 'fail' ? 'border-emerald-500 border-2 text-emerald-400' : ''}
                            `}
                          >
                             {opt}
                          </button>
                       ))}
                    </div>

                    <AnimatePresence>
                      {status !== 'idle' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-stone-900/80 p-6 rounded border border-stone-800 text-center"
                        >
                          <p className="text-xs text-stone-500 font-bold mb-1 uppercase tracking-[0.2em] italic">Intel Briefing:</p>
                          <p className="text-sm text-stone-300 font-medium italic">
                            {AGENT_MISSIONS[currentTask].explanation}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Funny Pedro as sidebar indicator */}
                  <div className="hidden lg:block sticky top-8">
                     <PedroAvatar status={status} />
                  </div>
                </div>
            )}

            {view === 'debrief' && (
              <motion.div 
                key="debrief"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl mx-auto w-full text-center space-y-12"
              >
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-red-600/20 blur-[80px] animate-pulse" />
                  <div className="relative bg-stone-900 border border-stone-800 p-12 rounded-full">
                    <Fingerprint size={80} className="text-red-600" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-5xl font-black italic uppercase tracking-tighter">Mission <br/> <span className="text-red-600 underline">Completed</span></h2>
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-[10px] text-stone-600 font-black uppercase tracking-[0.4em]">Success Probability</p>
                    <p className="text-6xl font-black italic text-stone-200">
                      {Math.round((score / AGENT_MISSIONS.length) * 100)}<span className="text-red-600">%</span>
                    </p>
                    <p className="text-xs text-stone-500 mt-2">Detections: {AGENT_MISSIONS.length - score} ERRORS</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <button 
                    onClick={acceptMission}
                    className="bg-stone-900 border border-stone-800 text-stone-400 p-6 rounded font-black uppercase tracking-widest text-xs hover:bg-stone-800"
                   >
                     <RotateCcw className="inline-block mr-2" /> Re-run Sim
                   </button>
                   <button 
                    onClick={() => setView('intro')}
                    className="bg-red-600 text-white p-6 rounded font-black uppercase tracking-widest text-xs hover:bg-white hover:text-red-600 transition-colors"
                   >
                     Headquarters
                   </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        <footer className="mt-12 py-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 opacity-30 grayscale hover:grayscale-0 transition-all">
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">Agent 007 Pedro // Protocol 00</p>
          <div className="flex gap-4">
            <Shield size={14} />
            <Eye size={14} />
            <Target size={14} />
          </div>
        </footer>

      </div>
    </div>
  );
}
