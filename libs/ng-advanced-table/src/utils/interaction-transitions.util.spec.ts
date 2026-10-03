import { renderWithoutTransitions } from './interaction.util';

describe('FEATURE: renderWithoutTransitions', () => {
  describe('GIVEN: elements with an inline transform transition', () => {
    describe('WHEN: a render runs through renderWithoutTransitions', () => {
      it('THEN: it turns their transitions off during the render and clears them afterwards', () => {
        const elements = [document.createElement('th'), document.createElement('th')];
        const transitionsDuringRender: string[] = [];

        for (const element of elements) element.style.transition = 'transform 180ms ease';

        renderWithoutTransitions(elements, () => {
          transitionsDuringRender.push(...elements.map((element) => element.style.transition));
        });

        expect(transitionsDuringRender).toStrictEqual(['none', 'none']);
        expect(elements.map((element) => element.style.transition)).toStrictEqual(['', '']);
      });
    });

    describe('WHEN: the render throws', () => {
      it('THEN: it still restores their transitions and rethrows', () => {
        const element = document.createElement('th');

        element.style.transition = 'transform 180ms ease';

        expect(() =>
          renderWithoutTransitions([element], () => {
            throw new Error('render failed');
          })
        ).toThrow('render failed');
        expect(element.style.transition).toBe('');
      });
    });
  });
});
