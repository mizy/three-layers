import * as THREE from "three";
import earcut from "earcut";
window.earcut = earcut;
class GeoJSON {
	constructor(config = {}) {
		this.points = [];
		this.lines = [];
		this.geometrys = [];
		this.config = {
			convertFunc: (coord) => {
				return [...coord,1.];
			},
			...config,
		};
	}

	parse(json) {
		if (json.type === "FeatureCollection") {
			json.features.forEach((item) => {
				this.parse(item);
			});
		} else if (json.type === "Feature") {
			this.parseFeature(json);
		}
	}

	parseFeature(feature) {
		const { convertFunc } = this.config;
		let coords = feature.geometry.coordinates;
		let points = [];
		let linePoints = [];
		let indexs = [];
		// if(feature.properties.CNAME!=="中国"){
		// 	// return;
		// }
		// coords = coords.slice(2,3)
		switch (feature.geometry.type) {
			case "Point":
				points.push(...convertFunc(coords));
				break;
			case "LineString":
				coords.map((item) => points.push(...convertFunc(item)));
				break;
			case "MultiPoint":
				coords.map((item) => points.push(...convertFunc(item)));
				break;
			case "MultiLineString":
				coords.map((item) => {
					item.map((each, index) => {
						points.push(...convertFunc(each));
						if (index !== 0) {
							indexs.push(points.length - 2, points.length - 1);
						}
					});
				});
				break;
			case "Polygon":
				const holeIndex = [];
				coords.forEach((item, index) => {
					const eachLinePoints = [];
					item.forEach((each) => {
						const convertPoint = convertFunc(each);
						eachLinePoints.push(...convertPoint);
						points.push(...convertPoint);
					});
					linePoints.push(eachLinePoints);
					if (index !== 0) {
						holeIndex.push(index);
					}
				});
				indexs = earcut(points, holeIndex.length ? holeIndex : null, 3);
				break;
			case "MultiPolygon":
				coords.forEach((polyCoords) => {
					const holeIndex = [];
					const nowPoints = [];
					polyCoords.forEach((item, index) => {
						const eachLinePoints = [];
						item.forEach((each) => {
							const convertPoint = convertFunc(each);
							eachLinePoints.push(...convertPoint);
							nowPoints.push(...convertPoint);
						});
						// 每个洞的线都要画
						linePoints.push(eachLinePoints);
						if (index !== 0) {
							holeIndex.push(index);
						}
					});
					// 直接塞到一个TRIGHLES里渲染，不区分多个MESH
					const allIndexs = earcut(nowPoints, holeIndex.length ? holeIndex : null, 3) || [];
					const newIndexs = allIndexs.map((item) => {
						return item + points.length/3;
					});
					console.log(nowPoints,newIndexs)
					points = [...points, ...nowPoints];
					indexs = [...indexs, ...newIndexs];
				});
				break;
		}

		this.geometrys.push({
			properties: feature.properties,
			type: feature.geometry.type,
			linePoints,
			points,
			indexs,
		});
	}
}
export default GeoJSON;
