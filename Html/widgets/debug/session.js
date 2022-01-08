
define(['jquery', 'widgets/horizons-widget', 'horizons/session', 'text!./debug.css'], ($, HorizonsWidget, HzSession, styles) => {

    const template = /*html*/`
<style>
    ${styles}
    .debugpanel { width: 350px; }
</style>
<div class="debugpanel">
    <div class="group">
        <div class="grouplabel">Session</div>
        <div class="prop"><span class="proplabel">CommOverride:</span> <span class="propvalue" id="CommOverride"></span></div>
        <div class="prop"><span class="proplabel">EncountersEnabled:</span> <span class="propvalue" id="EncountersEnabled"></span></div>
        <div class="prop"><span class="proplabel">Mode:</span> <span class="propvalue" id="Mode"></span></div>
        <div class="prop"><span class="proplabel">State:</span> <span class="propvalue" id="State"></span></div>
    </div>
    <div class="group">
        <div class="grouplabel">Settings</div>
        <div class="prop"><span class="proplabel">Production:</span> <span class="propvalue" id="Production"></span></div>
        <div class="prop"><span class="proplabel">Debug:</span> <span class="propvalue" id="Debug"></span></div>
    </div>
    <div class="group">
        <div class="grouplabel">Server</div>
        <div class="prop"><span class="proplabel">ServerStartTime:</span> <span class="propvalue" id="ServerStartTime"></span></div>
        <div class="prop"><span class="proplabel">ServerScreen:</span> <span class="propvalue" id="ServerScreen"></span></div>
    </div>
    <div class="group">
        <div class="grouplabel">Console</div>
        <div class="prop"><span class="proplabel">ConsoleLevel:</span> <span class="propvalue" id="ConsoleLevel"></span></div>
        <div class="prop"><span class="proplabel">ConsoleStatus:</span> <span class="propvalue" id="ConsoleStatus"></span></div>
    </div>
    <div class="group">
        <div class="grouplabel">Events</div>
        <div class="prop"><span class="proplabel">Reset:</span> <span class="propvalue" id="Reset"></span></div>
        <div class="prop"><span class="proplabel">Break:</span> <span class="propvalue" id="Break"></span></div>
    </div>
</div>
`;

    class HzDebugSession extends HorizonsWidget {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });

            this.props = {
                CommOverride: {},
                EncountersEnabled: {},
                Mode: {},
                State: {},

                Production: {},
                Debug: {},
                
                ServerStartTime: {},
                ServerScreen: {},
                
                ConsoleLevel: {},
                ConsoleStatus: {},
                
                Reset: { event: true },
                Break: { event: true },
            }
        }

        connectedCallback() {
            this.$root = $(this.shadowRoot);
            this.$root.html(template);

            Object.keys(this.props).forEach(key => {
                this.props[key].$el = this.$root.find(`#${key}`);

                if (this.props[key].event) {
                    HzSession.addEventListener(key, () => {
                        this.props[key].$el.text(`Last Received: ${(new Date()).toLocaleTimeString()}`)
                    });
                }
                else {
                    HzSession.addEventListener(key, ({ value }) => {
                        this.props[key].$el.text(JSON.stringify(value, null, 2))
                    });
                }
            });
        }
    }

    customElements.define('hz-debug-session', HzDebugSession);

});