/*
*before I try to understand how to simulate the cloth active,
*I thought it must be very complicated,
*But in fact ,it is so straight and simple,
*physic is truly beautiful
*/

const html2img = require('html-to-image');

	
class Cloth{
    /**
     * 
     * @param {Object} obj options
     *   - canvas = canvas element,
     *	 - ctx = ctx //ctx or canvas,not nessary support both 
     *	 - numrow = how many cell-rows(cell number in y-axis),
     *	 - numcol = how many cell-cols(cell number in x-axis),
     *	 - space  = the size of one cell,
     *	 - start  ={
     *			x:x,
     *			y:y,
     *			}//start
     *	 - gravity = {x:0,y:1200}重力加速度,
     *   - tear_distance = 撕裂距离,
     *	 - mouse_influence = 光标影响范围,
     *	 - mouse_cut = 剪切影响范围,
     * 	 - render_times = 每次更新前物理作用渲染次数,
     *	 - img = img src ,
     *	 - doGrain = false//是否渲染纹理,
     * 	 - renderType=clarity 1|pattern 0//你试试
     *
     *   - cell 指每个纵横线间形成的小格子
     */
    constructor(obj){
        
        this.img = obj.img;
        this.renderType = obj.renderType || 0;

        let filltype = this.filltype = obj.filltype||"picture";//"color"纯色；"picture"图片

        let fillcolor = this.fillcolor = obj.fillcolor||"#000";

        let doGrain = this.doGrain = obj.doGrain||false;
        console.log("doGrain" , this.doGrain);
        let canvas = this.canvas = obj.canvas;
        let ctx = this.ctx = obj.ctx || obj.canvas.getContext('2d');
        let numrow = this.numrow = obj.numrow || 30 ;
        let numcol = this.numcol = obj.numcol || 60 ;
        let space = this.space = obj.space || 7;
        let gravity = this.gravity = obj.gravity||{x:0,y:1200};
        // let gravity = this.gravity = {x:0,y:1200};
        // this.gravity = obj.gravity || {x:0,y:1200};
        let tear_distance = this.tear_distance = obj.tear_distance || 50;
        let mouse_influence = this.mouse_influence = obj.mouse_influence || 10;
        let mouse_cut = this.mouse_cut = obj.mouse_cut || 5;
        let render_times = this.render_times = obj.render_times || 3;
        this.points = [];
        let mouse = {
            x:0,
            y:0,
            perv_x:0,
            perv_y:0,
            down:false,
            button:1
        };
        obj.start?this.start=obj.start: this.start={x:0,y:0};

        this.pand = obj.pand || {x:1,y:1};

        // let canvas = obj.canvas;
        // let ctx = this.ctx;
        // let numrow = obj.numrow || 30 ;
        // let numcol = obj.numcol || 60 ;
        // let space = obj.space || 7;
        // let gravity = {x:0,y:1200};
        // // this.gravity = obj.gravity || {x:0,y:1200};
        // let tear_distance = obj.tear_distance || 50;
        // let mouse_influence = obj.mouse_influence || 10;
        // let mouse_cut = obj.mouse_cut || 5;
        // let render_times = obj.render_times || 3;
        // let points = [];
        // let mouse = this.mouse;
        // let start;
        // obj.start?start=obj.start: start={x:0,y:0};
            this.bindEvent = function(canv){
                let canva = canvas || canv;
                // let that = this;
                canva.addEventListener("mousedown",function(e){
                    mouse.button = e.which;
                    mouse.perv_x = mouse.x;
                    mouse.perv_y = mouse.y;
                    var rect = canvas.getBoundingClientRect();//返回元素大小及其相对于视口的位置
                    mouse.x = e.clientX - rect.left;
                    mouse.y = e.clientY - rect.top;
                    mouse.down = true;
                    e.preventDefault();
                });

                canva.addEventListener("mouseup",function(e){
                    mouse.down = false;
                        e.preventDefault();
                });
                canva.addEventListener("mousemove",function(e){
                    mouse.button = e.which;
                    mouse.perv_x = mouse.x;
                    mouse.perv_y = mouse.y;
                    var rect = canvas.getBoundingClientRect();//返回元素大小及其相对于视口的位置
                    mouse.x = e.clientX - rect.left;
                    mouse.y = e.clientY - rect.top;
                    e.preventDefault();
                });
                canva.addEventListener("contextmenu",function(e){
                        e.preventDefault();

                });
                return this;
            };

        /*
        *Class Point(position-x,position-y)
        */
        this.Point = function(x,y){
            this.x = x;
            this.y = y;
            this.perv_x = x;
            this.perv_y = y*.99;
            this.pin_x = null;
            this.pin_y = null;
            //acceleration 加速度
            let gra = gravity;
            // console.log(gra);
            this.acce_x = gra.x;
            this.acce_y = gra.y;

            this.constraints = [];
            //this.grain
        };

        this.Point.prototype.renderConstraints = function(){
            for(let i=0 ; i<this.constraints.length;i++){
                this.constraints[i].render();
            }
        };

        this.Point.prototype.renderGravity = function(delta){
            if(mouse.down){
                // console.log('asasa');
                let dist_x = this.x - mouse.x;
                let dist_y = this.y - mouse.y;
                let dist = Math.sqrt(dist_x*dist_x + dist_y*dist_y);
                if(mouse.button==1){
                    if(dist < mouse_influence){
                        this.perv_x = this.x - (mouse.x - mouse.perv_x);
                        this.perv_y = this.y - (mouse.y - mouse.perv_y);
                    }
                }else{
                    if(dist < mouse_cut){
                        this.constraints = [];
                    }
                }
            }

            this.acce_x = gravity.x;
            this.acce_y = gravity.y;
            delta *= delta;
            let next_x = this.x + (this.x - this.perv_x) + this.acce_x * delta *0.5;
            let next_y = this.y + (this.y - this.perv_y) + this.acce_y * delta *0.5;
            // console.log("next_x", this.x - this.perv_x)
            this.perv_x = this.x;
            this.perv_y = this.y;

            this.x = next_x;
            this.y = next_y;

            if(this.pin_x !=null && this.pin_y!=null){
                this.x = this.pin_x;
                this.y = this.pin_y;
            } 

        };

        this.Point.prototype.draw = function(){
            for(let i=0;i<this.constraints.length;i++){
                this.constraints[i].draw();
            }
        };

        this.Point.prototype.pin = function(x,y){
            this.pin_x = x ;
            this.pin_y = y ;
        };

        this.Point.prototype.removeConstraint = function(constraint){
            this.constraints.splice(this.constraints.indexOf(constraint),1);
        };



        /*
        *Class Constraint (a-point,another-point)
        */
        this.Constraint = function(pa,pb){
            this.pa = pa;
            this.pb = pb;
        }
        this.Constraint.prototype.render = function(){
            let dist_x = this.pb.x - this.pa.x;
            let dist_y = this.pb.y - this.pa.y;
            let dist = Math.sqrt(dist_x*dist_x + dist_y*dist_y);
            let fibreForce =  (space - dist)/dist;
            if(dist > tear_distance){
                this.pb.removeConstraint(this);
                return;
            }
            // console.log("dist_x",dist_x);
            let dx = dist_x * fibreForce * 0.6;//useed to be 0.5 , simulate bounce
            let dy = dist_y * fibreForce * 0.6;
            /*纤维使间距尽量维持在space大小*/
            this.pa.x -= dx;
            this.pa.y -= dy;
            this.pb.x += dx;
            this.pb.y += dy;
        };

        this.Constraint.prototype.draw = function(){
            ctx.moveTo(this.pa.x , this.pa.y);
            ctx.lineTo(this.pb.x , this.pb.y);
        };



        // for(let y=0 ; y <= this.numrow ;y++){
        // 	this.points[y] = [];
        // 	for(let x=0;x <= this.numcol ;x++ ){
                
        // 		let point = new this.Point(x*this.space , y*this.space);
        // 		this.points[y].push(point);

        // 		x!=0 && point.constraints.push(this.points[y][x-1],point);
        // 		y!=0 && point.constraints.push(this.points[y-1][x], point);
        // 		y==0 && point.pin(x*this.space , y*this.space);
        // 	}
        // }

    
    }

    init(){
        for(let y=0 ; y <= this.numrow ;y++){
            this.points[y] = [];
            for(let x=0;x <= this.numcol ;x++ ){
                
                let point = new this.Point(this.start.x+x*this.space , this.start.y+y*this.space);
                this.points[y][x] = point;

                x!=0 && point.constraints.push(new this.Constraint(this.points[y][x-1],point));
                y!=0 && point.constraints.push(new this.Constraint(this.points[y-1][x], point));
                y==0 && point.pin(point.x , point.y);
            }
        }
        return this;
    }

    update(){
        for(let i=0;i<this.render_times;i++){
            // console.log(i);
            for(let y=0;y<=this.numrow;y++){
                for(let x=0 ; x<=this.numcol;x++){
                    this.points[y][x].renderConstraints();
                }
            }
        }

        for(let y=0 ; y<=this.numrow;y++){
            for(let x = 0 ; x<=this.numcol ; x++){
                this.points[y][x].renderGravity(0.02);//0.016
            }
        }
        
    }

    draw(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if(this.filltype=="color"){
            // this.ctx.save();

            for(let y=1;y<=this.numrow;y++){
                for(let x=1;x<=this.numcol;x++){
                    // this.points[y][x].drawGrain();
                    let p1 = this.points[y-1][x-1];
                    let p2 = this.points[y-1][x];
                    let p3 = this.points[y][x-1];
                    let p4 = this.points[y][x];
                        // console.log(p4.constraints[0].pa.constraints);

                    if(p4.constraints.length<2)continue;
                    if(!(p4.constraints[0].pa.constraints.length && p4.constraints[1].pa.constraints.length))continue;
                    if(p4.constraints[0].pa.constraints[p4.constraints[0].pa.constraints.length-1].pa == p4.constraints[1].pa.constraints[0].pa){
                        
                        this.ctx.beginPath();
                        this.ctx.fillStyle = this.fillcolor;
                        this.ctx.moveTo(p1.x , p1.y);
                        this.ctx.lineTo(p2.x , p2.y);
                        this.ctx.lineTo(p4.x , p4.y);
                        this.ctx.lineTo(p3.x , p3.y);

                        this.ctx.fill();
                    }
                }
            }//for y numrow
            // this.ctx.restore();
        }
        if(this.filltype=="glass"){
            this.ctx.save();

            let tempCanvas = document.createElement("canvas");
            tempCanvas.width = this.canvas.width;
            tempCanvas.height = this.canvas.height;
            let tempCtx = tempCanvas.getContext("2d");

            for(let y=1;y<=this.numrow;y++){
                for(let x=1;x<=this.numcol;x++){
                    // this.points[y][x].drawGrain();
                    let p1 = this.points[y-1][x-1];
                    let p2 = this.points[y-1][x];
                    let p3 = this.points[y][x-1];
                    let p4 = this.points[y][x];
                        // console.log(p4.constraints[0].pa.constraints);

                    if(p4.constraints.length<2)continue;
                    if(!(p4.constraints[0].pa.constraints.length && p4.constraints[1].pa.constraints.length))continue;
                    if(p4.constraints[0].pa.constraints[p4.constraints[0].pa.constraints.length-1].pa == p4.constraints[1].pa.constraints[0].pa){
                        
                        tempCtx.beginPath();
                        tempCtx.fillStyle = this.fillcolor;
                        tempCtx.moveTo(p1.x , p1.y);
                        tempCtx.lineTo(p2.x , p2.y);
                        tempCtx.lineTo(p4.x , p4.y);
                        tempCtx.lineTo(p3.x , p3.y);

                        tempCtx.fill();
                    }
                }
            }//for y numrow
            this.ctx.drawImage(tempCanvas ,0,0,this.canvas.width , this.canvas.height);
            this.ctx.globalCompositeOperation = "source-in";
            this.ctx.drawImage(this.img , 0 , 0 , this.canvas.width , this.canvas.height);
            this.ctx.restore();
        }
        if(!this.doGrain){
            this.ctx.beginPath();
            this.ctx.lineWidth = this.space*.1;
            this.ctx.strokecolor="#ff0";
            for(let y=0 ; y<=this.numrow;y++){
                for(let x = 0 ; x<=this.numcol ; x++){
                    this.points[y][x].draw();
                }
            }
            this.ctx.stroke();
        }
        if(this.doGrain && this.filltype!="color" && this.filltype!="glass"){
            // let imgWidth = this.img.width/this.numcol;
            // let imgHeight = this.img.height/this.numrow;
            for(let y=1;y<=this.numrow;y++){
                for(let x=1;x<=this.numcol;x++){
                    // this.points[y][x].drawGrain();
                    let p1 = this.points[y-1][x-1];
                    let p2 = this.points[y-1][x];
                    let p3 = this.points[y][x-1];
                    let p4 = this.points[y][x];
                        // console.log(p4.constraints[0].pa.constraints);

                    if(p4.constraints.length<2)continue;
                    if(!(p4.constraints[0].pa.constraints.length && p4.constraints[1].pa.constraints.length))continue;
                    if(p4.constraints[0].pa.constraints[p4.constraints[0].pa.constraints.length-1].pa == p4.constraints[1].pa.constraints[0].pa){
                        this.ctx.save();
                        this.ctx.setTransform(p2.x-p1.x , p2.y-p1.y ,p3.x-p1.x, p3.y-p1.y ,p1.x,p1.y);
                        // this.ctx.putImageData(p1.grain,p1.x,p1.y);
                        
                        //worst way to fill pure color 
                        if(this.filltype=="color"){
                            this.ctx.fillRect(0,0,this.pand.x,this.pand.y);
                        }
                        
                        else if(this.renderType ==1){

                            // this.ctx.drawImage(this.img , p1.x,p1.y,this.space,this.space,0,0,this.pand.x,this.pand.y  );
                            // this.ctx.setTransform(p2.x-p3.x , p2.y-p3.y ,p4.x-p3.x , p4.y-p3.y,p3.x,p3.y);
                            // this.ctx.drawImage(this.transImg[x%2],this.numrow*this.space - p3.y , p3.x+p3.y,this.space,this.space,0,0,1,1);
                            this.ctx.drawImage(this.img , p1.x,p1.y,this.space,this.space,0,0,this.pand.x,this.pand.y );
                            this.ctx.setTransform(p2.x-p3.x , p2.y-p3.y ,p4.x-p3.x , p4.y-p3.y,p3.x,p3.y);
                            this.ctx.drawImage(this.img,this.numrow*this.space - p3.y*this.space , p3.x*this.space+p3.y*this.space,this.space*2,this.space*2,0,0,this.pand.x,this.pand.y );
                        
                        }
                        else if(this.renderType ==0){

                            // this.ctx.drawImage(this.transImg[x%2?1:0] , (x-1)*imgWidth,(y-1)*imgHeight,imgWidth,imgHeight,0,0,1.07,1.07 );
                            this.ctx.drawImage(this.halfImg[(x+y)%2?0:1] , (x-1)*this.space,(y-1)*this.space,this.space,this.space,0,0,this.pand.x,this.pand.y );
                            this.ctx.setTransform(p2.x-p3.x , p2.y-p3.y ,p4.x-p3.x , p4.y-p3.y,p3.x,p3.y);
                            this.ctx.drawImage(this.transImg[(x+y)%2],this.numrow*this.space - y*this.space , (x-1)*this.space+y*this.space,this.space,this.space,0,0,this.pand.x,this.pand.y );
                        }
                        this.ctx.restore();
                    }
                }
            }
        }

    }

    async renderGrain(img){
        let image = this.img = img || this.img;
        // console.log(!(image instanceof HTMLImageElement));
        if(!(image instanceof HTMLElement) ){
            throw new Error("renderGrain can only accept html element typed argument");
        }
        if( !(image instanceof HTMLImageElement)  ){
            //USE html to image
            image = this.img = await html2img.toCanvas(image);
            console.log("img" );
        }
        // console.log(image instanceof HTMLImageElement);

        // this.img.width = this.numcol*this.space;
        // this.img.height = this.numrow*this.space;
        this.doGrain = true;

        if(this.filltype=='glass' || this.filltype=='color') return;

        this.transImg = [];
        this.transImg[0] = document.createElement("canvas");
        this.transImg[0].width = this.space * this.numrow;
        this.transImg[0].height = this.space * this.numcol + this.space*this.numrow;
        let imgctx = this.transImg[0].getContext("2d");
        imgctx.transform(0,1,-1,1,this.space * this.numrow,0);
        /*
        *inverse transform(1,-1,1,0,-1*this.space * this.numrow,this.space * this.numrow)
        */
        imgctx.drawImage(image , 0,0,image.width ,image.height , 0,0,this.space * this.numcol,this.space * this.numrow);
        
        this.transImg[1] = document.createElement("canvas");
        this.transImg[1].width = this.space * this.numrow;
        this.transImg[1].height = this.space * this.numcol + this.space*this.numrow;
        let imgctx1 = this.transImg[1].getContext("2d");
        imgctx1.transform(0,1,-1,1,this.space * this.numrow,0);
        imgctx1.drawImage(image , 0,0,image.width ,image.height , 0,0,this.space * this.numcol,this.space * this.numrow);
        
        imgctx.resetTransform();
        imgctx1.resetTransform();
        for(let i=0;i<this.numcol+this.numrow;i++){
            if(!(i%2)){//偶
                imgctx.clearRect(0,i*this.space,this.space*this.numrow,this.space);

                // imgctx.clearRect(i*this.space,0,this.space,this.space*this.numrow);
            }else{
                imgctx1.clearRect(0,i*this.space,this.space*this.numrow,this.space);

                // imgctx1.clearRect(i*this.space,0,this.space,this.space*this.numrow);

            }
        }

        this.halfImg = [];
        this.halfImg[0] = document.createElement("canvas");
        this.halfImg[0].width = this.space * this.numcol ;
        this.halfImg[0].height = this.space*this.numrow;
        imgctx = this.halfImg[0].getContext("2d");
        imgctx.transform(1,-1,1,0,-1*this.space * this.numrow,this.space * this.numrow);
        imgctx.drawImage(this.transImg[0],0,0);

        this.halfImg[1] = document.createElement("canvas");
        this.halfImg[1].width = this.space * this.numcol ;
        this.halfImg[1].height = this.space*this.numrow;
        imgctx = this.halfImg[1].getContext("2d");
        imgctx.transform(1,-1,1,0,-1*this.space * this.numrow,this.space * this.numrow);
        imgctx.drawImage(this.transImg[1],0,0);
        // this.ctx.save();
        // this.ctx.drawImage(image , 0,0,image.width,image.height,0,0,this.numcol*this.space , this.numrow * this.space);
        // // this.ctx.getImageData(0,0,this.numcol*this.space , this.numrow * this.space);
        // for(let y=0;y<this.numrow;y++){
        // 	for(let x=0;x<this.numcol;x++){
        // 		this.points[y][x].grain = this.ctx.getImageData(x*this.space,y*this.space , this.space,this.space);

        // 	}
        // }
        // this.ctx.restore();
    }

}

module.exports = Cloth;









