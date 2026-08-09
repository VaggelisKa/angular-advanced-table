import { docsHtmlRegistry } from '../docs/docs-html-registry';
import { docsSearchIndex } from '../docs/docs-search-index';
import { findDocsTopicContent } from '../docs/topics/docs-topics';
import { showcaseDocs } from '../shell/showcase-navigation';

const SEARCH_SECTION_TEXT_LIMIT = 1500;

describe('FEATURE: Docs search index contract', () => {
  describe('GIVEN: the generated docs search index and docs HTML registry', () => {
    describe('WHEN: comparing the index keys with the registry keys', () => {
      it('THEN: it indexes exactly the registered markdown documents', () => {
        expect(Object.keys(docsSearchIndex).sort()).toEqual(Object.keys(docsHtmlRegistry).sort());
      });
    });

    describe('WHEN: comparing section heading ids with the registry headings', () => {
      it('THEN: it only references heading ids and depths that exist in the registry', () => {
        for (const [markdownPath, document] of Object.entries(docsSearchIndex)) {
          const registryDepthsById = new Map<string, number>(
            docsHtmlRegistry[markdownPath as keyof typeof docsHtmlRegistry].headings.map((heading) => [heading.id, heading.depth])
          );

          for (const section of document.sections) {
            if (section.headingId === null) {
              continue;
            }

            expect(registryDepthsById.get(section.headingId), `${markdownPath} -> ${section.headingId}`).toBe(section.depth);
          }
        }
      });
    });

    describe('WHEN: inspecting section bodies', () => {
      it('THEN: it keeps every section body within the generated text budget', () => {
        for (const document of Object.values(docsSearchIndex)) {
          for (const section of document.sections) {
            expect(section.text.length).toBeLessThanOrEqual(SEARCH_SECTION_TEXT_LIMIT);
          }
        }
      });
    });
  });

  describe('GIVEN: the registered docs topics', () => {
    describe('WHEN: resolving every topic markdown block against the index', () => {
      it('THEN: it has an index entry at the conventional path for every topic markdown block', () => {
        for (const doc of showcaseDocs) {
          const topic = findDocsTopicContent(doc.id);

          expect(topic.id, `topic for ${doc.id}`).toBe(doc.id);

          const markdownBlocks = topic.blocks.filter((block) => block.kind === 'markdown');

          expect(markdownBlocks.length, `markdown blocks for ${doc.id}`).toBeGreaterThan(0);

          for (const block of markdownBlocks) {
            /* The search corpus derives topic ids from markdown paths by
               convention (`/docs/<id>.md` <-> `/docs/<id>`); this locks the
               convention against the authoritative docs-topics mapping. */
            expect(block.markdownPath).toBe(`/docs/${doc.id}.md`);
            expect(docsSearchIndex[block.markdownPath], `index entry for ${block.markdownPath}`).toBeDefined();
          }
        }
      });
    });
  });
});
