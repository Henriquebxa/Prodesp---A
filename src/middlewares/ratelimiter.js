import Redis from 'ioredis';

const redis = new Redis();

/**
 * Middleware de Rate Limiting com Bloqueio Temporário
 * @param {number} limit 
 * @param {number} windowInSeconds
 * @param {number} blockDurationInSeconds
 */
export function rateLimiter(limit, windowInSeconds, blockDurationInSeconds = 300) {
  return async (req, res, next) => {
    const clientId = req.headers['x-api-key'] || req.ip;
    const now = Date.now();
    const clearBefore = now - windowInSeconds * 1000;
    const key = `rate_limit:${clientId}`;
    const blockKey = `rate_limit:blocked:${clientId}`;

    try {
      const blockTTL = await redis.ttl(blockKey);
      if (blockTTL > 0) {
        res.setHeader('Retry-After', blockTTL);
        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Acesso bloqueado por excesso de tentativas. Tente novamente em ${blockTTL} segundos.`
        });
      }

      const pipeline = redis.pipeline();

      pipeline.zremrangebyscore(key, 0, clearBefore);
      pipeline.zadd(key, now, now.toString());
      pipeline.zcard(key);
      pipeline.expire(key, windowInSeconds);

      const results = await pipeline.exec();
      const requestCount = results[2][1];

      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - requestCount));
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowInSeconds * 1000) / 1000));

      if (requestCount > limit) {
        await redis.set(blockKey, 'blocked', 'EX', blockDurationInSeconds);

        res.setHeader('Retry-After', blockDurationInSeconds);
        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Limite de requisições excedido. Você foi bloqueado por ${Math.ceil(blockDurationInSeconds / 60)} minutos.`
        });
      }

      next();
    } catch (err) {
      console.error('Erro no Rate Limiter:', err);
      next(); 
    }
  };
}