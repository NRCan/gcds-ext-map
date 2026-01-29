import {defineCustomElements} from '../dist/esm/loader';
import {defineCustomElements as defineGcdsComponents} from '@cdssnc/gcds-components/loader';

import gcdsTheme from './gcds-theme';

defineCustomElements();
defineGcdsComponents();

const preview = {
  parameters: {
    docs: {
      // source: {
      //   state: 'open',
      // },
      theme: gcdsTheme,
    },
  },
};

export default preview;
