
define(['widgets/horizons-widget'], (HorizonsWidget) => {
    class MapLayerElement extends HorizonsWidget {
        constructor() {
            super();
        }

        Render(context, mapData) {
            // rendering context is transformed so 
            // drawing coordinates match world space
        }
    }

    return MapLayerElement;
});