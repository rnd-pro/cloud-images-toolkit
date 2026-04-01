import { css } from '@symbiotejs/symbiote';

export const IMS_COMPOSER_CSS = css`
cit-ims-composer {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, .2);
  backdrop-filter: blur(6px);
  transition: opacity .3s;
  padding-left: 40px;
  padding-right: 40px;

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

    [layout] {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      max-height: 100%;

      [column] {
        overflow: auto;
        max-height: calc(100vh - 140px);

        [toolbar] {
          margin-top: 2px;

          &:first-of-type {
            margin-top: 10px;
          }
        }
      }
    }

    pre {
      margin: 0;
    }

    code {
      display: block;
      outline: none;
      padding: 20px;
      background-color: rgba(0, 0, 0, .4);
      color: rgba(0, 200, 255, 1);
      border-radius: 4px;
      overflow: auto;
      transition: .3s;

      &[error] {
        color: rgba(255, 100, 100, 1);
      }

      &[embed-code] {
        max-height: 80px;
        overflow: auto;
      }
    }
  }

  ims-viewer {
    display: block;
    height: 400px;
    background-color: #ccc;
    border-radius: 4px;
  }

  ims-viewer > * {
    height: 400px;
    background-color: #ccc;
    border-radius: 4px;
  }

  [src-data-img] {
    border-radius: 4px;
    background-color: rgb(255, 255, 255);
    image-rendering: pixelated;
    min-width: 80px;
    min-height: 80px;
  }

  x-object-ui {
    --remove: '✕';
    color: #fff;
    margin: 0;
    width: 100%;

    x-object-ui-row {
      td {
        background-color: rgba(255, 255, 255, .1);

        &.row-btn {
          line-height: 10px;
        }

        &.value {
          text-align: left;
          line-height: 10px;

          x-object-ui {
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