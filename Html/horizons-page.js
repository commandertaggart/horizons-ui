import Vue from "/lib/vue.js";
import WidgetLoader from "/widgets/util/WidgetLoader.js";
import WidgetBinding from "/widgets/util/WidgetBinding.js";
import serviceManager from "./serviceManager.js";


Vue.use(WidgetBinding);

export default function HorizonsPage(query) {
    const nodes = (typeof(query) === 'string') ?
        Array.from(document.querySelectorAll(query)) :
        (query instanceof NodeList || Array.isArray(query)) ? query : [query];

    nodes.forEach(async (node) => {
        const components = await WidgetLoader.loadComponetsFromUndefinedElements(node);

        const vue = new Vue({
            el: node,
            components,
            data: {
                serviceManager,
                services: {},
            }
        });

        serviceManager.onServiceConnected = (name, value) => {
            vue.$set(vue.services, name, value); // this is the key
        };
    });
} 