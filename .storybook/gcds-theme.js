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
  // Storybook's theming runs these through `polished`, which cannot parse
  // CSS custom properties - use literal colours / numeric radii only.
  appContentBg: '#ffffff',
  appBorderColor: '#cccccc',
  appBorderRadius: 6,

  // Toolbar default and active colors
  barTextColor: '#333333',

  // Text colors
  textColor: '#333333',
  textInverseColor: '#ffffff',

  // Form colors
  inputBorderRadius: 6,
});