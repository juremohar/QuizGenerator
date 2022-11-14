import _ from 'lodash';
import { initRouter } from './Routes';
import '../scss/styles.scss'
import { inject } from '@vercel/analytics';

window.addEventListener('DOMContentLoaded', function() {
  initRouter(document.body)
  inject();
})
