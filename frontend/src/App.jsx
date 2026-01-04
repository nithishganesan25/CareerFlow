import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    BookOpen,
    PieChart,
    Search,
    Plus,
    ChevronDown,
    ArrowRight,
    Loader2,
    Sparkles,
    Building2,
    Trophy,
    LogOut,
    Settings,
    User,
    Save,
    Upload,
    FileText,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Login from './Login';
import { auth, logOut, onAuthChange, updateUserProfile } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://careerflow-nbvo.onrender.com';

// Mock data to enrich the company cards (simulating the design)
const COMPANIES = [
    { name: 'TCS', category: 'Service', color: 'from-orange-200 to-orange-100' },
    { name: 'Infosys', category: 'Service', color: 'from-blue-200 to-blue-100' },
    { name: 'Google', category: 'Product', color: 'from-gray-200 to-gray-100' },
    { name: 'Amazon', category: 'Product', color: 'from-green-200 to-green-100' },
    { name: 'Wipro', category: 'Service', color: 'from-purple-200 to-purple-100' },
    { name: 'Microsoft', category: 'Product', color: 'from-red-200 to-red-100' },
    { name: 'Accenture', category: 'Service', color: 'from-yellow-200 to-yellow-100' },
    { name: 'Meta', category: 'Product', color: 'from-pink-200 to-pink-100' },
];

function App() {
    // Authentication State
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Existing State
    const [view, setView] = useState('dashboard'); // dashboard, company, resume, search, settings
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Search / AI State
    const [searchQuery, setSearchQuery] = useState('');
    const [aiAnswer, setAiAnswer] = useState(null);
    const [aiCitations, setAiCitations] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    // Resume State
    const [resumeText, setResumeText] = useState('');
    const [resumeData, setResumeData] = useState(null);

    // Settings State
    const [newName, setNewName] = useState('');
    const [updateStatus, setUpdateStatus] = useState('');

    // Mock Test State
    const [activeTab, setActiveTab] = useState('process');
    const [mockTest, setMockTest] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [expandedQuestionIndex, setExpandedQuestionIndex] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestInput, setRequestInput] = useState('');

    // Clear sensitive data on user change/logout
    useEffect(() => {
        setResumeData(null);
        setResumeText('');
        setView('dashboard');
    }, [user]);

    const handleSearch = async (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            setLoading(true);
            setView('search');
            setAiAnswer(null);
            setAiCitations([]);
            setShowSuggestions(false);
            try {
                const res = await axios.post(`${API_BASE_URL}/ask-ai`, { query: searchQuery });
                setAiAnswer(res.data.answer);
                setAiCitations(res.data.citations || []);
            } catch (err) {
                setAiAnswer("Sorry, I couldn't reach the server. Make sure it's running!");
            }
            setLoading(false);
        }
    };

    const handleTypeahead = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (val.trim().length > 0) {
            const filtered = COMPANIES.filter(c =>
                c.name.toLowerCase().includes(val.toLowerCase())
            ).slice(0, 5);
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleRequestCompany = () => {
        setIsRequestModalOpen(true);
    };

    const submitRequest = () => {
        if (requestInput.trim()) {
            fetchCompanyData(requestInput);
            setIsRequestModalOpen(false);
            setRequestInput('');
        }
    };

    const fetchCompanyData = async (name) => {
        setLoading(true);
        setError(null);
        setData(null);
        setExpandedQuestionIndex(null);
        setSelectedCompany(name);
        setView('company');
        try {
            const res = await axios.post(`${API_BASE_URL}/get-interview-data`, { name });
            if (res.data.error) {
                setError(res.data.error);
            } else {
                setData(res.data);
                setActiveTab('process');
            }
        } catch (err) {
            console.error(err);
            setError("Connection Error: Ensure backend is running.");
        }
        setLoading(false);
    };

    const fetchMoreQuestions = async () => {
        setLoadingMore(true);
        setExpandedQuestionIndex(null);
        try {
            const existing = data.questions.map(q => q.question);
            const res = await axios.post(`${API_BASE_URL}/fetch-more-questions`, {
                name: selectedCompany,
                existing: existing
            });

            // Client-side safety filter
            const newUniqueQuestions = res.data.questions.filter(
                newQ => !existing.includes(newQ.question)
            );

            setData(prev => ({
                ...prev,
                questions: [...prev.questions, ...newUniqueQuestions]
            }));
        } catch (err) {
            console.error(err);
        }
        setLoadingMore(false);
    };

    const fetchMockTest = async () => {
        setLoading(true);
        setUserAnswers({});
        try {
            const res = await axios.post(`${API_BASE_URL}/generate-mock-test`, { name: selectedCompany });
            setMockTest(res.data.quiz);
            setActiveTab('mock');
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setUpdateStatus('updating');
        try {
            await updateUserProfile(user, newName);
            setUpdateStatus('success');
            setTimeout(() => setUpdateStatus(''), 3000);
        } catch (err) {
            console.error(err);
            setUpdateStatus('error');
        }
    };

    const filteredCompanies = COMPANIES.filter(c =>
        categoryFilter === 'All' ? true : c.category === categoryFilter
    );

    useEffect(() => {
        const unsubscribe = onAuthChange((currentUser) => {
            setUser(currentUser);
            if (currentUser) setNewName(currentUser.displayName || '');
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await logOut();
            setUser(null);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#18181b] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#8b5cf6]" size={48} />
            </div>
        );
    }

    if (!user) {
        return <Login onLoginSuccess={setUser} />;
    }

    return (
        <div className="layout-grid font-sans text-sm">
            {/* Desktop Sidebar */}
            <aside className="sidebar-desktop bg-[#131316] p-6 flex flex-col h-screen sticky top-0 border-r border-[#27272a]">
                <div className="mb-10 pl-2">
                    <h1 className="text-xl font-bold tracking-tight">CareerFlow</h1>
                </div>

                <nav className="space-y-2 flex-1">
                    <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={view === 'dashboard' || view === 'company' || view === 'search'} onClick={() => { setView('dashboard'); setSelectedCompany(null); }} />
                    <SidebarItem icon={<PieChart size={20} />} label="Analytics" active={view === 'resume'} onClick={() => setView('resume')} />
                    <SidebarItem icon={<Settings size={20} />} label="Settings" active={view === 'settings'} onClick={() => setView('settings')} />
                </nav>

                <div className="pt-6 border-t border-[#27272a] mt-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#a1a1aa] hover:text-white hover:bg-red-500/10 transition-all group"
                    >
                        <LogOut size={20} className="group-hover:text-red-500 transition-colors" />
                        <span className="font-medium">Logout</span>
                    </button>
                    <div className="mt-4 px-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#d946ef] flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-[#8b5cf6]/20">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-xs font-bold text-white truncate">{user?.displayName || 'User'}</div>
                            <div className="text-[10px] text-[#52525b] truncate flex items-center gap-1">
                                <ShieldCheck size={10} className="text-green-500" />
                                Secured
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="bg-[#18181b] min-h-screen flex flex-col pb-20 lg:pb-0">
                <header className="sticky top-0 z-40 bg-[#131316]/95 backdrop-blur-md border-b border-[#27272a]">
                    {/* Mobile Branding Bar */}
                    <div className="lg:hidden p-4 flex items-center justify-between">
                        <h1 className="text-lg font-bold">CareerFlow</h1>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#d946ef] flex items-center justify-center text-[10px] font-bold text-white">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {/* Search Bar - Responsive Padding */}
                    <div className="p-4 lg:p-6 flex items-center justify-between gap-6">
                        <div className="relative flex-1 max-w-2xl group">
                            <div className={`absolute inset-0 bg-[#8b5cf6]/5 rounded-xl blur-xl transition-opacity ${searchQuery ? 'opacity-100' : 'opacity-0'}`} />
                            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchQuery ? 'text-[#8b5cf6]' : 'text-[#a1a1aa]'}`} size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleTypeahead}
                                onKeyDown={handleSearch}
                                onFocus={() => searchQuery && setShowSuggestions(true)}
                                placeholder="Search companies..."
                                className="w-full bg-[#1c1c21] border border-[#27272a] rounded-xl py-2.5 lg:py-3 pl-12 pr-4 text-white focus:ring-1 focus:ring-[#8b5cf6]/50 shadow-lg placeholder:text-[#52525b] transition-all relative z-10 text-sm"
                            />
                            <AnimatePresence>
                                {showSuggestions && suggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute left-0 right-0 top-full mt-2 bg-[#1c1c21] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                                    >
                                        <div className="px-3 py-2 text-[10px] font-bold text-[#52525b] uppercase tracking-widest">Jump to Company</div>
                                        {suggestions.map((company, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setShowSuggestions(false);
                                                    fetchCompanyData(company.name);
                                                }}
                                                className="w-full text-left px-4 py-3 rounded-xl hover:bg-[#8b5cf6]/10 group flex items-center justify-between transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[#27272a] flex items-center justify-center group-hover:bg-[#8b5cf6]/20 transition-colors">
                                                        <Building2 size={16} className="text-[#a1a1aa] group-hover:text-[#8b5cf6]" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-white group-hover:text-[#8b5cf6]">{company.name}</div>
                                                        <div className="text-[10px] text-[#52525b] uppercase">{company.category}</div>
                                                    </div>
                                                </div>
                                                <ArrowRight size={14} className="text-[#27272a] group-hover:text-[#8b5cf6] transition-transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                <div className="flex-1 px-8 pb-12 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {view === 'dashboard' && (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8 pt-6"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <h2 className="text-2xl lg:text-3xl font-bold">Companies</h2>
                                    <button onClick={handleRequestCompany} className="btn-primary w-fit">
                                        <Plus size={18} />
                                        Request Company
                                    </button>
                                </div>

                                <div className="flex items-center justify-start overflow-x-auto pb-2 scrollbar-none">
                                    <div className="flex gap-2 bg-[#202025] p-1 rounded-xl border border-[#27272a] shrink-0">
                                        {['All', 'Service', 'Product'].map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setCategoryFilter(cat)}
                                                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${categoryFilter === cat ? 'bg-[#8b5cf6] text-black shadow-sm' : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                    <div />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredCompanies.map((company, i) => (
                                        <CompanyCard
                                            key={i}
                                            company={company}
                                            onEnroll={() => fetchCompanyData(company.name)}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {view === 'search' && (
                            <motion.div
                                key="search"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="max-w-3xl mx-auto pt-10"
                            >
                                <button onClick={() => setView('dashboard')} className="mb-6 flex items-center gap-2 text-[#a1a1aa] hover:text-white">
                                    <ArrowRight className="rotate-180" size={16} /> Back to Dashboard
                                </button>

                                <div className="bg-[#202025] rounded-3xl border border-[#27272a] p-8 min-h-[50vh]">
                                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[#27272a]">
                                        <div className="w-12 h-12 rounded-full bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6]">
                                            <Sparkles size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">AI Assistant</h3>
                                            <p className="text-[#a1a1aa]">"{searchQuery}"</p>
                                        </div>
                                    </div>

                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-12 gap-4 text-[#a1a1aa]">
                                            <div className="relative">
                                                <Loader2 className="animate-spin text-[#8b5cf6]" size={32} />
                                                <div className="absolute inset-0 bg-[#8b5cf6] blur-xl opacity-20 animate-pulse" />
                                            </div>
                                            <p className="animate-pulse">Synthesizing real-time career intelligence...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            <div className="prose prose-invert prose-sm max-w-none text-[#d4d4d8] leading-relaxed">
                                                {aiAnswer ? (
                                                    <div dangerouslySetInnerHTML={{ __html: aiAnswer.replace(/\n/g, '<br/>') }} />
                                                ) : (
                                                    <p className="text-center text-[#52525b]">No answer generated.</p>
                                                )}
                                            </div>

                                            {aiCitations.length > 0 && (
                                                <div className="pt-8 border-t border-[#27272a]">
                                                    <h4 className="text-xs font-bold text-[#8b5cf6] uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <BookOpen size={12} />
                                                        Confidence Sources
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {aiCitations.map((cite, i) => (
                                                            <a
                                                                key={i}
                                                                href={cite.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center justify-between p-3 bg-[#1c1c21] border border-[#27272a] rounded-xl hover:border-[#8b5cf6]/30 transition-all group"
                                                            >
                                                                <span className="text-xs text-[#a1a1aa] group-hover:text-white transition-colors truncate pr-4">{cite.title}</span>
                                                                <ArrowRight size={12} className="text-[#52525b] group-hover:text-[#8b5cf6] flex-shrink-0" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {view === 'company' && (
                            <motion.div
                                key="company"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-5xl mx-auto pt-6"
                            >
                                <button onClick={() => setView('dashboard')} className="mb-6 flex items-center gap-2 text-[#a1a1aa] hover:text-white">
                                    <ArrowRight className="rotate-180" size={16} /> Back to Dashboard
                                </button>

                                <div className="bg-[#202025] rounded-3xl border border-[#27272a] overflow-hidden p-8 min-h-[60vh]">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-3xl font-bold mb-2">{selectedCompany}</h2>
                                            <p className="text-[#a1a1aa]">Comprehensive Interview Roadmap</p>
                                        </div>
                                        <div className="flex gap-2 bg-[#18181b] p-1 rounded-xl">
                                            {['process', 'questions', 'mock'].map(tab => (
                                                <button
                                                    key={tab}
                                                    onClick={() => {
                                                        setExpandedQuestionIndex(null);
                                                        tab === 'mock' ? fetchMockTest() : setActiveTab(tab);
                                                    }}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-[#27272a] text-white shadow-sm' : 'text-[#a1a1aa] hover:text-white'}`}
                                                >
                                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center h-64 text-[#a1a1aa]">
                                            <Loader2 className="animate-spin mb-4" size={32} />
                                            <p>Loading intelligence...</p>
                                        </div>
                                    ) : error ? (
                                        <div className="text-center py-20 text-red-400">
                                            <p className="mb-4">{error}</p>
                                            <button onClick={() => fetchCompanyData(selectedCompany)} className="btn-primary">Retry</button>
                                        </div>
                                    ) : data ? (
                                        <AnimatePresence mode="wait">
                                            {activeTab === 'process' && (
                                                <motion.div key="process" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">

                                                    {/* Company Brief */}
                                                    <div className="bg-gradient-to-br from-[#1c1c21] to-[#18181b] p-8 rounded-3xl border border-[#27272a] shadow-xl">
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <div className="px-3 py-1 bg-[#8b5cf6]/10 text-[#8b5cf6] rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#8b5cf6]/20">Expert Brief</div>
                                                        </div>
                                                        <h2 className="text-2xl font-bold text-white mb-4">Strategic Intelligence</h2>
                                                        <p className="text-[#a1a1aa] leading-relaxed italic border-l-2 border-[#8b5cf6]/30 pl-6 py-2 mb-8">
                                                            "{data.company_brief}"
                                                        </p>

                                                        {data.practice_links && data.practice_links.length > 0 && (
                                                            <div className="pt-6 border-t border-[#27272a]">
                                                                <h4 className="text-[#8b5cf6] font-bold text-xs uppercase mb-4 tracking-widest flex items-center gap-2">
                                                                    <BookOpen size={12} />
                                                                    External Prep Links
                                                                </h4>
                                                                <div className="flex flex-wrap gap-3">
                                                                    {data.practice_links.map((link, i) => (
                                                                        <a
                                                                            key={i}
                                                                            href={link.link}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="px-4 py-2 bg-[#1c1c21] border border-[#27272a] rounded-xl text-xs text-[#d4d4d8] hover:border-[#8b5cf6]/50 hover:text-white transition-all flex items-center gap-2"
                                                                        >
                                                                            {link.title}
                                                                            <ArrowRight size={12} />
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Roadmap Section - NEW */}
                                                    {data.roadmap && (
                                                        <div className="space-y-6">
                                                            <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                                                                <div className="w-2 h-8 bg-[#8b5cf6] rounded-full" />
                                                                Step-by-Step Preparation Roadmap
                                                            </h3>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {data.roadmap.map((week, idx) => (
                                                                    <div key={idx} className="p-5 bg-[#18181b] border border-[#27272a] rounded-2xl hover:border-[#8b5cf6]/30 transition-all">
                                                                        <div className="text-[#8b5cf6] font-bold text-xs uppercase mb-2">{week.week}</div>
                                                                        <div className="text-white font-bold mb-1">{week.focus}</div>
                                                                        <div className="text-[#a1a1aa] text-sm">{week.details}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Rounds */}
                                                    <div className="grid gap-6">
                                                        <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                                                            <div className="w-2 h-8 bg-[#8b5cf6] rounded-full" />
                                                            Interview Rounds
                                                        </h3>
                                                        {data.rounds.map((round, i) => (
                                                            <div key={i} className="flex gap-6 group">
                                                                <div className="flex flex-col items-center">
                                                                    <div className="w-10 h-10 rounded-full bg-[#1c1c21] border-2 border-[#8b5cf6]/20 text-[#8b5cf6] flex items-center justify-center font-bold text-sm ring-8 ring-[#18181b] z-10 group-hover:border-[#8b5cf6] transition-colors">{i + 1}</div>
                                                                    <div className="w-px h-full bg-gradient-to-b from-[#8b5cf6]/20 to-transparent group-last:hidden" />
                                                                </div>
                                                                <div className="pb-10">
                                                                    <h3 className="text-xl font-bold mb-2 text-white group-hover:text-[#8b5cf6] transition-colors">{round.name}</h3>
                                                                    <p className="text-[#a1a1aa] leading-relaxed max-w-2xl">{round.description}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {activeTab === 'questions' && (
                                                <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                    <div className="grid md:grid-cols-2 gap-4 mb-10">
                                                        <AnimatePresence mode="popLayout">
                                                            {data.questions.map((q, i) => (
                                                                <motion.div
                                                                    layout
                                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    key={i}
                                                                    onClick={() => setExpandedQuestionIndex(expandedQuestionIndex === i ? null : i)}
                                                                    className={`p-6 bg-[#18181b] rounded-2xl border border-[#27272a] hover:border-[#8b5cf6]/50 transition-all cursor-pointer group ${expandedQuestionIndex === i ? 'border-[#8b5cf6]/50 bg-[#1c1c21]' : ''}`}
                                                                >
                                                                    <div className="flex justify-between items-start mb-3">
                                                                        <span className="text-[10px] uppercase font-bold text-[#8b5cf6] bg-[#8b5cf6]/10 px-2 py-1 rounded inline-block">{q.category}</span>
                                                                        <ChevronDown className={`text-[#52525b] transition-transform duration-300 ${expandedQuestionIndex === i ? 'rotate-180 text-[#8b5cf6]' : ''}`} size={16} />
                                                                    </div>
                                                                    <h4 className="font-medium text-white mb-3 group-hover:text-[#8b5cf6] transition-colors">{q.question}</h4>
                                                                    <p className="text-sm text-[#a1a1aa] mb-2">Tip: {q.tip}</p>

                                                                    <div className="overflow-hidden">
                                                                        <AnimatePresence>
                                                                            {expandedQuestionIndex === i && (
                                                                                <motion.div
                                                                                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                                                                    animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                                                                                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                                                                    className="border-t border-[#27272a] pt-4"
                                                                                >
                                                                                    <p className="text-sm text-[#d4d4d8] leading-relaxed">
                                                                                        <strong className="text-[#8b5cf6] block mb-1">Professional Answer:</strong>
                                                                                        {q.answer || "Fetching professional answer..."}
                                                                                    </p>
                                                                                </motion.div>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </AnimatePresence>
                                                    </div>

                                                </motion.div>
                                            )}

                                            {activeTab === 'mock' && mockTest && (
                                                <motion.div key="mock" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6 pt-6">
                                                    <div className="flex items-center justify-between mb-8 p-6 bg-[#8b5cf6]/5 rounded-2xl border border-[#8b5cf6]/20">
                                                        <div>
                                                            <div className="text-[10px] text-[#8b5cf6] font-bold uppercase tracking-widest mb-1">Live Technical Simulation</div>
                                                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                                {selectedCompany} Master Mock
                                                            </h3>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-bold text-[#8b5cf6]">{Object.keys(userAnswers).length} / {mockTest.length}</div>
                                                            <div className="text-[10px] text-[#52525b] font-bold uppercase">Questions Completed</div>
                                                        </div>
                                                    </div>

                                                    {Object.keys(userAnswers).length === mockTest.length && (
                                                        <motion.div
                                                            initial={{ scale: 0.9, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            className="p-8 bg-[#8b5cf6] rounded-3xl text-black shadow-2xl shadow-[#8b5cf6]/10 mb-10 text-center"
                                                        >
                                                            <Trophy className="mx-auto mb-4" size={48} />
                                                            <h2 className="text-3xl font-black mb-2">Simulated Score: {Math.round((mockTest.filter((q, i) => q.correct_answer === userAnswers[i]).length / mockTest.length) * 100)}%</h2>
                                                            <p className="font-medium opacity-80 mb-6">You've successfully navigated {mockTest.length} professional interview patterns for {selectedCompany}.</p>
                                                            <button
                                                                onClick={() => { setUserAnswers({}); setActiveTab('process'); }}
                                                                className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:scale-105 transition-transform"
                                                            >
                                                                Complete Session
                                                            </button>
                                                        </motion.div>
                                                    )}

                                                    <div className="space-y-4">
                                                        {mockTest.map((m, i) => (
                                                            <div key={i} className={`p-6 bg-[#18181b] rounded-2xl border transition-all ${userAnswers[i] !== undefined ? 'border-[#27272a]' : 'border-[#27272a] hover:border-[#8b5cf6]/30'}`}>
                                                                <div className="flex gap-4">
                                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${userAnswers[i] !== undefined ? 'bg-[#27272a] text-[#52525b]' : 'bg-[#8b5cf6]/10 text-[#8b5cf6]'}`}>
                                                                        {i + 1}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="font-medium text-white text-base mb-4 leading-relaxed">{m.question}</p>
                                                                        <div className="grid md:grid-cols-2 gap-3">
                                                                            {m.options.map((opt, idx) => {
                                                                                const isAnswered = userAnswers[i] !== undefined;
                                                                                const isSelected = userAnswers[i] === idx;
                                                                                const isCorrect = m.correct_answer == idx;

                                                                                let borderColor = "border-[#27272a]";
                                                                                let bgColor = "bg-[#202025]/50";
                                                                                let textColor = "text-[#a1a1aa]";

                                                                                if (isAnswered) {
                                                                                    if (isCorrect) {
                                                                                        borderColor = "border-green-500/50";
                                                                                        bgColor = "bg-green-500/10";
                                                                                        textColor = "text-green-400";
                                                                                    } else if (isSelected) {
                                                                                        borderColor = "border-red-500/50";
                                                                                        bgColor = "bg-red-500/10";
                                                                                        textColor = "text-red-400";
                                                                                    }
                                                                                }

                                                                                return (
                                                                                    <button
                                                                                        key={idx}
                                                                                        onClick={() => !isAnswered && setUserAnswers(prev => ({ ...prev, [i]: idx }))}
                                                                                        disabled={isAnswered}
                                                                                        className={`w-full text-left p-4 rounded-xl text-sm transition-all border ${borderColor} ${bgColor} ${textColor} ${!isAnswered && 'hover:border-[#8b5cf6]/50 hover:bg-[#202025]'}`}
                                                                                    >
                                                                                        <div className="flex items-center gap-3">
                                                                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${isSelected ? 'border-[#8b5cf6] bg-[#8b5cf6] text-black' : 'border-[#27272a]'}`}>
                                                                                                {String.fromCharCode(65 + idx)}
                                                                                            </div>
                                                                                            {opt}
                                                                                        </div>
                                                                                    </button>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                        {userAnswers[i] !== undefined && (
                                                                            <motion.div
                                                                                initial={{ height: 0, opacity: 0 }}
                                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                                className="mt-4 text-xs bg-[#202025] p-3 rounded-lg border-l-2 border-[#8b5cf6] text-[#a1a1aa] leading-relaxed"
                                                                            >
                                                                                <span className="text-[#8b5cf6] font-bold uppercase mr-2">Insights:</span>
                                                                                {m.explanation}
                                                                            </motion.div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    ) : null}
                                </div>
                            </motion.div>
                        )}

                        {view === 'settings' && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="max-w-2xl mx-auto pt-10"
                            >
                                <div className="text-center space-y-2 mb-12">
                                    <h2 className="text-3xl font-bold">Profile Settings</h2>
                                    <p className="text-[#a1a1aa]">Manage your account preferences and personal details.</p>
                                </div>

                                <div className="bg-[#202025] p-8 rounded-3xl border border-[#27272a] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5cf6]/5 rounded-full blur-[60px]" />

                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#d946ef] flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-[#8b5cf6]/20">
                                            {user?.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold text-white">{user?.displayName || 'User'}</div>
                                            <div className="text-sm text-[#a1a1aa]">{user?.email}</div>
                                        </div>
                                    </div>

                                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                                        <div>
                                            <label className="text-xs font-bold text-[#52525b] uppercase tracking-widest block mb-2">Display Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525b] group-focus-within:text-[#8b5cf6] transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    value={newName}
                                                    onChange={(e) => setNewName(e.target.value)}
                                                    className="w-full bg-[#1c1c21] border border-[#27272a] rounded-xl py-3 pl-12 pr-4 text-white focus:ring-1 focus:ring-[#8b5cf6]/50 focus:border-[#8b5cf6]/50 transition-all outline-none"
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={updateStatus === 'updating'}
                                            className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {updateStatus === 'updating' ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <Save size={20} />
                                            )}
                                            {updateStatus === 'updating' ? 'Saving...' : 'Save Changes'}
                                        </button>

                                        {updateStatus === 'success' && (
                                            <div className="text-green-400 text-sm text-center font-medium bg-green-500/10 py-2 rounded-lg">Profile updated successfully!</div>
                                        )}
                                        {updateStatus === 'error' && (
                                            <div className="text-red-400 text-sm text-center font-medium bg-red-500/10 py-2 rounded-lg">Failed to update profile.</div>
                                        )}
                                    </form>
                                </div>
                            </motion.div>
                        )}

                        {view === 'resume' && (
                            <motion.div
                                key="resume"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="max-w-6xl mx-auto space-y-8 pt-10"
                            >
                                <div className="text-center space-y-3 mb-12">
                                    <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-[#a1a1aa] bg-clip-text text-transparent">Professional Resume Audit</h2>
                                    <p className="text-[#a1a1aa] max-w-xl mx-auto">Get a comprehensive ATS analysis and actionable feedback from our AI-powered executive recruiter engine.</p>
                                </div>

                                <div className="grid lg:grid-cols-3 gap-8">
                                    {/* Upload Card */}
                                    <div className="lg:col-span-1">
                                        <div className="bg-[#202025] rounded-3xl border border-[#27272a] overflow-hidden sticky top-24">
                                            <div className="p-1 bg-gradient-to-r from-[#8b5cf6]/10 via-[#d946ef]/10 to-[#8b5cf6]/10" />
                                            <div className="p-6">
                                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                                    <Upload size={20} className="text-[#8b5cf6]" />
                                                    Upload Resume
                                                </h3>

                                                <div className="border-2 border-dashed border-[#27272a] rounded-2xl p-8 text-center hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/5 transition-all group">
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        id="resume-upload"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                setResumeText(file.name);
                                                                e.target.resumeFile = file;
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor="resume-upload" className="cursor-pointer block">
                                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <FileText className="w-8 h-8 text-[#52525b] group-hover:text-[#8b5cf6] transition-colors" />
                                                        </div>
                                                        <p className="text-white font-medium mb-1">Select PDF File</p>
                                                        <p className="text-[#52525b] text-xs uppercase tracking-wide">Max Size 5MB</p>
                                                        {resumeText && (
                                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 px-3 py-2 bg-[#8b5cf6]/10 text-[#8b5cf6] text-xs font-bold rounded-lg truncate border border-[#8b5cf6]/20">
                                                                {resumeText}
                                                            </motion.div>
                                                        )}
                                                    </label>
                                                </div>

                                                <button
                                                    onClick={async () => {
                                                        const fileInput = document.getElementById('resume-upload');
                                                        const file = fileInput?.resumeFile;
                                                        if (!file) {
                                                            alert('Please select a PDF file first');
                                                            return;
                                                        }
                                                        setLoading(true);
                                                        try {
                                                            const formData = new FormData();
                                                            formData.append('file', file);
                                                            const res = await axios.post(`${API_BASE_URL}/score-resume`, formData, {
                                                                headers: { 'Content-Type': 'multipart/form-data' }
                                                            });
                                                            setResumeData(res.data);
                                                        } catch (err) {
                                                            console.error(err);
                                                        }
                                                        setLoading(false);
                                                    }}
                                                    disabled={loading || !resumeText}
                                                    className="w-full mt-6 bg-white hover:bg-gray-100 text-black font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {loading ? (
                                                        <Loader2 className="animate-spin" size={18} />
                                                    ) : (
                                                        <Sparkles size={18} />
                                                    )}
                                                    {loading ? 'Analyzing...' : 'Generate Audit'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Results Area */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {resumeData ? (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                                {/* Score Header */}
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div className="bg-[#202025] rounded-3xl p-6 border border-[#27272a] relative overflow-hidden flex flex-col justify-center items-center text-center">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5cf6]/5 rounded-full blur-[50px]" />
                                                        <div className="relative">
                                                            <div className="text-6xl font-black text-white tracking-tighter mb-2">{resumeData.score}</div>
                                                            <div className="text-xs font-bold text-[#8b5cf6] uppercase tracking-widest bg-[#8b5cf6]/10 px-3 py-1 rounded-full inline-block">ATS Score</div>
                                                        </div>
                                                    </div>
                                                    <div className="bg-[#202025] rounded-3xl p-6 border border-[#27272a] flex flex-col justify-center relative overflow-hidden">
                                                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-500/5 rounded-full blur-[40px]" />
                                                        <h4 className="text-[#a1a1aa] font-medium mb-1 text-sm">Verdict</h4>
                                                        <div className="text-3xl font-bold text-white mb-4">{resumeData.grade} Grade</div>
                                                        <p className="text-xs text-[#52525b] leading-relaxed line-clamp-3">
                                                            {resumeData.summary}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Section Metrics */}
                                                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                                                    {Object.entries(resumeData.section_scores || {}).map(([key, score]) => (
                                                        <div key={key} className="bg-[#18181b] border border-[#27272a] p-4 rounded-2xl">
                                                            <div className="text-[10px] text-[#52525b] uppercase font-bold mb-2 break-all">
                                                                {key.replace('_', ' ')}
                                                            </div>
                                                            <div className="flex items-end gap-2">
                                                                <span className={`text-xl font-bold ${score > 7 ? 'text-green-400' : score > 4 ? 'text-yellow-400' : 'text-red-400'}`}>{score}</span>
                                                                <span className="text-[#27272a] text-xs font-bold mb-1">/10</span>
                                                            </div>
                                                            <div className="w-full h-1 bg-[#27272a] rounded-full mt-2 overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${score > 7 ? 'bg-green-500' : score > 4 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                    style={{ width: `${score * 10}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Detailed Feedback Cards */}
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div className="bg-[#202025] rounded-3xl p-6 border border-[#27272a]">
                                                        <h4 className="flex items-center gap-2 text-green-400 font-bold mb-6">
                                                            <CheckCircle2 size={18} />
                                                            Key Strengths
                                                        </h4>
                                                        <ul className="space-y-4">
                                                            {resumeData.strengths.map((s, i) => (
                                                                <li key={i} className="flex gap-3 text-sm text-[#d4d4d8]">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                                                                    <span className="leading-relaxed">{s}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="bg-[#202025] rounded-3xl p-6 border border-[#27272a]">
                                                        <h4 className="flex items-center gap-2 text-red-400 font-bold mb-6">
                                                            <AlertCircle size={18} />
                                                            Actionable Fixes
                                                        </h4>
                                                        <ul className="space-y-4">
                                                            {resumeData.improvements.map((s, i) => (
                                                                <li key={i} className="flex gap-3 text-sm text-[#d4d4d8]">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                                                                    <span className="leading-relaxed">{s}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center p-12 bg-[#202025] rounded-3xl border border-[#27272a] border-dashed text-center">
                                                <div className="w-16 h-16 bg-[#27272a] rounded-full flex items-center justify-center mb-4">
                                                    <FileText className="text-[#52525b]" />
                                                </div>
                                                <h3 className="text-white font-bold mb-2">Ready to audit</h3>
                                                <p className="text-[#52525b] max-w-xs text-sm">Upload your resume layout to get a professional critique and ATS compatibility score.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-center pt-8 border-t border-[#27272a]">
                                        <p className="text-[10px] text-[#52525b] flex items-center justify-center gap-2 uppercase tracking-widest font-bold">
                                            <Lock size={12} />
                                            End-to-End Encrypted • Data Deleted After Analysis • ISO 27001 Compliant
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Global Professional Footer */}
                <footer className="border-t border-[#27272a] bg-[#131316] py-8 px-8 mt-auto">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#52525b]">
                        <div className="flex items-center gap-2 font-bold">
                            <div className="w-5 h-5 bg-[#8b5cf6] rounded-md flex items-center justify-center text-black">
                                <Sparkles size={12} fill="black" />
                            </div>
                            CareerFlow Enterprise
                        </div>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-white transition-colors">Security</a>
                            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
                        </div>
                        <div>
                            &copy; 2024 Placement AI Inc. All rights reserved.
                        </div>
                    </div>
                </footer>
            </main>

            {/* Request Modal */}
            < AnimatePresence >
                {isRequestModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#18181b] p-8 rounded-3xl border border-[#27272a] w-full max-w-md shadow-2xl"
                        >
                            <h3 className="text-xl font-bold mb-2 text-white">Request Company</h3>
                            <p className="text-[#a1a1aa] text-sm mb-6">Enter the name of the company you want to analyze.</p>
                            <input
                                type="text"
                                value={requestInput}
                                autoFocus
                                onChange={(e) => setRequestInput(e.target.value)}
                                className="w-full bg-[#202025] border border-[#27272a] rounded-xl p-4 text-white mb-6 focus:ring-1 focus:ring-[#8b5cf6] outline-none"
                                placeholder="e.g. Netflix, Uber..."
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setIsRequestModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold bg-[#27272a] text-white hover:bg-[#3f3f46] transition-colors">Cancel</button>
                                <button onClick={submitRequest} className="flex-1 py-3 rounded-xl font-bold bg-[#8b5cf6] text-white hover:bg-[#7c3aed] transition-colors">Analyze</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >

            {/* Mobile Bottom Navigation */}
            <nav className="bottom-nav">
                <button
                    onClick={() => { setView('dashboard'); setSelectedCompany(null); }}
                    className={`flex flex-col items-center gap-1 transition-colors ${view === 'dashboard' || view === 'company' || view === 'search' ? 'text-[#8b5cf6]' : 'text-[#a1a1aa]'}`}
                >
                    <LayoutDashboard size={20} />
                    <span className="text-[10px] font-bold">Home</span>
                </button>
                <button
                    onClick={() => setView('resume')}
                    className={`flex flex-col items-center gap-1 transition-colors ${view === 'resume' ? 'text-[#8b5cf6]' : 'text-[#a1a1aa]'}`}
                >
                    <PieChart size={20} />
                    <span className="text-[10px] font-bold">Audit</span>
                </button>
                <button
                    onClick={() => setView('settings')}
                    className={`flex flex-col items-center gap-1 transition-colors ${view === 'settings' ? 'text-[#8b5cf6]' : 'text-[#a1a1aa]'}`}
                >
                    <Settings size={20} />
                    <span className="text-[10px] font-bold">Settings</span>
                </button>
            </nav>

        </div >
    );
}

const SidebarItem = ({ icon, label, active, onClick, badge }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${active ? 'bg-[#8b5cf6]/10 text-[#8b5cf6]' : 'text-[#a1a1aa] hover:text-white hover:bg-[#202025]'}`}
    >
        <span className={`transition-colors ${active ? 'text-[#8b5cf6]' : 'group-hover:text-white'}`}>{icon}</span>
        <span className="font-medium">{label}</span>
        {active && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#8b5cf6] rounded-l-full" />}
        {badge && <span className="absolute right-4 px-1.5 py-0.5 bg-[#8b5cf6] text-white text-[9px] font-bold rounded-md uppercase">{badge}</span>}
    </button>
);

const CompanyCard = ({ company, onEnroll }) => (
    <div className="group relative bg-[#202025] rounded-3xl p-6 border border-[#27272a] hover:border-[#8b5cf6]/50 transition-all hover:shadow-xl hover:shadow-[#8b5cf6]/10 hover:-translate-y-1 cursor-pointer" onClick={onEnroll}>
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${company.color} mb-6 flex items-center justify-center text-black font-bold text-lg shadow-lg`}>
            {company.name[0]}
        </div>
        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#8b5cf6] transition-colors">{company.name}</h3>
        <p className="text-xs font-bold uppercase text-[#52525b] tracking-wider mb-8">{company.category}</p>

        <div className="flex items-center justify-between mt-auto">
            <span className="text-xs font-bold text-[#a1a1aa] group-hover:text-white transition-colors">View Roadmap</span>
            <div className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center group-hover:bg-[#8b5cf6] transition-colors">
                <ArrowRight size={14} className="text-white -rotate-45 group-hover:rotate-0 transition-transform" />
            </div>
        </div>
    </div>
);

export default App;
