// frontend/js/state-manager.js
class StateManager {
    constructor() {
        this.state = {
            user: null,
            token: null,
            theme: 'light',
            quizzes: {
                daily: null,
                topics: [],
                currentTopic: null
            },
            papers: [],
            channels: [],
            apps: [],
            analytics: null,
            loading: false,
            error: null
        };
        this.listeners = new Map();
        this.middleware = [];
    }

    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);

        return () => {
            const callbacks = this.listeners.get(key);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }

    getState(key) {
        if (key) {
            return this.state[key];
        }
        return { ...this.state };
    }

    setState(updates) {
        const prevState = { ...this.state };
        
        let processedUpdates = updates;
        for (const mw of this.middleware) {
            processedUpdates = mw(prevState, processedUpdates);
        }

        this.state = {
            ...this.state,
            ...processedUpdates
        };

        Object.keys(processedUpdates).forEach(key => {
            const callbacks = this.listeners.get(key);
            if (callbacks) {
                callbacks.forEach(callback => {
                    callback(this.state[key], prevState[key]);
                });
            }
        });

        const wildcardCallbacks = this.listeners.get('*');
        if (wildcardCallbacks) {
            wildcardCallbacks.forEach(callback => {
                callback(this.state, prevState);
            });
        }
    }

    use(middleware) {
        this.middleware.push(middleware);
    }

    reset() {
        this.state = {
            user: null,
            token: null,
            theme: 'light',
            quizzes: { daily: null, topics: [], currentTopic: null },
            papers: [],
            channels: [],
            apps: [],
            analytics: null,
            loading: false,
            error: null
        };
        this.notifyAll();
    }

    notifyAll() {
        this.listeners.forEach((callbacks) => {
            callbacks.forEach(callback => {
                callback(this.state, null);
            });
        });
    }
}

const store = new StateManager();

// Persistence middleware
store.use((prevState, updates) => {
    const persistKeys = ['user', 'token', 'theme'];
    persistKeys.forEach(key => {
        if (updates[key] !== undefined) {
            if (updates[key] === null) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, JSON.stringify(updates[key]));
            }
        }
    });
    return updates;
});

function initializeStore() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const theme = localStorage.getItem('theme');

    if (token && userStr) {
        try {
            store.setState({
                token: JSON.parse(token),
                user: JSON.parse(userStr),
                theme: theme ? JSON.parse(theme) : 'light'
            });
        } catch (error) {
            console.error('Failed to initialize store:', error);
            localStorage.clear();
        }
    }
}

window.store = store;
window.initializeStore = initializeStore;