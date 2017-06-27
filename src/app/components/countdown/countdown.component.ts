import { style } from '@angular/animations';
import { CountDownHand } from './countdown.hand';
import { Timer } from './countdown.timer';
import { CountDownConfig } from './countdown.config';
import { Component, ViewEncapsulation, OnChanges, OnDestroy, Input, Output, EventEmitter, ElementRef, Renderer, OnInit, SimpleChanges } from '@angular/core';

// 参考：https://github.com/cipchk/ngx-countdown
@Component({
    selector: 'bg-countdown',
    templateUrl: './countdown.component.html',
    styleUrls: ['./countdown.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CountDownComponent implements OnInit,OnChanges, OnDestroy {
    @Input() config: CountDownConfig;
    @Output() start = new EventEmitter();
    @Output() finished = new EventEmitter();
    @Output() notify = new EventEmitter();
    cls: string;

    constructor(private el: ElementRef,
        private renderer: Renderer,
        private timer: Timer) {
        this.timer.start();
    }

    ngOnInit() {
        this.init();
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    ngOnChanges(changes: SimpleChanges): void {                
        if (!changes.config.firstChange) {
            this.destroy().init();
        }
    }    

    restart(): void {
        this.destroy().init();
        this.timer.start();
    }

    private frequency: number = 1000;
    private _notify: any = {};
    private hands: CountDownHand[] = [];
    private left: number = 0;

    private init() {
        const me = this;
        const el = me.el.nativeElement;
        me.config = Object.assign(<CountDownConfig>{
            leftTime: 0,
            template: '$!h!时$!m!分$!s!秒',
            size: 'lite',
            effect: 'normal',
            varRegular: /\$\!([\-\w]+)\!/g,
            clock: ['d', 100, 2, 'h', 24, 2, 'm', 60, 2, 's', 60, 2, 'u', 10, 1]
        }, me.config);

        this.cls = `count-down ${me.config.size} ${me.config.className}`;

        // 分析markup
        let tmpl = el.innerHTML || me.config.template;
        me.config.varRegular.lastIndex = 0;
        el.innerHTML = tmpl.replace(me.config.varRegular, (str: string, type: string) => {
            // 时钟频率校正
            if (type === 'u' || type === 's-ext') {
                me.frequency = 100;
            }

            // 生成hand的markup
            let content = '';
            if (type === 's-ext') {
                me.hands.push({ type: 's' });
                me.hands.push({ type: 'u' });
                content = me.html('', 's', 'handlet') + me.html('.', '', 'digital') + me.html('', 'u', 'handlet');
            } else {
                me.hands.push({ type: type });
            }

            return me.html(content, type, 'hand');
        });

        const clock = me.config.clock;
        me.hands.forEach((hand: CountDownHand) => {
            let type = hand.type;
            let base: number = 100;
            let i: number;

            hand.node = el.querySelector(`.hand-${type}`);
            // radix,bits 初始化
            for (i = clock.length - 3; i > -1; i -= 3) {
                if (type === clock[i]) {
                    break;
                }
                base *= clock[i + 1];
            }
            hand.base = base;
            hand.radix = clock[i + 1];
            hand.bits = clock[i + 2];
        });

        me.getLeft();
        me.reflow();

        // 绑定更新时钟到当前me对象
        const _reflow = me.reflow;
        me.reflow = (count: number = 0) => {
            return _reflow.apply(me, [count]);
        };

        // 构建 notify
        if (me.config.notify) {
            me.config.notify.forEach((time: number) => {
                if (time < 1) {
                    throw new Error('由于当结束会调用 finished，所以 notify 通知必须全是正整数');
                }
                time = time * 1000;
                time = time - time % me.frequency;
                me._notify[time] = true;
            });
        }

        me.start.emit();
        me.timer.add(me.reflow, me.frequency);

        // 显示
        el.style.display = 'inline';

        return me;
    }

    private destroy() {
        this.timer.remove(this.reflow);
        return this;
    }

    /**
     * 更新时钟
     * @private
     * @param {number} [count=0] 
     * @memberof CountDownComponent
     */
    private reflow(count: number = 0): void {
        const me = this;
        me.left = me.left - me.frequency * count;

        me.hands.forEach((hand: CountDownHand) => {
            hand.lastValue = hand.value;
            hand.value = Math.floor(me.left / hand.base) % hand.radix;
        });

        me.repaint();

        if (me._notify[me.left]) {
            me.notify.emit(me.left);
        }

        if (me.left < 1) {
            me.finished.emit();
            this.destroy();
        }
    }

    /**
     * 重绘时钟
     * @private
     * @memberof CountDownComponent
     */
    private repaint(): void {
        let me = this;
        if (me.config.repaint) {
            me.config.repaint.apply(me);
            return;
        }

        let content: string;

        me.hands.forEach((hand: CountDownHand) => {
            if (hand.lastValue != hand.value) {
                content = '';
                me.toDigitals(hand.value,hand.bits).forEach((digital:number)=>{
                    content+=me.html(digital.toString(),'','digital');
                });
                hand.node.innerHTML=content;
            }
        });
    }

    /**
     * 获取倒计时剩余帧数
     * @private
     * @memberof CountDownComponent
     */
    private getLeft():void{
        let left:number=this.config.leftTime*1000;
        let end:number=this.config.stopTime;

        if(!left&&end){
            left=end-new Date().getTime();
        }

        this.left=left-left%this.frequency;
    }

    /**
     * 生成需要的html代码，辅助工具
     * @private
     * @param {(string|any[])} con 
     * @param {string} className 
     * @param {string} type 
     * @returns {string} 
     * @memberof CountDownComponent
     */
    private html(con: string | any[], className: string, type: string): string {
        if (con instanceof Array) {
            con = con.join('');
        }

        switch (type) {
            case 'hand':
            case 'handlet':
                className = type + ' hand-' + className;
                break;
            case 'digital':
                if (con === '.') {
                    className = type + ' ' + type + '-point' + className;
                } else {
                    className = type + ' ' + type + '-' + con + ' ' + className;
                }
                break;
        }
        return '<span class="' + className + '">' + con + '</span>';
    }

    /**
     * 把值转换为独立的数字形式
     * @private
     * @param {number} value 
     * @param {number} bits 
     * @returns {number[]} 
     * @memberof CountDownComponent
     */
    private toDigitals(value: number, bits: number): number[] {
        value = value < 0 ? 0 : value;
        let digitals = [];
        // 把时、分、秒等换算成数字
        while (bits--) {
            digitals[bits] = value % 10;
            value = Math.floor(value / 10);
        }
        return digitals;
    }
}