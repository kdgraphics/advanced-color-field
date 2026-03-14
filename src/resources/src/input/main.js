import './style.css';
import {initInput} from './input-init';

const mountInput = (root) => {
  if (!(root instanceof HTMLElement)) return;
  if (root.dataset.acfInputMounted === '1') return;
  root.dataset.acfInputMounted = '1';
  initInput(root);
};

document.querySelectorAll('.acf-color-field').forEach((root) => mountInput(root));

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) {
        return;
      }
      if (node.matches('.acf-color-field')) {
        mountInput(node);
      }
      node.querySelectorAll?.('.acf-color-field').forEach((el) => mountInput(el));
    });
  });
});

observer.observe(document.body, {childList: true, subtree: true});
