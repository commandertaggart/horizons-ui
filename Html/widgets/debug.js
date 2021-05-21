
define(['hydra/net', 'jquery'], (HydraNet, $) => {
    const template = /*html*/`
        <style>
            #debug_output {
                border: 5px dotted yellow;
                border-radius: 10px;
                margin: 20px;
                padding: 20px;
                max-height: 600px;
                overflow-y: auto;
                overflow-x: auto;
            }

            .debug_line {
                display: block;
                box-spacing: border-box;
                border: 1px solid white;
                padding: 10px;
            }

            .message_type {
                display: block;
                font-weight: bold;
            }

            .message_payload {
                white-space: pre-wrap;
                font-family: monospace;
                padding: 0;
            }
        </style>
        <div id="debug_output"></div>
`;

    class HzDebug extends HTMLElement {
        constructor() {
            super();
            this.lines = [];
            this.maxLines = 50;
            this.attachShadow({ mode: 'open' });
        }

        static get observedAttributes() {
            return ['max-lines'];
        }
    
        connectedCallback() {
            this.$root = $(this.shadowRoot);
            this.$root.html(template);

            this.$log = this.$root.find('#debug_output');

            this.subscription = HydraNet.Subscribe('*', (messageType, messagePayload) => {
                const $line = $(/*html*/`
                    <div class="debug_line">
                        <span class="message_type">${messageType}</span>
                        <span class="message_payload">${JSON.stringify(messagePayload, null, 2)}</span>
                    </div>
                `);
                this.$log.append($line);

                this.lines.push($line);
                while (this.lines.length > this.maxLines) {
                    this.lines.shift().remove();
                }
            });
        }

        disconnectedCallback() {
            this.subscription.unsubscribe();
        }

        attributeChangedCallback(attrName, oldVal, newVal) {
            if (attrName === 'max-lines') {
                this.maxLines = +newVal;
                if (isNaN(this.maxLines)) {
                    this.maxLines = 50;
                }
            }
        }
    }

    customElements.define('hz-debug', HzDebug);
});