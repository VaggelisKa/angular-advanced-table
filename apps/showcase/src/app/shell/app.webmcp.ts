import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, afterNextRender, inject } from '@angular/core';
import { Router } from '@angular/router';

import { createShowcaseWebMcpTools } from './app.webmcp-tools';
import type { WebMcpContext, WebMcpDocument, WebMcpNavigator, WebMcpTool } from './app.webmcp-types';

type WebMcpContexts = {
  readonly navigatorContext: WebMcpContext | undefined;
  readonly documentContext: WebMcpContext | undefined;
};

const getRegisterContext = (
  navigatorContext: WebMcpContext | undefined,
  documentContext: WebMcpContext | undefined
): WebMcpContext | undefined => {
  if (navigatorContext?.registerTool) {
    return navigatorContext;
  }

  return documentContext?.registerTool ? documentContext : undefined;
};

@Injectable({
  providedIn: 'root'
})
export class ShowcaseWebMcp {
  private readonly abortController = new AbortController();
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private registered = false;

  public constructor() {
    this.destroyRef.onDestroy(() => this.abortController.abort());
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
    const registrations = this.createContextRegistrations(tools, contexts.navigatorContext);
    const registerContext = getRegisterContext(contexts.navigatorContext, contexts.documentContext);

    return [...registrations, ...this.createToolRegistrations(tools, registerContext)];
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
