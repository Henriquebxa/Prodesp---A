import Redis from 'ioredis';

const redis = new Redis();

/**
 * Middleware para limitar tentativas erradas consecutivas no login.
 * Bloqueia após 7 falhas consecutivas, sem afetar o cadastro (/registrar).
 * @param {number} maxFailures 
 * @param {number} blockDurationInSeconds 
 */
export function loginFailureLimiter(maxFailures = 7, blockDurationInSeconds = 300) {
  return async (req, res, next) => {
    const clientId = req.headers['x-forwarded-for'] || req.ip;
    const blockKey = `login:blocked:${clientId}`;
    const failuresKey = `login:failures:${clientId}`;

    try {
      const blockTTL = await redis.ttl(blockKey);
      if (blockTTL > 0) {
        res.setHeader('Retry-After', blockTTL);
        return res.status(429).json({
          error: 'Muitas Tentativas',
          message: `Acesso temporariamente bloqueado após ${maxFailures} tentativas incorretas. Tente novamente em ${Math.ceil(blockTTL / 60)} minutos.`
        });
      }

      req.recordLoginFailure = async () => {
        const failures = await redis.incr(failuresKey);
        await redis.expire(failuresKey, 900);

        if (failures >= maxFailures) {
          await redis.set(blockKey, 'blocked', 'EX', blockDurationInSeconds);
          return true;
        }
        return false;
      };

      req.resetLoginFailures = async () => {
        await redis.del(failuresKey);
      };

      next();
    } catch (err) {
      console.error('Erro no limitador de falhas de login:', err);
      next(); 
    }
  };
}

// Exportação adicional com o alias para compatibilidade caso o server.js importe rateLimiter
export const rateLimiter = loginFailureLimiter;