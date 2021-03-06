import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { ButtonModule } from './components/button/button.module';
import { Component, ViewEncapsulation, ViewContainerRef, OnInit } from '@angular/core';

@Component({
    selector: 'app',
    //encapsulation:ViewEncapsulation.None,
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    /**
     * 菜单是否收缩
     * @type {boolean}
     * @memberof AppComponent
     */
    isMenuCollapsed: boolean = false;
    text: string;
    /**
     * 配置是否已初始化
     * @type {boolean}
     * @memberof AppComponent
     */
    optionIsInited: boolean = false;

    constructor(
        private router: Router,
        private titleService: Title,
        private activatedRoute: ActivatedRoute
    ) {
        console.log('初始化组件!');
    }

    /**
     * 初始化应用配置
     * @memberof AppComponent
     */
    public initAppOptions(): void {
        this.optionIsInited = true;

    }
    /**
     * 通知配置
     * @memberof AppComponent
     */
    public notificationsOptions = {
        position: ['top', 'right'],
        timeOut: 300,
        lastOnBottom: true,
        clickToClose: true,
        maxLength: 0,
        maxStack: 5,
        showProgressBar: true,
        pauseOnHover: true,
        preventDuplicates: false,
        preventLastDuplicates: false
    }

    // 程序初始化，关闭加载状态
    public ngAfterViewInit(): void {

    }

    /**
     * 加载图片
     * @private
     * 
     * @memberof AppComponent
     */
    private _loadImages(): void {

    }

    loggedIn() {

    }
    /**
     * 路由检查
     * @memberof AppComponent
     */
    routeCheck() {

    }
    // 初始化时重置路由
    ngOnInit() {
        console.log('Ng初始化事件!');
        // Ng监听路由变化状态：https://segmentfault.com/a/1190000009971757
        this.router.events
            .filter(event => event instanceof NavigationEnd)
            .map(() => this.activatedRoute)
            .map(route=>{
                while(route.firstChild){
                    route=route.firstChild;
                }
                return route;
            })
            .filter(route=>route.outlet==='primary')// 过滤出未命名的outlet,<router-outlet>
            .mergeMap(route=>route.data)// 获取路由配置数据
            .subscribe((event) => {
                console.log('NavigationEnd', event);
                if(event['title']){
                    this.titleService.setTitle('BingNg-'+event.title);
                }
            });
    }

    showSb() {
        this.text = "傻逗";
    }
}