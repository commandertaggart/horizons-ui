import WidgetLoader from '/widgets/util/WidgetLoader.js';
import HzBitsIcon from '/widgets/bits/icon/index.js';

const HzLayoutGroup = {
    name: 'hz-layout-group',
    //template: '/widgets/layout/group/template.html',
    styles: ['/widgets/layout/group/style.css'],

    props: {
        'tab-position': { type: String, default: 'left-top' }
    },
    data: {
        selected: 0,
    },
    computed: {
        icons() {
            return this.$slots.default.filter(s => !!s.componentOptions).map(s => s.componentOptions.propsData?.icon);
        },
        panels() {
            return this.$slots.default.filter(s => !!s.componentOptions).map(s => this.$createElement('div', s));
        }
    },

    render(h) {
        const childPanels =  this.$slots.default.filter(s => !!s.componentOptions);
        return h('div', 
            { 'class': 'hz-layout-group'}, 
            [
                h('div', 
                    { 
                        'class': 'hz-layout-group-tabs', 
                        'attrs': { 'tab-position': this.tabPosition } 
                    }, 
                    childPanels.map((s, i) => h('div', 
                        { 
                            'class': { 'hz-layout-group-tab': true, 'selected': i === this.selected },
                            'on': { 
                                click: () => { 
                                    this.selected = i; 
                                }
                            }
                        }, 
                        [ 
                            h('hz-bits-icon', 
                                { 
                                    props: { id: s.componentOptions.propsData?.icon || 'blank' } 
                                }
                            )
                        ]
                    ))
                ),
                h('div', 
                    { 
                        'class': 'hz-layout-group-panels', 
                        'attrs': { 'tab-position': this.tabPosition } 
                    },
                    childPanels.map((s, i) => h('div', 
                        { 
                            'class': { 'hz-layout-group-panel': true, 'selected-panel': i === this.selected }
                        }, 
                        [s]
                    ))
                )
            ]
        );
    },

    components: {
        [HzBitsIcon.name]: WidgetLoader.loadComponent(HzBitsIcon)
    }
};

export default HzLayoutGroup;
