import assert from 'node:assert/strict';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { after, afterEach, before, describe, it } from 'node:test';

let handler;
let originalMarkdownPagesFixture;

const originalVercelUrl = process.env['VERCEL_URL'];
const originalProductionUrl = process.env['VERCEL_PROJECT_PRODUCTION_URL'];
const markdownPagesFixtureUrl = new URL('../api/markdown-pages.generated.json', import.meta.url);

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

before(async () => {
  try {
    originalMarkdownPagesFixture = await readFile(markdownPagesFixtureUrl);
  } catch {
    originalMarkdownPagesFixture = undefined;
  }

  await writeFile(
    markdownPagesFixtureUrl,
    `${JSON.stringify({
      '/large': {
        url: '/large',
        markdown: `---\ntitle: "Large fixture"\n---\n${'x'.repeat(40 * 1024)}`
      }
    })}\n`
  );

  ({ default: handler } = await import('../api/mcp.mjs'));
});

after(async () => {
  if (originalMarkdownPagesFixture === undefined) {
    await rm(markdownPagesFixtureUrl, { force: true });
  } else {
    await writeFile(markdownPagesFixtureUrl, originalMarkdownPagesFixture);
  }
});

afterEach(() => {
  restoreEnvironmentValue('VERCEL_URL', originalVercelUrl);
  restoreEnvironmentValue('VERCEL_PROJECT_PRODUCTION_URL', originalProductionUrl);
});

describe('FEATURE: MCP endpoint security boundaries', () => {
  describe('GIVEN: a JSON-RPC request stays within every resource limit', () => {
    describe('WHEN: posting a small parsed batch', () => {
      it('THEN: it preserves normal batch dispatch', async () => {
        const target = createResponse();
        const request = {
          method: 'POST',
          headers: {},
          body: [
            { jsonrpc: '2.0', id: 1, method: 'ping' },
            { jsonrpc: '2.0', id: 2, method: 'tools/list' }
          ]
        };

        await handler(request, target.response);

        assert.equal(target.response.statusCode, 200);
        assert.deepEqual(target.readBody(), [
          { jsonrpc: '2.0', id: 1, result: {} },
          { jsonrpc: '2.0', id: 2, result: { tools: [] } }
        ]);
      });
    });

    describe('WHEN: posting a raw streamed request', () => {
      it('THEN: it parses and dispatches the request without using the parsed-body fallback', async () => {
        const target = createResponse();
        const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping' });
        const request = Readable.from([Buffer.from(body)]);

        request.method = 'POST';
        request.headers = { 'content-length': String(Buffer.byteLength(body)) };

        await handler(request, target.response);

        assert.equal(target.response.statusCode, 200);
        assert.deepEqual(target.readBody(), { jsonrpc: '2.0', id: 1, result: {} });
      });
    });

    describe('WHEN: Vercel has parsed the body and consumed the request stream', () => {
      it('THEN: it dispatches the parsed request instead of reading the drained stream', async () => {
        const target = createResponse();
        const body = { jsonrpc: '2.0', id: 1, method: 'ping' };
        const request = Readable.from([]);

        request.method = 'POST';
        request.headers = { 'content-length': String(Buffer.byteLength(JSON.stringify(body))) };
        request.body = body;

        for await (const chunk of request) {
          void chunk;
        }

        await handler(request, target.response);

        assert.equal(target.response.statusCode, 200);
        assert.deepEqual(target.readBody(), { jsonrpc: '2.0', id: 1, result: {} });
      });
    });
  });

  describe('GIVEN: a JSON-RPC batch exceeds the endpoint request limit', () => {
    describe('WHEN: posting the batch', () => {
      it('THEN: it rejects the request before dispatching every message', async () => {
        const target = createResponse();
        const request = {
          method: 'POST',
          headers: {},
          body: Array.from({ length: 33 }, (_, index) => ({ jsonrpc: '2.0', id: index, method: 'ping' }))
        };

        await handler(request, target.response);

        assert.equal(target.response.statusCode, 413);
        assert.equal(target.readBody().error.message, 'JSON-RPC batch too large.');
      });
    });
  });

  describe('GIVEN: a valid batch would duplicate a large resource beyond the reply budget', () => {
    describe('WHEN: posting repeated resource reads', () => {
      it('THEN: it rejects the aggregate response instead of materializing an unbounded reply', async () => {
        const target = createResponse();
        const request = {
          method: 'POST',
          headers: {},
          body: Array.from({ length: 16 }, (_, index) => ({
            jsonrpc: '2.0',
            id: index,
            method: 'resources/read',
            params: { uri: '/large' }
          }))
        };

        await handler(request, target.response);

        assert.equal(target.response.statusCode, 413);
        assert.equal(target.readBody().error.message, 'JSON-RPC response too large.');
      });
    });
  });

  describe('GIVEN: Vercel exposes a compact parsed body for an oversized wire payload', () => {
    describe('WHEN: posting the parsed JSON-RPC request with its original content length', () => {
      it('THEN: it enforces the wire-byte limit from the transport metadata', async () => {
        const target = createResponse();
        const request = Readable.from([]);

        request.method = 'POST';
        request.headers = { 'content-length': String(65 * 1024) };
        request.body = { jsonrpc: '2.0', id: 1, method: 'ping' };

        for await (const chunk of request) {
          void chunk;
        }

        await handler(request, target.response);

        assert.equal(target.response.statusCode, 413);
        assert.equal(target.readBody().error.message, 'Request body too large.');
      });
    });
  });

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

  describe('GIVEN: Vercel supplies a preview deployment host', () => {
    describe('WHEN: requesting the service document without a production URL', () => {
      it('THEN: it advertises the validated HTTPS deployment endpoint', async () => {
        process.env['VERCEL_URL'] = 'preview-angular-advanced-table.vercel.app';

        const result = await invoke();

        assert.equal(result.statusCode, 200);
        assert.equal(result.body.endpoint, 'https://preview-angular-advanced-table.vercel.app/mcp');
      });
    });
  });

  describe('GIVEN: Vercel supplies a production and preview deployment host', () => {
    describe('WHEN: requesting the service document', () => {
      it('THEN: it advertises the validated HTTPS production endpoint', async () => {
        process.env['VERCEL_PROJECT_PRODUCTION_URL'] = 'angular-advanced-table.vercel.app';
        process.env['VERCEL_URL'] = 'preview-angular-advanced-table.vercel.app';

        const result = await invoke();

        assert.equal(result.statusCode, 200);
        assert.equal(result.body.endpoint, 'https://angular-advanced-table.vercel.app/mcp');
      });
    });
  });
});
