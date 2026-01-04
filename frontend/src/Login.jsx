import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithGoogle, loginWithEmail, registerWithEmail, sendPasswordReset } from './firebase';
import { Mail, Lock, ArrowRight, Github, Chrome, ArrowLeft } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [isReset, setIsReset] = useState(false); // New state for Password Reset mode
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        setSuccessMsg('');
        try {
            const user = await signInWithGoogle();
            onLoginSuccess(user);
        } catch (err) {
            setError(err.message || 'Failed to sign in with Google.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (!email) {
            setError("Please enter your email address.");
            return;
        }
        setLoading(true);
        setError('');
        setSuccessMsg('');
        try {
            await sendPasswordReset(email);
            setSuccessMsg(`Password reset link sent to ${email} `);
            setTimeout(() => { setIsReset(false); setSuccessMsg(''); }, 5000);
        } catch (err) {
            setError(err.message || "Failed to send reset link.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');
        try {
            let user;
            if (isRegister) {
                if (!name) {
                    setError("Please enter your full name.");
                    setLoading(false);
                    return;
                }
                user = await registerWithEmail(email, password, name);
                setSuccessMsg(`Welcome, ${name}! Verification email sent to ${email}`);
                // Optional: Don't login immediately if you want them to verify first
                // But for UX, we usually let them in.
                setTimeout(() => onLoginSuccess(user), 2000);
            } else {
                user = await loginWithEmail(email, password);
                onLoginSuccess(user);
            }
        } catch (err) {
            console.error(err.code);
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Incorrect password. Please try again.');
            } else if (err.code === 'auth/user-not-found') {
                setError('No account found with this email.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Email is already in use.');
            } else {
                setError(err.message || 'Authentication failed. Please check your credentials.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#8b5cf6]/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#d946ef]/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Branding */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        className="inline-block p-3 rounded-2xl bg-gradient-to-tr from-[#8b5cf6] to-[#d946ef] mb-6 shadow-xl shadow-[#8b5cf6]/20"
                    >
                        <Lock className="text-white" size={32} />
                    </motion.div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">CareerFlow</h1>
                    <p className="text-[#a1a1aa] font-medium">Elevate your professional journey</p>
                </div>

                {/* Login/Register/Reset Card */}
                <div className="bg-[#121214]/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-10 shadow-3xl shadow-black/50 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent opacity-50" />

                    {!isReset && (
                        <div className="relative flex p-1.5 bg-[#1c1c1f] rounded-2xl mb-8 border border-white/5 shadow-inner">
                            {/* Animated Background Pill */}
                            <motion.div
                                className="absolute top-1.5 bottom-1.5 bg-[#8b5cf6] rounded-xl shadow-lg shadow-[#8b5cf6]/25"
                                initial={false}
                                animate={{
                                    left: isRegister ? '50%' : '6px',
                                    right: isRegister ? '6px' : '50%'
                                }}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />

                            <button
                                onClick={() => setIsRegister(false)}
                                className={`flex-1 relative z-10 py-3 rounded-xl text-sm font-bold transition-colors duration-300 ${!isRegister ? 'text-white' : 'text-[#a1a1aa] hover:text-white'}`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setIsRegister(true)}
                                className={`flex-1 relative z-10 py-3 rounded-xl text-sm font-bold transition-colors duration-300 ${isRegister ? 'text-white' : 'text-[#a1a1aa] hover:text-white'}`}
                            >
                                Register
                            </button>
                        </div>
                    )}

                    <h2 className="text-2xl font-bold text-white mb-2">
                        {isReset ? 'Reset Password' : isRegister ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-[#71717a] text-sm mb-8">
                        {isReset ? 'Enter your email to receive a secure reset link.' :
                            isRegister ? 'Join thousands of professionals mastering interviews.' : 'Enter your credentials to access your dashboard.'}
                    </p>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-medium flex gap-3 items-center"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </motion.div>
                        )}
                        {successMsg && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-xs font-medium flex gap-3 items-center"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                {successMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={isReset ? handlePasswordReset : handleSubmit} className="space-y-4">
                        {isRegister && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-1.5"
                            >
                                <label className="text-[10px] uppercase font-bold text-[#52525b] tracking-widest ml-1">Full Name</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full bg-[#1c1c1f] border border-white/5 rounded-2xl py-4 px-4 text-white placeholder:text-[#3f3f46] focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6]/50 transition-all outline-none"
                                    />
                                </div>
                            </motion.div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-[#52525b] tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525b] group-focus-within:text-[#8b5cf6] transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full bg-[#1c1c1f] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-[#3f3f46] focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6]/50 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {!isReset && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-[#52525b] tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525b] group-focus-within:text-[#8b5cf6] transition-colors" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-[#1c1c1f] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-[#3f3f46] focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6]/50 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        {!isRegister && !isReset && (
                            <div className="flex justify-end">
                                <button type="button" onClick={() => setIsReset(true)} className="text-xs font-bold text-[#8b5cf6] hover:text-[#a78bfa] transition-colors">Forgot Password?</button>
                            </div>
                        )}

                        {isReset && (
                            <div className="flex justify-end">
                                <button type="button" onClick={() => setIsReset(false)} className="text-xs font-bold text-[#52525b] hover:text-white transition-colors flex items-center gap-1">
                                    <ArrowLeft size={12} /> Back to Login
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white hover:bg-white/90 text-black font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 mt-4 shadow-xl shadow-white/5"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>{isReset ? 'Send Reset Link' : isRegister ? 'Initialize Account' : 'Sign In Now'}</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {!isReset && (
                        <>
                            <div className="my-8 flex items-center gap-4 text-[#3f3f46]">
                                <div className="h-px bg-white/5 flex-1" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Or Securely Join With</span>
                                <div className="h-px bg-white/5 flex-1" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={loading}
                                    className="flex items-center justify-center gap-3 bg-[#1c1c1f] hover:bg-[#27272a] border border-white/5 text-white font-bold py-3.5 rounded-2xl transition-all group disabled:opacity-50"
                                >
                                    <Chrome className="text-[#8b5cf6] group-hover:scale-110 transition-transform" size={20} />
                                    <span className="text-sm">Google</span>
                                </button>
                                <button
                                    onClick={() => setError('GitHub sign-in coming soon!')}
                                    className="flex items-center justify-center gap-3 bg-[#1c1c1f] hover:bg-[#27272a] border border-white/5 text-white font-bold py-3.5 rounded-2xl transition-all group"
                                >
                                    <Github className="text-white group-hover:scale-110 transition-transform" size={20} />
                                    <span className="text-sm">GitHub</span>
                                </button>
                            </div>
                        </>
                    )}

                    <p className="text-center text-[10px] text-[#52525b] mt-10 leading-relaxed max-w-[240px] mx-auto">
                        By continuing, you agree to our <span className="text-[#8b5cf6] cursor-pointer">Terms of Service</span> and <span className="text-[#8b5cf6] cursor-pointer">Privacy Policy</span>.
                    </p>
                </div>

                {/* Social Proof */}
                <div className="mt-12 flex justify-center items-center gap-8 opacity-40 grayscale hover:opacity-80 transition-opacity">
                    <div className="text-white font-bold text-lg">Google</div>
                    <div className="text-white font-bold text-lg">Meta</div>
                    <div className="text-white font-bold text-lg">Amazon</div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;

