/*
 * This file is derived from @gcds-core/components
 * <https://github.com/cds-snc/gcds-components>.
 * Copyright (c) Government of Canada / Gouvernement du Canada.
 * SPDX-License-Identifier: MIT
 * See the NOTICE file in the root of this distribution.
 */
export const assignLanguage = (el: HTMLElement) => {
  let lang = '';
  if (!el.getAttribute('lang')) {
    const closestLangAttribute = closestElement('[lang]', el)?.getAttribute('lang');
    if (closestLangAttribute == 'en' || !closestLangAttribute) {
      lang = 'en';
    } else {
      lang = 'fr';
    }
  } else if (el.getAttribute('lang') == 'en') {
    lang = 'en';
  } else {
    lang = 'fr';
  }

  return lang;
};

// Allows use of closest() function across shadow boundaries
export const closestElement = (selector, el) => {
  if (el) {
    return (el && el != document && typeof window != 'undefined' && el != window && el.closest(selector)) || closestElement(selector, el.getRootNode().host);
  }

  return null;
};
