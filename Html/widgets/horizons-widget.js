
import * as THREE from '/lib/three.module.js';
import Vue from '/lib/vue.js';

import WidgetEvent from './util/WidgetEvent.js';
import WidgetLoader from './util/WidgetLoader.js';

export default class HorizonsWidget extends HTMLElement {
    constructor(files) {
        super();

        this.__files = files;
        this.__state = {};
        this.__rendering = false;
    }

    connectedCallback() {
        if (this.init) {
            this.init();
        }
        this.__build();
    }

    async __build() {
        this.classList.add('hz-widget');
        this.__observer = new MutationObserver(this.__onMutation.bind(this));
        this.__observer.observe(this, { subtree: false, childList: true });
        if (this.__files) {
            this.attachShadow({ mode: 'open' });
            WidgetLoader.observe(this.shadowRoot);

            for (const i in this.__files.styles) {
                const style = document.createElement('link');
                style.setAttribute('type', 'text/css');
                style.setAttribute('rel', 'stylesheet');
                style.setAttribute('href', this.__files.styles[i]);
                this.shadowRoot.appendChild(style);
            }

            if (this.__files.template) {
                try {
                    const template = await fetch(this.__files.template).catch(() => null);
                    this.__template_str = await template.text();
                    this.__template = Handlebars.compile(this.__template_str);

                    this.__htmlRoot = document.createElement('div');
                    this.__htmlRoot.classList.add('hz-widget-shadow');
                    this.shadowRoot.appendChild(this.__htmlRoot);
                }
                catch (ex) {
                    console.error(ex);
                }
            }

            this.childrenChangedCallback(this.children);
            this.render();
        }
    }

    __onMutation(mutationList, _observer) {
        if (mutationList.some(m => m.type === 'childList' && m.target === this)) {
            this.childrenChangedCallback(this.children)
        }
    }

    render() {
        if (!this.__rendering) {
            this.__rendering = true;
            setTimeout(() => {
                if (this.__template && this.__htmlRoot) {
                    this.__htmlRoot.innerHTML = this.__template({
                        children: this.children,
                        
                        ... this.__state // this last so if the state overrides any defaults, that's what we get.
                    });
                }
                this.__rendering = false;
            }, 0);
        }
    }

    updateState(__newState, __value) {
        let newState;
        if (typeof(__value) !== 'undefined') {
            newState = { [__newState]: __value };
        }
        else {
            newState = { ... __newState };
        }

        Object.keys(newState).forEach(property => {
            const value = newState[property];
            if (value !== this.__state[property]) {
                const event = new WidgetEvent({ property, value });

                this.dispatchEvent(event);

                newState[property] = event.updatedValue;
            }
            else {
                delete newState[property];
            }
        });

        if (Object.keys(newState).length > 0) {
            this.__state = {
                ... this.__state,
                ... newState
            };

            this.render();
        }
    }
    
    getState(property, defValue) {
        return this.__state[property] || defValue;
    }

    static async register(spec) {
        if (!spec.__hz_widget_initialized) {
            spec.__hz_widget_initialized = true;

            let template = '<slot></slot>';

            Vue.component(spec.name, {
                name: s,
                template,
                props: spec.props || [],
                data: () => ({ ... (spec.state || {}) })
            })
        }
    }
}
