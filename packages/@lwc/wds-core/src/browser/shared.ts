export const STEP_RENDER_MARKUP = 1;
export const STEP_INSERT_MARKUP = 2;
export const STEP_HYDRATE = 3;

export function determineTagName(componentUrl: string | URL, origin?: string | URL) {
  const url = new URL(componentUrl, origin);
  const match = /\/(\w+)\/(\w+)\/\2\.[jt]s$/.exec(url.pathname);
  if (!match) {
    return 'x-foo';
  }
  const [, namespace, componentName] = match;
  const kebabbedComponentName = componentName.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
  return `${namespace}-${kebabbedComponentName}`.toLowerCase();
}

export function getElementName(element: any) {
  const tagName = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : '';
  const classList =
    [...element.classList].length > 0 ? `.${[...element.classList].join(' .')}` : '';

  return `${tagName} ${id} ${classList}`;
}
