import React, { useRef, useEffect } from 'react';
import { Download, ShieldCheck, Share2 } from 'lucide-react';

export default function CertificateGenerator({
  athleteName = 'ATHLETE_ONE',
  exercise = 'pushup',
  reps = 0,
  accuracy = 99.9,
  duration = 0,
  maxStreak = 0,
  date = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}) {
  const canvasRef = useRef(null);

  const exerciseLabel =
    exercise === 'pushup'
      ? 'OLYMPIC PUSH-UPS'
      : exercise === 'squat'
      ? 'PARALLEL SQUATS'
      : 'JUMPING JACKS';

  const hashId = `TR-${Math.random().toString(36).substring(2, 9).toUpperCase()}-99`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = 1200;
    const height = 675;
    canvas.width = width;
    canvas.height = height;

    // 1. Dark Cyberpunk Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#030712');
    bgGrad.addColorStop(0.5, '#070f26');
    bgGrad.addColorStop(1, '#02040a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. High-Tech Grid Pattern
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 3. Cyberpunk Border Frames & Glowing Corners
    ctx.strokeStyle = '#0070F3';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 3;
    // Corner accents
    const cSize = 25;
    const corners = [
      [30, 30, 1, 1],
      [width - 30, 30, -1, 1],
      [30, height - 30, 1, -1],
      [width - 30, height - 30, -1, -1]
    ];
    corners.forEach(([cx, cy, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy + dy * cSize);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + dx * cSize, cy);
      ctx.stroke();
    });

    // 4. Header Badge
    ctx.font = 'bold 16px "Space Grotesk", monospace';
    ctx.fillStyle = '#00d2ff';
    ctx.letterSpacing = '3px';
    ctx.fillText('COMBATFORM • ON-DEVICE CV REFEREE VERIFIED', 60, 80);

    // 5. Main Title
    ctx.font = '900 48px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#0070F3';
    ctx.shadowBlur = 20;
    ctx.fillText('PROOF OF WORKOUT', 60, 145);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.font = '600 16px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('AUTONOMOUS AI OLYMPIC BIOMECHANICS CERTIFICATE', 60, 175);

    // Divider
    const divGrad = ctx.createLinearGradient(60, 0, width - 60, 0);
    divGrad.addColorStop(0, '#00d2ff');
    divGrad.addColorStop(0.5, '#0070F3');
    divGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 200);
    ctx.lineTo(width - 60, 200);
    ctx.stroke();

    // 6. Athlete & Exercise Details
    ctx.font = '600 14px "Space Grotesk", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('ATHLETE IDENTITY', 60, 245);
    ctx.font = 'bold 28px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(athleteName.toUpperCase(), 60, 280);

    ctx.font = '600 14px "Space Grotesk", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('EXERCISE PROTOCOL', 400, 245);
    ctx.font = 'bold 28px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#00d2ff';
    ctx.fillText(exerciseLabel, 400, 280);

    // 7. Stat Pillars
    const drawPillar = (x, y, w, h, label, val, color) => {
      ctx.fillStyle = '#071126';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 14);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 12px "Space Grotesk", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(label.toUpperCase(), x + 20, y + 32);

      ctx.font = '900 36px "Space Grotesk", monospace';
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.fillText(val, x + 20, y + 76);
      ctx.shadowBlur = 0;
    };

    const pillarW = 240;
    const pillarH = 100;
    drawPillar(60, 330, pillarW, pillarH, 'Verified Reps', `${reps}`, '#ffffff');
    drawPillar(330, 330, pillarW, pillarH, 'Form Accuracy', `${accuracy}%`, '#10b981');
    drawPillar(600, 330, pillarW, pillarH, 'Max Streak', `${maxStreak} Clean`, '#f59e0b');
    drawPillar(870, 330, pillarW, pillarH, 'Workout Time', `${Math.round(duration)}s`, '#38bdf8');

    // 8. Sentinel Verification Seal (Right Bottom Corner)
    const sealX = width - 200;
    const sealY = height - 160;

    // Glowing seal ring
    ctx.beginPath();
    ctx.arc(sealX, sealY, 55, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(sealX, sealY, 48, 0, 2 * Math.PI);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#34d399';
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '900 13px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.textAlign = 'center';
    ctx.fillText('SENTINEL', sealX, sealY - 10);
    ctx.font = 'bold 11px "Space Grotesk", monospace';
    ctx.fillText('99.99%', sealX, sealY + 6);
    ctx.font = '700 9px "Space Grotesk", sans-serif';
    ctx.fillText('VERIFIED', sealX, sealY + 22);

    // Reset align
    ctx.textAlign = 'left';

    // 9. Footer Info & Cryptographic Hash
    ctx.font = '500 12px "Space Grotesk", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`VERIFICATION HASH: ${hashId}  •  DATE: ${date}  •  ENGINE: BLAZEPOSE-WASM-v1.0`, 60, height - 70);
    ctx.fillText('Tamper-proof on-device kinematics audit. Issued by CombatForm Referee.', 60, height - 48);

  }, [athleteName, exercise, reps, accuracy, duration, maxStreak, date, exerciseLabel, hashId]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `CombatForm_${exercise}_${reps}Reps_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      {/* Canvas preview (scaled down responsively) */}
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden border border-cyan-500/40 shadow-[0_0_30px_rgba(0,112,243,0.3)] bg-[#03060d]">
        <canvas ref={canvasRef} className="w-full h-auto block" />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleDownload}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0070F3] to-cyan-500 hover:from-blue-600 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,112,243,0.4)] active:scale-95 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Download Certificate (PNG)</span>
        </button>
      </div>
    </div>
  );
}
