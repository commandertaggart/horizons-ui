class AttributeChangedEvent extends Event {
    constructor(name, oldVal, newVal) {
        super(name);

        this.attributeName = name;
        this.oldValue = oldVal;
        this.newValue = newVal;
        this.originalNewValue = newVal;
    }

    toString() {
        return `[AttributeChangedEvent ${this.attributeName} (${this.oldValue} -> ${this.newValue})]`;
    }
}

const OBSERVER = Symbol('observer');
const PARAMS = Symbol('params');
const ADJUSTING_ATTRIBUTE = Symbol('adjusting-attribute');
const ROOT_NODE = Symbol('root-node');

export default class HorizonsElement extends HTMLElement {
    constructor() {
        super();
 
        this[ADJUSTING_ATTRIBUTE] = false;
        this[ROOT_NODE] = this;

        this[PARAMS] = this.constructor.parameters || {};
        const paramNames = Object.keys(this[PARAMS]);

        this.params = {};
        paramNames.forEach(paramName => {
            const value = this.getAttribute(paramName) ?? this[PARAMS][paramName].defaultValue;
            if (this[PARAMS].validator) {
                if (!this[PARAMS].validator(value)) {
                    console.warn(`Provided value ${value} for parameter ${paramName} is invalid.`);
                }
            }
            this.params[paramName] = value;
        });
        
        this[OBSERVER] = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes') {
                    this.attributeChangedCallback(
                        mutation.attributeName, 
                        mutation.oldValue,
                        this.getAttribute(mutation.attributeName)
                    );
                }
            });
        });
    }

    connectedCallback() {
        this[OBSERVER].observe(this, { 
            attributes: true, 
            attributeOldValue: true,
            attributeFilter: Object.keys(this[PARAMS])
        });
        this.dispatchEvent(new Event('connected'));
    }

    disconnectedCallback() {
        this.dispatchEvent(new Event('disconnected'));
        this[OBSERVER].disconnect();
    }

    adoptedCallback() {
        this.dispatchEvent(new Event('adopted'));
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (!this[ADJUSTING_ATTRIBUTE]) {
            const event = new AttributeChangedEvent(name, oldVal, newVal)
            this.dispatchEvent(event);
            if (event.newValue !== event.originalNewValue) {
                this[ADJUSTING_ATTRIBUTE] = true;
                this.setAttribute(name, event.newValue);
                this[ADJUSTING_ATTRIBUTE] = false;
            }
        }
    }

    addEventListener(eventName, listenerCallback) {
        super.addEventListener(eventName, listenerCallback);
        if (eventName in this.params) {
            listenerCallback(new AttributeChangedEvent(eventName, undefined, this.params[eventName]));
        }
    }

    queryElement(selector) {
        return this[ROOT_NODE].querySelector(selector);
    }

    getElement(valueId) {
        let valueEl = 
            this.queryElement(`#${valueId}`) ||
            this.queryElement(`[slot="${valueId}"]`) ||
            this.queryElement(`[name="${valueId}"]`) ||
            this.queryElement(`.${valueId}`);
        return valueEl;
    }

    getTemplate(templateId) {
        return this.queryElement(`template#${templateId}`);
    }

    createFromTemplate(templateId, createCount = 1, forEach = () => void(0)) {
        const template = this.getTemplate(templateId);
        if (template) {
            if (template.content.childElementCount != 1) {
                console.warn(`createFromTemplate() expects exactly one root element per template`);
            }
            if (template.content.firstElementChild) {
                const existing = template.parentElement.querySelectorAll(`[id^="${templateId}:"]`);
                Array.prototype.forEach.call(existing, node => node.remove());

                for (let i = 0; i < createCount; ++i) {
                    const created = template.content.firstElementChild.cloneNode(true);
                    created.setAttribute('id', `${templateId}:${i}`);

                    forEach(created, templateId, i);
                    template.parentElement.appendChild(created);
                }
            }
        }
    }

    getValue(valueId) {
        const valueEl = this.getElement(valueId);
        return valueEl ? (valueEl.value ?? valueEl.innerHTML) : undefined;
    }

    setValue(valueId, value) {
        const valueEl = this.getElement(valueId);
        if ('value' in valueEl) {
            valueEl.value = value;
        }
        else {
            valueEl.innerHTML = value;
        }
    }

    setLabel(valueId, value) {
        const labelEl = this[ROOT_NODE].querySelector(`label[for="${valueId}"]`);
        const valueEl = this.getElement(valueId);

        if (labelEl || valueEl) {
            (labelEl || valueEl).innerHTML = value;
        }
    }

    setStyleClass(valueId, styleClass, setIt = true) {
        const valueEl = this.getElement(valueId);
        if (valueEl) {
            valueEl.classList.toggle(styleClass, setIt);
        }
    }

    setStyleProp(valueId, styleProp, propValue) {
        if (!styleProp.startsWith('--')) {
            styleProp = '--' + styleProp;
        }
        
        const valueEl = this.getElement(valueId);
        if (valueEl) {
            valueEl.style.setProperty(styleProp, propValue);
        }
    }

    setAttribute(valueId, attributeName, attributeValue) {
        if (typeof(attributeValue) === 'undefined') {
            super.setAttribute(valueId, attributeName);
        }
        const valueEl = this.getElement(valueId);
        if (valueEl) {
            valueEl.setAttribute(attributeName, attributeValue);
        }
    }

    addEvent(valueId, event, callback) {
        const valueEl = this.getElement(valueId);
        if (valueEl) {
            valueEl.addEventListener(event, callback);
            return true;
        }
        return false;
    }

    removeEvent(valueId, event, callback) {
        const valueEl = this.getElement(valueId);
        if (valueEl) {
            valueEl.removeEventListener(event, callback);
            return true;
        }
        return false;
    }

    async setTemplate(template, { useShadow = false } = {}) {
        let slotted = null;
        this[ROOT_NODE] = document.createElement('div');
        this[ROOT_NODE].style.display = 'contents';

        if (useShadow) {
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.appendChild(this[ROOT_NODE]);
        }
        else {
            slotted = Array.prototype.map.call(this.childNodes, child => child);
            Array.prototype.forEach.call(slotted, node => node.remove());
            this.appendChild(this[ROOT_NODE]);
        }


        if (typeof(template) === 'string') {
            let templateStr = template;
            if ((/\.html?$/i).test(template)) {
                templateStr = await fetch(template)
                    .then(response => response.text())
                    .catch(err => {
                        console.warn(`Template file ${template} failed to load`, err);
                        return useShadow ? '<slot></slot>' : '';
                    });
            }

            this[ROOT_NODE].innerHTML = templateStr;
        }
        else if (typeof(template) === HTMLTemplateElement) {
            this[ROOT_NODE].appendChild(template.content.cloneNode(true))
        }

        if (slotted) {
            const slots = {};
            Array.prototype.forEach.call(this[ROOT_NODE].querySelectorAll('slot'), slot => {
                const slotName = slot.getAttribute('name') || 'default';
                const replacement = document.createElement('div');
                replacement.style.display = 'contents';
                replacement.setAttribute('replacing-slot', slotName)
                slots[slotName] = replacement;
                slot.replaceWith(replacement);
            });

            Object.keys(slots).forEach(slotName => {
                if (slotName != 'default') {
                    slotted = slotted.filter(node => {
                        if (node instanceof HTMLElement && node.getAttribute('slot') === slotName) {
                            slots[slotName].appendChild(node);
                            return false;
                        }
                        return true;
                    });
                    slots[slotName].normalize();
                }
            });

            if (slots.default) {
                slots.default.append(... slotted);
                slots.default.normalize();
            }
        }
    }

    async addStyles(styles) {
        if (!Array.isArray(styles)) {
            styles = [styles];
        }

        styles = styles.map((style) => {
            if (/\.css/i.test(style)) {
                return `@import url(${style});`;
            }
            else {
                return style;
            }
        });

        const styleNode = document.createElement('style');
        styleNode.setAttribute('scoped', true);
        styleNode.innerText = styles.join('\n\n');

        this[ROOT_NODE].parentElement.appendChild(styleNode);
    }

    bindSystem(system, properties) {
        if (Array.isArray(properties)) {
            let map = {};
            properties.forEach(p => map[p] = []);
            properties = map;
        }

        Object.keys(properties).forEach(prop => {
            const bindings = Array.isArray(properties[prop]) ? properties[prop] : [properties[prop]];

            bindings.forEach(binding => {
                const valueId = binding.elementId || prop;
                const valueEl = this.getElement(valueId);
                if (!valueEl) {
                    console.warn(`Failed to bind system property ${prop} to missing element ${valueId}`);
                }
                else {
                    Object.keys(binding).filter(k => k.startsWith('on')).forEach(eventName => {
                        if (eventName === 'onUpdate') {
                            const action = binding.onUpdate || 'setValue';
                            if (typeof(action) === 'string' && !(action in this)) {
                                console.warn(`Unrecognized action ${action} on widget binding`);
                            }
                            else {
                                this.setValue(valueId, system[prop]);
                                let actionFn = action;
                                if (typeof(action) === 'string') {
                                    actionFn = this[action];
                                }
                                system.addEventListener(prop, ({ value }) => actionFn.call(this, valueId, value, ... properties[prop].parameters || []));
                            }
                        }
                        else {
                            const eventTag = eventName.slice(2);
                            valueEl.addEventListener(eventTag, binding[eventName]);
                        }
                    });
                }
            });
        });
    }
}