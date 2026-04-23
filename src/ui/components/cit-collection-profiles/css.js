import { css } from '@symbiotejs/symbiote';

export const styles = css`
cit-collection-profiles {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  padding: 10px;
  transition: opacity .3s;

  &:not([active]) {
    opacity: 0;
    pointer-events: none;
  }

  [popup] {
    position: absolute;
    top: 40px;
    bottom: 40px;
    display: grid;
    grid-template-rows: min-content auto;
    max-width: 1200px;
    width: 100%;
    background-color: var(--color-1);
    border-radius: 6px;
    box-shadow: 0 0 12px rgba(0, 0, 0, .4);
    overflow: hidden;

    [p-header] {
      display: flex;
      justify-content: space-between;
      padding: 6px;

      [p-caption] {
        height: 100%;
        display: flex;
        align-items: center;
        padding-left: 10px;
      }
    }

    [p-content] {
      background-color: rgba(255, 255, 255, .1);
      padding: 10px;
      overflow: auto;
    }
  }

  cit-collection-item {
    display: block;
    margin-bottom: var(--gap-mid);
    padding: var(--gap-mid);
    background-color: rgba(0, 0, 0, .2);
    color: #fff;
    border-radius: 6px;
  }
}
`;