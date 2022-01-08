import WidgetBinding from '/widgets/util/WidgetBinding.js';

const HzSystem = {
    name: 'hz-system',

    template: /*html*/`<div class="hz-layout-inert" v-if="$hz[use]"><slot></slot></div>`,

    props: {
        'use': { type: String, required: true },
        'load-path': { type: String, default: '/horizons/$.js' },
        'load-path-substitute': { type: String, default: '$' }
    },
    created() {
        const systemPath = this.loadPath.replace(this.loadPathSubstitute, this.use);
        WidgetBinding.addSystem(this.use, systemPath, () => (this.$parent || this).$forceUpdate());
    }
}

export default HzSystem;