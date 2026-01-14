import { useEffect, useState } from "react";
import { isFunctionReturning, isUpdaterFunction } from "../utilities/typeGuards";

// Type guard function that can be optionally passed to validate parsed data
type TypeGuard<T> = (value: unknown) => value is T;

export function useLocalStorage<T>(
    key: string,
    initialValue: T | (() => T),
    typeGuard?: TypeGuard<T>
): [T, (value: T | ((val: T) => T)) => void] {
    const [value, setValue] = useState<T>(() => {
        try {
            const jsonValue = localStorage.getItem(key);
            if (jsonValue != null) {
                const parsed = JSON.parse(jsonValue);

                // If a type guard is provided, validate the parsed data
                if (typeGuard) {
                    if (typeGuard(parsed)) {
                        return parsed;
                    } else {
                        console.warn(
                            `localStorage data for key "${key}" failed validation. Using initial value.`
                        );
                        // Fall through to return initialValue
                    }
                } else {
                    // No type guard provided, return parsed data as-is
                    return parsed;
                }
            }

            if (typeof initialValue === 'function') {
                return (initialValue as () => T)();
            } else {
                return initialValue;
            }
        } catch (error) {
            console.log(`There was an Error retrieving ${key} from localStorage: ${error}`);
            return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.log(`There was an Error saving ${key} = ${value} to localStorage: ${error}`);
        }
    }, [key, value])

    return [value, setValue] as [typeof value, typeof setValue];
}