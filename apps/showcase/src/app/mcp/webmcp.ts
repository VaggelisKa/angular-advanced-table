import { DOCUMENT } from '@angular/common';
import { DestroyRef, Service, afterNextRender, inject } from '@angular/core';
import { Router } from '@angular/router';

import { createShowcaseWebMcpTools } from './tools';
import type { WebMcpContext, WebMcpDocument, WebMcpNavigator, WebMcpTool } from './types';

type WebMcpContexts = {
  readonly navigatorContext: WebMcpContext | undefined;
  readonly documentContext: WebMcpContext | undefined;
};

const getRegisterContext = (
  documentContext: WebMcpContext | undefined,
  navigatorContext: WebMcpContext | undefined
): WebMcpContext | undefined => {
  if (documentContext?.registerTool) {
    return documentContext;
  }

  return navigatorContext?.registerTool ? navigatorContext : undefined;
};

@Service()
export class ShowcaseWebMcp {
  private readonly abortController = new AbortController();
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private initialized = false;
  private registered = false;

  public constructor() {
    this.destroyRef.onDestroy(() => this.abortController.abort());
  }

  public initialize(): void {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    afterNextRender({ write: () => void this.registerTools() });
  }

  private async registerTools(): Promise<void> {
    if (this.registered) {
      return;
    }

    const contexts = this.getContexts();

    if (!contexts.navigatorContext && !contexts.documentContext) {
      return;
    }

    const tools = createShowcaseWebMcpTools({
      document: this.document,
      navigateByUrl: async (url: string): Promise<boolean> => this.router.navigateByUrl(url)
    });
    const registrations = this.createRegistrations(tools, contexts);

    if (registrations.length === 0) {
      return;
    }

    this.registered = true;
    await this.resolveRegistrations(registrations);
  }

  private getContexts(): WebMcpContexts {
    return {
      navigatorContext: (globalThis.navigator as WebMcpNavigator | undefined)?.modelContext,
      documentContext: (this.document as WebMcpDocument).modelContext
    };
  }

  private createRegistrations(tools: readonly WebMcpTool[], contexts: WebMcpContexts): readonly Promise<void>[] {
    if (contexts.navigatorContext?.provideContext) {
      return this.createContextRegistrations(tools, contexts.navigatorContext);
    }

    const registerContext = getRegisterContext(contexts.documentContext, contexts.navigatorContext);

    return this.createToolRegistrations(tools, registerContext);
  }

  private createContextRegistrations(
    tools: readonly WebMcpTool[],
    navigatorContext: WebMcpContext | undefined
  ): readonly Promise<void>[] {
    if (!navigatorContext?.provideContext) {
      return [];
    }

    return [Promise.resolve(navigatorContext.provideContext({ tools }, { signal: this.abortController.signal }))];
  }

  private createToolRegistrations(tools: readonly WebMcpTool[], registerContext: WebMcpContext | undefined): readonly Promise<void>[] {
    if (!registerContext?.registerTool) {
      return [];
    }

    return tools.map(async (tool) => registerContext.registerTool?.(tool, { signal: this.abortController.signal }));
  }

  private async resolveRegistrations(registrations: readonly Promise<void>[]): Promise<void> {
    const results = await Promise.allSettled(registrations);

    if (results.length > 0 && results.every((result) => result.status === 'rejected')) {
      this.registered = false;
    }
  }
}
