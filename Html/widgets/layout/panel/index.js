
import HzBitsIcon from "/widgets/bits/icon/index.js";

const HzLayoutPanel = {
    name: 'hz-layout-panel',
    template: '/widgets/layout/panel/template.html',
    styles: ['/widgets/layout/panel/style.css'],

    props: {
        'icon': String,
        'title': String,
        'force-icon': Boolean
    },

    components: {
        [HzBitsIcon.name]: HzBitsIcon
    }
};

export default HzLayoutPanel;
