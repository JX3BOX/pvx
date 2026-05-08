/**
 * 支付轮询工具
 * 统一 face/body 模块的支付状态轮询逻辑，
 * 使用 setTimeout + 最大重试次数，防止无限轮询导致内存泄漏
 */

var DEFAULT_MAX_RETRY = 30;
var DEFAULT_INTERVAL = 2000;

/**
 * 轮询支付状态
 *
 * @param {Function} fetchStatus - 获取支付状态的接口函数，需返回 Promise
 * @param {string|number} payId - 支付记录ID
 * @param {Object} options - 配置项
 * @param {number} [options.maxRetry=30] - 最大重试次数
 * @param {number} [options.interval=2000] - 轮询间隔(ms)
 * @param {Function} options.onSuccess - 支付成功回调(status)
 * @param {Function} options.onFail - 支付失败回调(status)
 * @param {Function} [options.onError] - 网络异常回调
 * @param {Function} [options.onTimeout] - 超时回调
 * @returns {Object} { stop: Function } 可手动停止轮询
 */
export function pollPayStatus(fetchStatus, payId, options) {
    var maxRetry = options.maxRetry || DEFAULT_MAX_RETRY;
    var interval = options.interval || DEFAULT_INTERVAL;
    var retryCount = 0;
    var stopped = false;

    function poll() {
        if (stopped) return;

        retryCount++;
        if (retryCount > maxRetry) {
            if (options.onTimeout) options.onTimeout();
            return;
        }

        fetchStatus(payId)
            .then(function (res) {
                if (stopped) return;
                var status = res.data.data.pay_status;
                if (status === 1) {
                    stopped = true;
                    options.onSuccess(status);
                } else if (status === 2) {
                    stopped = true;
                    options.onFail(status);
                } else {
                    setTimeout(poll, interval);
                }
            })
            .catch(function () {
                if (stopped) return;
                if (options.onError) {
                    options.onError();
                }
                setTimeout(poll, interval);
            });
    }

    poll();

    return {
        stop: function () {
            stopped = true;
        },
    };
}
