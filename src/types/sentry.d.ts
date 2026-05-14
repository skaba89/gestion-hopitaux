// Type declarations for optional @sentry/nextjs package
// When Sentry is not installed, these prevent TypeScript build errors
declare module '@sentry/nextjs' {
  export function init(options: Record<string, any>): void
  export function captureException(error: Error, options?: Record<string, any>): void
  export function captureMessage(message: string, level?: string): void
  export function withScope(callback: (scope: any) => void): void
}
