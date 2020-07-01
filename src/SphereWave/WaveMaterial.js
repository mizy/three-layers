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
			side:THREE.DoubleSide,
			// depthTest:false,
			uniforms: {
				minOpacity:{value:userConfig.minOpacity!==undefined?userConfig.minOpacity:0.8},
				r:{value:userConfig.r||0},
				opacity:{value:userConfig.opacity||1},
				radius:{value:userConfig.radius},
				centerNormal:{value:userConfig.centerNormal||new THREE.Vector3()},
				startColor:{value:userConfig.startColor||new THREE.Vector4(1,0,1,1)},
				endColor:{value:userConfig.endColor||new THREE.Vector4(0,1,1,1)},
			},
		
			vertexShader: `
			attribute float number;
			varying vec4 vColor;
			varying float nowRadius;
			uniform vec4 startColor;
			uniform vec4 endColor;
			uniform vec3 centerNormal;
			uniform float r;
			uniform float radius;
			void main() {
				vColor = endColor;
				if(number!=0.){
					// 求出当前球面半径
					float height = sqrt(radius*radius - r*r );
					vec3 angleVec = position*r;
					vec3 finalPos = angleVec + centerNormal*height;
					vec4 mPosition = projectionMatrix * modelViewMatrix  * vec4(finalPos,1.0);
					gl_Position = mPosition;

					nowRadius = 1.;

				}else{
					vec4 mPosition = projectionMatrix * modelViewMatrix  * vec4(position,1.0);
					vColor = startColor;
					gl_Position = mPosition; 

					nowRadius = 0.;
				}
			}
			`,

			// gl_PointCoord
			fragmentShader: `
			varying vec4 vColor;
			varying float nowRadius;
			uniform float opacity;
			uniform float minOpacity;
			void main() {
				gl_FragColor = vColor; 
				gl_FragColor.w *= opacity;
				if(nowRadius<minOpacity){
					discard;
				}
			}
			`
		}
		super(configs);
	}
}
export default PointsMaterial;