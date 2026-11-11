import type { Player, Pool, Rating } from "../engine/types";

export type ShareFormat = "story" | "post" | "square";
export type ShareMode = "top3" | "top10";

interface GenerateShareOptions {
  pool: Pool;
  ratings: Rating[];
  playersMap: Map<string, Player>;
  kitColor?: "home" | "away" | "third";
  format?: ShareFormat;
  mode?: ShareMode;
}

const DIMENSIONS: Record<ShareFormat, { width: number; height: number }> = {
  story: { width: 1080, height: 1920 }, // 9:16 Instagram Story
  post: { width: 1080, height: 1350 },  // 4:5 Portrait Feed Post
  square: { width: 1080, height: 1080 }, // 1:1 Square
};

function getThemeColors(pool: Pool, kitColor: "home" | "away" | "third" = "home") {
  if (pool.kits?.[kitColor]?.paper) {
    return {
      bg: pool.kits[kitColor].paper,
      cardBg: pool.kits[kitColor].card || "#ffffff",
      text: pool.kits[kitColor].onPaper || "#ffffff",
      accent: pool.kits[kitColor].accent || "#063672",
      primary: pool.kits[kitColor].primary || "#ba181b",
    };
  }
  if (pool.id.includes("arsenal")) {
    return { bg: "#DB0007", cardBg: "#ffffff", text: "#ffffff", accent: "#063672", primary: "#ba181b" };
  }
  if (pool.id.includes("liverpool")) {
    return { bg: "#C8102E", cardBg: "#ffffff", text: "#ffffff", accent: "#001f3f", primary: "#870014" };
  }
  if (pool.id.includes("mancity")) {
    return { bg: "#6CABDD", cardBg: "#ffffff", text: "#ffffff", accent: "#1C2C5B", primary: "#00285E" };
  }
  if (pool.id.includes("chelsea")) {
    return { bg: "#034694", cardBg: "#ffffff", text: "#ffffff", accent: "#0A1E4A", primary: "#034694" };
  }
  if (pool.id.includes("manutd")) {
    return { bg: "#DA291C", cardBg: "#ffffff", text: "#ffffff", accent: "#062A4E", primary: "#111111" };
  }
  if (pool.id.includes("tottenham")) {
    return { bg: "#132257", cardBg: "#ffffff", text: "#ffffff", accent: "#080D24", primary: "#132257" };
  }
  if (pool.id.includes("aston-villa")) {
    return { bg: "#670E36", cardBg: "#ffffff", text: "#ffffff", accent: "#95BFE5", primary: "#670E36" };
  }
  if (pool.id.includes("strikers")) return { bg: "#9a3412", cardBg: "#ffffff", text: "#ffffff", accent: "#ea580c", primary: "#c2410c" };
  if (pool.id.includes("midfielders")) return { bg: "#4c1d95", cardBg: "#ffffff", text: "#ffffff", accent: "#7c3aed", primary: "#6d28d9" };
  if (pool.id.includes("centre-backs")) return { bg: "#064e3b", cardBg: "#ffffff", text: "#ffffff", accent: "#059669", primary: "#047857" };
  if (pool.id.includes("goalkeepers")) return { bg: "#78350f", cardBg: "#ffffff", text: "#ffffff", accent: "#d97706", primary: "#b45309" };
  if (pool.id.includes("managers")) return { bg: "#0f172a", cardBg: "#ffffff", text: "#ffffff", accent: "#334155", primary: "#1e293b" };
  return { bg: "#C60B1E", cardBg: "#ffffff", text: "#ffffff", accent: "#001f3f", primary: "#ba181b" };
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function generateShareCanvas(options: GenerateShareOptions): Promise<HTMLCanvasElement> {
  const { pool, ratings, playersMap, kitColor = "home", format = "story", mode = "top3" } = options;
  const { width, height } = DIMENSIONS[format];
  const colors = getThemeColors(pool, kitColor);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // 1. Draw Background with atmospheric gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, colors.bg);
  bgGrad.addColorStop(0.7, colors.bg);
  bgGrad.addColorStop(1, "#05070e");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Decorative athletic diagonal stripes in background
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = "#ffffff";
  for (let i = -width; i < width * 2; i += 120) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 300, height);
    ctx.lineTo(i + 360, height);
    ctx.lineTo(i + 60, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Load crest
  const crestImg = pool.crestUrl ? await loadImage(pool.crestUrl) : null;

  // 2. Header Section
  const headerTop = format === "story" ? 140 : 80;
  let textStartX = 80;

  if (crestImg) {
    const crestSize = format === "story" ? 130 : 100;
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 20;
    ctx.drawImage(crestImg, 80, headerTop, crestSize, crestSize);
    ctx.restore();
    textStartX = 80 + crestSize + 30;
  }

  // Header Subtitle
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText("FOOTBALL SORTER · RANKINGS", textStartX, headerTop + 32);

  // Header Title
  ctx.fillStyle = "#ffffff";
  ctx.font = '900 68px "Barlow Condensed", "Arial Narrow", sans-serif';
  const displayTitle = pool.title.toUpperCase();
  ctx.fillText(displayTitle, textStartX, headerTop + 96);

  // 3. Draw Podium (Top 3 Mode)
  if (mode === "top3") {
    const top3Ratings = ratings.slice(0, 3);
    const podiumItems = [
      { rating: top3Ratings[1], rank: 2, x: width * 0.22, yOffset: 60, medalColor: "#94a3b8", label: "2ND" },
      { rating: top3Ratings[0], rank: 1, x: width * 0.5, yOffset: 0, medalColor: "#eab308", label: "1ST" },
      { rating: top3Ratings[2], rank: 3, x: width * 0.78, yOffset: 90, medalColor: "#f97316", label: "3RD" },
    ];

    const centerY = format === "story" ? height * 0.48 : height * 0.52;

    for (const item of podiumItems) {
      if (!item.rating) continue;
      const player = playersMap.get(item.rating.entityId);
      const isWinner = item.rank === 1;
      const avatarR = isWinner ? 140 : 110;
      const posX = item.x;
      const posY = centerY + item.yOffset;

      // Draw Avatar Circle with glowing border
      ctx.save();
      ctx.shadowColor = item.medalColor;
      ctx.shadowBlur = isWinner ? 35 : 20;
      ctx.strokeStyle = item.medalColor;
      ctx.lineWidth = isWinner ? 10 : 7;
      ctx.beginPath();
      ctx.arc(posX, posY, avatarR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Clip image inside avatar circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(posX, posY, avatarR, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = "#0c1b33";
      ctx.fillRect(posX - avatarR, posY - avatarR, avatarR * 2, avatarR * 2);

      const pImg = player?.photoUrl ? await loadImage(player.photoUrl) : null;
      if (pImg) {
        const aspect = pImg.naturalWidth / pImg.naturalHeight;
        const drawH = avatarR * 2.3;
        const drawW = drawH * aspect;
        ctx.drawImage(pImg, posX - drawW / 2, posY - avatarR * 0.4, drawW, drawH);
      } else {
        // Fallback initials
        ctx.fillStyle = "#ffffff";
        ctx.font = '800 64px "Barlow Condensed", sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(player?.name?.slice(0, 2).toUpperCase() || "#", posX, posY);
      }
      ctx.restore();

      // Medal Badge (#1, #2, #3)
      const medalRadius = isWinner ? 36 : 28;
      const medalY = posY + avatarR - 10;
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 12;
      ctx.fillStyle = item.medalColor;
      ctx.beginPath();
      ctx.arc(posX, medalY, medalRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#0f172a";
      ctx.font = `900 ${isWinner ? "32px" : "24px"} "Barlow Condensed", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`#${item.rank}`, posX, medalY);
      ctx.restore();

      // Player Name
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = `900 ${isWinner ? "36px" : "28px"} "Barlow Condensed", sans-serif`;
      const nameY = posY + avatarR + (isWinner ? 55 : 45);
      ctx.fillText((player?.name || item.rating.entityId).toUpperCase(), posX, nameY);

      // Subtitle: Position & Club
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
      const subInfo = [
        player?.position,
        player?.clubName || player?.nationality,
      ].filter(Boolean).join(" · ");
      ctx.fillText(subInfo, posX, nameY + 30);
    }
  } else {
    // 4. Top 10 List View
    const listTop = format === "story" ? 360 : 260;
    const listRatings = ratings.slice(0, 10);
    const rowHeight = format === "story" ? 115 : 82;
    const rowGap = format === "story" ? 16 : 10;

    for (let i = 0; i < listRatings.length; i++) {
      const rating = listRatings[i];
      const player = playersMap.get(rating.entityId);
      const rank = i + 1;
      const rowY = listTop + i * (rowHeight + rowGap);
      const rowX = 80;
      const rowW = width - 160;

      // Row background
      ctx.save();
      ctx.fillStyle = i < 3 ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.12)";
      ctx.beginPath();
      ctx.roundRect(rowX, rowY, rowW, rowHeight, 16);
      ctx.fill();
      ctx.restore();

      // Rank Badge
      const isTop3 = rank <= 3;
      const badgeColor = rank === 1 ? "#eab308" : rank === 2 ? "#94a3b8" : rank === 3 ? "#f97316" : "#475569";
      ctx.fillStyle = badgeColor;
      ctx.font = '900 32px "Barlow Condensed", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`#${rank}`, rowX + 45, rowY + rowHeight / 2);

      // Player photo thumbnail
      const thumbX = rowX + 105;
      const thumbY = rowY + rowHeight / 2;
      const thumbR = rowHeight * 0.38;

      ctx.save();
      ctx.beginPath();
      ctx.arc(thumbX, thumbY, thumbR, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = "#0c1b33";
      ctx.fillRect(thumbX - thumbR, thumbY - thumbR, thumbR * 2, thumbR * 2);

      const pImg = player?.photoUrl ? await loadImage(player.photoUrl) : null;
      if (pImg) {
        ctx.drawImage(pImg, thumbX - thumbR, thumbY - thumbR, thumbR * 2, thumbR * 2);
      }
      ctx.restore();

      // Player Name
      ctx.textAlign = "left";
      ctx.fillStyle = isTop3 ? "#0f172a" : "#ffffff";
      ctx.font = '800 28px "Barlow Condensed", sans-serif';
      ctx.fillText((player?.name || rating.entityId).toUpperCase(), rowX + 160, rowY + rowHeight / 2 - 4);

      // Position Tag
      ctx.fillStyle = isTop3 ? "#64748b" : "rgba(255, 255, 255, 0.7)";
      ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
      const posText = `${player?.position || "GEN"} · ${player?.clubName || player?.nationality || ""}`;
      ctx.fillText(posText, rowX + 160, rowY + rowHeight / 2 + 22);

      // Strength / Score
      ctx.textAlign = "right";
      ctx.fillStyle = isTop3 ? "#059669" : "#34d399";
      ctx.font = '800 24px "Barlow Condensed", sans-serif';
      const strengthText = rating.strength >= 0 ? `+${rating.strength.toFixed(2)}` : rating.strength.toFixed(2);
      ctx.fillText(strengthText, rowX + rowW - 30, rowY + rowHeight / 2);
    }
  }

  // 5. Footer Watermark
  const footerY = height - (format === "story" ? 100 : 60);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, footerY - 30);
  ctx.lineTo(width - 80, footerY - 30);
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText("⚽ bonsa9.github.io/football-sorter", 80, footerY + 10);

  ctx.textAlign = "right";
  ctx.fillText("Ranked via Bradley-Terry pairwise battles", width - 80, footerY + 10);

  return canvas;
}

export async function downloadShareCard(options: GenerateShareOptions, fileName?: string): Promise<void> {
  const canvas = await generateShareCanvas(options);
  const dataUrl = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = fileName || `football-sorter-${options.pool.id}-${options.mode || "top3"}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function shareToSocial(options: GenerateShareOptions): Promise<boolean> {
  const canvas = await generateShareCanvas(options);
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return resolve(false);
      const file = new File([blob], `football-sorter-${options.pool.id}.png`, { type: "image/png" });
      const shareData = {
        title: `${options.pool.title} Ranking`,
        text: `Here is my head-to-head ranking for ${options.pool.title}! Rank your own at:`,
        url: window.location.href,
        files: [file],
      };

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share(shareData);
          resolve(true);
        } catch {
          resolve(false);
        }
      } else {
        // Fallback: download the image
        await downloadShareCard(options);
        resolve(true);
      }
    }, "image/png");
  });
}

