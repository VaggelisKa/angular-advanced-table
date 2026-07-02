export type JsonSchema = {
  readonly [key: string]: unknown;
};

export type WebMcpToolInput = Record<string, unknown>;

export type WebMcpToolResult = Record<string, unknown>;

export type WebMcpTool = {
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly inputSchema: JsonSchema;
  readonly execute: (input: WebMcpToolInput) => Promise<WebMcpToolResult> | WebMcpToolResult;
  readonly annotations?: {
    readonly readOnlyHint?: boolean;
    readonly untrustedContentHint?: boolean;
  };
};

export type WebMcpRegisterOptions = {
  readonly signal?: AbortSignal;
};

export type WebMcpContext = {
  readonly provideContext?: (
    context: { readonly tools: readonly WebMcpTool[] },
    options?: WebMcpRegisterOptions
  ) => Promise<void> | void;
  readonly registerTool?: (tool: WebMcpTool, options?: WebMcpRegisterOptions) => Promise<void> | void;
};

export type WebMcpNavigator = Navigator & {
  readonly modelContext?: WebMcpContext;
};

export type WebMcpDocument = Document & {
  readonly modelContext?: WebMcpContext;
};
