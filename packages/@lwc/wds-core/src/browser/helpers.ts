import {
  createElement,
  
  hydrateComponent,
  LightningHTMLElement,
  
} from '@lwc/engine-dom';
// @ts-expect-error
import { hasMismatch } from '@lwc/engine-dom';
import { determineTagName } from './shared.js';
import * as ssr from './ssr/index.js';

const thisUrl = new URL(import.meta.url);
const pathname = thisUrl.pathname;
const directoryPath = pathname.substring(0, pathname.lastIndexOf('/') + 1);
const newFileUrl = `${thisUrl.origin}${directoryPath}wireMockUtil.js`;

function getQueryString(paramsObj: Record<string, string | number> = {}) {
  const queryParams = new URLSearchParams(thisUrl.searchParams);
  if (paramsObj && Object.keys(paramsObj).length > 0) {
    for (const [key, val] of Object.entries(paramsObj)) {
      queryParams.set(key, `${val}`);
    }
  }
  const queryString = queryParams.toString();
  return queryString.length ? `?${queryString}` : '';
}

export async function renderToMarkup(componentPath: string, props: any = {}) {
  return await ssr.render(componentPath, props);
}

function attachShadowRoots(rootEl: any) {
  for (const templateEl of rootEl.querySelectorAll('template[shadowroot]')) {
    const mode = templateEl.getAttribute('shadowroot');
    const shadowRoot = templateEl.parentNode!.attachShadow({ mode });
    shadowRoot.appendChild(templateEl.content);
    templateEl.remove();
    attachShadowRoots(shadowRoot);
  }
}

export async function insertMarkupIntoDom(markup: string, parentEl = document.querySelector('#mount')): Promise<any> {
  if ("setHTMLUnsafe" in Element.prototype) {
    parentEl!.setHTMLUnsafe(markup);
  } else {
    parentEl!.innerHTML = markup;
  }
  attachShadowRoots(parentEl);
  return parentEl!.firstChild;
}

export async function hydrateElement(el: Element, componentPath: any, props: any = {}, cacheBust = false): Promise<any> {
  const cacheBustedComponentPath = cacheBust
    ? `${componentPath}${getQueryString({ cacheBust: Date.now() })}`
    : `${componentPath}${getQueryString()}`;
  const { default: Ctor } = await import(cacheBustedComponentPath);

  hydrateComponent(el, Ctor, props);

  return !hasMismatch;
}

export async function clientSideRender(parentEl: any, componentPath: any, props: any = {}, cacheBust = false) {
  const cacheBustedComponentPath = cacheBust
    ? `${componentPath}${getQueryString({ cacheBust: Date.now() })}`
    : `${componentPath}${getQueryString()}`;

  const { default: Ctor } = await import(cacheBustedComponentPath);
  const elm = createElement<any>(determineTagName(cacheBustedComponentPath, document.location.origin), {
    is: Ctor,
  });
  for (const [key, val] of Object.entries(props)) {
    elm[key] = val;
  }
  parentEl.appendChild(elm);
  return elm;
}

export async function wireMockUtil(mockController: (arg0: string) => any) {
  const setWireValue = async (exportName: any, data: any) => {
    await mockController(`
        import { createTestWireAdapter } from '${newFileUrl}'; 
        export const ${exportName} = createTestWireAdapter();
        ${exportName}.emit(${JSON.stringify(data)});
    `);
  };
  return { setWireValue };
}
