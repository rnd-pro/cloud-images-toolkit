import Symbiote from '@symbiotejs/symbiote';
import { styles } from './css.js';
import { template } from './tpl.js';
import { configs } from '../../../node/CFG.js';
import { WsClient } from '../../WsClient.js';

export class CitCollectionProfiles extends Symbiote {

  init$ = {
    configs: configs.map((cfg, i) => {
      return {
        name: cfg.name || `Collection ${i}`,
        idx: i,
        cfg,
        modified: false,
        current: i === this.$['APP/collectionIndex'],
      }
    }),

    onCfgChange: (e) => {
      let itemComponent = e.target.closest('cit-collection-item');
      if (itemComponent) {
        itemComponent.$.modified = true;
        let xCfg = e.target.closest('x-cfg');
        if (xCfg) {
          itemComponent.$.cfg = xCfg.value;
        }
      }
    },

    applyChanges: async (e) => {
      let itemComponent = e.target.closest('cit-collection-item');
      if (itemComponent) {
        let idx = itemComponent.$.idx;
        let newCfg = itemComponent.$.cfg;
        await WsClient.send({
          cmd: 'SAVE_CONFIG',
          data: {
            collectionIndex: idx,
            config: newCfg
          }
        });
        itemComponent.$.modified = false;
      }
    },

    onActivate: (e) => {
      let itemComponent = e.target.closest('cit-collection-item');
      if (itemComponent) {
        let idx = itemComponent.$.idx;
        this.$['APP/collectionIndex'] = idx;
        
        // Update visual current state for all items
        let domItems = this.querySelectorAll('cit-collection-item');
        domItems.forEach(item => {
          // @ts-ignore
          item.$.current = item.$.idx === idx;
        });

        this.$['APP/collectionProfilesActive'] = false;
      }
    },
  }

  close() {
    this.$['APP/collectionProfilesActive'] = false;
  }

  renderCallback() {
    this.sub('APP/collectionProfilesActive', (val) => {
      if (val) {
        this.setAttribute('active', '')
      } else {
        this.removeAttribute('active')
      }
    });
  }
}

CitCollectionProfiles.rootStyles = styles;
CitCollectionProfiles.template = template;

CitCollectionProfiles.reg('cit-collection-profiles');
