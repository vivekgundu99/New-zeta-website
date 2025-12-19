// backend/lib/cache.js
const redis = require('redis');

let client = null;
let isRedisAvailable = false;

// Initialize Redis client
async function initializeRedis() {
    if (process.env.REDIS_URL) {
        try {
            client = redis.createClient({
                url: process.env.REDIS_URL,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 10) {
                            console.log('Redis reconnection failed after 10 attempts');
                            return false;
                        }
                        return Math.min(retries * 100, 3000);
                    }
                }
            });

            client.on('error', (err) => {
                console.error('Redis Client Error:', err);
                isRedisAvailable = false;
            });

            client.on('connect', () => {
                console.log('Redis Client Connected');
                isRedisAvailable = true;
            });

            await client.connect();
            return client;
        } catch (error) {
            console.error('Redis initialization failed:', error);
            isRedisAvailable = false;
            return null;
        }
    } else {
        console.log('Redis URL not configured, running without cache');
        return null;
    }
}

// Get cached data
async function getCache(key) {
    if (!isRedisAvailable || !client) {
        return null;
    }

    try {
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Cache get error:', error);
        return null;
    }
}

// Set cached data
async function setCache(key, value, ttl = 300) {
    if (!isRedisAvailable || !client) {
        return false;
    }

    try {
        await client.setEx(key, ttl, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Cache set error:', error);
        return false;
    }
}

// Delete cached data
async function deleteCache(key) {
    if (!isRedisAvailable || !client) {
        return false;
    }

    try {
        await client.del(key);
        return true;
    } catch (error) {
        console.error('Cache delete error:', error);
        return false;
    }
}

// Delete multiple keys by pattern
async function deleteCachePattern(pattern) {
    if (!isRedisAvailable || !client) {
        return false;
    }

    try {
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(keys);
        }
        return true;
    } catch (error) {
        console.error('Cache pattern delete error:', error);
        return false;
    }
}

// Cache middleware for API routes
function cacheMiddleware(duration = 300) {
    return async (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        const key = `cache:${req.url}`;
        
        try {
            const cachedData = await getCache(key);
            
            if (cachedData) {
                return res.json(cachedData);
            }

            // Store original res.json
            const originalJson = res.json.bind(res);
            
            // Override res.json
            res.json = (data) => {
                setCache(key, data, duration).catch(console.error);
                return originalJson(data);
            };

            next();
        } catch (error) {
            console.error('Cache middleware error:', error);
            next();
        }
    };
}

module.exports = {
    initializeRedis,
    getCache,
    setCache,
    deleteCache,
    deleteCachePattern,
    cacheMiddleware
};