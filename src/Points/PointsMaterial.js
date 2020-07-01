import * as THREE from "three"
class PointsMaterial extends THREE.ShaderMaterial{
	constructor(userConfig={}){
		const configs = {
			fog:true,
			// depthTest:false,
			// depthFunc:THREE.AlwaysDepth,
			//由于points是四边形且会遮挡,计算深度值的时候，并不会因为是透明元素就剔除，哪怕是透明元素后面的frag也不会渲染，导致透明度计算的结果是后方的球
			depthWrite:false,//，但不会更新,根据depthFunc小于等于的情况下也不会更新，总之就是以球的depthBuffer为准，也会使元素永远处于镜头前
			// side:THREE.DoubleSide,
			transparent:true,
			// depthTest:false,
			uniforms: {
				size:{value:userConfig.size||1},
				map:{value:userConfig.map},
				scale:{value:userConfig.scale||100},
				t:{value:0}
			},
			transparent:true,
		
			vertexShader: `
			attribute float time;
			attribute vec3 color;
			varying vec4 vColor;
			uniform float size;
			uniform float t;
			uniform float scale;
			varying float vTime;
			void main() {
				vColor = vec4(color,1);
				vTime = time;
				vec4 mPosition = projectionMatrix * modelViewMatrix  * vec4(position,1.0);
				gl_Position = mPosition;
				gl_PointSize = size/mPosition.z*scale;
				gl_PointSize *=sin(t+vTime)*0.75/2. + 1.-0.75/2.;
			}
			`,
			// gl_PointCoord
			fragmentShader: `
			varying vec4 vColor;
			varying float vTime;
			uniform float t;
			${userConfig.map?'uniform sampler2D map;':''}
			void main() {
				float distance = distance(gl_PointCoord, vec2(0.5, 0.5));
				if (distance <= 0.5){
					${userConfig.map?`
						vec4 texelColor = texture2D( map, gl_PointCoord ); 
						gl_FragColor = texelColor;
						
						gl_FragColor.w *= sin(t+vTime)*0.75/2. + 1.-0.75/2.;
						if(texelColor.w<=0.01){
							discard;
						}
					`:`
						gl_FragColor = vColor;
						gl_FragColor.w = 1. - distance*2.;
						gl_FragColor.w *= sin(t+vTime)*0.75/2. + 1.-0.75/2. ;
					`}
				}else{
					discard;
				}
			}
			`
		}
		super(configs);
	}
}
export default PointsMaterial;