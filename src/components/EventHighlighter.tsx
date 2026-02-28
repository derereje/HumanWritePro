'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { useEventReplay } from './EventReplayContext';

interface ElementMeta {
    tag?: string;
    id?: string;
    text?: string;
    className?: string;
    selector?: string;
    analyticsId?: string;
    modal?: string;
}

function HighlighterContent() {
    const searchParams = useSearchParams();
    const { triggerModal } = useEventReplay();
    const [isVisible, setIsVisible] = useState(false);
    const [highlightText, setHighlightText] = useState<string | null>(null);

    useEffect(() => {
        const highlight = searchParams?.get('highlight');
        const metaParam = searchParams?.get('meta');
        if (!highlight && !metaParam) return;

        setHighlightText(highlight);
        setIsVisible(true);

        let overlayCleanup: (() => void) | undefined;
        let found = false;

        // Parse element metadata from URL
        let meta: ElementMeta = {};
        if (metaParam) {
            try {
                meta = JSON.parse(decodeURIComponent(metaParam));
            } catch (e) {
                console.warn('Failed to parse element metadata', e);
            }
        }

        const performHighlight = (element: HTMLElement) => {
            found = true;

            // Scroll into view
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });

            const createOverlay = () => {
                const rect = element.getBoundingClientRect();
                const scrollX = window.scrollX;
                const scrollY = window.scrollY;

                // Remove any existing overlay
                document.getElementById('event-replay-overlay')?.remove();

                const overlay = document.createElement('div');
                overlay.id = 'event-replay-overlay';

                const size = Math.max(rect.width, rect.height) + 48;

                Object.assign(overlay.style, {
                    position: 'absolute',
                    top: `${rect.top + scrollY + rect.height / 2 - size / 2}px`,
                    left: `${rect.left + scrollX + rect.width / 2 - size / 2}px`,
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: '50%',
                    border: '4px solid rgb(99, 102, 241)',
                    boxShadow: '0 0 0 6px rgba(99, 102, 241, 0.15), 0 0 40px rgba(99, 102, 241, 0.3)',
                    pointerEvents: 'none',
                    zIndex: '99999',
                    animation: 'replay-ring-pulse 2s ease-in-out infinite',
                });

                document.body.appendChild(overlay);

                // Center dot
                const dot = document.createElement('div');
                Object.assign(dot.style, {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '10px',
                    height: '10px',
                    backgroundColor: 'rgb(236, 72, 153)',
                    borderRadius: '50%',
                    boxShadow: '0 0 12px rgba(236, 72, 153, 0.8)',
                });
                overlay.appendChild(dot);

                return overlay;
            };

            const overlay = createOverlay();

            // Reposition on scroll/resize
            const reposition = () => {
                const r = element.getBoundingClientRect();
                const size = Math.max(r.width, r.height) + 48;
                overlay.style.top = `${r.top + window.scrollY + r.height / 2 - size / 2}px`;
                overlay.style.left = `${r.left + window.scrollX + r.width / 2 - size / 2}px`;
            };
            window.addEventListener('resize', reposition);
            window.addEventListener('scroll', reposition);

            // Inject animation styles
            if (!document.getElementById('replay-ring-styles')) {
                const style = document.createElement('style');
                style.id = 'replay-ring-styles';
                style.textContent = `
                    @keyframes replay-ring-pulse {
                        0%, 100% {
                            border-color: rgb(99, 102, 241);
                            box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.15), 0 0 40px rgba(99, 102, 241, 0.3);
                            transform: scale(1);
                        }
                        50% {
                            border-color: rgb(236, 72, 153);
                            box-shadow: 0 0 0 10px rgba(236, 72, 153, 0.15), 0 0 50px rgba(236, 72, 153, 0.3);
                            transform: scale(1.05);
                        }
                    }
                `;
                document.head.appendChild(style);
            }

            // Outline the element
            const origOutline = element.style.outline;
            const origOffset = element.style.outlineOffset;
            element.style.outline = '3px solid rgb(99, 102, 241)';
            element.style.outlineOffset = '3px';

            overlayCleanup = () => {
                window.removeEventListener('resize', reposition);
                window.removeEventListener('scroll', reposition);
                element.style.outline = origOutline;
                element.style.outlineOffset = origOffset;
                overlay.remove();
            };
        };

        // Score-based element finder with multiple strategies
        const findElement = () => {
            if (found) return;

            // Strategy 1: data-analytics-id (most precise, from registry)
            if (meta.analyticsId) {
                const el = document.querySelector(`[data-analytics-id="${meta.analyticsId}"]`);
                if (el) { performHighlight(el); return; }
            }

            // Strategy 2: CSS selector from metadata
            if (meta.selector) {
                try {
                    const el = document.querySelector(meta.selector);
                    if (el) { performHighlight(el); return; }
                } catch { /* invalid selector, continue */ }
            }

            // Strategy 3: Element ID
            if (meta.id) {
                const el = document.getElementById(meta.id);
                if (el) { performHighlight(el); return; }
            }

            // Strategy 4: Score-based matching using tag + className + text
            const candidates = Array.from(document.querySelectorAll(
                'button, a, input[type="submit"], input[type="button"], [role="button"], label, span, h1, h2, h3, h4, div[data-analytics-id]'
            ));

            let bestMatch: HTMLElement | null = null;
            let bestScore = 0;

            for (const el of candidates) {
                let score = 0;
                const elText = el.textContent?.trim().substring(0, 50) || '';
                const elTag = el.tagName;
                const elClass = el.className || '';

                // Tag match
                if (meta.tag && elTag === meta.tag) score += 10;

                // ClassName match (very reliable for existing events)
                if (meta.className && elClass && typeof elClass === 'string') {
                    const metaClasses = meta.className.split(/\s+/).filter((c: string) => c.length > 3);
                    const elClasses = elClass.split(/\s+/);
                    let classMatches = 0;
                    for (const mc of metaClasses) {
                        if (elClasses.includes(mc)) classMatches++;
                    }
                    if (metaClasses.length > 0) {
                        const classMatchRatio = classMatches / metaClasses.length;
                        score += Math.round(classMatchRatio * 50);
                    }
                }

                // Text match
                if (highlight && elText.toLowerCase().includes(highlight.toLowerCase())) {
                    score += 20;
                    if (elText.toLowerCase() === highlight.toLowerCase()) score += 15;
                }

                // Prefer interactive elements
                if (['BUTTON', 'A', 'INPUT'].includes(elTag)) score += 5;

                if (score > bestScore && score >= 15) {
                    bestScore = score;
                    bestMatch = el;
                }
            }

            if (bestMatch) {
                performHighlight(bestMatch);
            }
        };

        // --- Modal-aware replay ---
        // If the event was inside a modal, trigger it first, then search after a delay
        const modalName = meta.modal;
        let startDelay = 800;

        if (modalName) {
            const opened = triggerModal(modalName);
            if (opened) {
                startDelay = 1500; // Give modal time to animate in and render
            }
        }

        // Search with delay to let the page (or modal) render
        const initialTimer = setTimeout(findElement, startDelay);

        // MutationObserver for late-loading elements
        const observer = new MutationObserver(() => {
            if (!found) findElement();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Backup polling
        const pollTimer = setInterval(findElement, 1500);
        const stopPoll = setTimeout(() => clearInterval(pollTimer), 12000);

        return () => {
            clearTimeout(initialTimer);
            observer.disconnect();
            clearInterval(pollTimer);
            clearTimeout(stopPoll);
            if (overlayCleanup) overlayCleanup();
        };
    }, [searchParams, triggerModal]);

    if (!isVisible || !highlightText) return null;

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] animate-in slide-in-from-top duration-500">
            <div className="bg-slate-900/95 backdrop-blur-xl text-white px-8 py-4 rounded-full shadow-2xl border border-white/20 flex items-center gap-4 ring-2 ring-indigo-500/20">
                <div className="relative">
                    <div className="w-4 h-4 bg-indigo-500 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 w-4 h-4 bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)]"></div>
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Replaying Event</p>
                    </div>
                    <p className="text-sm font-bold truncate max-w-[280px]">Target: <span className="text-white">&quot;{highlightText}&quot;</span></p>
                </div>
                <div className="w-[1px] h-8 bg-white/10 mx-2"></div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-all group hover:scale-110"
                    title="Close Replay Mode"
                >
                    <X className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </button>
            </div>
        </div>
    );
}

export default function EventHighlighter() {
    return (
        <Suspense fallback={null}>
            <HighlighterContent />
        </Suspense>
    );
}
