import { DomRenderer } from './../common/dom';
import { Component, OnInit, AfterViewInit, Input, Renderer2, ElementRef } from '@angular/core';
@Component({
    selector:'bing-badge',
    templateUrl:'./badge.component.html',
    providers:[DomRenderer]
})
export class BadgeComponent implements OnInit,AfterViewInit{
    @Input() content:string;
    @Input() up:boolean;

    constructor(private renderer2:Renderer2,private domRenderer:DomRenderer,private er:ElementRef){}

    ngOnInit() {        
    }

    ngAfterViewInit() {
        const container=this.er.nativeElement;
        const parent=this.renderer2.parentNode(container);
        const position=this.domRenderer.getStyle(container,'position');
        if(!position||position==='static'){
            this.renderer2.setStyle(parent,'position','relative');
        }
    }
}