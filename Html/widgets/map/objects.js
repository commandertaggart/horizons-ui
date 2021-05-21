
define([
    'widgets/map/layer-element', 'widgets/map/object-renderer', 
    'horizons/gameObject', 'horizons/contacts', 'jquery'
], (MapLayerElement, MapObjectRenderer, GameObject, HzContacts, $) => {

    class HzMapObjects extends MapLayerElement {

        constructor() {
            super();
        }

        connectedCallback() {
        }

        disconnectedCallback() {
        }

        Render(map, scene) {
            const $children = $(this).children().filter((_i, el) => el instanceof MapObjectRenderer);

            GameObject.ForEach((gameObject) => {
                $children.each((_idx, renderer) => {
                    return !renderer.RenderObject(gameObject, map, scene);
                });
            });
        }
    }

    customElements.define('hz-map-objects', HzMapObjects);
    return HzMapObjects;
})