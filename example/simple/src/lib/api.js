import $ from 'jquery';

// 在 JS 中可以获取 env.js 中定义的环境配置, 占位的地方会被真实的值替换掉
var apiRootEndpoint = __api_root_endpoint__;
console.log('在 JS 中可以获取 env.js 中定义的环境配置', apiRootEndpoint);

// 在这里统一定义接口的 URL
var apiConfig = {
    'getUser': { // jQuery ajax options, 一般配置 type 和 url
        type: 'GET',
        url: apiRootEndpoint + '/user'
    }
};

// 接口请求失败时的状态码
var REQUEST_ERROR_STATUS = 10000;

/**
 * 接口调用成功时的默认处理方法
 * 
 * @param {object} result 接口返回的数据
 * @return {object|Promise}
 */
function defaultSuccessHandler(result) {
    if (!result.status) {
        return result.data;
    } else {
        commonErrorStatusHandler(result);
        // 当接口处理失败时, 也转到 error 处理
        return $.Deferred().reject(result).promise();
    }
}
/**
 * 接口调用失败时的默认处理方法
 * 
 * @param {object} jqXHR 
 * @param {string} textStatus 
 * @param {string} errorThrown 
 */
function defaultErrorHandler(jqXHR, textStatus, errorThrown) {
    var result = {
        status: REQUEST_ERROR_STATUS,
        statusInfo: {
            message: '服务器正忙...请稍后再试',
            detail: {
                status: jqXHR.status,
                textStatus: textStatus,
                errorThrown: errorThrown,
                xhr: jqXHR
            }
        }
    };

    commonErrorStatusHandler(result);
    return $.Deferred().reject(result).promise();
}
/**
 * 当接口处理失败时通用的错误状态处理
 * 
 * 例如:
 * - 接口出错时统一弹出错误提示信息
 * - 接口出错时根据 status 做通用的错误处理(例如用户 session 超时, 引到用户重新登录)
 * 
 * @param {object} result 接口返回的数据 
 */
function commonErrorStatusHandler(result) {
    console.info(result.status, result.statusInfo.message);

    if (result.status === REQUEST_ERROR_STATUS) {
        // XXX your code here
    } else if (result.status == 1) {
        // XXX your code here
    }
}
/**
 * 统一发送请求的方法
 * 
 * @param {object} options jQuery ajax options
 * @return {Promise}
 */
function sendRequest(options) {
    return $.ajax(options).then(defaultSuccessHandler, defaultErrorHandler);
}
/**
 * 统一发送 API 请求的方法
 * 
 * @param {string} apiName 
 * @param {object} options jQuery ajax options 
 */
function sendApiRequest(apiName, options) {
    return sendRequest($.extend(true, {}, apiConfig[apiName], options));
}

/**
 * 建议有共用逻辑的公共接口方法可以再封装一层
 */
function getUser() {
    return sendApiRequest('getUser');
}

export {
    REQUEST_ERROR_STATUS,
    sendRequest,
    sendApiRequest,

    getUser
};