import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Controller from './Controller';
import * as THREE from 'three';

class Avadar {
    constructor(app) {
        this.app = app;
        this.initCamera();
        this.initAvadar();
    }

    update(delta) {
        if (this.avadarMixer) this.avadarMixer.update(delta);
        if (this.controls) this.controls.update(delta);
    }

    async initAvadar() {
        const { scene } = this.app;
        const gltf = await this.load('/demo/RobotExpressive.glb');
        this.avadar = gltf.scene;
        let now = [this.avadar.children[0]];
        while (now.length) {
            const item = now.pop();
            if (item.type.indexOf('Mesh') > -1) {
                item.castShadow = true;
            }
            now = [...now, ...item.children]
        }
        this.avadar.children[0].castShadow = true;
        this.avadarGroup = new THREE.Group();
        this.avadarGroup.add(this.avadar);
        this.controls = new Controller(this.app);
        scene.add(this.avadarGroup);
        this.makeAnimations(gltf);
    }

    initCamera() {
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    }

    makeAnimations(gltf) {
        this.avadarMixer = new THREE.AnimationMixer(gltf.scene);
        this.actionsMap = {};
        gltf.animations.forEach(clip => {
            const action = this.avadarMixer.clipAction(clip);
            this.actionsMap[clip.name] = action;
            // action.clampWhenFinished = true;
            // action.loop = THREE.LoopOnce;
        })
        this.actionsMap['Idle'].play();
    }



    load(url) {
        const loader = new GLTFLoader();
        return new Promise((resolve, reject) => {
            loader.load(url, (gltf) => {
                resolve(gltf)
            }, undefined, function (e) {
                console.error(e);
                reject(e)
            });
        })
    }
}
export default Avadar;