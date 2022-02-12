
import Vue from '/lib/vue.js';
import SystemProxy from './SystemProxy.js';

const systems = {};
const vues = new Map();

const WidgetBinding = {

    init(el, components) {
        vues.set(el, new Vue({
            el, components,
            data: {
                horizons: systems
            }
        }));
    },

    addSystem(name, path, onload = () => void(0)) {
        if(!(name in systems)) {
            systems[name] = SystemProxy(path).then(system => {
                for (const vue in vues.values()) {
                    vue.set(vue.horizons, name, system);
                }

                onload();
            });
        }
    },

    removeSystem(name) {
        if (name in systems) {
            if (systems[name] instanceof Promise) {
                systems[name].then(s => s[SystemProxy.DESTROY]());
            }
            else {
                systems[name][SystemProxy.DESTROY]();
            }

            for (const vue in vues.values()) {
                vue.delete(vue.horizons, name);
            }

            delete systems[name];
        }
    }
}

export default WidgetBinding;