// frontend/js/api-client.js
class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.requestInterceptors = [];
        this.responseInterceptors = [];
        this.cache = new Map();
        this.pendingRequests = new Map();
    }

    addRequestInterceptor(fn) {
        this.requestInterceptors.push(fn);
    }

    addResponseInterceptor(fn) {
        this.responseInterceptors.push(fn);
    }

    buildURL(endpoint) {
        return `${this.baseURL}${endpoint}`;
    }

    async processRequest(config) {
        let processedConfig = { ...config };
        for (const interceptor of this.requestInterceptors) {
            processedConfig = await interceptor(processedConfig);
        }
        return processedConfig;
    }

    async processResponse(response) {
        let processedResponse = response;
        for (const interceptor of this.responseInterceptors) {
            processedResponse = await interceptor(processedResponse);
        }
        return processedResponse;
    }

    getCacheKey(endpoint, options) {
        return `${endpoint}_${JSON.stringify(options)}`;
    }

    async deduplicateRequest(key, requestFn) {
        if (this.pendingRequests.has(key)) {
            return this.pendingRequests.get(key);
        }

        const promise = requestFn();
        this.pendingRequests.set(key, promise);

        try {
            const result = await promise;
            return result;
        } finally {
            this.pendingRequests.delete(key);
        }
    }

    async request(endpoint, options = {}) {
        const {
            method = 'GET',
            body,
            headers = {},
            cache = false,
            cacheTime = 5 * 60 * 1000,
            timeout = 10000,
            ...rest
        } = options;

        if (method === 'GET' && cache) {
            const cacheKey = this.getCacheKey(endpoint, options);
            const cached = this.cache.get(cacheKey);
            
            if (cached && Date.now() - cached.timestamp < cacheTime) {
                return cached.data;
            }
        }

        const requestKey = `${method}_${endpoint}_${JSON.stringify(body)}`;
        
        return this.deduplicateRequest(requestKey, async () => {
            let config = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                ...rest
            };

            if (body) {
                config.body = JSON.stringify(body);
            }

            config = await this.processRequest(config);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            try {
                const response = await fetch(
                    this.buildURL(endpoint),
                    { ...config, signal: controller.signal }
                );

                clearTimeout(timeoutId);

                let processedResponse = await this.processResponse(response);

                const contentType = processedResponse.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await processedResponse.json();
                    processedResponse.data = data;
                }

                if (!processedResponse.ok) {
                    throw new APIError(
                        processedResponse.data?.message || 'Request failed',
                        processedResponse.status,
                        processedResponse.data
                    );
                }

                if (method === 'GET' && cache) {
                    const cacheKey = this.getCacheKey(endpoint, options);
                    this.cache.set(cacheKey, {
                        data: processedResponse.data,
                        timestamp: Date.now()
                    });
                }

                return processedResponse.data;
            } catch (error) {
                clearTimeout(timeoutId);

                if (error.name === 'AbortError') {
                    throw new APIError('Request timeout', 408);
                }

                throw error;
            }
        });
    }

    get(endpoint, options) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    post(endpoint, body, options) {
        return this.request(endpoint, { ...options, method: 'POST', body });
    }

    put(endpoint, body, options) {
        return this.request(endpoint, { ...options, method: 'PUT', body });
    }

    delete(endpoint, options) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    clearCache(pattern) {
        if (pattern) {
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }
}

class APIError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

const api = new APIClient(API_URL);

// Auth token interceptor
api.addRequestInterceptor((config) => {
    const token = store.getState('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Response error interceptor
api.addResponseInterceptor(async (response) => {
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('theme');
        window.location.href = '/login.html';
        throw new APIError('Session expired', 401);
    }
    return response;
});

window.api = api;
window.APIError = APIError;