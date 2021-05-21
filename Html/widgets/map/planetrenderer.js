
define(['widgets/map/object-renderer', 'three', 'horizons/gameObjects/Planet'], 
(MapObjectRenderer, THREE, Planet) => {

    class HzMapPlanetRenderer extends MapObjectRenderer {
        constructor() {
            super();

            this._objects = new Map();
        }

        connectedCallback() {
        }

        _createMesh(object, scene) {
            const geometry = new THREE.SphereGeometry(object.Scale, 32, 16);
            const texture = MapObjectRenderer.TextureLoader.load(object.Texture);
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.copy(object.Position);
            mesh.rotation.copy(object.Orientation);

            this._objects.set(object.Name, mesh);
            scene.add(mesh);
            object.OnDestroy(() => {
                scene.remove(mesh);
                this._objects.delete(object.Name);
            });
            return mesh;
        }

        RenderObject(object, map, scene) {
            if (object instanceof Planet) {
                let planet = this._objects.get(object.Name);
                if (!planet) {
                    planet = this._createMesh(object, scene);
                }

                return true;
            }
        }
    }

    customElements.define('hz-map-planetrenderer', HzMapPlanetRenderer);
    return HzMapPlanetRenderer;
});