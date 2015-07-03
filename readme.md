# Barrage.js - 弹幕组件

### 资源引用

``` html
<link rel="stylesheet" href="src/Barrage.css">
<script src="src/Barrage-min.js"></script>
```

### 初始化参数

- **element** : \(String | DOM node\) 初始化外层容器

- cover : \(Boolean: false\) 是否显示遮罩

- lines : \(Number: 8\) 弹幕最多显示行数

- maxList : \(Number: 200\) （在呈现速度不及数据增长速度的情况下）最多积压未显示的弹幕条数

- maxTxtLen : \(Number: 60\) 每条弹幕最长文字数

- aniSpeed : \(Number: 1\) 弹幕动画速度

### 公有方法

- add : (para：Object: 弹幕信息)添加一条弹幕信息

- clear : (para：none)清空积压数据并暂停弹幕

- restart : (para：none)重新开始播放弹幕

- resize : (para：Number)动态调整弹幕主容器宽度

------------

### [demo](../demo.html)

##### 示例1：```最简调用```

``` javascript
var barrage = new Barrage({
    element : 'barrage'
});
```