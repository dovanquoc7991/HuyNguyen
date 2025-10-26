type Listener = (data: any) => void;

const events: Record<string, Listener[]> = {};

export const eventEmitter = {
  on(event: string, listener: Listener) {
    if (!events[event]) {
      events[event] = [];
    }
    events[event].push(listener);
  },

  emit(event: string, data?: any) {
    const listeners = events[event];
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  },
};