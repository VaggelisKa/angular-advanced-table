import markdownPages from './api/markdown-pages.generated.json';

const DISCOVERY_LINK_HEADER = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</.well-known/api-catalog>; rel="service-desc"; type="application/linkset+json"',
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

export default function middleware(request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return;
  }

  const accept = request.headers.get('accept') ?? '';

  if (!/text\/markdown/i.test(accept)) {
    return;
  }

  const url = new URL(request.url);
  const pathname = normalizePathname(url.pathname);
  const page = markdownPages[pathname];

  if (!page) {
    return;
  }

  const headers = {
    'Content-Length': String(new TextEncoder().encode(page.markdown).byteLength),
    'Content-Type': 'text/markdown; charset=utf-8',
    Vary: 'Accept',
    'x-markdown-tokens': String(page.tokenCount)
  };

  if (pathname !== '/') {
    headers.Link = DISCOVERY_LINK_HEADER;
  }

  return new Response(request.method === 'HEAD' ? null : page.markdown, {
    status: 200,
    headers
  });
}

export const config = {
  matcher: ['/', '/index.html', '/docs/:path*', '/examples/:path*']
};
