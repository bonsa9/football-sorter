import React, { useState } from "react";
import type { Player } from "../engine/types";

interface PlayerAvatarProps {
  player: Player;
  kitColor?: "home" | "away" | "third";
  size?: "sm" | "md" | "lg";
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  player,
  kitColor = "home",
  size = "lg",
}) => {
  const [imageError, setImageError] = useState(false);

  const getKitColors = () => {
    switch (kitColor) {
      case "away":
        return {
          primary: "#1e3a8a",
          secondary: "#facc15",
          accent: "#dc2626",
          text: "#ffffff",
        };
      case "third":
        return {
          primary: "#fef3c7",
          secondary: "#b45309",
          accent: "#dc2626",
          text: "#1e293b",
        };
      case "home":
      default:
        return {
          primary: "#b91c1c",
          secondary: "#f59e0b",
          accent: "#1e3a8a",
          text: "#ffffff",
        };
    }
  };

  const colors = getKitColors();
  const playerNumber = player.number ?? (Math.abs(hashString(player.id)) % 25 + 1);

  // Small avatar (Roster grid chips)
  if (size === "sm") {
    if (player.photoUrl && !imageError) {
      return (
        <img
          src={player.photoUrl}
          alt={player.name}
          className="player-avatar-sm-img"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      );
    }
    return (
      <div className="player-avatar-sm" style={{ backgroundColor: colors.primary }}>
        <span style={{ color: colors.text }}>{playerNumber}</span>
      </div>
    );
  }

  // Large avatar (Head-to-head battle card)
  if (player.photoUrl && !imageError) {
    return (
      <div className="player-photo-container">
        <img
          src={player.photoUrl}
          alt={player.name}
          className="player-card-photo"
          onError={() => setImageError(true)}
          loading="eager"
        />
      </div>
    );
  }

  // Fallback vector athletic silhouette
  return (
    <div className={`player-avatar-card ${size}`}>
      <svg
        viewBox="0 0 200 240"
        className="avatar-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`kitGrad-${player.id}-${kitColor}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={darken(colors.primary, 20)} />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.25" />
          </filter>
        </defs>

        <circle cx="100" cy="115" r="75" fill={colors.secondary} opacity="0.12" />

        <g filter="url(#shadow)">
          <circle cx="100" cy="55" r="24" fill="#fcd34d" />
          <path d="M92 78 L108 78 L105 92 L95 92 Z" fill="#f59e0b" />
          <path d="M78 52 C78 35, 122 35, 122 52 C120 42, 80 42, 78 52 Z" fill="#292524" />
          <path
            d="M50 115 L62 94 C72 88, 85 86, 100 86 C115 86, 128 88, 138 94 L150 115 L135 125 L127 108 L127 210 L73 210 L73 108 L65 125 Z"
            fill={`url(#kitGrad-${player.id}-${kitColor})`}
          />
          <path d="M86 86 C86 96, 114 96, 114 86" fill="none" stroke={colors.secondary} strokeWidth="4" />
          <path d="M68 92 L76 104" stroke={colors.secondary} strokeWidth="3" strokeLinecap="round" />
          <path d="M132 92 L124 104" stroke={colors.secondary} strokeWidth="3" strokeLinecap="round" />
          <circle cx="82" cy="118" r="6" fill={colors.secondary} />
          <path d="M80 116 L84 116 L82 121 Z" fill={colors.primary} />
          <text
            x="100"
            y="155"
            textAnchor="middle"
            fill={colors.text}
            fontSize="32"
            fontFamily="'Barlow Condensed', sans-serif"
            fontWeight="800"
            letterSpacing="-1"
          >
            {playerNumber}
          </text>
        </g>
      </svg>
    </div>
  );
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function darken(hex: string, percent: number): string {
  if (!hex.startsWith("#") || hex.length < 7) return hex;
  const num = parseInt(hex.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}
