
function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({canvas});
    
    const width = canvas.clientWidth / 2;
    const height = canvas.clientHeight / 2;
    const near = 5;
    const far = 200000;
    const camera = new THREE.OrthographicCamera(-width, width, height, -height, near, far);
    camera.zoom = 0.005;
    camera.rotation.set(-90*Math.PI/180, 0, 0);
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('black');
    
    const loader = new THREE.TextureLoader();
    {
        const planeSize = 10000;
        
        const texture = loader.load('/Taggart/images/player-vessel.png');
        texture.magFilter = THREE.NearestFilter;
        
        const spriteMat = new THREE.SpriteMaterial({
            map: texture
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(planeSize, planeSize, 1);
        scene.add(sprite);
    }

    let sphere = null;
    const spherePathRadius = 100000;
    function setSpherePos(t) {
        t /= 1000;
        sphere.position.set(Math.cos(t) * spherePathRadius, 0, Math.sin(t) * spherePathRadius);
    }
    {
        const sphereRadius = 63710;
        const sphereWidthDivisions = 32;
        const sphereHeightDivisions = 16;
        const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
        const texture = loader.load('/Planet.Earth.spng');
        const sphereMat = new THREE.MeshBasicMaterial({ map: texture, color: '#CA8'});
        const mesh = new THREE.Mesh(sphereGeo, sphereMat);
        //mesh.frustumCulled = false;
        scene.add(mesh);
        sphere = mesh;
        setSpherePos(Date.now());
    }
    
    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(0, 10, 0);
        light.target.position.set(-0.5, -0.87, 0);
        scene.add(light);
        scene.add(light.target);
    }
    
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }
    
    function render() {
        
        resizeRendererToDisplaySize(renderer);
        
        setSpherePos(Date.now());
        camera.position.set(sphere.position.x, sphere.position.y + (far/2), sphere.position.z);

        {
            camera.updateProjectionMatrix();
            
            scene.background.set(0x000000);
            renderer.render(scene, camera);
        }
        
        requestAnimationFrame(render);
    }
    
    requestAnimationFrame(render);
}
