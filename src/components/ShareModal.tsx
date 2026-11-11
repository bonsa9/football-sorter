import React, { useState, useEffect, useRef } from "react";
import type { Player, Pool, Rating } from "../engine/types";
import {
  generateShareCanvas,
  downloadShareCard,
  shareToSocial,
  type ShareFormat,
  type ShareMode,
} from "../lib/canvasShare";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: Pool;
  ratings: Rating[];
  playersMap: Map<string, Player>;
  kitColor?: "home" | "away" | "third";
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  pool,
  ratings,
  playersMap,
  kitColor = "home",
}) => {
  const [format, setFormat] = useState<ShareFormat>("story");
  const [mode, setMode] = useState<ShareMode>("top3");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate preview when format or mode changes
  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    async function renderPreview() {
      setLoading(true);
      setStatusMessage(null);
      try {
        const canvas = await generateShareCanvas({
          pool,
          ratings,
          playersMap,
          kitColor,
          format,
          mode,
        });
        if (!isCancelled) {
          canvasRef.current = canvas;
          setPreviewUrl(canvas.toDataURL("image/png"));
        }
      } catch (err: any) {
        console.error("Failed to generate share preview:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    renderPreview();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, pool, ratings, playersMap, kitColor, format, mode]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setStatusMessage("Downloading poster...");
      await downloadShareCard({
        pool,
        ratings,
        playersMap,
        kitColor,
        format,
        mode,
      });
      setStatusMessage("✓ Saved to downloads!");
      setTimeout(() => setStatusMessage(null), 2500);
    } catch (e: any) {
      console.error(e);
      setStatusMessage("Error downloading image.");
    }
  };

  const handleShareSheet = async () => {
    try {
      setStatusMessage("Preparing image...");
      const shared = await shareToSocial({
        pool,
        ratings,
        playersMap,
        kitColor,
        format,
        mode,
      });
      if (shared) {
        setStatusMessage("✓ Shared successfully!");
        setTimeout(() => setStatusMessage(null), 2500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostToX = () => {
    const top1 = ratings[0] ? playersMap.get(ratings[0].entityId)?.name || ratings[0].entityId : "";
    const top2 = ratings[1] ? playersMap.get(ratings[1].entityId)?.name || ratings[1].entityId : "";
    const top3 = ratings[2] ? playersMap.get(ratings[2].entityId)?.name || ratings[2].entityId : "";
    
    const text = encodeURIComponent(
      `My top 3 for ${pool.title}:\n🥇 ${top1}\n🥈 ${top2}\n🥉 ${top3}\n\nRank your whole squad on Football Sorter:`
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  return (
    <div className="share-modal-backdrop" onClick={onClose}>
      <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="share-modal-header">
          <div className="modal-title-group">
            <span className="modal-kicker">CREATE SHAREABLE CARD</span>
            <h2 className="modal-title">Export Ranking Poster</h2>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Options Controls */}
        <div className="share-modal-controls">
          {/* Format selector */}
          <div className="control-group">
            <label className="control-label">Aspect Ratio</label>
            <div className="segmented-control">
              <button
                type="button"
                className={`segment-btn ${format === "story" ? "active" : ""}`}
                onClick={() => setFormat("story")}
              >
                📱 Story (9:16)
              </button>
              <button
                type="button"
                className={`segment-btn ${format === "post" ? "active" : ""}`}
                onClick={() => setFormat("post")}
              >
                🖼️ Post (4:5)
              </button>
              <button
                type="button"
                className={`segment-btn ${format === "square" ? "active" : ""}`}
                onClick={() => setFormat("square")}
              >
                ⏹️ Square (1:1)
              </button>
            </div>
          </div>

          {/* Mode selector */}
          <div className="control-group">
            <label className="control-label">Card Content</label>
            <div className="segmented-control">
              <button
                type="button"
                className={`segment-btn ${mode === "top3" ? "active" : ""}`}
                onClick={() => setMode("top3")}
              >
                🏆 Top 3 Podium
              </button>
              <button
                type="button"
                className={`segment-btn ${mode === "top10" ? "active" : ""}`}
                onClick={() => setMode("top10")}
              >
                📋 Top 10 List
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Container */}
        <div className="share-preview-container">
          {loading ? (
            <div className="preview-loading-spinner">
              <div className="spinner"></div>
              <span>Rendering graphics with portraits...</span>
            </div>
          ) : previewUrl ? (
            <div className={`preview-frame frame-${format}`}>
              <img src={previewUrl} alt="Ranking Preview" className="preview-image" />
            </div>
          ) : (
            <div className="preview-error">Failed to generate preview</div>
          )}
        </div>

        {/* Status notice */}
        {statusMessage && <div className="share-status-toast">{statusMessage}</div>}

        {/* Action Buttons */}
        <div className="share-modal-actions">
          <button
            type="button"
            className="btn-action-primary btn-download"
            onClick={handleDownload}
            disabled={loading}
          >
            ⬇️ Download PNG
          </button>
          <button
            type="button"
            className="btn-action-secondary btn-share-sheet"
            onClick={handleShareSheet}
            disabled={loading}
          >
            📲 Share Image
          </button>
          <button
            type="button"
            className="btn-action-outline btn-post-x"
            onClick={handlePostToX}
          >
            𝕏 Post on X
          </button>
        </div>
      </div>
    </div>
  );
};
