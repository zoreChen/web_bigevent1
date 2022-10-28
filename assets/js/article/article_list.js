$(function () {
    var layer = layui.layer
    var form = layui.form
    var laypage = layui.laypage

    // 定义美化时间的过滤器
    template.defaults.imports.dataFormat = function (date) {
        const dt = new Date(date)

        var y = dt.getFullYear()
        // 月份是从 0 开始的，所以必须加1
        var m = padZero(dt.getMonth() + 1)
        var d = padZero(dt.getDate())

        var hh = padZero(dt.getHours())
        var mm = padZero(dt.getMinutes())
        var ss = padZero(dt.getSeconds())

        return y + '-' + m + '_' + d + ' ' + hh + ':' + mm + ':' + ss
    }

    // 定义补零的函数
    function padZero(n) {
        return n > 9 ? n : '0' + n
    }


    // 定义一个查询的参数对象，将来请求数据的时候，需要将请求参数对象提交给服务器
    var q = {
        pagenum: 1, // 页码值，默认请求第一页的数据
        pagesize: 2, // 每页显示几条数据，默认每页显示2条
        cate_id: '', // 文章分类的 id
        state: '' // 文章发布的状态
    }

    initTable()
    initCate()

    // 获取文章列表数据的方法
    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章列表失败')
                }
                // 使用模板引擎渲染页面的数据
                var htmlStr = template('tpl-table', res)
                $('tbody').html(htmlStr)
                // 调用渲染分页的方法 
                // res.total 是总数据条数
                renderPage(res.total)
            }
        })
    }

    // 初始化文章分类的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取分类数据失败！')
                }
                // 调用模板引擎渲染分类的可选项
                var htmlStr = template('tpl-cate', res)
                $('[name = cate_id]').html(htmlStr)
                // 通知 layui 重新渲染表单区域的 UI 结构
                form.render()
            }
        })
    }

    // 为筛选表单绑定 submit 事件
    $('#form-search').on('submit', function (e) {
        e.preventDefault()
        // 获取下拉选择框中的值
        var cate_id = $('[name = cate_id]').val()
        var state = $('[name = state]').val()
        // 为查询参数中的 q 赋值
        q.cate_id = cate_id
        q.state = state
        initTable()
    })

    // 定义渲染分页的方法
    function renderPage(total) {
        // 调用 laypage.render() 方法来渲染分页的结构
        laypage.render({
            elem: 'pageBox',  // 指定存放分页的容器，分页容器的ID
            count: total, // 数据总条数
            limit: q.pagesize, // 每页显示的数据条数
            curr: q.pagenum, // 设置默认被选中的分页
            // 自定义排版。coutn:总条目输区域 skip:快捷跳页区域 limit:条目选项区域
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],// 默认有'prev', 'page', 'next'
            limits: [2, 3, 5, 10],
            // 分页发生切换的时候，触发 jump 回调
            // 触发 jump 回调的方式有两种：
            // 1. 点击页码的时候，会触发 jump 回调 first = undefined
            // 2. 只要调用 laypage.render() 方法，就会触发 jump 回调 first = true
            // 可以通过 first 的值来判断是哪种方式触发的 jump 回调，如果 first 的值为true，就是用laypage.render()方式调用的
            jump: function (obj, first) {
                // 把最新的页码值，赋值到 q 这个查询对象参数中
                q.pagenum = obj.curr
                // 把最新的条目数，赋值到 q 这个查询参数对象的 pagesize 属性中
                q.pagesize = obj.limit
                // 根据最新的 q 获取对应的数据列表，并渲染表格
                if (!first) {
                    initTable()
                }
            }
        })
    }

    // 通过代理的形式，为删除按钮绑定点击事件处理函数
    $('tbody').on('click', 'btn-delete', function () {
        // 获取当前页删除按钮的个数
        var len = $('.btn-delete').length
        // 询问用户是否要删除数据
        layer.confirm('确认删除?', {icon: 3, title: '提示'}, function (index) {
            // 获取到文章的 id
            var id = $(this).attr('data-id')
            $.ajax({
                method: 'GET',
                url: '/my/article/delete/' + id,
                success: function (res) {
                    if (res.status !== 0) {
                        return layer.msg('删除文章失败！')
                    }
                    layer.msg('删除文章成功！')
                    // 当数据删除完成后，需要判断当前这一页中，是否还有剩余的数据，如果没有剩余的数据了，则让页码值 -1 之后，再重新调用 initTable 方法
                    // 因为 q.pagenum 还是等于当前页，调用 initTable() 后会返回 total 赋值给 renderPage 所有分页会减一，但是分页还是展示为空白页
                    if (len === 1) {
                        // 如果 len 的值等于1，证明删除完毕之后，页面上就没有任何数据了
                        // 页码值最小必须是 1
                        q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1
                    }
                    initTable()
                    layer.close(index);
                }
            })
        })
    })
})