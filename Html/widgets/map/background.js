
define(['widgets/map/layer-element', 'horizons/galaxy'], (MapLayerElement, HzGalaxy) => {

    class HzMapBackground extends MapLayerElement {

        constructor() {
            super();

            this.galaxyBackgroundSrc = null;
            this.image = new Image();
            this.imageLoaded = false;
            this.image.onload = () => this.imageLoaded = true;
        }

        static get observedAttributes() {
            return ['image', 'color'];
        }
        
        connectedCallback() {
            this.sub = HzGalaxy.OnGalaxyMapUpdate(gmap => {
                if (this.getAttribute('image') === null) {
                    this.imageLoaded = false;
                    this.galaxyBackgroundSrc = this.image.src = gmap.Background.Source;
                }
            });
        }

        disconnectedCallback() {
            if (this.sub) this.sub.unsubscribe();
        }

        attributeChangedCallback(attrName, _oldVal, newVal) {
            if (attrName === 'image') {
                if (newVal || this.galaxyBackgroundSrc) {
                    this.imageLoaded = false;
                    this.image.src = newVal ? newVal : this.galaxyBackgroundSrc;
                }
            }
        }

        RenderWorld(context, mapData) {
            const color = this.getAttribute('color');

            if (color) {
                context.fillStyle = color;
                context.fillRect(
                    mapData.screen.top, 
                    mapData.screen.left, 
                    mapData.screen.width,
                    mapData.screen.height
                );
            }

            if (this.imageLoaded && 
                (this.galaxyBackgroundSrc || this.getAttribute('image'))) {
                // TODO: scale image pattern appropriate for zoom
                const pattern = context.createPattern(this.image, "repeat");
                context.fillStyle = pattern;
                context.fillRect(
                    mapData.screen.top, 
                    mapData.screen.left, 
                    mapData.screen.width,
                    mapData.screen.height
                );
            }
        }
    }

    customElements.define('hz-map-background', HzMapBackground)
})