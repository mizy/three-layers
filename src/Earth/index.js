import * as THREE from 'three';
import geojsonDecoder from 'geojson-decoder';
import GeoJSON from '../GeoJSON';
const worldJSON = require("./world.json");
const json = geojsonDecoder.decode(worldJSON);
class Earth extends THREE.Group{
	
	constructor(config={}){
		super(config);
		this.config = {
			radius:100,//半径
		...config};
		this.material = new THREE.MeshBasicMaterial({
			transparent:true,
			opacity:0.2,
			side:THREE.DoubleSide,
			// wireframe:true,
			color:0x00aaff
		})
		this.lineMaterial = new THREE.LineBasicMaterial({
			color:0xaa0033
		})
		this.geoJSON = new GeoJSON({
			convertFunc: (coord) => {
				return this.convertxy(coord[0],coord[1])
			},
		});
		this.init(json);
	}
   
	convertxy(lng,lat){
		lng *= Math.PI/180;
		lat *= Math.PI/180;
		// y轴为地磁轴
		const x = 100*Math.cos(lat)*Math.cos(lng);
		const z = -100*Math.cos(lat)*Math.sin(lng);
		const y = 100*Math.sin(lat);
		return [x,y,z]
	}

	
	init(json){
		this.geoJSON.parse(json);
		this.geoJSON.geometrys.forEach(each=>{
			const item = new THREE.Group();
			this.renderFeature(each,item);
			item.name = each.properties.CNAME;
			this.add(item);
		});
	}

	renderFeature(each,group){
		// 暂时只渲染多个多边形
		if(each.type!=="MultiPolygon")return;
		const buffer = new THREE.BufferGeometry();
		buffer.setAttribute("position",new THREE.BufferAttribute(new Float32Array(each.points),3));
		buffer.setIndex(each.indexs);
		const mesh = new THREE.Mesh(buffer,this.material);
		mesh.name='mesh';
		group.add(mesh);
		each.linePoints.forEach(item=>{
			const lineBuffer = new THREE.BufferGeometry();
			lineBuffer.setAttribute("position",new THREE.BufferAttribute(new Float32Array(item),3));
			const line = new THREE.Line(lineBuffer,this.lineMaterial);
			group.add(line);
		})
	
	}
 
	dispose(){
		 this.children.forEach(item=>{
			 item.children.forEach(each=>{
				 each.geometry.dispose();
				 each.material.dispose();
				 item.remove(each)
			 })
			 this.remove(item)
		 })
	}
}
export default Earth;