var path = require('path');
var createHash = require('crypto').createHash;

// 与 lib/Compilation.js 中计算 chunkHash 的方式保持一致
var options = {
    hashFunction: 'md5',
    hashDigest: 'hex',
    hashDigestLength: 7
};

var usedHash = new Set();

/**
 * 获取 code split 方式懒加载的文件的文件名
 * 
 * 使用模块的文件名作为 chunk 的名称, 这样便于定位文件
 * 参考 angular-cli 的实现, 找出 code split 方式加载的文件的文件名
 * https://github.com/angular/angular-cli/blob/master/packages/%40angular/cli/plugins/named-lazy-chunks-webpack-plugin.ts
 * 
 * @param {object} chunk
 * @return {string} 文件名
 */
function getLazyModuleFileName(chunk) {
    var moduleFileName = null;

    // 一开始是参考 angular-cli 的实现, 但他的实现识别不了 require.ensure 方式做的 code split
    // 后来参考 webpack.github.io/analyse 的分析结果得知,
    // chunk 分为两种: 初始分块和非初始分块, 即一开始就加载的分块和懒加载的分块
    if (!chunk.isInitial()) {
        var request = null;
        // 找出通过 import() 或者 require.ensure() 方式加载的模块名称
        for (var i = 0, blockLength = chunk.blocks.length; i < blockLength; i++) {
            var block = chunk.blocks[i];
            for (var j = 0, dependencyLength = block.dependencies.length; j < dependencyLength; j++) {
                var dependency = block.dependencies[j];
                if (dependency.request) {
                    request = dependency.request;
                    break;
                }
            }
        }

        if (request) {
            moduleFileName = path.basename(request, path.extname(request));
        }
    }

    return moduleFileName;
}

/**
 * 计算 chunk 的 hash 值
 * 
 * 参考
 * https://medium.com/webpack/predictable-long-term-caching-with-webpack-d3eee1d3fa31
 * HashedModuleIdsPlugin
 * 
 * @param {object} chunk 
 * @return {string}
 */
function calcChunkHash(chunk) {
    var hash = '';

    var chunkModulesPath = chunk.mapModules(function(m) {
        return path.relative(m.context, m.request);
    }).join('_');

    hash = createHash(options.hashFunction).update(chunkModulesPath)
                                           .digest(options.hashDigest);

    // 截取 hash 的长度
    var len = options.hashDigestLength;
    while(usedHash.has(hash.substr(0, len))) {
        len++;
    }
    hash = hash.substr(0, len);
    usedHash.add(hash);

    return hash;
}

/**
 * 获取 chunk 的名字
 * 
 * @param {object} chunk 
 * @return {string} chunk 的名字
 */
function chunkNameResolver(chunk) {
    var name = null;

    if (chunk.name) {
        name = chunk.name;
    } else {
        var moduleFileName = getLazyModuleFileName(chunk);
        var hash = calcChunkHash(chunk);

        if (moduleFileName) {
            name = moduleFileName + '-' + hash;
        } else {
            name = hash;
        }
    }

    return name;
}

module.exports = chunkNameResolver;