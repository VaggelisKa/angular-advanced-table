import { beforeEach, describe, expect, it } from 'vitest';

import {
  hasUnreachableShadowRoot,
  isNatToolbarIntrinsicControl,
  resolveNatToolbarFocusTarget,
  resolveNatToolbarImplicitFocusTarget,
  restoreNatToolbarFocusTargetTabStop,
  suppressNatToolbarFocusTargetTabStop
} from './toolbar-focus-target.util';

describe('FEATURE: Toolbar focus-target resolution', () => {
  let host: HTMLElement;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
  });

  describe('GIVEN: a wrapper that renders its control in light DOM', () => {
    beforeEach(() => {
      host.innerHTML = '<span class="shell"><button class="inner">Go</button></span>';
    });

    describe('WHEN: the selector matches a descendant', () => {
      it('THEN: it resolves that descendant', () => {
        expect(resolveNatToolbarFocusTarget(host, 'button')).toBe(host.querySelector('button'));
      });
    });

    describe('WHEN: the selector matches nothing', () => {
      it('THEN: it resolves null rather than throwing', () => {
        expect(resolveNatToolbarFocusTarget(host, '.missing')).toBeNull();
      });
    });

    describe('WHEN: the selector is malformed', () => {
      it('THEN: it resolves null instead of propagating the DOM error', () => {
        expect(resolveNatToolbarFocusTarget(host, ':::not-a-selector')).toBeNull();
      });
    });

    describe('WHEN: the selector is blank', () => {
      it('THEN: it resolves null without querying', () => {
        expect(resolveNatToolbarFocusTarget(host, '   ')).toBeNull();
      });
    });
  });

  describe('GIVEN: a wrapper that renders its control into an open shadow root', () => {
    beforeEach(() => {
      const root = host.attachShadow({ mode: 'open' });

      root.innerHTML = '<button class="inner">Go</button>';
      host.innerHTML = '<button class="light-decoy">Decoy</button>';
    });

    describe('WHEN: the same selector matches in both roots', () => {
      it('THEN: it prefers the shadow-root match over light DOM', () => {
        expect(resolveNatToolbarFocusTarget(host, 'button')).toBe(host.shadowRoot?.querySelector('button'));
      });
    });
  });

  describe('GIVEN: a wrapper host with no nominated selector', () => {
    describe('WHEN: the first focusable descendant is a button', () => {
      it('THEN: it resolves that button implicitly', () => {
        host.innerHTML = '<span class="shell"><button class="inner">Go</button></span>';

        expect(resolveNatToolbarImplicitFocusTarget(host)).toBe(host.querySelector('button'));
      });
    });

    describe('WHEN: a disabled control precedes the real one', () => {
      it('THEN: it skips the disabled control', () => {
        host.innerHTML = '<button disabled>Off</button><input type="text" />';

        expect(resolveNatToolbarImplicitFocusTarget(host)).toBe(host.querySelector('input'));
      });
    });

    describe('WHEN: the resolved control was already pulled to tabindex -1', () => {
      it('THEN: it still resolves the same control on the next pass', () => {
        host.innerHTML = '<button class="inner" tabindex="-1">Go</button>';

        expect(resolveNatToolbarImplicitFocusTarget(host)).toBe(host.querySelector('button'));
      });
    });

    describe('WHEN: the control lives in an open shadow root behind light-DOM decoys', () => {
      it('THEN: it prefers the shadow-root control', () => {
        const root = host.attachShadow({ mode: 'open' });

        root.innerHTML = '<button class="inner">Go</button>';
        host.innerHTML = '<button class="light-decoy">Decoy</button>';

        expect(resolveNatToolbarImplicitFocusTarget(host)).toBe(root.querySelector('button'));
      });
    });

    describe('WHEN: the leading control sits in a disabled fieldset', () => {
      it('THEN: it skips to the first control that can take focus', () => {
        host.innerHTML = '<fieldset disabled><button class="off">Off</button></fieldset><button class="on">On</button>';

        expect(resolveNatToolbarImplicitFocusTarget(host)).toBe(host.querySelector('.on'));
      });
    });

    describe('WHEN: the leading control is inside an inert subtree', () => {
      it('THEN: it skips the inert control', () => {
        host.innerHTML = '<div inert><button class="off">Off</button></div><button class="on">On</button>';

        expect(resolveNatToolbarImplicitFocusTarget(host)).toBe(host.querySelector('.on'));
      });
    });

    describe('WHEN: the leading control is under a hidden ancestor', () => {
      it('THEN: it skips the hidden control', () => {
        host.innerHTML = '<span hidden><button class="off">Off</button></span><button class="on">On</button>';

        expect(resolveNatToolbarImplicitFocusTarget(host)).toBe(host.querySelector('.on'));
      });
    });

    describe('WHEN: nothing inside is focusable', () => {
      it('THEN: it resolves null so the host keeps focus itself', () => {
        host.innerHTML = '<span>Static label</span>';

        expect(resolveNatToolbarImplicitFocusTarget(host)).toBeNull();
      });
    });

    describe('WHEN: the host is itself an intrinsic control', () => {
      it('THEN: it resolves null and never looks inside', () => {
        const button = document.createElement('button');

        button.innerHTML = '<input type="text" />';

        expect(isNatToolbarIntrinsicControl(button)).toBe(true);
        expect(resolveNatToolbarImplicitFocusTarget(button)).toBeNull();
      });
    });

    describe('WHEN: the host is a plain element', () => {
      it('THEN: it is not treated as an intrinsic control', () => {
        expect(isNatToolbarIntrinsicControl(host)).toBe(false);
      });
    });
  });

  describe('GIVEN: a resolved focus target', () => {
    describe('WHEN: the tab stop is suppressed', () => {
      it('THEN: it takes the element out of the sequential tab order', () => {
        const target = document.createElement('button');

        suppressNatToolbarFocusTargetTabStop(target);

        expect(target.getAttribute('tabindex')).toBe('-1');
      });
    });

    describe('WHEN: the element already carries an explicit tab index', () => {
      it('THEN: it overwrites a tabbable value so the wrapper stays the only stop', () => {
        const target = document.createElement('button');

        target.setAttribute('tabindex', '0');
        suppressNatToolbarFocusTargetTabStop(target);

        expect(target.getAttribute('tabindex')).toBe('-1');
      });
    });
  });

  describe('GIVEN: a suppressed focus target being restored', () => {
    describe('WHEN: the element carried no tabindex before suppression', () => {
      it('THEN: it removes the attribute entirely', () => {
        const target = document.createElement('button');

        suppressNatToolbarFocusTargetTabStop(target);
        restoreNatToolbarFocusTargetTabStop(target, null);

        expect(target.hasAttribute('tabindex')).toBe(false);
      });
    });

    describe('WHEN: the element carried an explicit tabindex before suppression', () => {
      it('THEN: it restores the original value', () => {
        const target = document.createElement('button');

        target.setAttribute('tabindex', '0');
        suppressNatToolbarFocusTargetTabStop(target);
        restoreNatToolbarFocusTargetTabStop(target, '0');

        expect(target.getAttribute('tabindex')).toBe('0');
      });
    });

    describe('WHEN: another owner changed the tabindex after suppression', () => {
      it('THEN: it leaves the foreign value untouched', () => {
        const target = document.createElement('button');

        suppressNatToolbarFocusTargetTabStop(target);
        target.setAttribute('tabindex', '2');
        restoreNatToolbarFocusTargetTabStop(target, null);

        expect(target.getAttribute('tabindex')).toBe('2');
      });
    });
  });

  describe('GIVEN: a host that may hide its content behind a closed shadow root', () => {
    describe('WHEN: the host is a plain element', () => {
      it('THEN: it reports the root as reachable', () => {
        expect(hasUnreachableShadowRoot(host)).toBe(false);
      });
    });

    describe('WHEN: the host exposes an open shadow root', () => {
      it('THEN: it reports the root as reachable', () => {
        host.attachShadow({ mode: 'open' });

        expect(hasUnreachableShadowRoot(host)).toBe(false);
      });
    });

    describe('WHEN: the host is a defined custom element with no reachable content', () => {
      it('THEN: it reports the root as unreachable so the warning can say why', () => {
        const tagName = 'nat-closed-shadow-probe';

        customElements.define(
          tagName,
          class extends HTMLElement {
            public constructor() {
              super();
              this.attachShadow({ mode: 'closed' }).innerHTML = '<button></button>';
            }
          }
        );

        const element = document.createElement(tagName);

        document.body.appendChild(element);

        expect(hasUnreachableShadowRoot(element)).toBe(true);
      });
    });
  });
});
