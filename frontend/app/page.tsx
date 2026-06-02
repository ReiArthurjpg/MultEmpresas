"use client";

import React from "react";
import { LoginForm } from "@/components/login-form";
import { Mail, Lock, Eye, EyeOff, ChevronRight, Check, AlertTriangle, Shield, Activity, Globe } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#05070A] text-white font-sans selection:bg-[#D4AF37] selection:text-white flex overflow-hidden relative">
      <div className="w-full lg:w-[45%] flex flex-col relative z-10 bg-[#05070A] border-r border-white/5 shadow-2xl">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        <main className="flex-grow flex items-center justify-center px-6 sm:px-12 md:px-16 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
                ACESSE SUA <span className="text-[#D4AF37]">CONTA</span>
              </h1>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                Informe suas credenciais para gerenciar a plataforma
              </p>
              <div className="flex gap-4 mt-5 opacity-85">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" /> Conexão Segura
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Servidores Devallus
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" /> Verytas Ativo
                </div>
              </div>
            </div>

            {/* Integrate existing LoginForm (includes 2FA flow) */}
            <LoginForm />
          </div>
        </main>

        <footer className="p-8 flex justify-center gap-8 opacity-40 text-[9px] font-black uppercase tracking-widest border-t border-white/5">
          <a href="#" className="hover:text-[#D4AF37] transition-colors">Política de Privacidade</a>
          <a href="#" className="hover:text-[#D4AF37] transition-colors">Suporte Tecnológico</a>
          <a href="#" className="hover:text-[#D4AF37] transition-colors">Termos de Segurança</a>
        </footer>
      </div>

      <div className="hidden lg:flex lg:w-[55%] flex-col relative overflow-hidden bg-gradient-to-br from-[#040609] via-[#080B11] to-[#D4AF37]/10 p-16 justify-center items-center">
        <div className="absolute top-1/2 left-1/2 w-[550px] h-[550px] bg-[#D4AF37]/15 blur-[160px] rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="absolute top-12 right-12 w-[300px] h-[300px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-12 left-12 w-[250px] h-[250px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 text-center max-w-lg flex flex-col items-center">
          <div className="relative mb-10 group select-none">
            <div className="absolute inset-0 bg-[#D4AF37] rounded-2xl blur-3xl opacity-20 group-hover:opacity-35 transition-opacity duration-700 animate-pulse" />
            <div className="relative bg-[#090D15]/80 border border-white/10 p-10 py-12 rounded-2xl backdrop-blur-xl flex flex-col items-center justify-center shadow-2xl w-80 -skew-x-3 hover:scale-105 hover:border-[#D4AF37]/40 transition-all duration-500">
              <span className="text-[10px] font-black text-[#D4AF37] tracking-[0.4em] uppercase mb-3">TECNOLOGIA</span>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">DEVALLUS</h2>
              <div className="flex items-center gap-3 mt-5 w-full">
                <div className="h-[1px] flex-grow bg-white/10" />
                <span className="text-[9px] font-bold tracking-[0.25em] text-gray-400 uppercase whitespace-nowrap">BY VERYTAS DADOS</span>
                <div className="h-[1px] flex-grow bg-white/10" />
              </div>
            </div>
          </div>

          <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-4 text-center">INTELIGÊNCIA EM <span className="text-[#D4AF37] drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">DADOS</span></h2>
          <div className="h-[2px] w-16 bg-[#D4AF37] mb-6 rounded-full" />
          <p className="text-gray-400 font-bold uppercase tracking-[0.25em] text-[10px] mb-12 max-w-sm leading-relaxed text-center">Plataforma Integrada de Segurança, Governança de Dados e Otimização Tecnológica.</p>

          <div className="grid grid-cols-3 gap-3 w-full max-w-md pt-6 border-t border-white/5">
                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col items-center hover:bg-white/[0.03] transition-all">
              <Shield size={16} className="text-[#D4AF37] mb-2" />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Criptografia</span>
            </div>
            <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col items-center hover:bg-white/[0.03] transition-all">
              <Activity size={16} className="text-[#D4AF37] mb-2" />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Métricas Realtime</span>
            </div>
            <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col items-center hover:bg-white/[0.03] transition-all">
              <Globe size={16} className="text-[#D4AF37] mb-2" />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Escalabilidade</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
