"use client";

import { useState, useEffect, useCallback } from "react";

export function usePersistentState<T>(key: string, defaultValue: T) {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [state, setState] = useState<T>(() => {
        if (typeof window === "undefined") return defaultValue;

        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return defaultValue;
        }
    });

    // Update localStorage whenever the state changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                window.localStorage.setItem(key, JSON.stringify(state));
            } catch (error) {
                console.warn(`Error setting localStorage key "${key}":`, error);
            }
        }
    }, [key, state]);

    const reset = useCallback(() => {
        setState(defaultValue);
        if (typeof window !== "undefined") {
            window.localStorage.removeItem(key);
        }
    }, [key, defaultValue]);

    return [state, setState, reset] as const;
}
