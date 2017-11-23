import $ from 'jquery';

// 在 JS 中可以获取 env.js 中定义的环境配置, 占位的地方会被真实的值替换掉
var apiRootEndpoint = __api_root_endpoint__;
console.log('在 JS 中可以获取 env.js 中定义的环境配置', apiRootEndpoint);

// 统一定义接口的配置, 建立接口名称与接口的映射关系
// 这样封装后便于灵活调整接口的 URL 或其他配置参数
// 例如当调整接口的版本时, 即使修改了接口的 URL, 但对前端是没有任何影响的,
// 因为前端是通过接口名称来映射的接口
var apiConfig = {
    // 配置接口, key 值代表接口的名字
    'getUser': { // 接口的配置就是 jQuery ajax options, 必须配置 type 和 url, 其他参数可选
        type: 'GET',
        url: apiRootEndpoint + '/user'
    }
};

// 接口请求失败(HTTP协议层面)时的状态码, 用于与业务状态码区分开
var REQUEST_FAIL_STATUS = 10000;

var defaultAjaxOptions = {};

/**
 * 接口调用成功时的默认处理方法
 * 
 * @param {object} result 接口返回的数据
 * @param {string} textStatus 接口返回的数据
 * @param {object} jqXHR jqXHR Object
 * @return {object|Promise}
 */
function defaultSuccessHandler(result, textStatus, jqXHR) {
    if (!result.status) {
        return result.data;
    } else {
        // 当接口业务处理失败时, 转到 error 处理
        // 免于在调用各个接口时, 都需要去处理接口的返回状态, 再判断是否执行 success 的逻辑
        // 防止出现接口业务处理失败时, 也去执行了 success 的逻辑, 导致页面渲染异常
        // 
        // context
        // This object will be the context of all Ajax-related callbacks.
        // By default, the context is an object that represents the Ajax settings used in the call
        commonErrorStatusHandler.call(this, result);
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
        status: REQUEST_FAIL_STATUS,
        statusInfo: {
            message: '服务器正忙...请稍后再试',
            detail: {
                httpStatus: jqXHR.status,
                textStatus: textStatus,
                errorThrown: errorThrown,
                xhr: jqXHR
            }
        }
    };

    commonErrorStatusHandler.call(this, result);
    return $.Deferred().reject(result).promise();
}
/**
 * 当接口处理失败时通用的错误状态处理
 * 
 * 例如:
 * - 接口出错时统一弹出错误提示信息
 *   提供给用户看的消息格式参考 QQ 的错误提示消息
 *   提示消息
 *   (错误码:result.statusInfo.message)灰色字
 * - 接口出错时根据 status 做通用的错误处理(例如用户 session 超时, 引到用户重新登录)
 * 
 * @param {object} result 接口返回的数据 
 */
function commonErrorStatusHandler(result) {
    // 接口调用失败, 输出失败的日志信息, 需要包含如下重要信息
    // * HTTP method
    // * HTTP URL
    // * 接口的参数
    // * 接口的返回状态
    // * 接口的返回数据
    console.warn('接口调用出错', this.type || this.method, this.url, this.data, result.status, result);

    if (result.status === REQUEST_FAIL_STATUS) {
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
 * 统一发送(接口)请求的方法
 * 
 * @param {string} name 接口的名称, 如果不使用这个参数, 也可以发请求, 但不推荐这么使用, 应该将所有接口都配置好
 * @param {object} options jQuery ajax options 
 * @return {Promise}
 */
function sendApiRequest(name, options) {
    var apiOptions;
    if (name) {
        apiOptions = apiConfig[name];
        if (!apiOptions) {
            console.warn('没有找到匹配的接口配置', name, apiConfig);
        }
    }

    return sendRequest($.extend(true, {}, defaultAjaxOptions, apiOptions, options));
}

/**
 * 建议有公共逻辑的接口方法可以再封装一层
 * 
 * @return {Promise}
 */
function getUser(options) {
    return sendApiRequest('getUser', options);
}

export {
    REQUEST_FAIL_STATUS,
    sendApiRequest,

    getUser
};