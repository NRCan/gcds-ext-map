import { create } from '@storybook/theming';

export default create({
  base: 'light',

  // Brand
  brandTitle: 'Government of Canada | Gouvernement du Canada',
  brandUrl: '',
  brandImage: 'https://digital.canada.ca/img/cds/goc--header-logo.svg',
  brandTarget: '_self',

   // Typography
  fontBase: '"Noto Sans", sans-serif',
  fontCode: 'monospace',

  // UI
  appContentBg: 'var(--gcds-bg-white, #ffffff)',
  appBorderColor: 'var(--gcds-color-grayscale-200, #cccccc)',
  appBorderRadius: 'var(--gcds-border-radius-md, 0.375rem)',

  // Toolbar default and active colors
  barTextColor: 'var(--gcds-text-primary, #333333)',

  // Text colors
  textColor: 'var(--gcds-text-primary, #333333)',
  textInverseColor: 'var(--gcds-color-white, #ffffff)',

  // Form colors
  inputBorderRadius: 'var(--gcds-border-radius-md, 0.375rem)',
});