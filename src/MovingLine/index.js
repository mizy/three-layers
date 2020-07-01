import * as THREE from 'three';
import MoveLineMaterial from './MovingLineMaterial';
class Lines extends THREE.Group{
	
	constructor(config={}){
		super(config);
		this.config = {
			speed:1,
			smoothNumber:1,// 线长度
		...config};
		this.materialConfig = {
			// color:0xff00aa,
			...config.materialConfig
		}
		this.lines = [];
	}
	
	setData(data){
		this.data = data;
		this.formatData();
		this.addLines(this.lineData);
	}

	formatData(){
		const {data=[]} = this;
		const lineDatas = [];
		data.forEach(lineData=>{
			const {data=[]} = lineData;
			const points = []
			data.forEach(item=>{
				points.push(new THREE.Vector3(item.x,item.y,item.z))
			})
			const curve = new THREE.CatmullRomCurve3(points);
			const length = curve.getLength();

			lineDatas.push({
				...lineData,
				curve,
				length,
			})
		})
		this.lineData = lineDatas;
	}

	addLines(data){
		this.dispose()
		const lines = [];
		data.forEach(item=>{
			const {color,curve,length} = item;
			const geometry = new THREE.BufferGeometry();
			const pointsData = curve.getSpacedPoints(Math.ceil(length*this.config.smoothNumber));
			const points = [];
			const numbers = [];
			pointsData.forEach((item,index)=>{
				points.push(item.x,item.y,item.z);
				numbers.push(index)
			});

			geometry.setAttribute("position",new THREE.BufferAttribute(new Float32Array(points),3))
			geometry.setAttribute("number",new THREE.BufferAttribute(new Float32Array(numbers),1))

			const material = new MoveLineMaterial({
				...this.materialConfig,
				length,
				color:new THREE.Color(color),
				t:0
			})
			const line = new THREE.Line(geometry,material);
			line.data = item;
			lines.push(line)
			this.add(line)
		})
		this.lines = lines;
	}
	
	// render中调用draw函数,更新飞线的飞行轨迹,这种情况只是特效，不需要考虑delta的情况
	update(delta){
		this.lines.forEach(line=>{
			const {data:{
				length
			}} = line;
			const speed = Math.max(this.config.speed*this.config.smoothNumber,1/this.config.smoothNumber);
			line.material.uniforms.t.value += Math.ceil(speed);
			if(line.material.uniforms.t.value>=(length+20)){
				line.material.uniforms.t.value = 0;
			}
			line.material.uniformsNeedUpdate = true;
		})
		
	}

	dispose(){
		this.lines.forEach(line=>{
			this.remove(line)
			line.geometry.dispose();
			line.material.dispose()
		});
		this.lines = [];
	}
}
export default Lines;