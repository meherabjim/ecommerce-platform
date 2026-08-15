import { Injectable } from '@nestjs/common';

@Injectable()
export class IntegrationsService {
  private configured(...keys: string[]) {
    return keys.every((key) => Boolean(process.env[key]?.trim()));
  }

  status() {
    return {
      generatedAt: new Date().toISOString(),
      payments: [
        {
          key: 'manual',
          name: 'Manual / COD',
          configured: true,
          mode: 'built-in',
        },
        {
          key: 'sslcommerz',
          name: 'SSLCommerz',
          configured: this.configured('SSLCOMMERZ_STORE_ID', 'SSLCOMMERZ_STORE_PASSWORD'),
          mode: 'credential-dependent',
          requiredEnv: ['SSLCOMMERZ_STORE_ID', 'SSLCOMMERZ_STORE_PASSWORD'],
        },
        {
          key: 'bkash',
          name: 'bKash',
          configured: this.configured(
            'BKASH_APP_KEY',
            'BKASH_APP_SECRET',
            'BKASH_USERNAME',
            'BKASH_PASSWORD',
          ),
          mode: 'credential-dependent',
          requiredEnv: [
            'BKASH_APP_KEY',
            'BKASH_APP_SECRET',
            'BKASH_USERNAME',
            'BKASH_PASSWORD',
          ],
        },
        {
          key: 'nagad',
          name: 'Nagad',
          configured: this.configured('NAGAD_MERCHANT_ID', 'NAGAD_PRIVATE_KEY'),
          mode: 'credential-dependent',
          requiredEnv: ['NAGAD_MERCHANT_ID', 'NAGAD_PRIVATE_KEY'],
        },
      ],
      couriers: [
        {
          key: 'manual-rider',
          name: 'Internal Rider',
          configured: true,
          mode: 'built-in',
        },
        {
          key: 'pathao',
          name: 'Pathao Courier',
          configured: this.configured(
            'PATHAO_CLIENT_ID',
            'PATHAO_CLIENT_SECRET',
            'PATHAO_USERNAME',
            'PATHAO_PASSWORD',
          ),
          mode: 'credential-dependent',
          requiredEnv: [
            'PATHAO_CLIENT_ID',
            'PATHAO_CLIENT_SECRET',
            'PATHAO_USERNAME',
            'PATHAO_PASSWORD',
          ],
        },
        {
          key: 'steadfast',
          name: 'Steadfast',
          configured: this.configured('STEADFAST_API_KEY', 'STEADFAST_SECRET_KEY'),
          mode: 'credential-dependent',
          requiredEnv: ['STEADFAST_API_KEY', 'STEADFAST_SECRET_KEY'],
        },
        {
          key: 'redx',
          name: 'RedX',
          configured: this.configured('REDX_API_TOKEN'),
          mode: 'credential-dependent',
          requiredEnv: ['REDX_API_TOKEN'],
        },
      ],
      note:
        'External providers are reported as configured only when required credentials exist. Provider contracts are present, but real network integration must be completed and tested with provider sandbox/production credentials.',
    };
  }
}
