
import WidgetBinding from "/widgets/util/WidgetBinding.js";

const HzBitsButton = {
    name: 'hz-bits-button',
    template: /*html*/`<button class="hz-bits-button" @click="handleClick"><slot></slot></button>`,
    styles: ['/widgets/bits/button/style.css'],

    props: {
        'bind': { default: '' },
        'action': { default: 'none' },
        'bind-path': { default: '/horizons/$.js' },
        'bind-placeholder': { default: '$' },
        'binding': { default: WidgetBinding.empty }
    },

    methods: {
        handleClick() {
            this.$emit('click');
        }
    },

    watch: {
        bind(val) {
            if (this.binding) {
                this.binding.destroy();
                this.binding = WidgetBinding.empty();
            }
            if (val) {
                this.bind = val;
                this.binding = new WidgetBinding(this.bind, {
                    path: this.bindPath,
                    placeholder: this.bindPlaceholder
                });
            }
        }
    }
}

export default HzBitsButton;