import * as THREE from 'three';
import WaveMaterial from './WaveMaterial.js';
class SphereCircle extends THREE.Group{
	
	constructor(config={}){
		super(config);
		this.config = { 
			maxRangeRadius:10,
			radius:100,//半径 
			segments:64,
			speed:0.05,
			center:config.center||new THREE.Vector3(0,0,0),
		...config};
		this.materialConfig = {
			startColor:this.config.startColor,
			endColor:this.config.endColor,
			radius:this.config.radius,
			minOpacity:this.config.minOpacity,
			centerNormal:this.config.center,
			...config.materialConfig
		}
		this.waves = []; 
		this.waveMaterial = new WaveMaterial(this.materialConfig); 
	}
	
	setData(data){
		this.data = data;
		this.waves.forEach(line=>{
			line.geometry.dispose();
		})
		const {center,radius,segments,maxRangeRadius} = this.config;

		//{position:{x,y,z}}
		data.forEach(item=>{
			const {position,startRadius} = item;
			const positionVector = new THREE.Vector3(position.x,position.y,position.z);

			// 计算球上切面的点所提前需要计算好的两个independent的空间的基
			const toCenter = new THREE.Vector3(position.x - center.x,position.y-center.y,position.z-center.z);
			const xNormal = new THREE.Vector3(0,toCenter.z,-toCenter.y).normalize();
			const toCenterNormal = toCenter.clone().normalize();
			const yNormal = new THREE.Vector3().crossVectors(xNormal,toCenterNormal).normalize();

			const geometry = new THREE.BufferGeometry();
			const material = this.waveMaterial.clone();

			// 配置初始动量
			material.uniforms.centerNormal.value = positionVector.normalize();
			material.uniforms.r.value = startRadius||(maxRangeRadius*Math.random());

			const points = [position.x,position.y,position.z];// 中心点
			const indices = [];
			const numbers = [0];
			for(let i =0;i<segments;i++){
				const angle = Math.PI*2*i/segments;
				

				// 提前算好满圆时的每个点距离球心的向量，这样只需要控制t的比例就好了，不需要再shader中每帧计算
				const normal = new THREE.Vector3().addVectors(xNormal.clone().multiplyScalar(Math.sin(angle)) , yNormal.clone().multiplyScalar(Math.cos(angle)));

				points.push(normal.x,normal.y,normal.z);// 每个边距离圆心的集向量
				numbers.push(i+1);

				if(i<segments-1)
				indices.push(i+1,0,i+2);
			}
			indices.push(segments,0,1);

			geometry.setAttribute("position",new THREE.BufferAttribute(new Float32Array(points),3));
			geometry.setAttribute("number",new THREE.BufferAttribute(new Float32Array(numbers),1));
			geometry.setIndex(indices);
			const mesh = new THREE.Mesh(geometry,material);
			mesh.data = item;
			this.add(mesh);
			this.waves.push(mesh);
		})
	}

	// render中调用draw函数,更新飞线的飞行轨迹
	update(delta){
		const {maxRangeRadius,speed} = this.config;
		this.waves.forEach(mesh=>{
			const {material} = mesh;
			material.uniforms.r.value += speed;
			if(material.uniforms.r.value>maxRangeRadius){
				material.uniforms.r.value = 0;
			}
			material.uniforms.opacity.value = Math.sin(Math.PI*(material.uniforms.r.value/maxRangeRadius));
			material.uniformsNeedUpdate = true;
		})
	}


	dispose(){
		this.data = undefined;
		this.waves.forEach(line=>{
			line.geometry.dispose();
		})
		this.waves = [];
		this.waveMaterial.dispose();
	}
}
export default SphereCircle;