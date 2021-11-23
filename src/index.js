import FlyLine from "./FlyLine";
import FlyMeshLine from "./FlyMeshLine";
import FlyTube from "./FlyTube";
import Points from "./Points";
import MovingLine from "./MovingLine";
import Column from "./Column";
import SphereWave from "./SphereWave";
import GeoJSON from "./GeoJSON";
import Earth from "./Earth";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader";
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
	MTLLoader,
	Lines:{
		MeterLine:require("./Lines/MeterLine"),
		RoundLine:require("./Lines/RoundLine")
	}
}
export default Layers;