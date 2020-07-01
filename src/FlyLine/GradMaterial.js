import * as THREE from "three"
class GradMaterial extends THREE.ShaderMaterial{
	constructor(config={}){
		const configs = {
			uniforms: {
				start:{value:0},
				length:{value:100},
				startColor: { value: config.startColor||new THREE.Vector4(1,1,0,0) },
				endColor: { value: config.endColor||new THREE.Vector4(1,1,0,1) }
		
			},
			transparent:true,
			depthWrite:false,
		
			vertexShader: `
			attribute float number;

			uniform vec4 startColor;
			uniform vec4 endColor;
			uniform float length;
			uniform float start;

			varying vec4 vColor;

			void main() {

				vec4 mPosition = projectionMatrix * modelViewMatrix  * vec4(position,1.0);
				// 求出当前起点的颜色
				vec4 color = endColor - (length - number +start)/length*(endColor - startColor);
				vColor = color  ;
				
				gl_Position = mPosition;
			}
			`,
		
			fragmentShader: `
			varying vec4 vColor;
			void main() {
				if(vColor.w<=0.02){
					discard;
				}
				gl_FragColor = vec4(vColor);
			}
			`
		}
		super(configs);

	}
}
export default GradMaterial;