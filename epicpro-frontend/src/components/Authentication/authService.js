const authService = {
    subscribers: [],

    getUser: () => {
        return JSON.parse(localStorage.getItem('user')) || null;
    },

    setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        authService.notifySubscribers(user); // Notify App.js
    },

    logout: () => {
        localStorage.removeItem('user');
        authService.notifySubscribers(null);
    },

    subscribe: (callback) => {
        authService.subscribers.push(callback);
    },

    notifySubscribers: (user) => {
        authService.subscribers.forEach((callback) => callback(user));
    },
};

export default authService;
