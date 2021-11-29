import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Avadar from './Avadar';

class Meta {

    constructor(config = {}) {
        this.config = {
            ...config
        };
        this.init();
    }

    async init() {
        this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.lookAt(0, 0, 0);
        this.camera.position.set(50, 50, 50)
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);

        //sky
        const hemiLight = new THREE.HemisphereLight();
        hemiLight.intensity = 0.35;
        this.scene.add(hemiLight);

        //light
        const dirLight = new THREE.DirectionalLight(0xffffff, 1, 100);
        dirLight.position.set(100, 100, 100);
        dirLight.castShadow = true;

        this.scene.add(dirLight);
        this.clock = new THREE.Clock();

        this.initRenderer();
        this.initController();
        this.initFloor();
        this.avadar = new Avadar(this);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)

        this.animate();

        //helper
        const axesHelper = new THREE.AxesHelper(105);
        this.scene.add(axesHelper);
    }

    initController() {
        // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    }

    initFloor() {
        const floorBox = new THREE.Mesh(
            new THREE.BoxGeometry(200, 10, 200),
            new THREE.ShadowMaterial({ color: 0xcccccc })
        );
        floorBox.receiveShadow = true;
        floorBox.position.y = - 5;
        this.scene.add(floorBox);
        const box = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshPhongMaterial({ color: 0x3f0f5f })
        );
        box.castShadow = true;
        box.receiveShadow = true;
        box.position.y = 1;
        box.position.x = 2;
        this.scene.add(box)
    }


    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        document.body.appendChild(this.renderer.domElement);
    }

    animate = () => {
        const delta = this.clock.getDelta();
        requestAnimationFrame(this.animate);
        this.controls.update(delta);
        this.avadar.update(delta)
        this.renderer.render(this.scene, this.avadar.camera);
    }

}
export default Meta;