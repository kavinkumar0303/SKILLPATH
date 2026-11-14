import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B3B2E] text-[#F3F6EF] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background Soft Lime Glow */}
      <div 
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, #C6F36B 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />

      <div className="relative z-10 max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo size="lg" variant="light" tagline={true} />
        </div>

        <div className="space-y-3 pt-4">
          <div className="font-heading text-8xl font-semibold text-[#C6F36B]">404</div>
          <h1 className="font-heading text-3xl font-semibold text-[#F3F6EF]">
            Curriculum node not found
          </h1>
          <p className="text-sm text-[#A9BDB1] leading-relaxed">
            The requested application route or verifiable credential resource does not exist in the active ontology graph.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-lime h-12 px-8 text-sm font-semibold inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 text-[#0B3B2E]" />
            <span>Return to dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
