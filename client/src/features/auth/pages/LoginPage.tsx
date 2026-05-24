import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';
import { loginSchema, type LoginFormValues } from '../schemas/authSchemas.js';
import { login } from '../../../api/authApi.js';
import { useAuthStore } from '../../../store/authStore.js';
import { cn } from '../../../lib/utils.js';

export default function LoginPage() {
  const navigate       = useNavigate();
  const setCredentials = useAuthStore((s) => s.setCredentials);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const res = await login(values);
      setCredentials(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Premium colorful gradient backdrops */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-40 -right-40 h-[450px] w-[450px] rounded-full bg-primary/10 blur-3xl opacity-60" />
        <div className="absolute -bottom-40 -left-40 h-[450px] w-[450px] rounded-full bg-indigo-500/10 blur-3xl opacity-60" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2.5 mb-4 group select-none">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20 transition-transform duration-500 group-hover:rotate-[360deg] shadow-xs">
              <Zap className="h-6 w-6 fill-current animate-pulse-subtle" />
            </div>
            <span className="font-heading font-extrabold text-2xl tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text">
              FlowSprint
            </span>
          </div>
          <h1 className="text-xl font-bold font-heading tracking-tight text-foreground">Sign in to your workspace</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your credentials to continue</p>
        </div>

        {/* Premium Form card */}
        <div className="rounded-2xl border bg-card/65 backdrop-blur-md p-8 shadow-xl border-slate-200/50 dark:border-slate-800/50 glow-border">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className={cn(
                    'w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border bg-white/5 dark:bg-black/20 border-slate-200/60 dark:border-slate-800/60',
                    'outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-300 focus:bg-white/10 dark:focus:bg-black/35',
                    errors.email && 'border-destructive focus:ring-destructive/30'
                  )}
                  placeholder="you@company.com"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                  className={cn(
                    'w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border bg-white/5 dark:bg-black/20 border-slate-200/60 dark:border-slate-800/60',
                    'outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-300 focus:bg-white/10 dark:focus:bg-black/35',
                    errors.password && 'border-destructive focus:ring-destructive/30'
                  )}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2.5 px-4 font-bold tracking-wide transition-all duration-300 active:scale-[0.98]',
                'rounded-xl bg-primary text-primary-foreground text-sm hover:shadow-lg hover:shadow-primary/20 hover:brightness-110',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:opacity-50 disabled:pointer-events-none'
              )}
            >
              {isSubmitting ? (
                <svg className="h-4 w-4 animate-spin text-current" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  Sign in <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          No account yet?{' '}
          <Link to="/register" className="text-primary hover:underline font-bold transition-all duration-150">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
