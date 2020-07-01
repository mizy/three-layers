import * as THREE from 'three';
import PointsMaterial from './PointsMaterial'
class Points extends THREE.Group{
	
	constructor(config={}){
		super(config);
		this.config = {
		...config};
		this.materialConfig = {
			size:config.size,
			scale:config.scale,
			// color:0xff00aa,
			...config.materialConfig
		}
		this.points = [];
		this.geometry = new THREE.BufferGeometry();
		this.pointsMaterial = new PointsMaterial(this.materialConfig); 
		this.points = new THREE.Points(this.geometry,this.pointsMaterial);
		this.add(this.points)
	}
	
	setData(data){
		this.data = data;
		const positions = [];
		const colors =[];
		const time = [];
		this.data.forEach(item=>{
			positions.push(item.position.x,item.position.y,item.position.z);
			colors.push(item.color.r,item.color.g,item.color.b);
			time.push(Math.PI*Math.random()*2)
		})
		this.geometry.setAttribute("position",new THREE.BufferAttribute(new Float32Array(positions),3))
		this.geometry.setAttribute("color",new THREE.BufferAttribute(new Float32Array(colors),3))
		this.geometry.setAttribute("time",new THREE.BufferAttribute(new Float32Array(time),1))
	}
	
	// render中调用draw函数,更新飞线的飞行轨迹
	update(delta){
		this.pointsMaterial.uniforms.t.value += 2*Math.PI/180;
		if(this.pointsMaterial.uniforms.t.value>10000){
			this.pointsMaterial.uniforms.t.value = 0;
		}
		this.pointsMaterial.uniformsNeedUpdate = true;
	}

	dispose(){
		this.geometry.dispose()
		this.pointsMaterial.dispose();
		this.data = undefined; 
	}
}
export default Points;