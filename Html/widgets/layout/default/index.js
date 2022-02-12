import HorizonsElement from "/widgets/horizons-element.js";

export default class HzUIDefaultLayout extends HorizonsElement {
    constructor() {
        super();

        this.setTemplate('/widgets/layout/default/template.html');
        this.addStyles('/widgets/layout/default/style.css');
    }
}

customElements.define('hzui-default-layout', HzUIDefaultLayout);