
const PROMISE = Symbol('promise');
const MODULE = Symbol('module');
const SUBSCRIPTIONS = Symbol('subscriptions');
const DESTROY = Symbol('destroy');

const handler = {
    get(target, prop) {
        if (!(prop instanceof Symbol)) {
            if (!target[SUBSCRIPTIONS].get(prop)) {
                const listener = ({ property, value}) => target[property] = value;
                target[SUBSCRIPTIONS].set(prop, listener);
                target[MODULE].addEventListener(prop, listener);
            }
        }
        return target[prop];
    },
    set(target, prop, value) {
        if (!(prop instanceof Symbol)) {
            try {
                target[MODULE][prop] = value;
            }
            catch (err) {
                console.warn(err);
            }
        }
        target[prop] = value;
    }
}

function newSystem(name) {
    return {
        [SUBSCRIPTIONS]: new Map(),
        [PROMISE]: null,
        [MODULE]: null,
        [DESTROY]() {
            for (const [key, value] in this[SUBSCRIPTIONS].entries()) {
                this[MODULE].removeEventListener(key, value);
            }
            delete systems[name];
        }
    }
}

const systems = {};

const WidgetBinding = {
    install(Vue, _options) {
        Vue.prototype.$horizons =
        Vue.prototype.$hz = systems;
    },

    addSystem(name, path, onload = () => void(0)) {
        const system = systems[name] || newSystem(name);

        if (!system[MODULE]) {
            system[PROMISE] = import(path).then(module => {
                system[MODULE] = module.default;
                return system;
            });
        }

        return systems[name] = system;
    },

    removeSystem(name) {
        if (name in systems) {
            systems[name][DESTROY]();
        }
    },
}

export default WidgetBinding;