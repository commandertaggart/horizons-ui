
define([
    'text!./templates/map.html', 'widgets/map/layer-element', 
    'horizons/vessel', 'horizons/gameObject', 'widgets/horizons-widget',
    'jquery', 'three'
], (
    template, MapLayerElement, 
    HzVessel, GameObject, HorizonsWidget,
    $, THREE
) => {
    const VIEW_DEPTH = 200000;

    class HzMap extends HorizonsWidget {
        constructor() {
            super();

            this.resizeCallback = this.resizeCallback.bind(this);
            this.Render = this.Render.bind(this);

            this.attachShadow({ mode: 'open' });
            this._vessel = null;
            this._onresize = new ResizeObserver(this.resizeCallback);
        }

        connectedCallback() {
            this.$root = $(this.shadowRoot);
            this.$root.html(template);
            this._canvas = this.$root.find('#map-canvas')[0];
            this._onresize.observe(this._canvas);

            this._scene = new THREE.Scene();
            this._renderer = new THREE.WebGLRenderer({
                canvas: this._canvas,
                alpha: true
            });
            this._renderer.setSize(this._canvas.clientWidth, this._canvas.clientHeight, false);

            this._camera = new THREE.OrthographicCamera(
                this._canvas.clientWidth / -2, this._canvas.clientWidth / 2, 
                this._canvas.clientHeight / 2, this._canvas.clientHeight / -2,
                1, VIEW_DEPTH
            );

            HzVessel.GetVessel().then((vessel) => {
                this._vessel = vessel;
            });

            requestAnimationFrame(this.Render);
        }

        disconnectedCallback() {
            if (this._canvas) this._onresize.unobserve(this._canvas);
            this._canvas = null;
            this._scene = null;
            this._renderer = null;
            this._camera = null;
        }

        resizeCallback(entries) {
            for (const entry of entries) {
                if (entry.target === this._canvas) {
                    this._camera.left = this._canvas.clientWidth / -2;
                    this._camera.right = this._canvas.clientWidth / 2; 
                    this._camera.top = this._canvas.clientHeight / 2;
                    this._camera.bottom = this._canvas.clientHeight / -2;

                    this._renderer.setSize(this._canvas.clientWidth, this._canvas.clientHeight, false);
                }
            }
        }

        get defaultZoom() {
            return this.getNumAttribute('defaultZoom', 1)
        }

        get zoom() {
            const zoom = this.getNumAttribute('zoom', 0);
            if (zoom === 0) {
                return this.defaultZoom;
            }
            return zoom;
        }

        get focus() {
            let focus = this.getVectorAttribute('focus');
            if (!focus) {
                focus = this.getAttribute('focus') || '$vessel';
                if (focus === '$vessel') {
                    focus = this._vessel;
                }
                else {
                    focus = GameObject.ForID(focus);
                }
            }
            return focus;
        }

        get focusPos() {
            const focus = this.focus;
            if (!focus) {
                return undefined;
            }
            if (focus instanceof THREE.Vector3) {
                return focus;
            }
            if ('Position' in focus) {
                return focus.Position;
            }
            return undefined;
        }

        get orientation() {
            return this.getAttribute('orientation') || 'static';
        }
        get scene() {
            return this._scene;
        }

        Render() {
            const focusPos = this.focusPos;
            const orient = this.orientation;
            if (focusPos) {
                if (orient === 'static') {
                    this._camera.position.copy(focusPos).add(new THREE.Vector3(0, VIEW_DEPTH/2, 0));
                    this._camera.rotation.set(-90 * Math.PI / 180, 0, 0);
                    this._camera.zoom = this.zoom;
                }
            }

            const $layers = $(this).children().filter((_i, el) => el instanceof MapLayerElement);
            $layers.each((_idx, layer) => {
                layer.Render(this, this._scene);
            });

            this._camera.updateProjectionMatrix();
            this._renderer.render(this._scene, this._camera);

            requestAnimationFrame(this.Render);
        }
    }
    
    customElements.define('hz-map', HzMap);
    return HzMap;
});
