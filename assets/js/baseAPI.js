// 注意：每次调用 $.get() 或 $.post() 或 $.ajax 的时候，会先调用 ajaxPrefilter 这个函数
// 在这个函数中，可以拿到我们给 Ajax 提供的配置对象
$.ajaxPrefilter(function (options) {
    // 在发起真正的 Ajax 请求之前，统一拼接请求的跟路径
    options.url = 'http://www.liulongbin.top:3007' + options.url
    //  统一为有权限的接口，设置 headers 请求头
    //  如果不包含就会使得值等于-1
    if (options.url.indexOf('/my/') !== -1) {
        options.headers = {
            Authorization: localStorage.getItem('token') || ''
        }
    }
    // 不论成功还是失败，最终都会调用 complete 回调函数
    options.complete = function (res) {
        // 在 complete 回调函数中，可以使用 res.responseJSON 拿到服务器响应回来的数据
        if (res.responseJSON.status === 1 && res.responseJSON.message === '身份认证失败！') {
            // 1. 强制清空 token
            localStorage.removeItem('token')
            // 2. 强制跳转到登录界面
            location.href = 'login.html'
        }
    }
})