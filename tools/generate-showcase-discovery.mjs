import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

import { createJiti } from 'jiti';
import prettier from 'prettier';

const DEFAULT_SITE_URL = 'https://angular-advanced-table.vercel.app';
const AGENT_SKILLS_SCHEMA_URL = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json';
const NON_CANONICAL_ROUTE_PATHS = new Set(['docs', 'examples']);
const MCP_SERVER_INFO = {
  name: 'angular-advanced-table-showcase',
  version: '0.0.1'
};
const MCP_SUPPORTED_PROTOCOL_VERSIONS = ['2025-06-18'];

const outputDirectory = new URL('../public/', import.meta.url);
const apiDirectory = new URL('../api/', import.meta.url);
const docsDirectory = new URL('../apps/showcase/public/docs/', import.meta.url);
const routePathsModule = new URL('../apps/showcase/src/app/shell/routing/app.route-paths.ts', import.meta.url);
const skillDefinitions = [
  {
    directoryPath: fileURLToPath(new URL('../skills/nat-best-practises/', import.meta.url)),
    artifactName: 'nat-best-practises.tar.gz'
  }
];

const jiti = createJiti(import.meta.url);
const {
  SHOWCASE_DEFAULT_EXAMPLE_ROUTE_PATH,
  SHOWCASE_DEFAULT_ROUTE_PATH,
  SHOWCASE_DOCS_INDEX_ROUTE_PATH,
  SHOWCASE_EXAMPLES_INDEX_ROUTE_PATH,
  showcaseDocRouteDescriptors,
  showcaseExampleRouteDescriptors,
  showcasePrerenderRoutePaths
} = await jiti.import(fileURLToPath(routePathsModule));

const normalizeSiteUrl = (value) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    throw new Error('SHOWCASE_SITE_URL must not be empty when provided.');
  }

  const url = new URL(trimmedValue);

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`SHOWCASE_SITE_URL must use http or https. Received: ${trimmedValue}`);
  }

  url.search = '';
  url.hash = '';

  if (!url.pathname.endsWith('/')) {
    url.pathname = `${url.pathname}/`;
  }

  return url;
};

const escapeXml = (value) => {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll("'", '&apos;')
    .replaceAll('"', '&quot;')
    .replaceAll('>', '&gt;')
    .replaceAll('<', '&lt;');
};

const unique = (values) => [...new Set(values)];

const getRequestPath = (routePath) => (routePath ? `/${routePath}` : '/');

const countMarkdownTokens = (markdown) => markdown.trim().match(/\S+/gu)?.length ?? 0;

const getFrontmatterString = (markdown, key) => {
  const frontmatterMatch = markdown.match(/^---\r?\n(?<frontmatter>[\s\S]*?)\r?\n---/u);
  const frontmatter = frontmatterMatch?.groups?.['frontmatter'] ?? markdown;
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'mu'));

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

const getSkillFileEntries = (directoryPath, baseDirectoryPath = directoryPath) =>
  readdirSync(directoryPath, { withFileTypes: true })
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .flatMap((entry) => {
      const entryPath = join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        return getSkillFileEntries(entryPath, baseDirectoryPath);
      }

      if (!entry.isFile()) {
        return [];
      }

      const archivePath = relative(baseDirectoryPath, entryPath).split(sep).join('/');

      if (!archivePath || archivePath.startsWith('/') || archivePath.includes('..')) {
        throw new Error(`Refusing to archive unsafe skill path: ${archivePath}`);
      }

      return [
        {
          archivePath,
          content: readFileSync(entryPath)
        }
      ];
    });

const writeTarString = (header, offset, length, value) => {
  const buffer = Buffer.from(value, 'utf8');

  if (buffer.byteLength > length) {
    throw new Error(`Tar header value is too long: ${value}`);
  }

  buffer.copy(header, offset);
};

const writeTarOctal = (header, offset, length, value) => {
  const octalValue = value.toString(8);

  if (octalValue.length > length - 1) {
    throw new Error(`Tar numeric field is too large: ${value}`);
  }

  writeTarString(header, offset, length, `${octalValue.padStart(length - 1, '0')}\0`);
};

const createTarHeader = ({ archivePath, size }) => {
  const header = Buffer.alloc(512);
  const encodedPathLength = Buffer.byteLength(archivePath, 'utf8');

  if (encodedPathLength > 100) {
    throw new Error(`Tar archive path exceeds 100 bytes: ${archivePath}`);
  }

  writeTarString(header, 0, 100, archivePath);
  writeTarOctal(header, 100, 8, 0o644);
  writeTarOctal(header, 108, 8, 0);
  writeTarOctal(header, 116, 8, 0);
  writeTarOctal(header, 124, 12, size);
  writeTarOctal(header, 136, 12, 0);
  header.fill(0x20, 148, 156);
  writeTarString(header, 156, 1, '0');
  writeTarString(header, 257, 6, 'ustar\0');
  writeTarString(header, 263, 2, '00');

  const checksum = header
    .reduce((sum, byte) => sum + byte, 0)
    .toString(8)
    .padStart(6, '0');
  writeTarString(header, 148, 8, `${checksum}\0 `);

  return header;
};

const padTarFileContent = (content) => {
  const paddingLength = (512 - (content.byteLength % 512)) % 512;

  return paddingLength > 0 ? Buffer.concat([content, Buffer.alloc(paddingLength)]) : content;
};

const createSkillArchive = (fileEntries) =>
  gzipSync(
    Buffer.concat([
      ...fileEntries.flatMap((entry) => [
        createTarHeader({ archivePath: entry.archivePath, size: entry.content.byteLength }),
        padTarFileContent(entry.content)
      ]),
      Buffer.alloc(1024)
    ]),
    {
      // Store mode keeps the artifact digest stable across Node/zlib versions.
      level: 0,
      mtime: 0
    }
  );

const createAgentSkillArtifacts = () =>
  skillDefinitions.map(({ artifactName, directoryPath }) => {
    const skillMarkdown = readFileSync(join(directoryPath, 'SKILL.md'), 'utf8');
    const name = getFrontmatterString(skillMarkdown, 'name');
    const description = getFrontmatterString(skillMarkdown, 'description');

    if (!name || !description) {
      throw new Error(`Skill ${directoryPath} must define name and description frontmatter.`);
    }

    const artifactBytes = createSkillArchive(getSkillFileEntries(directoryPath));

    return {
      artifactName,
      artifactBytes,
      entry: {
        name,
        type: 'archive',
        description,
        url: `/.well-known/agent-skills/${artifactName}`,
        digest: `sha256:${createHash('sha256').update(artifactBytes).digest('hex')}`
      }
    };
  });

const createAgentMarkdownFrontmatter = ({ canonicalUrl, description, title }) => [
  '---',
  `title: ${JSON.stringify(title)}`,
  `description: ${JSON.stringify(description)}`,
  `canonical_url: ${JSON.stringify(canonicalUrl)}`,
  '---'
];

const createAgentMarkdownDocument = ({ body, canonicalUrl, description, title }) =>
  [
    ...createAgentMarkdownFrontmatter({ canonicalUrl, description, title }),
    '',
    `# ${title}`,
    '',
    description,
    '',
    `Canonical HTML: ${canonicalUrl}`,
    '',
    body.trim(),
    ''
  ].join('\n');

const readDocMarkdownSource = (docId) => readFileSync(new URL(`${docId}.md`, docsDirectory), 'utf8');

const createDocMarkdownDocument = ({ canonicalUrl, docId, description, title }) => {
  // Docs already live as Markdown; only add discovery metadata and canonical route context.
  return createAgentMarkdownDocument({
    body: readDocMarkdownSource(docId),
    canonicalUrl,
    description,
    title
  });
};

const createExampleMarkdownDocument = ({ canonicalUrl, description, siteUrl, title }) =>
  createAgentMarkdownDocument({
    canonicalUrl,
    description,
    title,
    body: [
      'This is an interactive Angular Advanced Table showcase page. Open the canonical HTML URL for the full table UI.',
      '',
      '## Useful Documentation',
      '',
      `- [Quick start](${new URL('docs/quick-start', siteUrl).toString()})`,
      `- [Composition](${new URL('docs/composition', siteUrl).toString()})`,
      `- [Column layout](${new URL('docs/column-layout', siteUrl).toString()})`,
      `- [Accessibility](${new URL('docs/accessibility', siteUrl).toString()})`
    ].join('\n')
  });

const createMarkdownPageEntry = ({ markdown, routePath, url }) => [
  getRequestPath(routePath),
  {
    url,
    markdown,
    tokenCount: countMarkdownTokens(markdown)
  }
];

const siteUrl = normalizeSiteUrl(process.env['SHOWCASE_SITE_URL'] ?? DEFAULT_SITE_URL);
const canonicalRoutePaths = unique(showcasePrerenderRoutePaths).filter((routePath) => !NON_CANONICAL_ROUTE_PATHS.has(routePath));
const canonicalUrls = canonicalRoutePaths.map((routePath) => new URL(routePath, siteUrl).toString());
const apiCatalogUrl = new URL('.well-known/api-catalog', siteUrl).toString();
const agentSkillsIndexUrl = new URL('.well-known/agent-skills/index.json', siteUrl).toString();
const mcpServerCardUrl = new URL('.well-known/mcp/server-card.json', siteUrl).toString();
const mcpEndpointUrl = new URL('mcp', siteUrl).toString();
const serviceDocUrl = new URL('docs/quick-start', siteUrl).toString();
const sitemapUrl = new URL('sitemap.xml', siteUrl).toString();
const defaultDocRoute = showcaseDocRouteDescriptors.find((route) => route.path === SHOWCASE_DEFAULT_ROUTE_PATH);
const defaultExampleRoute = showcaseExampleRouteDescriptors.find((route) => route.path === SHOWCASE_DEFAULT_EXAMPLE_ROUTE_PATH);

if (!defaultDocRoute) {
  throw new Error(`Unable to find default docs route: ${SHOWCASE_DEFAULT_ROUTE_PATH}`);
}

if (!defaultExampleRoute) {
  throw new Error(`Unable to find default example route: ${SHOWCASE_DEFAULT_EXAMPLE_ROUTE_PATH}`);
}

const sitemapXml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...canonicalUrls.map((url) => [`  <url>`, `    <loc>${escapeXml(url)}</loc>`, '  </url>'].join('\n')),
  '</urlset>',
  ''
].join('\n');

const robotsTxt = [
  'User-agent: *',
  'Content-Signal: ai-train=yes, search=yes, ai-input=yes',
  'Allow: /',
  'Allow: /docs/',
  'Allow: /examples/',
  'Allow: /favicon.svg',
  'Allow: /.well-known/agent-skills/',
  'Allow: /.well-known/api-catalog',
  'Allow: /.well-known/mcp/',
  'Allow: /mcp',
  'Allow: /robots.txt',
  'Allow: /sitemap.xml',
  'Disallow: /admin/',
  'Disallow: /api/',
  'Disallow: /private/',
  `Sitemap: ${sitemapUrl}`,
  ''
].join('\n');

const apiCatalogJson = `${JSON.stringify(
  {
    linkset: [
      {
        anchor: apiCatalogUrl,
        item: canonicalUrls.map((url) => ({
          href: url,
          type: 'text/html'
        })),
        'service-doc': [
          {
            href: serviceDocUrl,
            type: 'text/html'
          }
        ],
        describedby: [
          {
            href: sitemapUrl,
            type: 'application/xml'
          }
        ],
        'service-desc': [
          {
            href: agentSkillsIndexUrl,
            type: 'application/json'
          },
          {
            href: mcpServerCardUrl,
            type: 'application/json'
          }
        ]
      }
    ]
  },
  null,
  2
)}\n`;

const markdownPageEntries = [
  createMarkdownPageEntry({
    routePath: '',
    url: new URL('', siteUrl).toString(),
    markdown: createDocMarkdownDocument({
      canonicalUrl: new URL('', siteUrl).toString(),
      docId: defaultDocRoute.docId,
      description: defaultDocRoute.description,
      title: defaultDocRoute.title
    })
  }),
  createMarkdownPageEntry({
    routePath: SHOWCASE_DOCS_INDEX_ROUTE_PATH,
    url: new URL(SHOWCASE_DEFAULT_ROUTE_PATH, siteUrl).toString(),
    markdown: createDocMarkdownDocument({
      canonicalUrl: new URL(SHOWCASE_DEFAULT_ROUTE_PATH, siteUrl).toString(),
      docId: defaultDocRoute.docId,
      description: defaultDocRoute.description,
      title: defaultDocRoute.title
    })
  }),
  ...showcaseDocRouteDescriptors.map((route) =>
    createMarkdownPageEntry({
      routePath: route.path,
      url: new URL(route.path, siteUrl).toString(),
      markdown: createDocMarkdownDocument({
        canonicalUrl: new URL(route.path, siteUrl).toString(),
        docId: route.docId,
        description: route.description,
        title: route.title
      })
    })
  ),
  createMarkdownPageEntry({
    routePath: SHOWCASE_EXAMPLES_INDEX_ROUTE_PATH,
    url: new URL(SHOWCASE_DEFAULT_EXAMPLE_ROUTE_PATH, siteUrl).toString(),
    markdown: createExampleMarkdownDocument({
      canonicalUrl: new URL(SHOWCASE_DEFAULT_EXAMPLE_ROUTE_PATH, siteUrl).toString(),
      description: defaultExampleRoute.description,
      siteUrl,
      title: defaultExampleRoute.title
    })
  }),
  ...showcaseExampleRouteDescriptors.map((route) =>
    createMarkdownPageEntry({
      routePath: route.path,
      url: new URL(route.path, siteUrl).toString(),
      markdown: createExampleMarkdownDocument({
        canonicalUrl: new URL(route.path, siteUrl).toString(),
        description: route.description,
        siteUrl,
        title: route.title
      })
    })
  )
];

const markdownPagesJson = `${JSON.stringify(Object.fromEntries(markdownPageEntries), null, 2)}\n`;
const agentSkillArtifacts = createAgentSkillArtifacts();
const agentSkillsIndexJson = `${JSON.stringify(
  {
    $schema: AGENT_SKILLS_SCHEMA_URL,
    skills: agentSkillArtifacts.map((artifact) => artifact.entry)
  },
  null,
  2
)}\n`;
const mcpResourceEntries = [...new Map(markdownPageEntries.map((entry) => [entry[1].url, entry])).values()];
const mcpResources = mcpResourceEntries.map(([routePath, page]) => ({
  uri: page.url,
  name: routePath === '/' ? 'home' : routePath.replace(/^\//u, '').replaceAll('/', '-'),
  title: getFrontmatterString(page.markdown, 'title') ?? page.url,
  description: getFrontmatterString(page.markdown, 'description') ?? 'Public Angular Advanced Table showcase page.',
  mimeType: 'text/markdown'
}));
const mcpServerCard = {
  name: 'app.ng-advanced-table/showcase',
  title: 'Angular Advanced Table Showcase',
  description:
    'Read-only MCP server exposing public Angular Advanced Table showcase documentation and examples as markdown resources.',
  websiteUrl: siteUrl.toString(),
  version: MCP_SERVER_INFO.version,
  serverInfo: MCP_SERVER_INFO,
  supportedProtocolVersions: MCP_SUPPORTED_PROTOCOL_VERSIONS,
  endpoint: mcpEndpointUrl,
  transport: {
    type: 'streamable-http',
    endpoint: mcpEndpointUrl
  },
  remotes: [
    {
      type: 'streamable-http',
      url: mcpEndpointUrl
    }
  ],
  authentication: {
    type: 'none'
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
  resources: mcpResources,
  tools: [],
  prompts: []
};
const mcpServerCardJson = await prettier.format(JSON.stringify(mcpServerCard), {
  parser: 'json'
});

mkdirSync(apiDirectory, { recursive: true });
mkdirSync(outputDirectory, { recursive: true });
mkdirSync(new URL('.well-known/', outputDirectory), { recursive: true });
mkdirSync(new URL('.well-known/agent-skills/', outputDirectory), { recursive: true });
mkdirSync(new URL('.well-known/mcp/', outputDirectory), { recursive: true });
writeFileSync(new URL('markdown-pages.generated.json', apiDirectory), markdownPagesJson);
writeFileSync(new URL('.well-known/api-catalog', outputDirectory), apiCatalogJson);
writeFileSync(new URL('.well-known/agent-skills/index.json', outputDirectory), agentSkillsIndexJson);
for (const artifact of agentSkillArtifacts) {
  writeFileSync(new URL(`.well-known/agent-skills/${artifact.artifactName}`, outputDirectory), artifact.artifactBytes);
}
writeFileSync(new URL('.well-known/mcp/server-card.json', outputDirectory), mcpServerCardJson);
writeFileSync(new URL('sitemap.xml', outputDirectory), sitemapXml);
writeFileSync(new URL('robots.txt', outputDirectory), robotsTxt);

console.log(`Generated ${canonicalUrls.length} sitemap URLs for ${siteUrl.toString()}.`);
console.log(`Generated ${markdownPageEntries.length} markdown negotiation pages.`);
console.log(`Generated ${agentSkillArtifacts.length} agent skill discovery entries.`);
console.log(`Generated MCP server card with ${mcpResources.length} resources.`);
