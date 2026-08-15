import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

type Bucket = {
  count: number;
  resetAt: number;
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, Bucket>();

  /**
   * Public storefront GET endpoints are read-only and are called together
   * on page load (products, categories, CMS, promotions).
   *
   * They must not share the aggressive security throttle used for auth/admin
   * actions, otherwise normal browsing can produce HTTP 429 and make the
   * storefront appear empty.
   */
  private isPublicStorefrontRead(request: any): boolean {
    if (String(request?.method || '').toUpperCase() !== 'GET') {
      return false;
    }

    const rawUrl = String(
      request?.originalUrl ||
      request?.url ||
      '',
    );

    const path = rawUrl.split('?')[0].replace(/\/+$/, '');

    const publicReadPatterns = [
      /^\/api\/catalog\/public\/products$/,
      /^\/api\/catalog\/public\/products\/[^/]+$/,
      /^\/api\/catalog\/public\/categories$/,
      /^\/api\/catalog\/public\/brands$/,
      /^\/api\/cms\/public\/home$/,
      /^\/api\/promotions\/public\/featured$/,

      // Also support deployments without the /api global prefix.
      /^\/catalog\/public\/products$/,
      /^\/catalog\/public\/products\/[^/]+$/,
      /^\/catalog\/public\/categories$/,
      /^\/catalog\/public\/brands$/,
      /^\/cms\/public\/home$/,
      /^\/promotions\/public\/featured$/,
    ];

    return publicReadPatterns.some((pattern) => pattern.test(path));
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Keep auth/admin/security write routes rate-limited.
    // Only known, read-only storefront endpoints bypass the global limiter.
    if (this.isPublicStorefrontRead(request)) {
      return true;
    }

    const ip =
      request.ip ||
      request.headers['x-forwarded-for'] ||
      request.socket?.remoteAddress ||
      'unknown';

    const route =
      `${request.method}:${
        request.route?.path ||
        request.url ||
        ''
      }`;

    const key = `${ip}:${route}`;
    const now = Date.now();

    const windowMs = Number(
      process.env.RATE_LIMIT_WINDOW_MS ||
      60000,
    );

    const limit = Number(
      process.env.RATE_LIMIT_MAX ||
      120,
    );

    let bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      bucket = {
        count: 0,
        resetAt: now + windowMs,
      };

      this.buckets.set(key, bucket);
    }

    bucket.count += 1;

    if (bucket.count > limit) {
      throw new HttpException(
        'Too many requests. Please try again shortly.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
