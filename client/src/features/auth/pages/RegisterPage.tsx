import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { registerSchema, type RegisterFormValues } from '../schemas/authSchemas.js';
import { register as apiRegister } from '../../../api/authApi.js';
import { useAuthStore } from '../../../store/authStore.js';
import { cn } from '../../../lib/utils.js';

export default function RegisterPage() {
  const navigate       = useNavigate();
  const setCredentials = useAuthStore((s) => s.setCredentials);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const res = await apiRegister(values);
      setCredentials(res.data.user, res.data.token);
      toast.success(`Welcome to FlowSprint, ${res.data.user.name}!`);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    }
  };

  const fieldClass = (hasError?: boolean) =>
    cn(
      'w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border bg-background',
      'outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all',
      hasError && 'border-destructive focus:ring-destructive/20'
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Subtle gradient backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-primary/10 rounded-xl flex items-center justify-center w-[38px] h-[38px]">
              <img
                src="/logo.png"
                alt="FlowSprint"
                className="h-6 w-6 object-contain rounded-md"
              />
            </div>
            <span className="font-heading font-extrabold text-2xl tracking-tight">FlowSprint</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Create your workspace account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start managing projects in seconds</p>
        </div>

        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input id="name" type="text" autoComplete="name" {...register('name')}
                  className={fieldClass(!!errors.name)} placeholder="Alex Mercer" />
              </div>
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input id="email" type="email" autoComplete="email" {...register('email')}
                  className={fieldClass(!!errors.email)} placeholder="you@company.com" />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input id="password" type="password" autoComplete="new-password" {...register('password')}
                  className={fieldClass(!!errors.password)} placeholder="Min. 6 chars, 1 uppercase, 1 number" />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label htmlFor="role" className="text-sm font-medium">Workspace role</label>
              <select id="role" {...register('role')}
                className="w-full px-3 py-2.5 text-sm rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
                <option value="member">Member — standard access</option>
                <option value="manager">Manager — create & manage projects</option>
              </select>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isSubmitting}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2.5 px-4',
                'rounded-lg bg-primary text-primary-foreground text-sm font-medium',
                'hover:bg-primary/90 active:scale-[0.98] transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:opacity-50 disabled:pointer-events-none'
              )}>
              {isSubmitting ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>Create account <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
