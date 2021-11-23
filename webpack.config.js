module.exports = {
	entry: {
		index: "./src/index.js"
	},
	output: {
		library: "TNTVLayers",
		libraryTarget: "umd",
		libraryExport: "default", // 默认导出
		filename: "index.js"
	},

	devServer: {
		port: "6699",
		open: true,
		openPage: "./demo/",
		hot: true
	},
	optimization:{
		minimizer:[]
	},
	devtool: "source-map",
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules)|dist/,
				use: {
					loader: "babel-loader"
				}
			},
		]
	}
};
