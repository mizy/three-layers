import OBJLoader from '../OBJLoader';
import MTLLoader from '../MTLLoader';
export default function(url, path) {
	return new Promise((resolve, reject)=>{
		try {
			const mtl = new MTLLoader();
			if (path) {
				mtl.setPath(path);
			}
			mtl.load(url + '.mtl', (materials)=>{
				materials.preload();
				new OBJLoader().setMaterials(materials).load(url + '.obj', (object)=>{
					resolve(object);
				});
			});
		} catch (e) {
			console.error(e);
			reject(e);
		}
	});
}
