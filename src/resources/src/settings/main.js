import './style.css';
import {initSettings} from './settings-init';

const root = document.querySelector('[data-advanced-color-field-settings]');
if (root && root.dataset.acfSettingsMounted !== '1') {
  root.dataset.acfSettingsMounted = '1';
  initSettings(root);
}
