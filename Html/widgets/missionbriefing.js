
define(['text!./templates/missionbriefing.html', 'widgets/horizons-widget'], (template, HorizonsWidget) => {
    class HzMissionBriefing extends HorizonsWidget {
        constructor() {
            super();
        }
    
        connectedCallback() {
            this.$root = $(this.shadowRoot);
            this.$root.html(template);
        }
    }
    
    customElements.define('hz-missionbriefing', HzMissionBriefing);
});