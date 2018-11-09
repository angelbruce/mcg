Date.prototype.toLong = function () {
    var year = this.getFullYear();
    var month = this.getMonth();
    var date = this.getDate();
    var hour = this.getHours();
    var minute = this.getMinutes();
    var second = this.getSeconds();

    return year.toString().padLeft(4, '0') + '/'
        + (month + 1).toString().padLeft(2, '0') + '/'
        + date.toString().padLeft(2, '0') + ' '
        + hour.toString().padLeft(2, '0') + ':'
        + minute.toString().padLeft(2, '0') + ':'
        + second.toString().padLeft(2, '0');
}

String.prototype.padLeft = function (width, char) {
    if (this.length > width) return;
    var delta = width - this.left;
    var str = this.toString();
    for (var i = 0; i < delta; i++) str = char + str;
    return str;
}

angular.module('com.abl.drag', [])
    .directive('drag', ['$document', function (doc) {
        return {
            restrict: 'AE',
            link: function ($scope, elem, attr) {
                var old = { x: 0, y: 0 };
                var opos = { x: 0, y: 0 };
                var emove = $(elem);
                var moving = false;
                emove.on("mousedown", function (event) {
                    if (moving) return;
                    moving = true;
                    old = { x: event.pageX, y: event.pageY };
                    opos = { left: emove.offset().left, top: emove.offset().top };
                    doc.on("mousemove", mousemove);
                    emove.on("mousemove", mousemove);
                    emove.css('cursor', 'move');
                });

                doc.on("mouseup", function () {
                    moving = false;
                    doc.off("mousemove", mousemove);
                    emove.off("mousemove", mousemove);
                    emove.css('cursor', 'default');
                });

                function mousemove(event) {
                    if (!moving) return;
                    var x = event.pageX - old.x;
                    var y = event.pageY - old.y;
                    var size = { x: x, y: y }

                    emove.css({ left: opos.left + size.x, top: opos.top + size.y });
                    $scope.$emit('moving', { size: size, scope: $scope, element: emove });
                    return false;
                }
            }
        };
    }])

    .directive('resize', ['$document', function ($document) {
        return {
            restrict: 'EA',
            scope: {
                host: '=',
            },
            controller: ['$scope', '$element', '$document', function (scope, elem, doc) {
                var esize = $(elem);
                var host = $(scope.host);
                var sizing = false;
                var old = { x: 0, y: 0 };
                var osize = { width: 0, height: 0 };

                esize.on("mousedown", function (event) {
                    if (sizing) return;
                    sizing = true;
                    old = { x: event.pageX, y: event.pageY };
                    osize = { width: host.width(), height: host.height() };
                    doc.on("mousemove", mousemove);
                    esize.on("mousemove", mousemove);

                    return false;
                });

                doc.on("mouseup", function () {
                    sizing = false;
                    doc.off("mousemove", mousemove);
                    esize.off("mousemove", mousemove);
                });

                function mousemove(event) {
                    if (!sizing) return;
                    var x = event.pageX - old.x;
                    var y = event.pageY - old.y;
                    var size = { x: x, y: y }
                    host.css({ width: osize.width + size.x, height: osize.height + size.y });
                    scope.$emit('resize', { size: size, scope: scope, element: host });
                    return false;
                }
            }]
        };
    }])

    .directive('time', ['$interval', function ($interval) {
        return {
            restrict: 'EA',
            link: function ($scope, elem) {
                var e = $(elem);
                $interval(function () {
                    var date = new Date();
                    var value = date.toLong();
                    e.html(value);
                }, 1000);
            },
        };
    }])

    .directive('search', function () {
        return {
            restrict: 'EA',
            link: {
            },
            controller: function ($scope) {
                var scope = $scope;
                scope.search = function () { }
            },
            template: '<div class="search"><input type="text" placeholder="请输入内容" /><img src="../imgs/search.png" /></div>'
        };
    })

    .directive('dialog', ['$timeout', function (timer) {
        return {
            restrict: 'EA',
            scope: { item: '=' },
            link: function ($scope, elem, $timeout) {
                var e = $($(elem).find('.win'));
                var t = e.find(".win-body")
                timer(function () {
                    e.css({ top: 30, left: 0, height: $(window).height() - 60 });
                    t.css({ height: e.height() - 60 });
                }, 0);
            },
            controller: ['$scope', '$element', '$document', function (scope, elem, $document) {
                var states = { closed: -1, minimized: 0, normal: 1, maximized: 2 }
                var item = scope.item;
                item.state = states.maximized;
                item.location = { width: '', height: '', left: '', top: '' }
                var e = $($(elem).find('.win'));
                var t = e.find(".win-body");
                scope.host = e;
                scope.last = states.maximized;

                scope.toggleSize = function () {
                    toggle(item.state, item.state == states.maximized ? states.normal : states.maximized);
                }

                function toggle(from, to) {
                    if (from == states.normal)
                        item.location = { width: e.width(), height: e.height(), left: e.offset().left, top: e.offset().top };

                    switch (to) {
                        case states.minimized:
                            break;

                        case states.maximized:
                            e.removeClass('win-normal').removeClass('win-max');
                            e.addClass('win-max').css({ top: 30, left: 0, height: $(window).height() - 60, width: "100%" });
                            setState();
                            scope.last = to;
                            break;

                        case states.normal:
                            e.removeClass('win-normal').removeClass('win-max');
                            if (!item.location.width) e.addClass('win-normal');
                            else e.css(item.location);
                            setState();
                            scope.last = to;
                            break;
                    }

                    item.state = to;
                    scope.$emit('dialog-state', scope)
                    return false;
                }

                scope.$on('dialog-toggle', function (d, data) {
                    if (data.name != scope.item.name) return;
                    var to = data.state != states.minimized ? states.minimized : scope.last;
                    toggle(data.state, to);
                    return false;
                });

                scope.$on('dialog-change-state', function (d, data) {
                    console.log(data)
                    var item = data[0], to = data[1];
                    if (item.name != scope.item.name) return;
                    var from = item.state;
                    toggle(from, to);
                })

                scope.$watch('item.focused', function (newVal, oldVal) {
                    if (newVal == undefined) return;
                    if (newVal == true) e.css({ "z-index": "101" })
                    else e.css({ "z-index": "100" })
                });

                scope.$on('resize', setState);
                scope.focus = function () { scope.$emit('dialog-focus', scope); return false; }
                scope.close = function () { scope.$emit('dialog-close', scope); return false; }
                scope.minimize = function () {
                    scope.item.state = 0;
                    return false;
                }

                scope.getZIndex = function () { return scope.item.focused ? 101 : 100; }

                function setState(d, data) { if (data) t.css({ height: e.height() - 60 }); }
            }],
            template:
                '  <div class="win win-max" ng-click="focus(item)" drag  ng-show="item.state>0">' +
                '       <div class="win-header" ng-dblclick="toggleSize()" >                                           ' +
                '           <div class="left"><img ng-src="{{item.img}}" /></div>          ' +
                '           <div class="left"><span>{{item.title}}</span></div>            ' +
                '           <div class="right topres" resize host="host"><img src="../imgs/size.png" /></div>' +
                '           <div class="right close" ng-click="close(item)">               ' +
                '               <img src="../imgs/close.png" />                            ' +
                '           </div>                                                         ' +
                '           <div class="right"><img ng-click="toggleSize()" src="../imgs/max.png" /> </div>       ' +
                '           <div class="right"><img ng-click="minimize()" src="../imgs/mini.png" /> </div>       ' +
                '       </div>                                                             ' +
                '       <div class="win-body">                                             ' +
                '           <iframe style="border:0;" ng-src="{{item.url}}"></iframe>      ' +
                '       </div>                                                             ' +
                '       <div class="win-footer"><div class="left message">{{item.desc}}</div><div class="size right" host="host" resize><img src="../imgs/size.png" /></div></div>                                     ' +
                '   </div>'
        };
    }])

    .directive('contextmenu', [function () {
        return {
            restrict: 'EA',
            scope: {
                item: "=",
            },
            controller: ['$scope', '$element', '$document', function ($scope, elem, doc) {
                var scope = $scope;
                var e = $(elem);
                var menu = e.find('.menu');

                e.on('contextmenu', function () {
                    var menu = e.find('.menu');
                    menu.removeClass('menu-open').addClass('menu-open').show();
                    return false;
                });

                doc.on('click', function () {
                    var menu = e.find('.menu');
                    menu.removeClass('menu-open').hide();
                });

                scope.menuitem = function ($event, item, state) {
                    scope.$emit('on-menu-item', [item, state]);
                    menu.removeClass('menu-open').hide();
                    $event.stopPropagation();
                    return false;
                }
            }],
            transclude: true,
            template: '<div><div ng-transclude /><div class="menu"><div class="menu-item" ng-click="menuitem($event,item,2)">最大化</div><div class="menu-item" ng-click="menuitem($event,item,0)">最小化</div><div ng-click="menuitem($event,item,-1)" class="menu-item">关闭</div></div></div>'
        };
    }])
    ;

var app = angular.module('com.abl.main', ['com.abl.drag']);
app.controller('main', ['$scope', '$http', '$sce', function (scope, http, sce) {
    scope.fns = getFunctions() || [];
    angular.forEach(scope.fns, function (fn) { fn.url = sce.trustAsResourceUrl(fn.url); });

    scope.tasks = [];

    scope.setItem = { name: 'setting', img: '../imgs/setting.png', title: '配置管理', url: 'admin/setting.htm' }

    scope.open = function (fn) {
        var tasks = scope.tasks;
        if (tasks.indexOf(fn) != -1) {
            scope.$broadcast('dialog-toggle', fn);
            return;
        }

        scope.tasks.push(fn);
    }

    scope.setting = function() {
        var item = scope.setItem;
        if(scope.tasks.indexOf(item) != -1) return;
        scope.tasks.push(item);
    };

    scope.toggle = function (item) {
        scope.$broadcast('dialog-toggle', item);
        if (item.state > 0) {
            focus(item);
        }
    }

    scope.$on('dialog-close', function (d, data) {
        if (!data.item) return;

        close(data.item);
    });

    scope.$on('dialog-focus', function (d, data) {
        focus(data.item);
    })

    scope.$on('on-menu-item', function (d, data) {
        console.log(data)
        if (data[1] == -1) close(data[0]);
        scope.$broadcast('dialog-change-state', data)
    })

    scope.resetAll = function () {
        var opened = false;
        for (var i = 0; i < scope.tasks.length; i++) {
            if (scope.tasks[i].state > 0) {
                opened = true;
                break;
            }
        }

        if (opened) {
            angular.forEach(scope.tasks, function (item) {
                item.state = 0;
            });
        }
        else {
            angular.forEach(scope.tasks, function (item) {
                scope.$broadcast('dialog-toggle', item);
            });
        }
    }

    function focus(item) {
        if (item == null) return;
        angular.forEach(scope.fns, function (value) {
            value.focused = item.name == value.name;
        });
    }

    function close(item) {
        for (var i = 0; i < scope.tasks.length; i++) {
            var task = scope.tasks[i];
            if (task.name == item.name) {
                scope.tasks.splice(i, 1);
            }
        }
    }
}]);


function getFunctions() {
    return [
        { name: 'computer', img: '../imgs/computer.png', title: '我的电脑', url: 'https://baidu.com' },
        { name: 'image', img: '../imgs/image.png', title: '我的照片', url: 'https://photo.baidu.com' },
        { name: 'music', img: '../imgs/music.png', title: '我的音乐', url: 'https://music.baidu.com' },
        { name: 'travel', img: '../imgs/travel.png', title: '我的行程', url: 'https://baidu.com' },
        { name: 'plan', img: '../imgs/plan.png', title: '我的计划', url: 'https://cn.bing.com/' },
        { name: 'card', img: '../imgs/card.png', title: '我的卡片', url: 'https://www.apache.org/index.html#projects-list' },
        { name: 'tel', img: '../imgs/tel.png', title: '我的电话', url: 'https://baidu.com' },
        { name: 'stat', img: '../imgs/stat.png', title: '统计分析', url: 'http://www.echartsjs.com/examples/editor.html?c=bar3d-global-population&gl=1' },
        { name: 'email', img: '../imgs/email.png', title: '我的邮箱', url: 'http://mail.linkright.com.cn' },
        { name: 'recycle', img: '../imgs/recycle.png', title: '回收站', url: 'https://360.cn' },
    ];
}

$(function () {
    $(window).resize(resize);
    resize();
});

function resize() {
    var win = $(window), lb = $('.toolbar'), tb = $('.taskbar'), ct = $('.content');
    var ww = win.width(), wh = win.height(), lw = lb.width(), lh = lb.height(), tw = tb.width(), th = tb.height();
    ct.css('height', wh - th - lh);
}
