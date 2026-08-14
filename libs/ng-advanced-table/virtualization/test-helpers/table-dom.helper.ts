import type { ComponentFixture } from '@angular/core/testing';

export const queryRequired = <T extends HTMLElement = HTMLElement>(f: ComponentFixture<unknown>, sel: string): T => {
  const element = (f.nativeElement as HTMLElement).querySelector<T>(sel);

  if (!element) {
    throw new Error(`Expected to find an element matching "${sel}".`);
  }

  return element;
};

export const queryAll = <T extends HTMLElement = HTMLElement>(f: ComponentFixture<unknown>, sel: string): T[] =>
  Array.from((f.nativeElement as HTMLElement).querySelectorAll<T>(sel));
