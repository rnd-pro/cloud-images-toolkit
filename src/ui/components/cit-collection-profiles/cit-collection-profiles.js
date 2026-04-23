import Symbiote from '@symbiotejs/symbiote';
import { styles } from './css.js';
import { template } from './tpl.js';
import { configs } from '../../../node/CFG.js';

export class CitCollectionProfiles extends Symbiote {

  init$ = {
    configs: configs.map((cfg, i) => {
      return {
        name: cfg.name || `Collection ${i}`,
        idx: i,
        cfg,
        cfgModified: false,
        current: i === this.$['APP/collectionIndex'],
      }
    }),

    onCfgChange: () => {
      console.log('onCfgChange');
    },

    applyChanges: () => {
      const currentCfg = this.$['configs'].find((c) => c.current);
      if (currentCfg) {
        this.$['APP/collections'][this.$['APP/collectionIndex']] = currentCfg.cfg;
        this.$['configs'] = this.$['configs'].map((c) => ({
          ...c,
          cfgModified: false,
        }));
      }
    },

    onActivate: () => {
      const currentCfg = this.$['configs'].find((c) => c.current);
      if (currentCfg) {
        this.$['APP/collectionIndex'] = currentCfg.idx;
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
