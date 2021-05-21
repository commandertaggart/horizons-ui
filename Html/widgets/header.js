
define(['hydra/net', 'horizons/vessel', 'jquery', 'text!./templates/header.html'], (HydraNet, HzVessel, $, template) => {
    class HzHeader extends HTMLElement {
        static get observedAttributes() {
            return ['title', 'alert-status', 'network-status']
        }
        constructor() {
            super();

            this.subs = [];
            this.attachShadow({ mode: 'open' });
        }
    
        connectedCallback() {
            this.$root = $(this.shadowRoot);
            this.$root.html(template);

            this.$header = this.$root.find('#header');
            this.$header.addClass('alert-blue');

            this.$socket = this.$root.find('#socket-indicator');

            this.$title = this.$root.find('#title');
            this.$title.text(this.getAttribute('title'));

            this.$roles = {
                'Flight': this.$root.find('#role-flight'),
                'Communications': this.$root.find('#role-comms'),
                'Sciences': this.$root.find('#role-science'),
                'Engineer': this.$root.find('#role-engineer'),
                'Tactical': this.$root.find('#role-tactical')
            };

            this._subs = [
                HydraNet.OnStatus((netStatus) => {
                    this.setAttribute('network-status', netStatus);
                }),
                HzVessel.OnAlertStatusUpdate((alertStatus) => {
                    this.setAttribute('alert-status', alertStatus);
                }),
                HzVessel.OnRolesStatusUpdate((rolesStatus) => {
                    for (const role in rolesStatus) {
                        if (role in this.$roles) {
                            this.$roles[role].toggleClass('inuse', rolesStatus[role].InUse);
                        }
                    }
                })
            ];
        }

        disconnectedCallback() {
            this._subs.forEach(s => s.unsubscribe());
            this._subs = [];
        }

        attributeChangedCallback(attrName, _oldVal, newVal) {
            switch (attrName) {
                case 'alert-status': {
                    this.$header.toggleClass('alert-gray', newVal === 'gray');
                    this.$header.toggleClass('alert-blue', newVal === 'blue');
                    this.$header.toggleClass('alert-green', newVal === 'green');
                    this.$header.toggleClass('alert-yellow', newVal === 'yellow');
                    this.$header.toggleClass('alert-red', newVal === 'red');
                }
                break;

                case 'network-status': {
                    this.$socket.toggleClass('online', newVal === 'OPEN');
                }
                break;

                case 'title': {
                    this.$title ? this.$title.text(newVal) : void(0);
                }   
            }
        }
    }

    customElements.define('hz-header', HzHeader);
    return HzHeader;
});