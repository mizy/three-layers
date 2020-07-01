class CoordsConvert {
	lineHeight = 0.3;
	strightRatio = 0.4;// 外圈圆的垂直度
	strightRadiusRatio = 0.2;
	bezierRatio = 1;
	totalPoints= 100;
	smoothNumber=0.2;
	planeNormal = new THREE.Vector3(0,0,1);
	/**
	 * 2条贝塞尔曲线和一条外环线，好处是有环绕感，坏处是过渡不自然
	 * @param {*} start 
	 * @param {*} end 
	 * @param {*} radius 
	 * @param {*} center 
	 * @return {[]} points
	 */
	getGlobelBezierPoints= (start, end, radius, center = new THREE.Vector3(0, 0, 0)) => {

		// 改用两条贝塞尔曲线拼接行成，百度的切线做法在极端的情况比如南极北极，出入口点的线会很难受
		const start_end = new THREE.Vector3().subVectors(end, start);
		const normal = start_end.clone().normalize();
		const center_start = start.clone().sub(center);
		const center_end = end.clone().sub(center);
		const start_endL = start_end.length();
		// 根据点的距离远近，动态算出两点线的高度
		const bezierRatio = radius+this.lineHeight*(radius+start_endL)/3;
		
		// 求出外环圆的两个起点
		const strightRatio = this.strightRatio;// 小于60度时，弧度大点
		const startAnchorP = start.clone().add(start_end.clone().multiplyScalar(strightRatio));
		const startAnchor = startAnchorP.normalize().multiplyScalar(bezierRatio);
		const endAnchorP = end.clone().sub(start_end.clone().multiplyScalar(strightRatio));
		const endAnchor = endAnchorP.normalize().multiplyScalar(bezierRatio);

		// 求出连接外环的两个二次贝塞尔控制点
		const crossNorm = new THREE.Vector3().crossVectors(endAnchor,startAnchor);
		const tanNormal =  new THREE.Vector3().crossVectors(crossNorm,startAnchor).normalize();
		const tan2Normal =  new THREE.Vector3().crossVectors(endAnchor,crossNorm).normalize();

		const bezier0 = startAnchor.clone().add(tanNormal.clone().multiplyScalar(this.strightRadiusRatio*start_endL));
		const bezier1 = endAnchor.clone().add(tan2Normal.clone().multiplyScalar(this.strightRadiusRatio*start_endL));

		//外圆的点
		const pointsOut = this.calcOutPoints(startAnchor,endAnchor,center,bezierRatio);

		//外环圆的起点线
		const splineCurveA = new THREE.QuadraticBezierCurve3(start, bezier0, startAnchor);
		const splineCurveB = new THREE.QuadraticBezierCurve3(endAnchor, bezier1, end);
		const pointsA = splineCurveA.getSpacedPoints(8);
		pointsA.pop();//推出最后一个元素
		const pointsB = splineCurveB.getSpacedPoints(8);

		// 求外圆上的点 16个

		const curve = new THREE.CatmullRomCurve3([start,...pointsA,...pointsOut,...pointsB,end]);
		curve.curveType = "chordal";
		this.curve = curve;
		// return [start, bezier0,startAnchor,...pointsOut,endAnchor, end]
		return curve.getSpacedPoints(curve.getLength()*this.smoothNumber) 

		
	}

	// 根据球面两点，计算两点连线弧坐标,10个点,采用横向遍历树的算法，和开根号有点像
	calcOutPoints(start,end,center,outRadius){
		const number = 12;
		let parents = [{
			start,end,startIndex:0,endIndex:1
		}]
		const points = []

		while(parents.length>0){
			let newParents = [];
			for(let i =0 ;i<parents.length;i++){
				const parent = parents[i];
				const mid = parent.start.clone().add(parent.end).normalize().multiplyScalar(outRadius).add(center);
				const midIndex = (parent.startIndex+parent.endIndex)*0.5;
				mid.midIndex = midIndex;
				points.push(mid);
				newParents.push({
					start:parent.start,
					end:mid,
					startIndex:parent.startIndex,
					endIndex:midIndex,
				},{
					start:mid,
					end:parent.end,
					startIndex:midIndex,
					endIndex:parent.endIndex
				})
		   }
		   if(points.length<number){
				parents  = newParents;
		   }else{
			   parents = []
		   }
		}
		
		const res = points.sort((a,b)=>(a.midIndex>b.midIndex?1:-1));
		return res;
	}

	//第二种算法，比较简单，问题是环特别大
	get2BezierGlobe = (start, end, radius, center = new THREE.Vector3(0, 0, 0)) => {
		const start_end = new THREE.Vector3().subVectors(end, start);
		const start_endL = start_end.length();
		const midP = start.clone().add(end).normalize();
		const bezierRatio = radius+this.lineHeight*(radius+start_endL)/3;
		const midPoint = midP.clone().multiplyScalar(bezierRatio);

		const normal = start_end.clone().normalize();

		const anchor1 = midPoint.clone().add(normal.clone().multiplyScalar(-start_endL/2*this.bezierRatio));
		const anchor2 = midPoint.clone().add(normal.clone().multiplyScalar(start_endL/2*this.bezierRatio));

		const splineCurveA = new THREE.CubicBezierCurve3(start,start, anchor1, midPoint);
		const splineCurveB = new THREE.CubicBezierCurve3(midPoint, anchor2,end, end);
		const pointsA = splineCurveA.getSpacedPoints(10);
		pointsA.pop();//推出最后一个元素
		const pointsB = splineCurveB.getSpacedPoints(10);
		
		const curve = new THREE.CatmullRomCurve3([start,...pointsA,...pointsB,end]);
		this.curve = curve;
		// return [...pointsA,...pointsB]
		return curve.getSpacedPoints(curve.getLength()*this.smoothNumber) 

	}

	getPlaneBezierPoint=(start, end)=>{
		const normal = this.planeNormal.normalize();
		const start_end = end.clone().sub(start);
		const length = start_end.length();
		const anchor1 = start.clone().add(normal.clone().multiplyScalar(length*this.strightRatio));
		const anchor2 = end.clone().add(normal.clone().multiplyScalar(length*this.strightRatio));
		const curve = new THREE.CubicBezierCurve3(start,anchor1, anchor2, end);
		this.curve = curve;
		// return [...pointsA,...pointsB]
		return curve.getSpacedPoints(curve.getLength()*this.smoothNumber) 
	}
}
export default CoordsConvert;
