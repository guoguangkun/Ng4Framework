import { ShrinkItemComponent } from './shrink-item.component';
import { DomRenderer } from './../common/dom';
import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
@Component({
    selector:'bing-shrink',
    templateUrl:'./shrink.component.html',
    styleUrls:['./shrink.component.scss'],
    providers:[DomRenderer]
})
export class ShrinkComponent implements OnInit,AfterViewInit{
    expanded:boolean;
    @Input() reverse:boolean;
    @Input() menus:any;
    @Input() type='horizontal';
    itemWidth:any;
    distance:number;
    delay:any;
    direction:string;
    angle:number;
    @ViewChild('btn') _btn:ElementRef;
    @ViewChild('container') _container:ElementRef;
    @ViewChildren(ShrinkItemComponent) items:QueryList<ShrinkItemComponent>;
    _items:any;
    btn:HTMLDivElement;
    container:HTMLDivElement;

    constructor(private domRenderer:DomRenderer){}

    ngOnInit() {
        this.reverse=false;
        this.distance=10;        
    }

    ngAfterViewInit() {
        this.btn=this._btn.nativeElement;
        this.container=this._container.nativeElement;
        this._items=this.items.toArray();
        this.itemWidth=this.btn.offsetWidth;
        const type=this.type.split('-');
        if(type[1]&&type[1]==='reverse'){
            this.type=type[0];
            this.reverse=true;
        }
    }
    
    toggle(){
        if(this.expanded){
            this.close();
        }else{
            this.open();
        }
    }

    open(){
        const op=this.reverse?'-':'';
        this.domRenderer.addClass(this.btn,'burge-open');
        switch(this.type){
            case 'horizontal':
                for(let i=0;i<this._items.length;i++){
                    const x=op+((this.itemWidth+this.distance)*(i+1))+'px';
                    this._items[i].itemStyle={'top':'0px','opacity':1,'left':x};
                }
                break;
            case 'vertical':
                for(let i=0;i<this._items.length;i++){
                    const x=op+((this.itemWidth+this.distance)*(i+1))+'px';
                    this._items[i].itemStyle={'left':'0px','opacity':1,'top':x};
                }
                break;
            case 'circle':
                const r=this.itemWidth+this.distance;
                const dir={
                    lt:-180,
                    lb:90,
                    rt:-90,
                    rb:0                    
                };
                const rotation=dir[this.direction];
                this.delay=parseInt(this.delay,10);
                for(let i=0;i<this._items.length;i++){
                    if(this.delay){
                        this._items[i].intervalId=setInterval(function(){
                            this.anim(i,rotation,r);
                        },this.delay*i);
                        this.domRenderer.transitionEnd(this.items[i],function(){
                            clearInterval(this.intervalId);
                        });
                    }else{
                        this.anim(i,rotation,r);
                    }
                }
                break;
        }
        this.expanded=true;
        this.domRenderer.addClass(this.container,'suspend-expanded');
    }

    anim(i:number,rotation:any,r:any){
        // -180/左上(lt)、 90/左下(lb)、-90/右上(rt)、0/右下(rb)
        const angle=(this.angle*i-rotation)/180*Math.PI;
        let x=Math.sin(angle)*r;
        let y=Math.cos(angle)*r;
        x=parseFloat(x.toFixed(3));
        y=parseFloat(y.toFixed(3));
        const xy='translate('+x+'px,'+y+'px)';
        this.domRenderer.setTransform(this._items[i],xy);
        this._items[i].style.top='0px';
        this._items[i].style.opacity=1;
    }

    close(){
        switch(this.type){
            case 'horizontal':
            case 'vertical':
            case "circle":
                for(let i=0;i<this.items.length;i++){
                    this._items[i].itemStyle={'left':'0px','opacity':0,'top':'0px'};                
                }
                break;
        }
        this.expanded=false;
        this.domRenderer.removeClass(this.btn,'burge-open');
        this.domRenderer.removeClass(this.container,'suspend-expanded');
    }
}