# TNTV-Layers
基于THREE.js实现的一套特效图层库,目前提供各种类型的flyline和points的图层，后续计划实现更多常用效果图层

# 使用方法
```
npm i @tntv/layers
```

# 引用
```
import {FlyLine} from '@tntv/layers';
```

# demo
![](https://unpkg.com/@tntv/layers@1.0.1/images/flyline.png)
![](https://unpkg.com/@tntv/layers@1.0.1/images/fly-mesh.png)
![](https://unpkg.com/@tntv/layers@1.0.1/images/fly-tube.png)
![](https://unpkg.com/@tntv/layers@1.0.1/images/moveing-line.png)
![](https://unpkg.com/@tntv/layers@1.0.1/images/plane-fly-line.png)
![](https://unpkg.com/@tntv/layers@1.0.1/images/points.png)

# api
## flyline
```js
	//constructor() 构造函数 
	new FlyLine({
		addLineTimeout:100,// 线动画间隔
		materialConfig:{
			startColor:new THREE.Vector4(0,0,1,0), // 材质颜色
			endColor:new THREE.Vector4(0,1,1,1), // 材质结束颜色
		}
	})

	setData([{start:{x,y,z},end:{x,y,z}}]) //配置数据 
    start() //开始动画
```

## flytube,flymesh
```js
	new FlyTube({
		addLineTimeout:100,// 线动画间隔
		materialConfig:{
			lineWidth:5,
			useMap:true,
			map:texture,//材质
			//color:0xff00aa,
			repeat:new THREE.Vector2(20/5,1),//重复
			resolution:new THREE.Vector2(window.innerWidth,window.innerHeight)// 画布比例
		}
	})

	setData( [{start:{x,y,z},end:{x,y,z}}]) //配置数据
    start() //开始动画
```

## MoveingLine
```js
	new MoveingLine({
		speed:1,// 线动画间隔
		smoothNumber:1,//线顺滑度密度，最高为1
		materialConfig:{
			 flowSpeed：0.01 //流动速度
		}
	})

	setData([
		{
			color:"#0f9",
			points:[{x,y,z},{x,y,z}]
		}
	]) //配置数据
```
## Points
```js
	new Points({
		materialConfig:{
			size:2,
			map:textrue,//材质
			scale:100,//缩放比例，和相机和物体常用距离相关
		}
	})

	setData([
		{
			position:{x,y,z},// 坐标
			color:new THREE.Color(1,1,0) //颜色
		}
	]) //配置数据
```