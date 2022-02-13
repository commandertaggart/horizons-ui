
import HorizonsElement from '/widgets/horizons-element.js';

export default class HzUITabGroup extends HorizonsElement {
    constructor() {
        super();

        this.addStyles('/widgets/layout/tabgroup/style.css');
        this.setContent('/widgets/layout/tabgroup/template.html').then(() => {
            this.panels = this.getSlottedContent();
            this.tabs = Array(panels.length);
            this.createFromTemplate('tab', panels.length, (tab, idx) => {
                this.tabs[idx] = tab;
                tab.addEventListener('click', () => {
                    this.showTab(idx);
                });
            });
        });

        this.addEventListener('tab-position', ({ newValue }) => this.setAttribute('tabs', 'tab-position', newValue));
    }

    showTab(index) {
        for (let i = 0; i < this.panels.length; ++i) {
            this.panels[i].style.display = (i === index) ? null : 'none';
            this.tabs[i].classList.toggle('selected', i === index);
        }
    }
}

HzUITabGroup.parameters = {
    'tab-position': { 
        defaultValue: 'left', 
        valdiator(tabPosition) {
            return [
                'left',
                'right',
                'top',
                'bottom'
            ].includes(tabPosition)
        }
    }
}