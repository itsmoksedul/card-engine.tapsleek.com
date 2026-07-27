import type { Binding } from '../types/node';

export function resolveBinding(binding: Binding | undefined, card: any, content: any): any {
  if (!binding) return undefined;
  
  if (binding.source === 'card') {
    return card?.[binding.field];
  }
  
  if (binding.source === 'widget') {
    const widgetData = content?.[binding.key];
    if (!widgetData) return undefined;
    // Simple property path access (e.g. "title", "items.0.name")
    const parts = binding.path.split('.');
    let result = widgetData;
    for (const part of parts) {
      if (result == null) break;
      result = result[part];
    }
    return result;
  }
  
  if (binding.source === 'token') {
    return `var(--${binding.path.replace('.', '-')})`;
  }

  return undefined;
}
