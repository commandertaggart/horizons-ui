
import IconLibrary from './library.js';

const HzBitsIcon = {
    name: 'hz-bits-icon',

    template: /*html*/`
<div 
    class="hz-bits-icon"
    v-bind:class="{ 'image-icon': !!image }"
    v-bind:style="iconStyle"
></div>`,

    styles: ['/widgets/bits/icon/style.css'],

    props: {
        'id': { type: String, default: 'blank' },
        'image': String,
        'size': { type: [String, Number], default: 48 }
    },
    computed: {
        iconStyle() {
            const size = `${this.size}px`;
            if (this.image) {
                return {
                    'background-image': `url('${this.image}')`,
                    'background-size': size,
                    'width': size,
                    'height': size
                };
            }
            else {
                return {
                    '--hz-icon-content': `'${IconLibrary[this.id]}'`,
                    'font-size': size
                };
            }
        }
    }
};

export default HzBitsIcon;
