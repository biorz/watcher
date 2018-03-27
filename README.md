# watcher

------

监听元素进出视口，跳转至指定元素位置 [demo](https://biorz.github.io/watcher/demo/index.html)[demo2](https://biorz.github.io/watcher/demo/float-nav.html)

> * 无依赖
> * 简明的api
> * 支持多层级
> * 支持多方向
> * 性能优化
> * 持续更新

示例
```
<script src="../dist/watcher.min.js"></script>
<script>
    let ins = watcher('.watch')
        .on('enter', el => {
            console.log(el)
        })
        .on('exit', el => {
            console.log(el)
        })
        .scroll(document.querySelector('#id'), 300)         
</script>
```
