import { AsyncLocalStorage } from 'async_hooks';

/**
 * Storage for request context
 */
const contextStorage = new AsyncLocalStorage<Map<string, any>>();

/**
 * Gets the context store
 * Returns the current context store or undefined if not in an async context
 */
export function getContextStore(): Map<string, any> | undefined {
  return contextStorage.getStore();
}

/**
 * Gets context store with fallback to empty map
 * Use this when you need a guaranteed Map instance
 */
export function getContextStoreOrEmpty(): Map<string, any> {
  return getContextStore() || new Map<string, any>();
}

/**
 * Sets the value to the context
 * Returns true if successful, false if not in an async context
 */
export function setContext(key: string, value: any): boolean {
  const store = getContextStore();
  if (!store) {
    // Optionally log a warning in development
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Attempting to set context key "${key}" outside of async context`);
    }
    return false;
  }
  store.set(key, value);
  return true;
}

/**
 * Gets a value from the context
 * Returns undefined if the key doesn't exist or if not in an async context
 */
export function getContext(key: string): any {
  const store = getContextStore();
  return store?.get(key);
}

/**
 * Executes a function in a new context
 */
export function runWithContext<T>(fn: () => T): T {
  return contextStorage.run(new Map<string, any>(), fn);
}

/**
 * Executes a function in a new context with initial values
 */
export function runWithInitialContext<T>(initialContext: Record<string, any>, fn: () => T): T {
  const contextMap = new Map(Object.entries(initialContext));
  return contextStorage.run(contextMap, fn);
}