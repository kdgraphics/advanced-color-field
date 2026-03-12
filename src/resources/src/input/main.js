import './style.css';
import {initInput} from './input-init';

document.querySelectorAll('.acf-color-field').forEach((root) => {
  if (root.dataset.acfInputMounted === '1') return;
  root.dataset.acfInputMounted = '1';
  initInput(root);
});
