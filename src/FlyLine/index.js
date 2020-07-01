import * as THREE from 'three';
import CoordsConvert from '../Utils/CoordsConvert';
import GradMaterial from './GradMaterial.js';
class FlyLine extends THREE.Group{
	
	constructor(config={}){
		super(config);
		this.config = {
			curveType:"default",
			radius:100,//半径
			length:100,// 线长度
			speed:2,//每帧几个单位
			smoothNumber:1,// 每像素几个点
			addLineTimeout:100,//线出现的间隔
		...config};
		this.materialConfig = {
			startColor:new THREE.Vector4(0,0,1,0),
			endColor:new THREE.Vector4(0,1,1,1),
			...config.materialConfig
		}
		this.lines = [];
		this.convert = new CoordsConvert();
		this.convert.smoothNumber = this.config.smoothNumber;
		this.lineMaterial = new GradMaterial(this.materialConfig); 
	}

	
	setData(data){
		this.data = data;
		this.formatData();
	}

	// 构造数据
	formatData(){
		const {getGlobelBezierPoints,get2BezierGlobe,getPlaneBezierPoint} = this.convert;
		let curveFunc;
		switch(this.config.curveType){
			case "2bezier":
				curveFunc = get2BezierGlobe;break;
			case "plane":
				curveFunc = getPlaneBezierPoint;break;
			default:
				curveFunc = getGlobelBezierPoints;break;
		}
		const {data=[]} = this;
		const res = [];
		data.forEach(lineData=>{
			const points = curveFunc(lineData.start,lineData.end,this.config.radius);
			
			res.push({
				...lineData,
				points,
			})
		})
 
		this.linesData = res;
	}

	// 制造
	start(){
		this.intervalAddLine(0)
	}

	// 添加所有的线
	intervalAddLine(lineIndex){
		const lengthNumber = Math.floor(this.config.length*this.config.smoothNumber);

		this.addLineTimeout = setTimeout(()=>{
			const data = this.linesData[lineIndex];
			const pointsData = [];
			const numbers = [];
			data.points.forEach((item,index)=>{
				numbers.push(index)
				pointsData.push(item.x,item.y,item.z)
			})

			const geometry = new THREE.BufferGeometry()
			const line = new THREE.Line(geometry,this.lineMaterial.clone());
			line.geometry.setAttribute("position",new THREE.BufferAttribute(new Float32Array(pointsData), 3),);
			line.geometry.setAttribute("number",new THREE.BufferAttribute(new Float32Array(numbers), 1),);

			line.data = {
				// 记录下所有的点
				t:-lengthNumber,
				...data
			}
			this.lines.push(line);
			this.add(line);
			
			// 第二种实现方式
			line.geometry.setDrawRange(0,0);

			const nextIndex = ++lineIndex;
			if(this.linesData[nextIndex]){
				this.intervalAddLine(nextIndex)
			}
		},this.config.addLineTimeout)
	}

	// render中调用draw函数,更新飞线的飞行轨迹
	update(delta){
		const speed = Math.ceil(this.config.speed*this.config.smoothNumber);
		const lengthNumber = Math.floor(this.config.length*this.config.smoothNumber);

		 this.lines.forEach(line=>{
			 const start = Math.floor(line.data.t>0?line.data.t:0);
			 const endIndex= line.data.t+lengthNumber;
			 const length = line.data.points.length;
			 const end = Math.floor((endIndex)<length?endIndex:length);
			// //为了使UV有效,每次还是在shader外进行数组的切割
			// const points = line.data.pointsData.slice(start*3,end*3);
			const dis = end-start;
			if(dis>1){
				//采用简单低效的模式，避免再写一遍无用的shader
				line.material.uniforms.length.value = dis;
				line.material.uniforms.start.value = start;
				line.material.uniformsNeedUpdate = true;
				line.geometry.setDrawRange(start,dis)// setDrawRange的参数mesh和line不一样，由于indices的数目差别
				// line.geometry.setAttribute("position",new THREE.BufferAttribute(new Float32Array(points), 3),);
				// line.geometry.needsUpdate = true;
			}
			line.data.t = line.data.t+speed;
			if(line.data.t>(length)){
				line.data.t = -lengthNumber
			}
		 })
	}


	dispose(){
		this.data = undefined;
		this.lines.forEach(line=>{
			line.geometry.dispose();
		})
		this.lines = [];
		this.lineMaterial.dispose();
	}
}
export default FlyLine;