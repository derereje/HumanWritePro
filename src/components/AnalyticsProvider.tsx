'use client';

import React, { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '~/lib/mockClerk';

const AnalyticsTracker: React.FC = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { isLoaded, userId } = useAuth();

    const logActivity = async (event: string, data: any = {}) => {
        try {
            await fetch('/api/activity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event,
                    path: pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''),
                    ...data,
                    metadata: {
                        userAgent: navigator.userAgent,
                        language: navigator.language,
                        referrer: document.referrer,
                        timestamp: new Date().toISOString(),
                        ...data.metadata,
                    },
                }),
            });
        } catch (error) {
            // Silent error for analytics
            console.error('Failed to log activity', error);
        }
    };

    // Track Page Views
    useEffect(() => {
        if (isLoaded) {
            logActivity('PAGE_VIEW');
        }
    }, [pathname, searchParams, isLoaded]);

    // Helper to generate a unique-ish selector for an element
    const getSelector = (el: HTMLElement): string => {
        if (el.id) return `#${el.id}`;
        if (el.dataset.analyticsId) return `[data-analytics-id="${el.dataset.analyticsId}"]`;

        const path: string[] = [];
        let current: HTMLElement | null = el;

        while (current && current !== document.body) {
            let selector = current.tagName.toLowerCase();
            const parent = current.parentElement;

            if (parent) {
                const siblings = Array.from(parent.children).filter((c): c is HTMLElement => c.tagName === current?.tagName);
                if (siblings.length > 1) {
                    const index = siblings.indexOf(current) + 1;
                    selector += `:nth-of-type(${index})`;
                }
            }

            path.unshift(selector);
            current = parent;
        }

        return path.join(' > ');
    };

    // Global Click Tracking
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Track clicks on buttons, links, and specific interactive elements
            const interactiveElement = target.closest('button, a, input[type="submit"], [role="button"]');

            if (interactiveElement) {
                const modalElement = target.closest('[data-analytics-modal]');
                const modalName = modalElement?.dataset.analyticsModal;
                const selector = getSelector(interactiveElement);

                const elementInfo = {
                    tag: interactiveElement.tagName,
                    id: interactiveElement.id || undefined,
                    text: interactiveElement.textContent?.trim().substring(0, 50) || undefined,
                    className: interactiveElement.className || undefined,
                    selector: selector,
                    analyticsId: interactiveElement.dataset.analyticsId || undefined,
                };

                logActivity('CLICK', {
                    target: elementInfo.id || elementInfo.analyticsId || elementInfo.tag,
                    metadata: {
                        element: elementInfo,
                        modal: modalName,
                        selector: selector
                    },
                });
            }
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [pathname]); // Re-bind on navigation

    return null;
};

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <>
            {children}
            <Suspense fallback={null}>
                <AnalyticsTracker />
            </Suspense>
        </>
    );
};
