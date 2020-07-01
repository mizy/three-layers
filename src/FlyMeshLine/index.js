import * as THREE from 'three';
import CoordsConvert from '../Utils/CoordsConvert';
import {MeshLine,MeshLineMaterial} from '../Utils/MeshLine';
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
			transparent:true,
			lineWidth:2,
			side:THREE.DoubleSide,
			...config.materialConfig
		}
		this.lines = [];
		this.convert = new CoordsConvert();
		this.convert.smoothNumber = this.config.smoothNumber;
		this.meshLine = new MeshLine();
		this.meshLineMaterial = new MeshLineMaterial(this.materialConfig); 
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
		const grd=ctx.createLinearGradient(0,0,100,20);
		grd.addColorStop(1,"rgba(220,25,25,1)");
		grd.addColorStop(0,"rgba(220,25,25,0)");
		ctx.fillStyle=grd;
		ctx.fillRect(0,0,100,20);
		this.meshLineMaterial.map = new THREE.CanvasTexture( canvas );
		this.meshLineMaterial.map.premultiplyAlpha= true;
		this.meshLineMaterial.useMap = 1;
		document.body.appendChild(canvas)
		// this.meshLineMaterial.alphaMap = this.meshLineMaterial.map;
		// this.meshLineMaterial.useAlphaMap = 1;
	}
	
	setData(data){
		this.data = data;
		this.formatData();
	}

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
			const meshLine = new MeshLine();
			// 考虑一次申请足够大的数组，避免GC时卡顿
			meshLine.setGeometry({vertices:points});
			res.push({
				...lineData,
				meshLine,
				points
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
			const line = new THREE.Mesh(data.meshLine.geometry,this.meshLineMaterial.clone());
			this.add(line);
			const nextIndex = ++lineIndex;
			line.data = {
				// 记录下所有的点
				attributesData:data.meshLine.toData(),
				t:-lengthNumber,
				...data
			}
			line.geometry.setDrawRange(0,0);
			this.lines.push(line);
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
			 const start = line.data.t>0?line.data.t:0;
			 const endIndex= line.data.t+lengthNumber;
			 const length = line.geometry.attributes.position.count/2;;
			 const end = (endIndex)<length?endIndex:length;
			//为了使UV有效,每次还是在shader外进行数组的切割
			// const points = line.data.points.slice(start,end);
			const dis = end-start;
			if(dis>1){
				// line.data.meshLine.setGeometry({vertices:points});
				line.material.uniforms.start={value:start};
				line.material.uniforms.lineLength={value:lengthNumber};
				line.material.uniformsNeedsUpdate = true;
				//drawRange 应该是和index有关系，猜对了，果然和index有关系，mesh的三角面index是需要x3,因为mesh是采用的drawElements，这里three应该是个bug，之后可能要改
				// 这里特指drawElements才具有这个逻辑
				line.geometry.setDrawRange(start*2*3,dis*2*3);
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
		this.meshLineMaterial.dispose();
	}
}
export default FlyLine;