import { configure } from '@storybook/react';

function loadStories() {
  require('../stories/button.jsx');
  require('../stories/header.jsx');
}

configure(loadStories, module);
