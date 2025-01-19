const path = require('path');

module.exports = {
    target: 'node',
    mode: 'development',
    entry: './src/extension.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'extension.js',
        libraryTarget: 'commonjs2'
    },
    externals: {
        vscode: 'commonjs vscode',
        chokidar: 'commonjs chokidar',
        'fs-extra': 'commonjs fs-extra',
        'markdown-it': 'commonjs markdown-it'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            compilerOptions: {
                                "module": "es6"
                            }
                        }
                    }
                ]
            }
        ]
    },
    devtool: 'source-map'
}; 