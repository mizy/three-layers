import FlyLine from "./FlyLine";
import FlyMeshLine from "./FlyMeshLine";
import FlyTube from "./FlyTube";
import Points from "./Points";
import MovingLine from "./MovingLine";
import Column from "./Column";
import SphereWave from "./SphereWave";
import GeoJSON from "./GeoJSON";
import Earth from "./Earth";
import OBJLoader from "./Loaders/OBJLoader";
import MTLLoader from "./Loaders/MTLLoader";
import * as THREE from 'three';
window.THREE = THREE;
const Layers = {
	FlyLine,
	Points,
	FlyMeshLine,
	FlyTube,
	MovingLine,
	Column,
	SphereWave,
	GeoJSON,
	Earth,
	OBJLoader,
	MTLLoader
}
export default Layers;