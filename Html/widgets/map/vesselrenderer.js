
define(['widgets/map/object-renderer', 'three', 'horizons/gameObjects/playerVessel'], 
(MapObjectRenderer, THREE, PlayerVessel) => {

    class HzMapVesselRenderer extends MapObjectRenderer {
        constructor() {
            super();

            this._objects = new Map();
        }

        get spriteScale() {
            return this.getNumAttribute('sprite-scale', 1);
        }

        connectedCallback() {
            this._playerVesselTex = MapObjectRenderer.TextureLoader.load(`/images/player-vessel.png`);
            this._playerVesselTex.magFilter = THREE.NearestFilter;
        }

        _createSprite(object, map, scene) {
            let tex = null;
            if (object instanceof PlayerVessel) {
                if (this._playerVesselTex) {
                    tex = this._playerVesselTex;
                }
            }

            if (tex && tex.image) {
                const mat = new THREE.SpriteMaterial({
                    map: tex
                });
                const vesselObj = {
                    sprite: new THREE.Sprite(mat),
                    mat,
                    w: tex.image.width,
                    h: tex.image.height
                };
                vesselObj.sprite.scale.set(tex.image.width,tex.image.height,1);

                this._objects.set(object.ID, vesselObj);
                scene.add(vesselObj.sprite);
                object.OnDestroy(() => {
                    scene.remove(vesselObj.sprite);
                    this._objects.delete(object.ID);
                });
                return vesselObj;
            }
        }

        RenderObject(object, map, scene) {
            if (object instanceof PlayerVessel) {
                const spriteScale = this.spriteScale / map.zoom;
                let vesselObj = this._objects.get(object.ID);
                if (!vesselObj) {
                    vesselObj = this._createSprite(object, map, scene);
                }

                if (vesselObj) {
                    // update position and orientation
                    vesselObj.sprite.position.copy(object.Position);
                    vesselObj.sprite.scale.set(
                        vesselObj.w * spriteScale,
                        vesselObj.h * spriteScale,
                        1
                    );

                    const orientation = map.orientation;
                    if (orientation === 'static') {
                        vesselObj.mat.rotation = object.Orientation.y;
                    }
                }
                return true;
            }
        }
    }

    customElements.define('hz-map-vesselrenderer', HzMapVesselRenderer);
    return HzMapVesselRenderer;
});