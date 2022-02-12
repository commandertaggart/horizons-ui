
import HorizonsElement from '/widgets/horizons-element.js';

let SRC_ROOT = '/widgets/';
let NODE_NAME = 'hz-widget';

export default class HorizonsWidget extends HorizonsElement {
    constructor() {
        super();

        let src = this.getAttribute('src');
        if (src[0] !== '/') {
            src = SRC_ROOT + src;
        }
        this.params.src = src;

        if (this.params.src) {
            import(this.params.src).then(module => module.default(this));
        }
    }
}

HorizonsWidget.use = ({
    srcRoot = SRC_ROOT,
    nodeName = NODE_NAME
} = {}) => {
    if (customElements.get(nodeName)) {
        console.warn(`Node name ${nodeName} is already in use.  Do not call HorizonsWidget.use() multiple times.`);
    }
    else {
        SRC_ROOT = srcRoot;
        NODE_NAME = nodeName;

        customElements.define(NODE_NAME, HorizonsWidget);
    }
}