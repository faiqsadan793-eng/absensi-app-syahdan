import { useEffect, useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-[radial-gradient(circle_at_top_left,_rgba(191,219,254,0.7),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.2),_transparent_26%),linear-gradient(135deg,#eff6ff_0%,#dbeafe_38%,#eef2ff_100%)] text-slate-800 relative overflow-hidden font-sans">
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />

            <Head title="Log in — Presensi App" />

            <div className="relative w-full max-w-md p-8 sm:p-10 rounded-[28px] bg-white/80 backdrop-blur-xl border border-blue-200/70 shadow-[0_20px_60px_rgba(59,130,246,0.15)] z-10">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457-.39-2.823-1.07-4" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Presensi App
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Masuk dengan akun kamu untuk mulai absen.
                    </p>
                </div>

                {status && (
                    <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium text-center">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <InputLabel htmlFor="username" value="Username" className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1" />

                        <TextInput
                            id="username"
                            type="text"
                            name="username"
                            value={data.username}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-blue-200 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm shadow-sm"
                            autoComplete="username"
                            isFocused={true}
                            placeholder="Ketik username kamu"
                            onChange={(e) => setData('username', e.target.value)}
                        />

                        <InputError message={errors.username} className="mt-2 text-xs text-rose-500" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value="Password" className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1" />

                        <div className="relative">
                            <TextInput
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                className="w-full px-4 py-3 pr-11 rounded-xl bg-white border border-blue-200 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm shadow-sm"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                onChange={(e) => setData('password', e.target.value)}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-blue-600 transition-colors focus:outline-none"
                                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 012.627-4.373M6.634 6.632A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.963 9.963 0 01-4.087 5.76M9.88 9.88a3 3 0 104.24 4.24M3 3l18 18" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.036 12.322a1.012 1.012 0 010-.644C3.31 7.55 7.2 4.5 12 4.5s8.69 3.05 9.964 7.178a1.012 1.012 0 010 .644C20.69 16.45 16.8 19.5 12 19.5S3.31 16.45 2.036 12.322z" />
                                        <circle cx="12" cy="12" r="3.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <InputError message={errors.password} className="mt-2 text-xs text-rose-500" />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center cursor-pointer">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ms-2 text-sm text-slate-600 font-normal">
                                Ingat saya
                            </span>
                        </label>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <span>Memproses...</span>
                            ) : (
                                <>
                                    <span>Masuk ke Akun</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center text-xs text-slate-500">
                    &copy; {new Date().getFullYear()} Presensi App • System Modern
                </div>
            </div>
        </div>
    );
}