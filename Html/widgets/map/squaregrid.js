
define(['widgets/map/layer-element'], (MapLayerElement) => {

    class HzMapSquareGrid extends MapLayerElement {

        constructor() {
            super();
        }

        static get observedAttributes() {
            return ['mode', 'spacing', 'show-values', 'color'];
        }
        
        connectedCallback() {
        }

        disconnectedCallback() {
        }

        attributeChangedCallback(attrName, _oldVal, newVal) {
        }

        RenderWorld(context, mapData) {
            const mode = this.getAttribute('mode') || 'absolute';
            const showValues = this.getBoolAttribute('show-values', false);

            context.beginPath();
            context.strokeStyle(this.getAttribute('color'));
            context.setLineDash([]);

            const spacing = this.getAttribute('spacing') || 100;


            let startX = (mapData.screen.width / 2) % spacing;
            let startY = (mapData.screen.height / 2) % spacing;

            if (mode === 'absolute') {
                startX = fx % spacing;
                startY = fy % spacing;
            }

            startX += mapData.screen.left;
            startY += mapData.screen.top;

            let x = startX;
            while (x < mapData.screen.right) {
                context.moveTo(x, mapData.screen.top);
                context.lineTo(x, mapData.screen.bottom);
                x += spacing;
            }

            let y = startY;
            while (y < mapData.screen.bottom) {
                context.moveTo(mapData.screen.left, y);
                context.lineTo(mapData.screen.right, y);
                y += spacing;
            }

            context.stroke();

            if (showValues) {
                context.fillStyle(this.getAttribute('color'));

                // TODO: draw text
            }
        }
    }

    customElements.define('hz-map-squaregrid', HzMapSquareGrid)
});