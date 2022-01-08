
const doLog = true;
const log = doLog ? console.log.bind(console) : () => void(0);

const LOADED_STYLES = new Set();

const WidgetLoader = {
    loadComponent(spec) {
        if ('default' in spec) {
            spec = spec.default;
        }

        log(`Loading ${spec.name}...`);

        if (spec.styles) {
            if (!Array.isArray(spec.styles)) {
                spec.styles = [spec.styles];
            }

            spec.styles.forEach(style => {
                if (!LOADED_STYLES.has(style)) {
                    if (style.endsWith('.css')) {
                        const linkNode = document.createElement('link');
                        linkNode.setAttribute('rel', 'stylesheet');
                        linkNode.setAttribute('type', 'text/css');
                        linkNode.setAttribute('for-widget', spec.name);
                        linkNode.setAttribute('href', style);
                        document.head.appendChild(linkNode);
                    }
                    else {
                        const styleNode = document.createElement('style');
                        styleNode.setAttribute('for-widget', spec.name);
                        styleNode.innerHTML = style;
                        document.head.appendChild(styleNode);
                    }
                }
            });
        }

        if (spec.data) {
            if (typeof(spec.data) !== 'function') {
                const data = spec.data;
                spec.data = () => ({... data});
            }

            log(`... ${spec.name} default data: 
${JSON.stringify(spec.data(), null, 2)}`);
        }

        if (spec.template && (spec.template.endsWith('.htm') || spec.template.endsWith('.html'))) {
            log(`... ${spec.name} is asynchronous.`);
            return () => fetch(spec.template).then(response => {
                return response.text().then(t => {
                    spec.template = t;
                    return spec;
                });
            });
        }
        else {
            log(`... ${spec.name} is not asynchronous.`)
            return spec;
        }
    },

    async loadComponetsFromUndefinedElements(target = document.body) {
        const promises = [];

        const components = {};
        const tagsLoaded = new Set();

        const undefinedElements = target.querySelectorAll(':not(:defined)');
        [... undefinedElements]
            .map((el) => [el.localName, el.localName.split('-')])
            .filter(([_tag, parts]) => {
                if (parts[0] in window.CustomElementPrefixes) {
                    return true;
                }
                else {
                    console.warn('Unrecognized custom tag:', parts.join('-'));
                    return false;
                }
            }) 
            .forEach(([tag, parts]) => {
                parts[0] = window.CustomElementPrefixes[parts[0]];
                const filePath = `/${parts.join('/')}/index.js`;
                if (!tagsLoaded.has(tag)) {
                    log(`Loading ${filePath}`);
                    tagsLoaded.add(tag);
                    promises.push(import(filePath).then(module => {
                        const spec = module.default || module;
                        if (tag !== spec.name) {
                            console.warn(`Component loaded from unregistered element '${tag}' (${filePath}) has a different name declared: ${spec.name}`);
                        }

                        components[tag] = WidgetLoader.loadComponent(spec);
                        return components[tag];
                    }));
                }
            });
        
        // wait for everything to complete
        await Promise.allSettled(promises);
        log(`${promises.length} components loaded`);

        return components;
    }
}

export default WidgetLoader;