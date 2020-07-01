import * as THREE from "three"
class MoveLineMaterial extends THREE.ShaderMaterial{
	constructor(config={}){
		const {flowSpeed=0.01,t=0,color=new THREE.Color(0xf0f0a0),length=20} = config;
		const configs = {
			uniforms: {
				flowSpeed:{value:flowSpeed},
				length:{value:length},
				t:{value:t},
				color:{value:color},
			},
			transparent:true,
			vertexShader: `
			attribute float number;

			uniform vec3 color;
			uniform float t;
			uniform float length;
			uniform float flowSpeed;

			varying vec4 vColor;

			void main() {

				vec4 mPosition = projectionMatrix * modelViewMatrix  * vec4(position,1.0);
				// 求出当前起点的颜色
				float opacity = ${config.darkOpacity||0.2};
				if(number<=t){
					opacity = max(opacity,(1. - pow(2.,t/length)*(t-number)*${flowSpeed}) );
				}
				vColor = vec4(color,opacity);
				gl_Position = mPosition;
			}
			`,
		
			fragmentShader: `
			varying vec4 vColor;
			void main() {
				gl_FragColor = vColor;
			}
			`
		}
		super(configs);

	}
}
export default MoveLineMaterial;