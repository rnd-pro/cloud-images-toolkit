import Symbiote, {html, css} from '@symbiotejs/symbiote';
import {icon} from './icon.js';

export class BackBtn extends Symbiote {

  renderCallback() {
    this.sub('^historyBackAvailable', (val) => {
      this.classList.toggle('hidden', !val);
    });
    this.addEventListener('click', () => {
      this.$['^onHistoryBack']();
    });
  }
}

BackBtn.rootStyles = css`
back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.1);
  opacity: 0.5;
  font-size: 42px;
  color: var(--color-2);
  border-radius: 6px;
  padding: 10px;
  content-visibility: auto;
  height: 180px;
  width: 140px;
  contain-intrinsic-size: 140px 180px;
  user-select: none;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  &.hidden {
    display: none;
  }
}
`;

BackBtn.template = html`${icon('arrow_back')}`;

BackBtn.reg('back-btn');
