import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { DownloadIcon, ShareIcon, SparklesIcon } from './IconComponents';

interface QuizShareCardProps {
  personaTitle: string;
  personaBadge: string;
  personaTagline: string;
  accentClass: string;
  accentSoftClass: string;
  gradientClass: string;
  Icon: React.ComponentType<{ className?: string }>;
  interests: string[];
  budgetLabel?: string | null;
  occasionLabel?: string | null;
  relationshipLabel?: string | null;
}

const QuizShareCard: React.FC<QuizShareCardProps> = ({
  personaTitle,
  personaBadge,
  personaTagline,
  accentClass,
  accentSoftClass,
  gradientClass,
  Icon,
  interests,
  budgetLabel,
  occasionLabel,
  relationshipLabel,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [recipientName, setRecipientName] = useState('');
  const defaultMessage = useMemo(() => {
    const parts = [personaTagline];
    if (occasionLabel) {
      parts.push(`Perfect voor ${occasionLabel?.toLowerCase()}`);
    }
    if (relationshipLabel) {
      parts.push(`Met extra aandacht voor ${relationshipLabel?.toLowerCase()}`);
    }
    return parts.filter(Boolean).join(' • ');
  }, [personaTagline, occasionLabel, relationshipLabel]);

  const [customMessage, setCustomMessage] = useState(defaultMessage);
  const [isExporting, setIsExporting] = useState(false);
  const filename = `gifteez-cadeau-profiel-${personaTitle.replace(/\s+/g, '-').toLowerCase()}.png`;

  const renderInterests = interests.slice(0, 3);

  useEffect(() => {
    setCustomMessage(defaultMessage);
  }, [defaultMessage]);

  useEffect(() => {
    setRecipientName('');
  }, [personaTitle]);

  const handleDownload = async () => {
    if (!cardRef.current) {
      return;
    }

    try {
      setIsExporting(true);
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        width: 1080,
        height: 1350,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Share card export failed', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleNativeShare = async () => {
    if (!('share' in navigator)) {
      await handleDownload();
      return;
    }

    if (!cardRef.current) {
      return;
    }

    try {
      setIsExporting(true);
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        width: 1080,
        height: 1350,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: 'image/png' });

      const shareData: ShareData = {
        title: `Mijn Gifteez cadeau-profiel: ${personaTitle}`,
        text: customMessage,
        files: [file],
      };

      if ('canShare' in navigator && typeof navigator.canShare === 'function' && !navigator.canShare(shareData)) {
        await handleDownload();
        return;
      }

      await navigator.share(shareData);
    } catch (error) {
      console.error('Native share failed', error);
      await handleDownload();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div
        ref={cardRef}
        className={`relative mx-auto w-full max-w-[340px] rounded-[28px] border border-white/70 bg-gradient-to-br ${gradientClass} p-7 shadow-xl shadow-accent/20`}
      >
        <div className="absolute inset-0 rounded-[28px] bg-white/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="relative z-10 flex h-full flex-col items-center gap-5 text-center text-primary">
          <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${accentSoftClass} ${accentClass}`}>
            <SparklesIcon className="h-4 w-4" />
            {personaBadge}
          </span>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg shadow-primary/10">
            <Icon className={`h-10 w-10 ${accentClass}`} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/60">Cadeau-profiel</p>
            <h3 className="font-display text-2xl font-bold text-primary sm:text-3xl">
              {recipientName ? `${recipientName} is een` : 'Ik ben een'} {personaTitle}
            </h3>
          </div>
          <p className="max-w-[260px] text-sm font-medium leading-relaxed text-primary/75">
            {customMessage}
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary/60">
            {budgetLabel && (
              <span className="rounded-full bg-white/70 px-3 py-1 text-primary/70">Budget {budgetLabel}</span>
            )}
            {occasionLabel && (
              <span className="rounded-full bg-white/70 px-3 py-1 text-primary/70">{occasionLabel}</span>
            )}
            {relationshipLabel && (
              <span className="rounded-full bg-white/70 px-3 py-1 text-primary/70">Voor {relationshipLabel.toLowerCase()}</span>
            )}
          </div>
          <div className="mt-1 grid w-full grid-cols-3 gap-2 text-[11px] font-semibold uppercase tracking-wide text-primary/60">
            {renderInterests.map(tag => (
              <span key={tag} className="truncate rounded-full bg-white/70 px-3 py-1">
                #{tag.replace(/\s+/g, '')}
              </span>
            ))}
          </div>
          <div className="mt-auto flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-primary/40">
            <span>Gifteez Cadeau Quiz</span>
            <span>#Gifteez</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col text-sm text-primary/70">
            Naam ontvanger (optioneel)
            <input
              type="text"
              value={recipientName}
              onChange={event => setRecipientName(event.target.value)}
              placeholder="Voor wie is dit?"
              className="mt-1 rounded-xl border border-primary/10 bg-white/90 px-3 py-2 text-primary shadow-sm outline-none transition focus:border-accent/40 focus:ring-2 focus:ring-accent/40"
            />
          </label>
          <label className="flex flex-col text-sm text-primary/70">
            Quote op de kaart
            <input
              type="text"
              value={customMessage}
              onChange={event => setCustomMessage(event.target.value)}
              placeholder="Schrijf een korte boodschap"
              maxLength={120}
              className="mt-1 rounded-xl border border-primary/10 bg-white/90 px-3 py-2 text-primary shadow-sm outline-none transition focus:border-accent/40 focus:ring-2 focus:ring-accent/40"
            />
          </label>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/15 bg-white/85 px-5 py-2 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            <DownloadIcon className="h-4 w-4" />
            {isExporting ? 'Bezig...' : 'Download kaart'}
          </button>
          <button
            type="button"
            onClick={handleNativeShare}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-accent/30 bg-accent px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition hover:-translate-y-0.5 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            <ShareIcon className="h-4 w-4" />
            Deel direct
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizShareCard;
