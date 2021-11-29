import {
    Euler,
    Vector3
} from 'three';

class Controller {
    constructor(app) {
        this.app = app;
        this.avadar = app.avadar;
        this.target = app.avadar.avadarGroup;
        this.keys = {};
        this.euler = new Euler(0, 0, 0, 'YXZ');
        this.vector = new Vector3();
        this.minPolarAngle = 0; // radians
        this.maxPolarAngle = Math.PI; // radians
        this.domElement = this.app.renderer.domElement;
        this.cameraAngle = Math.PI / 3;
        this.avadarHeight = 2;
        this.cameraDis = 10;
        this.target.add(this.avadar.camera);
        this.updateCamera();
        this.addEvent();
    }


    updateCamera() {
        this.avadar.camera.position.set(0, this.cameraDis * Math.sin(this.cameraAngle) + this.avadarHeight, -this.cameraDis * Math.cos(this.cameraAngle));
        this.avadar.camera.lookAt(this.target.position.x, this.avadarHeight, this.target.position.z);
    }

    onContext = (event) => event.preventDefault();

    onWheel = (event) => {
        this.cameraDis = Math.max(0, event.deltaY / 100 + this.cameraDis);
        this.updateCamera();
    }

    onKeyDown = (event) => {
        this.keys[event.key] = event;
        console.log(this.nowAction)
        if (this.nowAction !== 'Running') {
            this.avadar.actionsMap['Running'].reset().fadeIn(0.2).play();
            this.nowAction = 'Running';
        }
    }

    onKeyUp = (event) => {
        delete this.keys[event.key];
        if (this.nowAction) {
            this.avadar.actionsMap[this.nowAction].fadeOut(0.2);
            this.nowAction = undefined;
        }
        this.avadar.actionsMap['Idle'].fadeIn(0.2).play();
    }

    onAdjustCameraAngle(event) {
        const { movementY, movementX } = event;
        this.cameraAngle = Math.min(Math.PI / 2, Math.max(0, this.cameraAngle + movementY * 0.008));
        this.euler.setFromQuaternion(this.target.quaternion);

        this.target.rotation.y -= movementX * 0.008;


    }

    onMouseMove = (event) => {
        if (this.isLocked === false) return;
        const { movementY, movementX } = event;

        if (event.buttons === 2) {
        } else if (event.buttons === 0) {
            this.cameraAngle = Math.min(Math.PI / 2, Math.max(0, this.cameraAngle + movementY * 0.008));
            this.target.rotation.y -= movementX * 0.008;
        }
        this.updateCamera()
    }

    onPointerlockChange = () => {
        if (this.domElement.ownerDocument.pointerLockElement === this.domElement) {
            this.locked = true;
        } else {
            this.locked = false
        }
    }

    addEvent() {
        this.domElement.ownerDocument.addEventListener('mousemove', this.onMouseMove);
        this.domElement.ownerDocument.addEventListener('contextmenu', this.onContext);
        this.domElement.ownerDocument.addEventListener('keydown', this.onKeyDown);
        this.domElement.ownerDocument.addEventListener('keyup', this.onKeyUp);
        this.domElement.ownerDocument.addEventListener('wheel', this.onWheel);
        this.domElement.ownerDocument.addEventListener('pointerlockchange', this.onPointerlockChange);
    }

    disposeEvent() {
        this.domElement.ownerDocument.removeEventListener('mousemove', this.onMouseMove);
        this.domElement.ownerDocument.removeEventListener('keydown', this.onKeyDown);
        this.domElement.ownerDocument.removeEventListener('contextmenu', this.onContext);
        this.domElement.ownerDocument.removeEventListener('keyup', this.onKeyUp);
        this.domElement.ownerDocument.removeEventListener('wheel', this.onWheel);
        this.domElement.ownerDocument.removeEventListener('pointerlockchange', this.onPointerlockChange);
    }

    update(delta) {
        if (this.keys['w'] !== this.keys['s']) {
            this.vector.set(0, 0, 1);
            this.vector.applyQuaternion(this.target.quaternion);
            this.vector.normalize();
            this.target.position.addScaledVector(this.vector, (this.keys['W'] ? -1 : 1) * 0.02);

        } else if (this.keys['a'] !== this.keys['d']) {
            this.vector.copy(this.target.position);
            this.vector.applyQuaternion(this.target.quaternion);
            this.vector.cross(new Vector3(0, 1, 0));
            this.vector.normalize();
            this.target.position.addScaledVector(this.vector, (this.keys['A'] ? 1 : -1) * 0.01);
        }

    }

}
export default Controller;