const path = require("path");
const HtmlBundlerPlugin = require("html-bundler-webpack-plugin");

module.exports = {
    output: { 
        path: path.join(__dirname, "dist"),
        clean: true
    },
    mode: "production",
    plugins: [
        new HtmlBundlerPlugin({
            entry: {
                index: "./src/index.html"
            },
            js: {
                filename: "[name].[contenthash:8].js"
            },
            css: {
                filename: "[name].[contenthash:8].css"
            }
        })
    ],
    module: {
        rules: [
            {
                test: /\.(css)$/,
                use: ["css-loader"]
            },
            {
                test: /\.(ico|png|svg)$/,
                type: "asset/resource",
                generator: {
                    filename: "icon/[name].[hash:8][ext]"
                }
            },
            {
                test: /\.(ttf|woff2?)$/,
                type: "asset/resource",
                generator: {
                    filename: "fonts/[name].[hash:8][ext]"
                }
            }
        ]
    },
    optimization: {
        splitChunks: {
            chunks: "all",
            maxSize: 1000000,
            cacheGroups: {
                app: {
                  test: /\.(js)$/,
                  chunks: "all",
                  enforce: true,
                  name({ context }, chunks, groupName) {
                    if (/[\\/]node_modules[\\/]/.test(context)) {
                      const moduleName = context.match(/[\\/]node_modules[\\/](.*?)(?:[\\/]|$)/)[1].replace('@', '');
                      return `${moduleName}`;
                    }
                    return groupName;
                  }
                }
            }
        }
    }
};
