import * as webpack from "webpack";
import * as path from "node:path";

const configurations: webpack.Configuration = {
    entry: path.resolve("src", "index.tsx"),
    mode: 'development',
    target: 'web',
    devtool: 'source-map',

    output: {
        path: path.resolve('build'),
        filename: 'main.bundle.js'
    },

    module: {
        rules: [
            {
                test: /\.[tj]sx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '...']
    }
};

const compiler: webpack.Compiler = webpack(configurations);

compiler.watch({
    poll: true,
    stdin: true
}, function (err, result) {
    if (err) return console.error(err);
    console.log(result.toString({ colors: true }));
});