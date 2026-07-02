import markdownPages from './api/markdown-pages.generated.json';

const DISCOVERY_LINK_HEADER = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</.well-known/api-catalog>; rel="service-desc"; type="application/linkset+json"',
  '</.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json"',
  '</docs/quick-start>; rel="service-doc"; type="text/html"',
  '</sitemap.xml>; rel="describedby"; type="application/xml"'
].join(', ');

const normalizePathname = (pathname) => {
  if (pathname === '/index.html') {
    return '/';
  }

  const normalizedPathname = pathname.replace(/\/{2,}/g, '/').replace(/\/+$/g, '');

  return normalizedPathname || '/';
};

const parseAcceptQuality = (acceptEntry) => {
  const [mediaRange, ...parameters] = acceptEntry.split(';').map((part) => part.trim());
  const qParameter = parameters.find((parameter) => parameter.toLowerCase().startsWith('q='));

  if (!qParameter) {
    return {
      mediaRange: mediaRange.toLowerCase(),
      quality: 1
    };
  }

  const quality = Number(qParameter.slice(2));

  return {
    mediaRange: mediaRange.toLowerCase(),
    quality: Number.isFinite(quality) ? Math.min(1, Math.max(0, quality)) : 0
  };
};

const getAcceptedQuality = (acceptEntries, mediaType) => {
  return Math.max(0, ...acceptEntries.filter((entry) => entry.mediaRange === mediaType).map((entry) => entry.quality));
};

const getHtmlQuality = (acceptEntries) => {
  return Math.max(
    getAcceptedQuality(acceptEntries, 'text/html'),
    getAcceptedQuality(acceptEntries, 'text/*'),
    getAcceptedQuality(acceptEntries, '*/*')
  );
};

const acceptsMarkdown = (accept) => {
  const acceptEntries = accept
    .split(',')
    .map(parseAcceptQuality)
    .filter((entry) => entry.mediaRange);
  const markdownQuality = getAcceptedQuality(acceptEntries, 'text/markdown');
  const htmlQuality = getHtmlQuality(acceptEntries);

  return markdownQuality > 0 && markdownQuality >= htmlQuality;
};

export default function middleware(request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return;
  }

  const accept = request.headers.get('accept') ?? '';

  if (!acceptsMarkdown(accept)) {
    return;
  }

  const url = new URL(request.url);
  const pathname = normalizePathname(url.pathname);
  const page = markdownPages[pathname];

  if (!page) {
    return;
  }

  const headers = {
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'Content-Length': String(new TextEncoder().encode(page.markdown).byteLength),
    'Content-Type': 'text/markdown; charset=utf-8',
    Link: DISCOVERY_LINK_HEADER,
    Vary: 'Accept',
    'x-markdown-tokens': String(page.tokenCount)
  };

  return new Response(request.method === 'HEAD' ? null : page.markdown, {
    status: 200,
    headers
  });
}

export const config = {
  matcher: ['/', '/index.html', '/docs/:path*', '/examples/:path*']
};
