import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueue } from '../context/QueueContext';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';

export const StaffLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useQueue();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = login(username, password);
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/counter-select');
      }
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex items-center justify-center p-4 lg:p-8 font-sans">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground mb-1">Welcome Back</h1>
          <p className="text-muted-foreground text-sm">Please sign in to your staff account</p>
        </div>

        <div className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden backdrop-blur-sm">
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="p-6 lg:p-8">
            {error && (
              <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-destructive font-medium text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex h-12 w-full rounded-xl border border-input bg-transparent pl-10 pr-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex h-12 w-full rounded-xl border border-input bg-transparent pl-10 pr-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 mt-2 shadow-sm"
              >
                Sign In
              </button>
            </div>

            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-border/40">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 text-center">Demo Credentials</p>
              <div className="space-y-2 text-sm">
                <div className="bg-muted/30 border border-border/50 rounded-lg p-3 flex justify-between items-center transition-colors hover:bg-muted/50 cursor-pointer" onClick={() => { setUsername('admin'); setPassword('admin123'); }}>
                  <span className="font-semibold text-foreground">Admin</span>
                  <span className="text-muted-foreground font-mono text-xs">admin / admin123</span>
                </div>
                <div className="bg-muted/30 border border-border/50 rounded-lg p-3 flex justify-between items-center transition-colors hover:bg-muted/50 cursor-pointer" onClick={() => { setUsername('cashier1'); setPassword('cash123'); }}>
                  <span className="font-semibold text-foreground">Cashier</span>
                  <span className="text-muted-foreground font-mono text-xs">cashier1 / cash123</span>
                </div>
                <div className="bg-muted/30 border border-border/50 rounded-lg p-3 flex justify-between items-center transition-colors hover:bg-muted/50 cursor-pointer" onClick={() => { setUsername('registrar1'); setPassword('reg123'); }}>
                  <span className="font-semibold text-foreground">Registrar</span>
                  <span className="text-muted-foreground font-mono text-xs">registrar1 / reg123</span>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center flex justify-center">
          <button
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors hover:underline underline-offset-4"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"><path d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            Back to Customer Kiosk
          </button>
        </div>
      </div>
    </div>
  );
};
