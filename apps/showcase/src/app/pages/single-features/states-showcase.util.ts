export const formatError = (error: unknown): string => (error instanceof Error ? error.message : 'The request failed.');
