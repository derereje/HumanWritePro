'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

// -------------------------------------------------------------------
// EventReplayContext
// -------------------------------------------------------------------
// A lightweight context that allows:
// 1. Pages to register modal-opening functions (e.g., "Pricing" → setShowPricingModal(true))
// 2. EventHighlighter to trigger those modals during replay

type ModalOpener = () => void;

interface EventReplayContextValue {
    /** Register a function that opens a named modal */
    registerModalOpener: (modalName: string, opener: ModalOpener) => void;
    /** Unregister a modal opener */
    unregisterModalOpener: (modalName: string) => void;
    /** Attempt to open a modal by name. Returns true if a matching opener was found. */
    triggerModal: (modalName: string) => boolean;
}

const EventReplayContext = createContext<EventReplayContextValue>({
    registerModalOpener: () => { },
    unregisterModalOpener: () => { },
    triggerModal: () => false,
});

export function useEventReplay() {
    return useContext(EventReplayContext);
}

export function EventReplayProvider({ children }: { children: React.ReactNode }) {
    const modalOpenersRef = useRef<Map<string, ModalOpener>>(new Map());

    const registerModalOpener = useCallback((modalName: string, opener: ModalOpener) => {
        modalOpenersRef.current.set(modalName.toLowerCase(), opener);
    }, []);

    const unregisterModalOpener = useCallback((modalName: string) => {
        modalOpenersRef.current.delete(modalName.toLowerCase());
    }, []);

    const triggerModal = useCallback((modalName: string): boolean => {
        const opener = modalOpenersRef.current.get(modalName.toLowerCase());
        if (opener) {
            opener();
            return true;
        }
        return false;
    }, []);

    return (
        <EventReplayContext.Provider value={{ registerModalOpener, unregisterModalOpener, triggerModal }}>
            {children}
        </EventReplayContext.Provider>
    );
}
