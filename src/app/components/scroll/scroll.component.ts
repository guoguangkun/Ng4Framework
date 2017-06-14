import { style } from '@angular/animations';
import { DomRenderer } from './../common/dom';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
@Component({
    selector:'bing-scroll',
    templateUrl:'./scroll.component.html',
    styleUrls:['./scroll.component.scss'],
    providers:[DomRenderer]
})
export class ScrollComponent implements OnInit,AfterViewInit{
    @ViewChild('scroll') _container:ElementRef;
    @ViewChild('thumb') _thumb:ElementRef;
    @ViewChild('scrollbar') _scrollbar:ElementRef;
    @Input() scrollClass:string;
    thumb:any;
    scrollbar:any;
    scrollHeight: number;
    offsetHeight: number;
    offsetTop: number;
    scrollBarHeight: number;
    scrollTop: number;
    isLoading: boolean;
    isRunning: boolean;
    container:any;
    wrapper:any;
    moveY: number;
    intervalId:any;
    isTouch: boolean;

    isMoz:boolean;
    WHEEL_EV:any;

    constructor(private domRenderer:DomRenderer,private er:ElementRef){}

    ngOnInit() {
        // 检查是否FireFox浏览器
        this.isMoz='MoztTransform' in document.createElement('div').style;
        this.WHEEL_EV=this.isMoz?'DOMMouseScroll':'mousewheel';
    }

    ngAfterViewInit() {
        this.container=this._container.nativeElement;
        this.thumb=this._thumb.nativeElement;
        this.scrollbar=this._scrollbar.nativeElement;
        this.wrapper=this.container.querySelector('.bing-scroll-wrapper');
        this.scrollClass&&this.domRenderer.addClass(this.container,this.scrollClass);
        this.scrollInit();
    }

    onMouseEnter(){
        if(this.scrollTop>0){
            this.scrollbar.style.opacity=1;
        }
        this.isTouch=true;
    }

    onMouseLeave(){
        this.scrollbar.style.opacity=0;
        this.isTouch=false;
    }

    refresh(){
        this.scrollHeight=this.wrapper.offsetHeight;
        this.offsetHeight=this.container.offsetHeight;
        this.offsetTop=0;
        this.scrollTop=this.scrollHeight-this.offsetHeight;
        this.scrollBarHeight=this.scrollbar.offsetHeight;
        this.scrollBarHeight=Math.max(Math.round(this.scrollBarHeight*this.scrollBarHeight/this.wrapper.offsetHeight),8);
        this.thumb.style.height=(this.scrollBarHeight)+'px';
        if(this.scrollTop>0&&this.isTouch){
            this.scrollbar.style.opacity=1;
        }else if(this.scrollTop<=0){
            this.scrollbar.style.opacity=0;
            this.reset();
        }
    }

    reset(){
        this.moveY=0;
        this.domRenderer.setTransform(this.thumb,'translate3d(0,0px,0)');
        this.domRenderer.setTransform(this.wrapper,'translate3d(0,'+this.moveY+'px,0)');
    }

    move(y:number){
        if(this.scrollTop>0){
            this.moveY+=y;
            // 计算滚动条滚动的高度
            if(this.moveY>=0){
                this.moveY=0;
            }else if(Math.abs(this.moveY)>=this.scrollTop){
                this.moveY=-this.scrollTop;
            }else{
                this.moveY=this.moveY;
            }
            let sv=this.moveY/this.scrollTop*(this.scrollbar.offsetHeight-this.scrollBarHeight);
            sv=-Math.floor(sv);
            this.domRenderer.setTransform(this.thumb,'translate3d(0,'+sv+'px,0)');
            this.domRenderer.setTransform(this.wrapper,'translate3d(0,'+this.moveY+'px,0)');
        }        
    }

    onWheel(e:any){
        let wheelDeltaX;
        let wheelDeltaY;
        if('wheelDeltaX' in e){// 向下滚动是负数-120，向上滚动是正数120
            wheelDeltaX=e.wheelDeltaX/12;
            wheelDeltaY=e.wheelDeltaY/12;
        }else if('wheelDelta' in e){
            wheelDeltaX=wheelDeltaY=e.wheelDelta/12;
        }else if('detail' in e){// 向下滚动是正数3，向上滚动是负数-3
            wheelDeltaX=wheelDeltaY=-e.detail*3;
        }else{
            return;
        }
        if(!this.isLoading){
            this.isRunning=true;
            this.move(wheelDeltaY);
        }
    }

    scrollInit(){
        this.moveY=0;
        this.domRenderer.setTransitionDuration(this.thumb,300);
        this.domRenderer.addPrefix(this.thumb,'transition','transform 400ms cubic-bezier(0.33,0.66,0.66,1)');
        this.domRenderer.addPrefix(this.scrollbar,'transition','all 350ms cubic-bezier(0.33,0.66,0.66,1)');
        this.refresh();
        this.intervalId=setInterval(function($this:any){
            $this.refresh();
        },10,this)
    }    
}