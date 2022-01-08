
define(['hydra/net', 'jquery', 'widgets/horizons-widget'], (HydraNet, $, HorizonsWidget) => {

    const template = /*html*/`
        <style>
            .message-type {
                display: inline-block;
                width: 100px;
            }
            .last-received-time {
                display: inline-block;
                width: 100px;
                float: right;
            }
            .last-data {
                display: block;
                font-family: monospace;
                white-space: pre-wrap;
                max-height: 32px;
                overflow-y: hidden;
                margin-left: 25px;
            }
            .last-data.expanded {
                max-height: inherit;
            }
        </style>
        <div>
            <div class="message-type"></div>
            <div class="last-received-time"><button class="request-button">REQUEST</button></div>
            <div class="last-data"></div>
        </div>
`;

    class HzDebugPacket extends HorizonsWidget {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
        }

        get messageType() {
            return this.getAttribute('message-type');
        }
        set messageType(name) {
            this.setAttribute('message-type', name);
            this.$messageType.text(name);
            if (this.subscribed) {
                this.subscribed = false;
                this.subscribed = true;
            }
        }

        get subscribed() {
            return !!this.subscription;
        }
        set subscribed(isSubscribed) {
            this.setAttribute('subscribed', isSubscribed ? 'true' : 'false');

            if (isSubscribed) {
                this.$requestButton.hide();
                this.$lastReceivedTime.text('-');
                if (!this.subscription) {
                    HydraNet.Subscribe(this.messageType, this.updateData.bind(this))
                        .then(sub => {
                            this.subscription = sub;
                        });
                }
            }
            else {
                if (this.subscription) {
                    this.subscription.unsubscribe();
                    this.subscription = null;
                }
            }
        }

        set lastReceivedTime(time) {
            this.$lastReceivedTime.text(time.toLocaleTimeString());
        }

        set lastData(data) {
            this.$lastData.text(JSON.stringify(data, null, 2));
        }

        connectedCallback() {
            this.$root = $(this.shadowRoot);
            this.$root.html(template);

            this.$messageType = this.$root.find('.message-type');
            this.$lastReceivedTime = this.$root.find('.last-received-time');
            this.$requestButton = this.$root.find('.request-button');
            this.$lastData = this.$root.find('.last-data');

            this.$requestButton.click(() => this.subscribed = true);
            this.$lastData.click(() => this.$lastData.toggleClass('expanded'));

            this.subscribed = this.getAttribute('subscribed') === 'true';
            this.messageType = this.messageType;
        }

        disconnectedCallback() {
            this.subscribed = false;
        }

        updateData(messageType, messagePayload) {
            if (messageType === this.messageType) {
                this.lastData = messagePayload;
                this.lastReceivedTime = new Date();
                this.$requestButton.attr('enabled', 'false');
            }
        }
    }

    customElements.define('hz-debug-packet', HzDebugPacket);

});