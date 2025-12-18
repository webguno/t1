import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Mail, Lock, User, Phone, Loader2, Zap, AlertCircle, ArrowRight } from 'lucide-react';

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        let authEmail = email;
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password,
        });
        if (error) throw error;
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: authData.user.id,
            email: email,
            full_name: fullName,
            phone: phone,
            role: 'user',
            created_at: new Date().toISOString()
          });
          
          if (profileError) console.warn(profileError);
          setError("Check your email to confirm!");
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gray-50">
        
      <div className="w-full max-w-sm animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-600/20 mb-4">
                 {/* MANUALLY EDIT ICON HERE: Replace src with your logo path or URL */}
                <img 
                  src="https://ui-avatars.com/api/?name=TE&background=4f46e5&color=fff&rounded=true" 
                  alt="App Logo" 
                  className="w-full h-full object-cover"
                />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">TaskEarn</h1>
            <p className="text-gray-500 text-sm mt-1">Start earning rewards today</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xl shadow-gray-200/50">
            
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">{isLogin ? 'Welcome back' : 'Create an account'}</h2>
                <p className="text-sm text-gray-500 mt-1">
                    {isLogin ? 'Enter your details to sign in.' : 'Fill in the form below to join.'}
                </p>
            </div>

            <form className="space-y-4" onSubmit={handleAuth}>
                
                {!isLogin && (
                    <>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                    placeholder="Mobile Number"
                                />
                            </div>
                        </div>
                    </>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type={isLogin ? "text" : "email"}
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            placeholder="name@example.com"
                        />
                    </div>
                </div>
                
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-red-600 text-xs bg-red-50 p-3 rounded-lg flex items-center gap-2 border border-red-100">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" /> 
                        <span>{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (
                        <>
                            {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>
        </div>

        <p className="text-center mt-6 text-sm text-gray-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
                onClick={toggleMode}
                className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
                {isLogin ? "Sign up" : "Log in"}
            </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
