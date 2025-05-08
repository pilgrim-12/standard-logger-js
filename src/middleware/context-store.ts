import { AsyncLocalStorage } from 'async_hooks';

/**
* Storage for request context
 */
const contextStorage = new AsyncLocalStorage<Map<string, any>>();

/**
* Gets the context store
 */
export function getContextStore(): Map<string, any> {
  let store = contextStorage.getStore();
  if (!store) {
    store = new Map<string, any>();
  // Note: in real code you need a mechanism to store this context in the current AsyncLocalStorage !!!!! ??
  }
  return store;
}

/**
* Sets the value to the context
 */
export function setContext(key: string, value: any): void {
  const store = getContextStore();
  store.set(key, value);
}

/**
* Executes a function in a new context
 */
export function runWithContext<T>(fn: () => T): T {
  return contextStorage.run(new Map<string, any>(), fn);
}