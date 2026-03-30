import { css } from '@symbiotejs/symbiote';

export const CIT_UI_CSS = css`
:root {
  --color-1: rgb(33, 33, 33);
  --color-2: rgb(238, 238, 238);
  --color-3: rgb(51, 51, 51);
  --color-4: rgb(102, 102, 102);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

cit-ui {
  -ms-overflow-style: none;
  scrollbar-width: none; 

  ::-webkit-scrollbar {
    display: none;
  }

  display: grid;
  grid-template-columns: min-content 1fr 320px;
  gap: 10px;
  background-color: var(--color-1);
  color: var(--color-2);
  border-radius: 10px;
  padding: 10px;
  font-family: sans-serif;
  height: calc(100vh - 40px);

  * {
    box-sizing: border-box;
  }

  .material-symbols-outlined {
    font-variation-settings:
      'FILL' 0,
      'wght' 300,
      'GRAD' 0,
      'opsz' 24
  }

  [panel] {
    display: flex;
    height: 100%;
    overflow: auto;
    gap: 10px;

    &[column] {
      flex-direction: column;
      gap: 2px;
    }
  }

  [toolbar] {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 2px solid rgba(0, 0, 0, 0.6);

    &:before {
      content: attr(caption);
      display: block;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }

    &[disabled] {
      opacity: 0.5;
      pointer-events: none;
      content-visibility: hidden;
    }

    &[hidden] {
      display: none;
    }

    [controls] {
      display: flex;
      flex-wrap: wrap;
      gap: 2px;

      &[grow] * {
        flex-grow: 1;
      }

      &[column] {
        width: 10px;
      }
    }

    info-row {
      display: block;
      position: relative;
      font-size: 12px;
      background-color: rgba(0, 0, 0, 0.4);
      color: rgba(0, 200, 255, 0.8);
      padding: 6px;
      border-radius: 4px;
      margin-top: 16px;
      word-break: break-all;

      &:before {
        position: absolute;
        top: -16px;
        left: 6px;
        color: rgba(255, 255, 255, 0.8);
        display: inline-block;
        content: attr(caption);
        margin-right: 4px;
        white-space: nowrap;
        text-transform: none;
      }

      &[uppercase] {
        text-transform: uppercase;
      }
    }

    pre {
      background-color: rgba(0, 0, 0, 0.4);
      padding: 10px;
      border-radius: 4px;
      overflow: auto;
      font-size: 12px;
      color: rgba(0, 200, 255, 0.8);
      margin: 0;
      box-shadow: inset 0 0 20px 0 rgba(0, 200, 255, 0.1);
      border: 1px solid rgba(0, 200, 255, 0.3);

      code {
        outline: none;
      }
    }
  }

  [tiles-wrapper] {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    height: 100%;
    overflow: auto;
    gap: 10px;
    background-color: rgba(255, 255, 255, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    border-top: 2px solid rgba(0, 0, 0, 0.7);
    box-shadow: inset 0 0 16px 0 rgba(0, 0, 0, 0.6);
    border-radius: 6px;
    content-visibility: auto;

    --img-item-bg: #212121;
    &.inverted {
      --img-item-bg: #eee;
    }
    &[hidden] {
      display: none;
    }

    [empty-state] {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: rgba(255, 255, 255, 0.3);
      gap: 16px;

      &[hidden] {
        display: none;
      }

      svg {
        height: 64px;
        width: 64px;
        fill: currentColor;
      }

      [title] {
        font-size: 24px;
        font-weight: 300;
      }

      [sub] {
        font-size: 14px;
        opacity: 0.7;
      }
    }

    [loader] {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 30px;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;

      &[hidden] {
        display: none;
      }

      svg {
        height: 64px;
        width: 64px;
        fill: #00ffc8;
        transform-origin: center;
        animation: spin 2s linear infinite;
      }
    }
  }


  [tiles] {
    display: inline-flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
    
    border-radius: 6px;
    padding: 10px;
  }

  [itemize-container] {
    display: contents;
  }

  input {
    height: 32px;
    min-width: 32px;
    border: none;
    background-color: var(--color-1);
    color: var(--color-2);
    padding-left: 12px;
    padding-right: 12px;
    border-radius: 4px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.4);
    width: 100%;

    &:focus {
      outline: none;
      border-bottom: 1px solid currentColor;
    }
  }

  select {
    height: 32px;
    border: none;
    background-color: var(--color-1);
    color: var(--color-2);
    padding-left: 12px;
    padding-right: 12px;
    border-radius: 4px;

    &:focus {
      outline: none;
    }
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    border: none;
    background-color: var(--color-1);
    color: var(--color-2);
    padding-left: 12px;
    padding-right: 12px;
    border-radius: 4px;
    cursor: pointer;
    white-space: nowrap;
    transition: .2s;

    &[disabled] {
      opacity: .4;
      pointer-events: none;
    }

    &:active {
      transform: scale(.96);
    }

    &:not([round]) {
      &:hover {
        background-color: var(--color-2);
        color: var(--color-1);
      }
    }

    &:not([round]) span {
      font-size: 18px !important;
      margin-right: 4px;
      transform: translateX(-4px);
    }

    &[hidden] {
      display: none;
    }

    &[round] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      overflow: hidden;
      transition: 0.3s;

      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }

      &[disabled] {
        opacity: 0.5;
        pointer-events: none;
      }

      &[message] {
        background-color: rgba(255, 255, 255, .4);
        color: #000;
      }

      &:not(:disabled)[current] {
        color: #0f0;
      }

      &:not(:disabled)[warning] {
        color: rgb(255 108 32);
      }

    }
  }

  [footer] {
    opacity: 0.5;
    margin: 10px;
    text-align: center;
    a {
      color: var(--color-2);
    }
  }
}
`;