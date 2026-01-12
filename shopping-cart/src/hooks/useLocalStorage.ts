import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)): [T, (value: T | ((val: T) => T)) => void] {
    const [value, setValue] = useState<T>(() => {
        try {
            const jsonValue = localStorage.getItem(key);
            if (jsonValue != null) return JSON.parse(jsonValue);

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