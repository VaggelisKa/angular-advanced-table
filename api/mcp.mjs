import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const markdownPages = require('./markdown-pages.generated.json');

const SERVER_INFO = {
  name: 'angular-advanced-table-showcase',
  version: '0.0.1'
};
const SUPPORTED_PROTOCOL_VERSION = '2025-06-18';
const DEFAULT_RESOURCE_DESCRIPTION = 'Public Angular Advanced Table showcase page.';
const DEFAULT_SITE_ORIGIN = 'https://angular-advanced-table.vercel.app';
const MAX_JSON_BODY_BYTES = 64 * 1024;
const MAX_JSON_RPC_BATCH_SIZE = 32;
const MAX_JSON_RPC_RESPONSE_BYTES = 512 * 1024;
const CORS_HEADERS = {
  'Access-Control-Allow-Headers': 'content-type, mcp-protocol-version',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Origin': '*'
};

const setHeaders = (response, headers) => {
  for (const [key, value] of Object.entries(headers)) {
    response.setHeader(key, value);
  }
};

const sendJsonText = (request, response, statusCode, jsonBody) => {
  setHeaders(response, {
    ...CORS_HEADERS,
    'Cache-Control': request.method === 'POST' ? 'no-store' : 'public, max-age=300',
    'Content-Length': Buffer.byteLength(jsonBody),
    'Content-Type': 'application/json; charset=utf-8'
  });
  response.statusCode = statusCode;
  response.end(request.method === 'HEAD' ? undefined : jsonBody);
};

const sendJson = (request, response, statusCode, body) => {
  sendJsonText(request, response, statusCode, JSON.stringify(body));
};

const sendEmpty = (response, statusCode) => {
  setHeaders(response, CORS_HEADERS);
  response.statusCode = statusCode;
  response.end();
};

const getFrontmatterString = (markdown, key) => {
  const match = markdown.match(new RegExp(`^${key}:\\s*(.+)$`, 'mu'));

  if (!match) {
    return undefined;
  }

  try {
    const parsedValue = JSON.parse(match[1]);

    return typeof parsedValue === 'string' ? parsedValue : undefined;
  } catch {
    return match[1].trim();
  }
};

const normalizePathname = (pathname) => {
  if (pathname === '/index.html') {
    return '/';
  }

  const normalizedPathname = pathname.replace(/\/{2,}/g, '/').replace(/\/+$/g, '');

  return normalizedPathname || '/';
};

const resourceEntries = [...new Map(Object.entries(markdownPages).map((entry) => [entry[1].url, entry])).values()];
const resources = resourceEntries.map(([routePath, page]) => ({
  uri: page.url,
  name: routePath === '/' ? 'home' : routePath.replace(/^\//u, '').replaceAll('/', '-'),
  title: getFrontmatterString(page.markdown, 'title') ?? page.url,
  description: getFrontmatterString(page.markdown, 'description') ?? DEFAULT_RESOURCE_DESCRIPTION,
  mimeType: 'text/markdown'
}));

const findMarkdownPage = (uri) => {
  if (typeof uri !== 'string') {
    return undefined;
  }

  if (markdownPages[uri]) {
    return {
      uri,
      page: markdownPages[uri]
    };
  }

  if (uri.startsWith('/')) {
    const normalizedPathname = normalizePathname(uri);

    if (markdownPages[normalizedPathname]) {
      return {
        uri: markdownPages[normalizedPathname].url,
        page: markdownPages[normalizedPathname]
      };
    }
  }

  const matchedPage = Object.values(markdownPages).find((page) => page.url === uri);

  return matchedPage
    ? {
        uri: matchedPage.url,
        page: matchedPage
      }
    : undefined;
};

class PayloadTooLargeError extends Error {}
class ResponseTooLargeError extends Error {}

const assertJsonBodySize = (byteLength) => {
  if (byteLength > MAX_JSON_BODY_BYTES) {
    throw new PayloadTooLargeError('Request body is too large.');
  }
};

const assertParsedJsonBodySize = (body) => {
  assertJsonBodySize(Buffer.byteLength(JSON.stringify(body)));
};

const getRequestHeader = (request, name) => {
  if (typeof request.headers?.get === 'function') {
    return request.headers.get(name) ?? undefined;
  }

  const headerValue = request.headers?.[name];

  return Array.isArray(headerValue) ? headerValue[0] : headerValue;
};

const assertDeclaredJsonBodySize = (request) => {
  const contentLength = getRequestHeader(request, 'content-length');

  if (contentLength === undefined || !/^\d+$/u.test(contentLength)) {
    return;
  }

  assertJsonBodySize(Number(contentLength));
};

const readJsonBody = async (request) => {
  assertDeclaredJsonBodySize(request);

  if (typeof request[Symbol.asyncIterator] === 'function') {
    const chunks = [];
    let byteLength = 0;

    for await (const chunk of request) {
      const buffer = Buffer.from(chunk);

      byteLength += buffer.byteLength;
      assertJsonBodySize(byteLength);
      chunks.push(buffer);
    }

    const rawBody = Buffer.concat(chunks).toString('utf8').trim();

    if (!rawBody) {
      throw new SyntaxError('Request body must contain JSON-RPC payload.');
    }

    return JSON.parse(rawBody);
  }

  if (request.body && typeof request.body === 'object' && !Buffer.isBuffer(request.body)) {
    assertParsedJsonBodySize(request.body);

    return request.body;
  }

  if (typeof request.body === 'string' || Buffer.isBuffer(request.body)) {
    assertJsonBodySize(Buffer.byteLength(request.body));

    return JSON.parse(String(request.body));
  }

  throw new SyntaxError('Request body must contain JSON-RPC payload.');
};

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

const createResult = (id, result) => ({
  jsonrpc: '2.0',
  id,
  result
});

const createError = (id, code, message) => ({
  jsonrpc: '2.0',
  id: id ?? null,
  error: {
    code,
    message
  }
});

const serializeJsonRpcResponse = (jsonRpcResponses, isBatch) => {
  const serializedResponses = [];
  let byteLength = isBatch ? 2 : 0;

  for (const jsonRpcResponse of jsonRpcResponses) {
    const serializedResponse = JSON.stringify(jsonRpcResponse);

    byteLength += Buffer.byteLength(serializedResponse) + (serializedResponses.length > 0 ? 1 : 0);

    if (byteLength > MAX_JSON_RPC_RESPONSE_BYTES) {
      throw new ResponseTooLargeError('JSON-RPC response is too large.');
    }

    serializedResponses.push(serializedResponse);
  }

  return isBatch ? `[${serializedResponses.join(',')}]` : serializedResponses[0];
};

const getServiceOrigin = () => {
  const deploymentHost = process.env['VERCEL_PROJECT_PRODUCTION_URL'] ?? process.env['VERCEL_URL'];

  if (!deploymentHost) {
    return DEFAULT_SITE_ORIGIN;
  }

  try {
    const deploymentUrl = new URL(`https://${deploymentHost}`);

    if (
      deploymentUrl.username ||
      deploymentUrl.password ||
      deploymentUrl.pathname !== '/' ||
      deploymentUrl.search ||
      deploymentUrl.hash
    ) {
      return DEFAULT_SITE_ORIGIN;
    }

    return deploymentUrl.origin;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
};

const getServiceDocument = () => {
  const endpoint = new URL('/mcp', getServiceOrigin()).toString();

  return {
    serverInfo: SERVER_INFO,
    endpoint,
    transport: {
      type: 'streamable-http',
      endpoint
    },
    capabilities: {
      resources: {
        list: true,
        read: true
      },
      tools: {
        list: true,
        items: []
      },
      prompts: {
        list: true,
        items: []
      }
    },
    resources
  };
};

const handleJsonRpcMessage = (message) => {
  if (!message || typeof message !== 'object' || message.jsonrpc !== '2.0' || typeof message.method !== 'string') {
    return createError(message?.id, -32600, 'Invalid JSON-RPC request.');
  }

  if (!hasOwn(message, 'id')) {
    return undefined;
  }

  switch (message.method) {
    case 'initialize':
      return createResult(message.id, {
        protocolVersion: SUPPORTED_PROTOCOL_VERSION,
        capabilities: {
          resources: {
            listChanged: false
          },
          tools: {
            listChanged: false
          },
          prompts: {
            listChanged: false
          }
        },
        serverInfo: SERVER_INFO,
        instructions:
          'Read-only MCP endpoint exposing public Angular Advanced Table showcase documentation and examples as markdown resources.'
      });

    case 'ping':
      return createResult(message.id, {});

    case 'resources/list':
      return createResult(message.id, {
        resources
      });

    case 'resources/read': {
      const resource = findMarkdownPage(message.params?.uri);

      if (!resource) {
        return createError(message.id, -32002, 'Resource not found.');
      }

      return createResult(message.id, {
        contents: [
          {
            uri: resource.uri,
            mimeType: 'text/markdown',
            text: resource.page.markdown
          }
        ]
      });
    }

    case 'tools/list':
      return createResult(message.id, {
        tools: []
      });

    case 'prompts/list':
      return createResult(message.id, {
        prompts: []
      });

    default:
      return createError(message.id, -32601, `Method not found: ${message.method}`);
  }
};

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') {
    sendEmpty(response, 204);
    return;
  }

  if (request.method === 'GET' || request.method === 'HEAD') {
    sendJson(request, response, 200, getServiceDocument());
    return;
  }

  if (request.method !== 'POST') {
    setHeaders(response, {
      ...CORS_HEADERS,
      Allow: 'GET, HEAD, POST, OPTIONS'
    });
    response.statusCode = 405;
    response.end();
    return;
  }

  let payload;

  try {
    payload = await readJsonBody(request);
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      sendJson(request, response, 413, createError(null, -32000, 'Request body too large.'));
      return;
    }

    sendJson(request, response, 400, createError(null, -32700, 'Parse error.'));
    return;
  }

  const messages = Array.isArray(payload) ? payload : [payload];

  if (messages.length === 0) {
    sendJson(request, response, 400, createError(null, -32600, 'Invalid JSON-RPC request.'));
    return;
  }

  if (messages.length > MAX_JSON_RPC_BATCH_SIZE) {
    sendJson(request, response, 413, createError(null, -32000, 'JSON-RPC batch too large.'));
    return;
  }

  const jsonRpcResponses = messages.map(handleJsonRpcMessage).filter(Boolean);

  if (jsonRpcResponses.length === 0) {
    sendEmpty(response, 202);
    return;
  }

  let jsonRpcResponseBody;

  try {
    jsonRpcResponseBody = serializeJsonRpcResponse(jsonRpcResponses, Array.isArray(payload));
  } catch (error) {
    if (error instanceof ResponseTooLargeError) {
      sendJson(request, response, 413, createError(null, -32000, 'JSON-RPC response too large.'));
      return;
    }

    throw error;
  }

  sendJsonText(request, response, 200, jsonRpcResponseBody);
}
