import React from 'react';
import { ZeroGHeroDeck } from './ZeroGHeroDeck';
import { EngineBentoMatrix } from './EngineBentoMatrix';
import type { ParticleFieldTelemetry } from './ParticleGravityField';

export interface LandingViewProps {
  onCreateRoom: () => Promise<boolean> | void;
  onJoinRoom: (code: string) => Promise<boolean> | void;
  onReenterSession?: () => Promise<boolean> | void;
  loading?: boolean;
  error?: string | null;
  telemetry?: ParticleFieldTelemetry;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onCreateRoom,
  onJoinRoom,
  onReenterSession,
  loading = false,
  error = null,
}) => {
  return (
    <div
      data-testid="landing-view-root"
      className="min-h-[100dvh] bg-transparent text-[#cdd6f4] flex flex-col justify-between pt-4 sm:pt-6 pb-28 px-4 sm:px-6 lg:px-10 relative overflow-hidden"
    >
      {/* Ambient Catppuccin Mocha Radial washes */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(circle at 14% 16%, rgba(203, 166, 247, 0.08), transparent 44%), radial-gradient(circle at 86% 24%, rgba(250, 179, 135, 0.06), transparent 46%), radial-gradient(circle at 50% 88%, rgba(166, 227, 161, 0.05), transparent 50%)',
        }}
      />

      <div className="max-w-7xl mx-auto w-full z-10 my-auto space-y-24 sm:space-y-32">
        <ZeroGHeroDeck
          onCreateRoom={onCreateRoom}
          onJoinRoom={onJoinRoom}
          onReenterSession={onReenterSession}
          loading={loading}
          error={error}
        />

        <EngineBentoMatrix onCreateRoom={onCreateRoom} loading={loading} />
      </div>
    </div>
  );
};
