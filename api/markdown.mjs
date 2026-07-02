import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const markdownPages = require('./markdown-pages.generated.json');

const DISCOVERY_LINK_HEADER = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</.well-known/api-catalog>; rel="service-desc"; type="application/linkset+json"',
  '</docs/quick-start>; rel="service-doc"; type="text/html"',
  '</sitemap.xml>; rel="describedby"; type="application/xml"'
].join(', ');

const getQueryValue = (value) => {
  if (Array.isArray(value)) {
    return value.at(0);
  }

  return value;
};

const normalizeRoute = (value) => {
  const route = typeof value === 'string' && value.trim() ? value.trim() : '/';
  const decodedRoute = decodeURIComponent(route);
  const pathname = decodedRoute.startsWith('/') ? decodedRoute : `/${decodedRoute}`;
  const normalizedPathname = pathname.replace(/\/{2,}/g, '/').replace(/\/+$/g, '');

  return normalizedPathname || '/';
};

const getRouteFromRequest = (request) => {
  const requestUrl = new URL(request.url ?? '/', `https://${request.headers.host ?? 'localhost'}`);
  const queryRoute = getQueryValue(request.query?.route) ?? requestUrl.searchParams.get('route');

  return normalizeRoute(queryRoute ?? requestUrl.pathname);
};

const setCommonHeaders = (response) => {
  response.setHeader('Vary', 'Accept');
  response.setHeader('Link', DISCOVERY_LINK_HEADER);
};

export default function handler(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.statusCode = 405;
    response.setHeader('Allow', 'GET, HEAD');
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    setCommonHeaders(response);
    response.end('Method not allowed');

    return;
  }

  const route = getRouteFromRequest(request);
  const page = markdownPages[route];

  if (!page) {
    response.statusCode = 404;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    setCommonHeaders(response);
    response.end(`Markdown page not found for ${route}`);

    return;
  }

  const markdown = page.markdown;

  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  response.setHeader('Content-Length', Buffer.byteLength(markdown, 'utf8'));
  response.setHeader('x-markdown-tokens', String(page.tokenCount));
  setCommonHeaders(response);
  response.end(request.method === 'HEAD' ? undefined : markdown);
}
