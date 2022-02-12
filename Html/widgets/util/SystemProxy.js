
const DESTROY = Symbol('destroy');

export default async function SystemProxy(path) {
    const module = await import(path);
    const system = module.default;
    
    let proxy = null;

    const subscriptions = {};
    const updating = {};
    const properties = system.getPropertyDefinitions();
    Object.keys(properties).forEach(key => {
        properties[key].get = () => {
            if (!subscriptions[key]) {
                subscriptions[key] = ({ value }) => {
                    updating[key] = true;
                    proxy[key] = value;
                    updating[key] = false;
                }
                system.addEventListener(key, subscriptions[key]);
            }
            return system[key];
        };

        if (properties[key].writeable) {
            properties[key].set = (value) => {
                if (!updating[key]) {
                    system[key] = value;
                }
            }
        }
        delete properties[key].writeable;
        delete properties[key].value;
    });
    
    properties[DESTROY] = {
        enumerable: false,
        writeable: false,
        value: () => {
            Object.keys(subscriptions).forEach(key => system.removeEventListener(key, subscriptions[key]));
        }
    }

    proxy = Object.create({}, properties);

    return proxy;
}

SystemProxy.DESTROY = DESTROY;