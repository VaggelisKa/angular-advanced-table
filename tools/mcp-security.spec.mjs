import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import handler from '../api/mcp.mjs';

const originalVercelUrl = process.env['VERCEL_URL'];
const originalProductionUrl = process.env['VERCEL_PROJECT_PRODUCTION_URL'];

const restoreEnvironmentValue = (key, value) => {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
};

const createResponse = () => {
  let responseBody;

  return {
    response: {
      statusCode: 0,
      setHeader: () => undefined,
      end: (body) => {
        responseBody = body;
      }
    },
    readBody: () => (responseBody === undefined ? undefined : JSON.parse(String(responseBody)))
  };
};

const invoke = async ({ headers = {} } = {}) => {
  const target = createResponse();
  const request = {
    method: 'GET',
    headers
  };

  await handler(request, target.response);

  return {
    body: target.readBody(),
    statusCode: target.response.statusCode
  };
};

afterEach(() => {
  restoreEnvironmentValue('VERCEL_URL', originalVercelUrl);
  restoreEnvironmentValue('VERCEL_PROJECT_PRODUCTION_URL', originalProductionUrl);
});

describe('FEATURE: MCP endpoint security boundaries', () => {
  describe('GIVEN: a request carries attacker-controlled forwarding headers', () => {
    describe('WHEN: requesting the service document without Vercel system environment values', () => {
      it('THEN: it advertises the canonical endpoint instead of the injected host', async () => {
        delete process.env['VERCEL_URL'];
        delete process.env['VERCEL_PROJECT_PRODUCTION_URL'];

        const result = await invoke({
          headers: {
            host: 'attacker.example',
            'x-forwarded-proto': 'http'
          }
        });

        assert.equal(result.statusCode, 200);
        assert.equal(result.body.endpoint, 'https://angular-advanced-table.vercel.app/mcp');
        assert.equal(result.body.transport.endpoint, 'https://angular-advanced-table.vercel.app/mcp');
      });
    });
  });

  describe('GIVEN: Vercel supplies a deployment host', () => {
    describe('WHEN: requesting the service document', () => {
      it('THEN: it advertises the validated HTTPS deployment endpoint', async () => {
        process.env['VERCEL_URL'] = 'preview-angular-advanced-table.vercel.app';

        const result = await invoke();

        assert.equal(result.statusCode, 200);
        assert.equal(result.body.endpoint, 'https://preview-angular-advanced-table.vercel.app/mcp');
      });
    });
  });
});
