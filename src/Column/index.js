import * as THREE from 'three';
import CoordsConvert from '../Utils/CoordsConvert';

class Column extends THREE.Group{
	
	constructor(config={}){
		super(config);
		this.config = {
			normal:undefined,
			center:undefined,
			curveType:"default",
			radius:2,//半径
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
		this.material = new THREE.MeshPhongMaterial(this.materialConfig); 
		
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
		this.material.map = new THREE.CanvasTexture( canvas );
		this.material.map.premultiplyAlpha= true;
		this.material.useMap = 1;
	}

	setData(data){
		this.data = data;
		this.meshs = [];
		this.data.forEach(item=>{
			const geometry = new THREE.CylinderBufferGeometry(this.config.radius,this.config.radius,item.height,16);
			const material = this.material.clone();
			material.color = new THREE.Color(item.color||"#f0a");
			const mesh = new THREE.Mesh(geometry,material);
			
			if(this.config.normal){
				mesh.lookAt(this.config.normal)
			}
			mesh.position.set(item.position.x,item.position.y,item.position.z);			
			
			if(this.config.center){
				// up不生效，只能ifelse处理了
				mesh.up = new THREE.Vector3(0,-1,0)
				mesh.lookAt(this.config.center);
			}
			// var axesHelper = new THREE.AxesHelper( 50 );
			// mesh.add(axesHelper)
			if(this.config.center){
				mesh.rotateX(-Math.PI/2);
			}else{
				mesh.rotateX(Math.PI/2);
			}
			mesh.translateY(item.height/2);

			mesh.data = item;
			this.meshs.push(mesh);
			this.add(mesh);
		})
	}

	// render中调用draw函数,更新飞线的飞行轨迹
	update(delta){
		 
	}

	dispose(){
		this.data = undefined;
		this.meshs.forEach(line=>{
			line.geometry.dispose();
		})
		this.meshs = [];
		this.material.dispose();
	}
}
export default Column;