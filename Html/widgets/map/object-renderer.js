
define(['widgets/horizons-widget', 'three'], (HorizonsWidget, THREE) => {
    class MapObjectRenderer extends HorizonsWidget {
        constructor() {
            super();
        }

        RenderObject(gameObject, map, scene) {}
    }

    MapObjectRenderer.TextureLoader = new THREE.TextureLoader();

    return MapObjectRenderer;
})