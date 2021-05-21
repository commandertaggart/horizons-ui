
define(['widgets/map/object-renderer', 'three', 'horizons/factions'], 
(MapObjectRenderer, THREE, HzFactions) => {

    class HzMapContactRenderer extends MapObjectRenderer {
        constructor() {
            super();

            this._contacts = new Map();
            this._subs = [];
        }

        static get observedAttributes() {
            return ['image', 'type'];
        }

        attributeChangedCallback(attrName, _oldVal, _newVal) {
            this.disconnectedCallback();
            if (attrName === 'image') {
                this.connectedCallback();
            }
        }

        get spriteScale() {
            return this.getNumAttribute('sprite-scale', 1);
        }

        get type() {
            return this.getAttribute('type');
        }

        get color() {
            return this.getAttribute('color') || '#ffffff';
        }

        get image() {
            return this.getAttribute('image');
        }

        connectedCallback() {
            this._texture = null;
            const image = this.image;
            if (image) {
                this._texture = MapObjectRenderer.TextureLoader.load(image);
                this._texture.magFilter = THREE.NearestFilter;
            }
        }

        disconnectedCallback() {
            this._contacts.clear();
            this._subs.forEach(s => s.unsubscribe());
            this._subs = [];
        }

        _createSprite(object, scene) {
            if (this._texture && this._texture.image) {
                const mat = new THREE.SpriteMaterial({
                    map: this._texture
                });
                const obj = {
                    sprite: new THREE.Sprite(mat),
                    mat,
                    w: this._texture.image.width,
                    h: this._texture.image.height
                };
                obj.sprite.scale.set(this._texture.image.width,this._texture.image.height,1);

                this._contacts.set(object.ID, obj);
                scene.add(obj.sprite);
                this._subs.push(object.OnDestroy(() => {
                    scene.remove(obj.sprite);
                    this._contacts.delete(object.ID);
                }));
                return obj;
            }
        }

        RenderObject(object, map, scene) {
            const type = this.type;
            if (!type || type === object.BaseType) {
                const spriteScale = this.spriteScale / map.zoom;
                let obj = this._contacts.get(object.ID);
                if (!obj) {
                    obj = this._createSprite(object, scene);
                }

                if (obj) {
                    // update position and orientation
                    obj.sprite.position.copy(object.Position);
                    obj.sprite.scale.set(
                        obj.w * spriteScale,
                        obj.h * spriteScale,
                        1
                    );

                    if ('Orientation' in object) {
                        const orientation = map.orientation;
                        if (orientation === 'static') {
                            obj.mat.rotation = object.Orientation.y;
                        }
                    }

                    const colorSetting = this.color;
                    let color = null;
                    if (colorSetting === 'faction') {
                        color = HzFactions.FactionColor(objecct.Faction);
                    }
                    else if (colorSetting === 'standing') {
                        color = HzFactions.RelationColor(object.Faction);
                    }
                    else {
                        color = colorSetting;
                    }

                    obj.mat.color = new THREE.Color(color);

                    return true;
                }
            }
        }
    }

    customElements.define('hz-map-contactrenderer', HzMapContactRenderer);
    return HzMapContactRenderer;
});