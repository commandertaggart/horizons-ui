
import HorizonsElement from '/widgets/horizons-element.js';
import IconLibrary from './library.js';

export default class HzUIIcon extends HorizonsElement {
    constructor() {
        super();

        this.addStyles(/*css*/`
.hzui.icon {
    font-size: var(--font-size, 48px);
    font-family: HorizonsIcon;
    font-weight: normal;
    display: inline-block;
    font-style: normal;
    font-variant: normal;
    line-height: 1;
    text-rendering: auto;
}
.hzui.icon:before {
    content: var(--icon-glyph, 'H');
}
        `);

        this.setTemplate(/*html*/`<div class="hzui icon"></div>`).then(() => {
            this.addEventListener('image', ({ newValue }) => this.setImage(newValue));
            this.addEventListener('size', ({ newValue }) => this.setSize(newValue));
        });

    }

    setImage(imageName) {
        this.setStyleProp('hzui.icon', '--icon-glyph', `'${imageName ? IconLibrary[imageName] || 'H' : 'H'}'`);
    }

    setSize(size) {
        if (+size /* yes double, not triple */ == size) {
            size = size + 'px';
        }
        this.setStyleProp('hzui.icon', '--font-size', size);
    }
}

HzUIIcon.parameters = {
    'image': {},
    'size': { defaultValue: '48' }
}

customElements.define('hzui-icon', HzUIIcon);