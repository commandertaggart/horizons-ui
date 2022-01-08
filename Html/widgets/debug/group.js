
define(['jquery', 'widgets/horizons-widget'], ($, HorizonsWidget) => {

    const groupTemplate = /*html*/`
    <style>
        .collapse-button {
            display: inline-block;
        }

        .title {
            display: inline-block;
            font-variant: small-caps;
            font-weight: bold;
            padding-left: 10px;
        }

        .children {
            margin-left: 25px;
        }
    </style>
    <div>
        <button class="collapse-button"></button>
        <div class="title"></div>
        <div class="children">
            <slot></slot>
        </div>
    </div>
`;

    class HzDebugGroup extends HorizonsWidget {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
        }

        static get observedAttributes() {
            return ['title', 'state'];
        }

        get state() {
            return this.getAttribute('state') === 'open'
        }
        set state(open) {
            this.setAttribute('state', open ? 'open' : 'closed');
            this.$collapse.text(open ? '-' : '+');
            this.$children.toggle(open);
        }

        get title() {
            return this.getAttribute('title');
        }
        set title(txt) {
            this.setAttribute('title', txt);
            this.$title.text(txt);
        }

        connectedCallback() {
            this.$root = $(this.shadowRoot);
            this.$root.html(groupTemplate);

            this.$collapse = this.$root.find('.collapse-button');
            this.$collapse.click(() => {
                this.state = !this.state;
            });
            this.$title = this.$root.find('.title');
            this.$children = this.$root.find('.children');
            
            HzDebugGroup.observedAttributes.forEach(a => this[a] = this[a]);
        }

        attributeChangedCallback(attrName, oldVal, newVal) {
            if (this.$root && (oldVal !== newVal)) {
                if (attrName === 'title') {
                    this.title = newVal;
                }
                if (attrName === 'state') {
                    this.state = newVal === 'open';
                }
            }
        }
    }

    customElements.define('hz-debug-group', HzDebugGroup);

});