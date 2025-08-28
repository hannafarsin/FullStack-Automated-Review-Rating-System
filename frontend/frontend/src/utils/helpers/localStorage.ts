export const setLocalStorage = (key: string, value: string): void => {
    try {
        localStorage.setItem(key, value);
    } catch (err) {
        console.error("Error setting localStorage:", err);
    }
};

export const getLocalStorage = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch (err) {
        console.error("Error getting localStorage:", err);
        return null;
    }
};

export const deleteLocalStorage = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch (err) {
        console.error("Error deleting localStorage:", err);
    }
};
