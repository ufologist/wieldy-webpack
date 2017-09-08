import $ from 'jquery';

// 在 JS 中可以获取 env.js 中定义的环境配置, 占位的地方会被真实的值替换掉
var apiRootEndpoint = __api_root_endpoint__;
console.log('在 JS 中可以获取 env.js 中定义的环境配置', apiRootEndpoint);

// 接口调用失败时的状态码
var ERROR_STATUS = 10000;

/**
 * 接口调用成功时的默认处理方法
 * 
 * @param {object} result 接口返回的数据
 * @return {object|Promise}
 */
function defaultSuccess(result) {
    if (!result.status) {
        return result.data;
    } else {
        commonStatusHandler(result);
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
function defaultError(jqXHR, textStatus, errorThrown) {
    var result = {
        status: ERROR_STATUS,
        statusInfo: {
            message: '服务器正忙...请稍后再试',
            detail: {
                textStatus: textStatus,
                errorThrown: errorThrown,
                xhr: jqXHR
            }
        }
    };

    commonStatusHandler(result);
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
function commonStatusHandler(result) {
    console.info(result.statusInfo.message);

    if (result.status === ERROR_STATUS) {
        // 
    } else if (result.status == 1) {
        // 
    }
}
/**
 * 统一发送请求的方法
 * 
 * @param {object} options 
 * @return {Promise}
 */
function sendRequest(options) {
    return $.ajax(options).then(defaultSuccess, defaultError);
}

/**
 * 封装对外使用的接口方法
 */
function getUser() {
    return sendRequest({
        url: apiRootEndpoint + '/user'
    });
}

export {
    ERROR_STATUS,
    getUser
};