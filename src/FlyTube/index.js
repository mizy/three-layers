import * as THREE from 'three';
import CoordsConvert from '../Utils/CoordsConvert';

class FlyLine extends THREE.Group{
	
	constructor(config={}){
		super(config);
		this.config = {
			curveType:"default",
			radius:100,//半径
			length:100,// 线长度
			speed:1,//每帧几个单位
			smoothNumber:1,// 每像素几个点
			addLineTimeout:100,//线出现的间隔
		...config};
		this.materialConfig = {
			transparent:true,
			startColor:0x0000ff,
			endColor:0x00ffff,
			...config.materialConfig
		}
		this.lines = [];
		this.convert = new CoordsConvert();
		this.convert.smoothNumber = this.config.smoothNumber;
		this.lineMaterial = new THREE.MeshPhongMaterial(this.materialConfig); 
		if(!this.materialConfig.map){
			this.initMaterialMap();
		}
	}

	// 默认的材质
	initMaterialMap(){
		const canvas = document.createElement("canvas");
		canvas.width = 100;
		canvas.height = 20;
		const ctx = canvas.getContext("2d");
		const grd=ctx.createLinearGradient(0,0,100,50);
		const color = new THREE.Color(this.materialConfig.startColor);
		const color1 = new THREE.Color(this.materialConfig.endColor);
		const colorM = color.clone().add(color1).multiplyScalar(0.5);
		grd.addColorStop(1,`rgba(${255*color.r},${255*color.g},${255*color.b},1)`);
		grd.addColorStop(0.6,`rgba(${255*colorM.r},${255*colorM.g},${255*colorM.b},1)`);
		grd.addColorStop(0,`rgba(${255*color1.r},${255*color1.g},${255*color1.b},0)`);
		ctx.fillStyle=grd;
		ctx.fillRect(0,0,100,50);
		this.lineMaterial.map = new THREE.CanvasTexture( canvas );
		this.lineMaterial.map.premultiplyAlpha= true;
		this.lineMaterial.useMap = 1;
		// document.body.appendChild(canvas)
		// this.meshLineMaterial.alphaMap = this.meshLineMaterial.map;
		// this.meshLineMaterial.useAlphaMap = 1;
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
				points,
				curve:this.convert.curve,
				...lineData,
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
			const curve = data.curve;
			const geometry = new THREE.BufferGeometry()
			const line = new THREE.Mesh(geometry,this.lineMaterial);

			line.data = {
				// 记录下所有的点
				t:-lengthNumber,
				...data,
				curve
			}
			this.lines.push(line);
			this.add(line);

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
			const points = line.data.points.slice(start,end);
			const dis = end-start;
			if(dis>1){
				//采用简单低效的模式，避免再写一遍无用的shader
				line.data.curve.points = points;
				line.geometry = new THREE.TubeBufferGeometry(line.data.curve,lengthNumber,  this.config.lineWidth, 8, false);
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
		this.lineMaterial.dispose();
		this.lines = [];
	}
}
export default FlyLine;