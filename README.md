# polygon cloth

put image or dom on canvas and interact with user like  cloth

## Install
[![](https://nodei.co/npm/polygon-cloth.png)](https://nodei.co/npm/polygon-cloth)
## Usage
### dom
```js
const Cloth= require(polygon-cloth);

let canvas = document.getElementById('canvas');

let dom = document.getElementById('domid');
new Cloth({
    canvas:canv,
    gravity:{x:0,y:500},
    start:{x:0,y:0},
    numcol:54,
    numrow:23,
    render_times:2,
    tear_distance:300,
    space:25,
    renderType:2,
    pand:{
        x:1.02,
        y:1.02
    },
    mouse_influence:50,
    filltype:"glass",
    doGrain:true
})
.init()
.bindEvent()
.renderGrain(dom)
.then(()=>{
    requestAnimationFrame(anim);
});

function anim(){
    cl.update();
    // if((delaycount = ++delaycount%9) ==0)
    cl.draw();
    requestAnimationFrame(anim);
}

```
### img
```js
let image = new Image();
image.onload = function(){
    new Cloth({
        ...
    }).init()
    .bindEvent()
    .renderGrain(image)
    .then(()=>{
        //anim
    })
}
image.src = 'image_src';
```

## Options
- canvas = canvas element,
- ctx = ctx //ctx or canvas,not nessary support both 
- numrow = how many cell-rows(cell number in y-axis),
- numcol = how many cell-cols(cell number in x-axis),
- space  = the size of one cell,
- start  ={
		x:x,
		y:y,
		}//start
- gravity = {x:0,y:1200}重力加速度,
- tear_distance = 撕裂距离,
- mouse_influence = 光标影响范围,
- mouse_cut = 剪切影响范围,
- render_times = 每次更新前物理作用渲染次数,
- img = img src ,
- doGrain = false//是否渲染纹理,
- renderType=clarity 1|pattern 0//你试试

## License
MIT
