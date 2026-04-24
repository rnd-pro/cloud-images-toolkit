import { css } from '@symbiotejs/symbiote';

export const CIT_UI_CSS = css`
:root {
  --color-1: rgb(33, 33, 33);
  --color-2: rgb(238, 238, 238);
  --color-3: rgb(51, 51, 51);
  --color-4: rgb(102, 102, 102);

  --color-accent: rgba(255, 221, 0, 1);

  --gap-min: 2px;
  --gap-mid: 10px;
  --gap-max: 20px;

  --ui-size: 32px;
}

* {
  box-sizing: border-box;
}

a {
  color: currentColor;
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
  height: calc(100vh - 16px);

  --img-item-bg: #212121;
  &.inverted {
    --img-item-bg: #eee;

    button {
      &[round] {
        &[invert-bg] {
          transform: rotate(180deg);
        }
      }
    }
  }

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

  [viewport] {
    display: block;
    height: calc(100vh - 36px);
    overflow: auto;
    background-color: rgba(255, 255, 255, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    border-top: 2px solid rgba(0, 0, 0, 0.7);
    box-shadow: inset 0 0 16px 0 rgba(0, 0, 0, 0.6);
    border-radius: 6px;
    content-visibility: auto;

    &[hidden] {
      display: none;
    }

    [empty-state] {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: rgba(255, 255, 255, 0.6);
      gap: 16px;

      &[hidden] {
        display: none;
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

    [dropzone] {
      min-height: calc(100% - 44px);
      &[drag-over] {
        opacity: 0.7;
        background: rgba(0, 255, 255, 0.1);
        outline: 2px dashed var(--color-accent);
        outline-offset: -10px;
      }
    }

    [collection-bar] {
      display: flex;
      align-items: center;
      padding: 8px 10px 0;

      &[hidden] {
        display: none;
      }

      [collection-select] {
        flex-grow: 1;
        height: 36px;
        font-size: 14px;
        font-weight: 500;
        background-color: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 6px;
        cursor: pointer;
        transition: 0.2s;

        &:hover {
          background-color: rgba(255, 255, 255, 0.15);
        }
      }
    }
  }


  [tiles] {
    display: flex;
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

      span {
        font-size: 18px !important;
        margin-right: 4px;
        transform: translateX(-4px);
        transition: .2s;

        &[right-icon] {
          transform: translateX(4px);
          margin-left: 4px;
        }
      }
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

    &[accent] {
      background-color: var(--color-accent);
      color: #000;
    }

    &[toggle-on] {
      background-color: transparent;
      color: var(--color-accent);
      border: 2px solid currentColor;
      span.material-symbols-outlined {
        transform: rotate(180deg);
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

  x-cfg {
    --remove: '✕';
    color: #fff;
    margin: 0;
    width: 100%;

    x-cfg-row {
      td {
        background-color: rgba(255, 255, 255, .1);

        &.row-btn {
          line-height: 10px;
        }

        &.value {
          text-align: left;
          line-height: 10px;

          x-cfg {
            width: unset;
            margin: var(--gap-mid);
          }
        }

        &.row-btn {
          button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: var(--ui-size);
            width: var(--ui-size);
            border-radius: 100%;
            background-color: rgba(0, 0, 0, .05);
            filter: grayscale(.2);
          }
        }
      }
      &:nth-of-type(even) > td {
        background-color: rgba(244, 253, 255, .05) !important;
      }
    }

    input[type="checkbox"] {
      height: var(--ui-size);
      width: var(--ui-size);
      margin: 0;
    }
  }
}
`;