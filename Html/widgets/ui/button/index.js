
import HorizonsElement from "/widgets/horizons-element";

export default class HzUIButton extends HorizonsElement {
    constructor() {
        super();

        this.setContent(/*html*/`
<button class="hzui" id="button">
    <template id="icon">
        <hzui-icon id="icon"></hzui-icon>
    </template>
    <slot></slot>
</button>
        `);
    }
}

HzUIButton.parameters = {
    'icon': {},
    'icon-size': { defaultValue: '32' }
}