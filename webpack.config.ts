import * as webpack from 'webpack';
import { resolve } from 'path';
import NodemonPlugin from 'nodemon-webpack-plugin';
import nodeExternals from 'webpack-node-externals';
import ESLintPlugin from 'eslint-webpack-plugin';

const NODE_ENV = process.env.NODE_ENV == 'development' ? 'development' : 'production';

const config: webpack.Configuration = {
    entry: './src/index.ts',
    mode: NODE_ENV,
    devtool: NODE_ENV === 'development' ? 'inline-source-map' : false,
    target: 'node',
    externals: [nodeExternals()],
    output: {
        path: resolve(__dirname, 'dist'),
        filename: 'index.js',
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    plugins: [
        new NodemonPlugin({
            script: './dist/index.js',
            watch: [resolve(__dirname, 'dist')],
            ignore: ['*.js.map'],
            verbose: true,
            ext: 'js,json',
            //nodeArgs: ['--inspect'],
        }),
        new ESLintPlugin({
            extensions: [`ts`],
            fix: true,
        }),
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ['ts-loader'],
            },
        ],
    },
};
export default config;
