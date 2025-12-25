import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

function createToastStore() {
    const { subscribe, update } = writable<ToastMessage[]>([]);

    let count = 0;

    function add(message: string, type: ToastType = 'info', duration = 3000) {
        const id = count++;
        const newToast: ToastMessage = { id, message, type };

        update(toasts => [...toasts, newToast]);

        setTimeout(() => {
            dismiss(id);
        }, duration);
    }

    function dismiss(id: number) {
        update(toasts => toasts.filter(t => t.id !== id));
    }

    return {
        subscribe,
        success: (msg: string, duration?: number) => add(msg, 'success', duration),
        error: (msg: string, duration?: number) => add(msg, 'error', duration),
        info: (msg: string, duration?: number) => add(msg, 'info', duration),
        dismiss
    };
}

export const toast = createToastStore();
