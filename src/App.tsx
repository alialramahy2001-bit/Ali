import React, { useState, useEffect } from 'react';
import { 
  Home, 
  StickyNote, 
  ArrowLeftRight, 
  Wallet, 
  BarChart3, 
  Trash2, 
  Plus, 
  ChevronRight, 
  Search,
  Scale,
  Ruler,
  BadgeDollarSign,
  PieChart,
  Minus,
  Sparkles,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { askAssistant } from './services/gemini';

// Types
type Tab = 'home' | 'notes' | 'converters' | 'finance' | 'analytics' | 'ai';

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

interface FinancialEntry {
  id: string;
  type: 'debt' | 'profit' | 'due' | 'interest';
  amount: number;
  label: string;
  date: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('assistant_notes');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Financial State
  const [salary, setSalary] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
  const [financeEntries, setFinanceEntries] = useState<FinancialEntry[]>(() => {
    const saved = localStorage.getItem('assistant_finance');
    return saved ? JSON.parse(saved) : [];
  });

  // Converters State
  const [convValue, setConvValue] = useState<string>('1');
  const [convFrom, setConvFrom] = useState<string>('m');
  const [convTo, setConvTo] = useState<string>('ft');
  
  useEffect(() => {
    localStorage.setItem('assistant_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('assistant_finance', JSON.stringify(financeEntries));
  }, [financeEntries]);

  // Handle Note logic
  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'ملاحظة جديدة',
      content: '',
      date: new Date().toLocaleDateString('ar-EG')
    };
    setNotes([newNote, ...notes]);
  };

  const updateNote = (id: string, field: keyof Note, value: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  // Finance logic
  const addFinanceEntry = (type: FinancialEntry['type'], amount: number, label: string) => {
    const newEntry: FinancialEntry = {
      id: Date.now().toString(),
      type,
      amount,
      label,
      date: new Date().toISOString()
    };
    setFinanceEntries([newEntry, ...financeEntries]);
  };

  const deleteFinanceEntry = (id: string) => {
    setFinanceEntries(financeEntries.filter(e => e.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeTab onNavigate={setActiveTab} />;
      case 'notes': return <NotesTab notes={notes} addNote={addNote} updateNote={updateNote} deleteNote={deleteNote} />;
      case 'converters': return <ConvertersTab convValue={convValue} setConvValue={setConvValue} convFrom={convFrom} setConvFrom={setConvFrom} convTo={convTo} setConvTo={setConvTo} />;
      case 'finance': return <FinanceTab salary={salary} setSalary={setSalary} deductions={deductions} setDeductions={setDeductions} entries={financeEntries} addEntry={addFinanceEntry} deleteEntry={deleteFinanceEntry} />;
      case 'analytics': return <AnalyticsTab entries={financeEntries} salary={salary} deductions={deductions} />;
      case 'ai': return <AITab />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-slate-50 shadow-2xl relative overflow-hidden font-sans">
      {/* Header */}
      <header className="p-6 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-l from-blue-600 to-indigo-600 bg-clip-text text-transparent">الـمـسـاعـد</h1>
          <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">Assistant Smart Hub</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600">
          <BadgeDollarSign size={20} />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 pb-24 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/90 backdrop-blur-lg border-t border-slate-100 px-4 py-3 flex justify-between items-center z-50">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={22} />} label="الرئيسية" />
        <NavButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={<StickyNote size={22} />} label="ملاحظاتي" />
        <NavButton active={activeTab === 'converters'} onClick={() => setActiveTab('converters')} icon={<ArrowLeftRight size={22} />} label="المحولات" />
        <NavButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<Sparkles size={22} />} label="الـذكاء" />
        <NavButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<Wallet size={22} />} label="المالية" />
        <NavButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart3 size={22} />} label="التحليلات" />
      </nav>
    </div>
  );
}

// Helper Components
function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
    >
      <div className={`p-1.5 rounded-xl ${active ? 'bg-indigo-50 shadow-sm' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

// --- Tabs Implementation ---

function HomeTab({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const cards = [
    { id: 'notes', title: 'الملاحظات', sub: 'سجل أفكارك', icon: <StickyNote className="text-yellow-500" />, tab: 'notes' as Tab },
    { id: 'ai', title: 'المساعد الذكي', sub: 'اسأل الذكاء الاصطناعي', icon: <Sparkles className="text-pink-500" />, tab: 'ai' as Tab },
    { id: 'converters', title: 'المحولات', sub: 'طول، وزن، عملة', icon: <ArrowLeftRight className="text-emerald-500" />, tab: 'converters' as Tab },
    { id: 'finance', title: 'المالية', sub: 'رواتب وديون', icon: <Wallet className="text-blue-500" />, tab: 'finance' as Tab },
    { id: 'analytics', title: 'الإحصائيات', sub: 'رسوم بيانية', icon: <BarChart3 className="text-purple-500" />, tab: 'analytics' as Tab },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-700 p-8 text-white shadow-xl shadow-indigo-200">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-1 text-right">مرحباً بك،</h2>
          <p className="text-indigo-100 text-sm text-right">مساعدك الذكي لإدارة يومك وشؤونك المالية</p>
          <div className="mt-8 flex gap-4">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 flex-1">
              <p className="text-[10px] uppercase font-bold opacity-70">الوقت الآن</p>
              <p className="text-lg font-bold">{new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 flex-1">
              <p className="text-[10px] uppercase font-bold opacity-70">التاريخ</p>
              <p className="text-lg font-bold">{new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {cards.map(card => (
          <button 
            key={card.id}
            onClick={() => onNavigate(card.tab)}
            className="flex flex-col items-start p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-right group"
          >
            <div className="mb-4 p-3 rounded-2xl bg-slate-50 group-hover:scale-110 transition-transform">
              {card.icon}
            </div>
            <h3 className="font-bold text-slate-800">{card.title}</h3>
            <p className="text-xs text-slate-400">{card.sub}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function NotesTab({ notes, addNote, updateNote, deleteNote }: { notes: Note[], addNote: () => void, updateNote: (id: string, f: keyof Note, v: string) => void, deleteNote: (id: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">ملاحظاتي</h2>
        <button 
          onClick={addNote}
          className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-20 opacity-30">
            <StickyNote size={60} className="mx-auto mb-4" />
            <p>لا توجد ملاحظات بعد</p>
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between mb-4">
                <input 
                  value={note.title}
                  onChange={(e) => updateNote(note.id, 'title', e.target.value)}
                  className="font-bold text-slate-800 bg-transparent outline-none w-full"
                />
                <button onClick={() => deleteNote(note.id)} className="text-red-400 hover:text-red-600 mr-2">
                  <Trash2 size={18} />
                </button>
              </div>
              <textarea 
                value={note.content}
                onChange={(e) => updateNote(note.id, 'content', e.target.value)}
                placeholder="ابدأ الكتابة هنا..."
                className="w-full h-24 text-sm text-slate-600 bg-transparent resize-none outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-2">{note.date}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ConvertersTab({ convValue, setConvValue, convFrom, setConvFrom, convTo, setConvTo, convertLength }: any) {
  const [activeType, setActiveType] = useState<'length' | 'weight' | 'currency'>('length');
  
  const lengthUnits: any = { 'm': 1, 'km': 1000, 'cm': 0.01, 'mm': 0.001, 'mi': 1609.34, 'ft': 0.3048, 'in': 0.0254 };
  const weightUnits: any = { 'kg': 1, 'g': 0.001, 'mg': 0.000001, 'lb': 0.453592, 'oz': 0.0283495 };
  const currencyUnits: any = { 'USD': 1, 'EUR': 0.93, 'GBP': 0.79, 'JPY': 155, 'SAR': 3.75, 'IQD': 1310, 'AED': 3.67 };

  const convert = (type: string) => {
    const val = parseFloat(convValue) || 0;
    const units = type === 'length' ? lengthUnits : type === 'weight' ? weightUnits : currencyUnits;
    
    // Safety check for keys
    if (!units[convFrom] || !units[convTo]) return "0.00";
    
    const baseValue = val * units[convFrom];
    return (baseValue / units[convTo]).toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  const getOptions = () => {
    if (activeType === 'length') return [
      { v: 'm', l: 'متر' }, { v: 'km', l: 'كيلومتر' }, { v: 'cm', l: 'سنتيمتر' }, { v: 'mi', l: 'ميل' }, { v: 'ft', l: 'قدم' }, { v: 'in', l: 'بوصة' }
    ];
    if (activeType === 'weight') return [
      { v: 'kg', l: 'كيلوجرام' }, { v: 'g', l: 'جرام' }, { v: 'lb', l: 'رطل (باوند)' }, { v: 'oz', l: 'أونصة' }
    ];
    return [
      { v: 'USD', l: 'دولار أمريكي' }, { v: 'EUR', l: 'يورو' }, { v: 'GBP', l: 'جنيه إسترليني' }, { v: 'SAR', l: 'ريال سعودي' }, { v: 'IQD', l: 'دينار عراقي' }, { v: 'AED', l: 'درهم إماراتي' }
    ];
  };

  // Reset units when switching type to avoid key errors
  useEffect(() => {
    const opts = getOptions();
    setConvFrom(opts[0].v);
    setConvTo(opts[1].v);
  }, [activeType]);

  return (
    <div className="space-y-6">
      <div className="flex p-1 bg-slate-100 rounded-2xl">
        <button 
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeType === 'length' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
          onClick={() => setActiveType('length')}
        >الـطـول</button>
        <button 
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeType === 'weight' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
          onClick={() => setActiveType('weight')}
        >الـوزن</button>
        <button 
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeType === 'currency' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
          onClick={() => setActiveType('currency')}
        >الـعـمـلـة</button>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <label className="block text-xs font-bold text-slate-400 mb-2 mr-2">القيمة</label>
        <input 
          type="number" 
          value={convValue}
          onChange={(e) => setConvValue(e.target.value)}
          className="w-full text-3xl font-bold bg-transparent outline-none mb-8 text-center font-mono"
        />

        <div className="grid grid-cols-2 gap-6 items-center">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 px-2 uppercase">مـن</label>
            <select 
              value={convFrom}
              onChange={(e) => setConvFrom(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700"
            >
              {getOptions().map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
            </select>
          </div>
          
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-slate-400 px-2 uppercase text-left block">إلـى</label>
            <select 
              value={convTo}
              onChange={(e) => setConvTo(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700"
            >
              {getOptions().map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-10 p-6 bg-indigo-50 rounded-3xl border border-indigo-100 text-center">
          <p className="text-xs font-bold text-indigo-400 mb-2">النتيجة</p>
          <p className="text-4xl font-black text-indigo-600 font-mono">{convert(activeType)}</p>
          <p className="text-xs font-bold text-indigo-400 mt-2">
            {getOptions().find(o => o.v === convTo)?.l}
          </p>
        </div>
      </div>
    </div>
  );
}

function FinanceTab({ salary, setSalary, deductions, setDeductions, entries, addEntry, deleteEntry }: any) {
  const [activeView, setActiveView] = useState<'salary' | 'splitter'>('salary');
  const [newLabel, setNewLabel] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<FinancialEntry['type']>('debt');

  const netSalary = salary - deductions;

  return (
    <div className="space-y-6">
      <div className="flex p-1 bg-slate-100 rounded-2xl">
        <button 
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeView === 'salary' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
          onClick={() => setActiveView('salary')}
        >حساب الراتب</button>
        <button 
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeView === 'splitter' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
          onClick={() => setActiveView('splitter')}
        >تقسيم الأرباح/الديون</button>
      </div>

      {activeView === 'salary' ? (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">الراتب الأساسي</label>
              <input 
                type="number"
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value))}
                className="w-full text-2xl font-bold bg-transparent border-b-2 border-slate-50 py-2 outline-none focus:border-indigo-500 transition-all font-mono"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mr-1">المقطوعات / الخصومات</label>
              <input 
                type="number"
                value={deductions}
                onChange={(e) => setDeductions(Number(e.target.value))}
                className="w-full text-2xl font-bold text-red-500 bg-transparent border-b-2 border-slate-50 py-2 outline-none focus:border-red-500 transition-all font-mono"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="bg-gradient-to-l from-emerald-500 to-teal-600 p-8 rounded-3xl text-white shadow-lg shadow-emerald-100 flex justify-between items-center">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase opacity-80 mb-1">صافي الراتب</p>
              <h2 className="text-4xl font-black">{netSalary.toLocaleString()}</h2>
            </div>
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
              <BadgeDollarSign size={28} />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <input 
              placeholder="اسم البند (مثلاً: دين أحمد)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold"
            />
            <input 
              type="number"
              placeholder="المبلغ"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold font-mono"
            />
            <div className="flex gap-2">
              {(['debt', 'profit', 'due', 'interest'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setNewType(t)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${newType === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-100'}`}
                >
                  {t === 'debt' ? 'دين' : t === 'profit' ? 'ربح' : t === 'due' ? 'مستحق' : 'فائدة'}
                </button>
              ))}
            </div>
            <button 
              onClick={() => {
                if(newLabel && newAmount) {
                  addEntry(newType, Number(newAmount), newLabel);
                  setNewLabel('');
                  setNewAmount('');
                }
              }}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 mt-2"
            >إضافة بند</button>
          </div>

          <div className="space-y-3">
            {entries.map((entry: any) => (
              <div key={entry.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <div className={`p-2 rounded-xl ${entry.type === 'profit' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {entry.type === 'profit' ? <Plus size={16} /> : <Minus size={16} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{entry.label}</p>
                    <p className="text-[10px] text-slate-400 uppercase">{entry.type}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <p className={`font-bold font-mono ${entry.type === 'profit' ? 'text-emerald-600' : 'text-red-600'}`}>{entry.amount.toLocaleString()}</p>
                  <button onClick={() => deleteEntry(entry.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AITab() {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: 'مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await askAssistant(userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: response || 'عذراً، لم أستطع فهم ذلك.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'حدث خطأ ما، يرجى المحاولة لاحقاً.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
      <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center gap-3">
        <Sparkles size={18} className="text-indigo-600" />
        <span className="font-bold text-indigo-900 text-sm">المساعد الذكي</span>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end">
            <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none animate-pulse">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <button 
          onClick={handleSend}
          disabled={isLoading}
          className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <Send size={20} />
        </button>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="اسألني أي شيء..."
          className="flex-1 bg-slate-100 rounded-2xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-medium"
        />
      </div>
    </div>
  );
}

function AnalyticsTab({ entries, salary, deductions }: any) {
  const chartData = entries.length > 0 ? entries.map((e: any) => ({
    name: e.label.substring(0, 10),
    amount: e.amount,
  })) : [
    { name: 'الراتب', amount: salary },
    { name: 'الخصومات', amount: deductions }
  ];

  return (
    <div className="space-y-6 pb-20">
      <h2 className="text-xl font-bold text-slate-800">التحليلات المالية</h2>
      
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              cursor={{ fill: '#f8fafc' }}
            />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#10b981'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">إجمالي الأرباح</p>
          <p className="text-xl font-bold text-emerald-600 font-mono">
            {entries.filter((e:any) => e.type === 'profit').reduce((acc: number, curr: any) => acc + curr.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">إجمالي الديون</p>
          <p className="text-xl font-bold text-red-500 font-mono">
            {entries.filter((e:any) => e.type === 'debt').reduce((acc: number, curr: any) => acc + curr.amount, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
