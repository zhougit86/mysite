/**
 * Created by taozh on 2016/3/14.
 */
var TSAUtil = {
    _currentDate: new Date(),
    getDaysToNow: function (date) {
        return TSAUtil.getTwoDateDays(TSAUtil._currentDate, date);
    },
    getTwoDateDays: function (d1, d2) {
        var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        return Math.abs(Math.round(Math.abs((d1 - d2 ) / (oneDay))));
    },
    insertFirst: function (parent, ele) {
        parent.insertBefore(ele, parent.firstChild);
    },
    initFrameWork: function (aside, handler, context) {
        //z.ajax.loadFile("../static/libs/altskins/skin-green-light.css");
        //z.dom.cls(document.body, "skin-green-light sidebar-mini fix-header");
        var loaded = {};
        var f;
        if (handler) {
            f = function (type) {
                loaded[type] = true;
                if (loaded["header"] === true) {
                    if (aside == null || loaded["aside"] === true) {
                        handler.apply(context, []);
                    }
                }

            };
        }
        TSAUtil.loadPageHeader(f);
        if (aside) {
            TSAUtil.loadPageAside(aside, f);
        }
        TSAUtil.loadPageFooter(f);

    },
    loadPageHeader: function (handler, context) {
        /*   var tsa_sidebar_collapse = z.browser.getCookie("tsa_sidebar_collapse");
           if (tsa_sidebar_collapse) {
               z.dom.cls(document.body, "sidebar-collapse");
           }
           console.log(tsa_sidebar_collapse);*/
        z.ajax.get("../static/modules/framework/header.html", {
            dataType: "html",
            complete: function (result, success, timeout) {
                if (success && !timeout) {
                    var header = z.dom.create("header", "main-header");
                    header.innerHTML = result;
                    TSAUtil.insertFirst(document.body, header);
                    if (handler) {
                        handler.apply(context, ["header"]);
                    }
                    z.event.onclick("#loginBtn", function () {
                       DomUtil.showModalPage("../static/modules/framework/login.html","登录",230,false);
                    });
                    z.event.onclick(".sidebar-toggle", function () {
                        z.dom.toggleClass(document.body, "sidebar-collapse");
                        //z.browser.setCookie("tsa_sidebar_collapse", z.dom.hasClass(document.body, "sidebar-collapse"))
                    });
                }
            }
        });
    },
    loadPageAside: function (current, handler, context) {
        z.ajax.get("../static/modules/framework/aside.html", {
            dataType: "html",
            complete: function (result, success, timeout) {
                if (success && !timeout) {
                    var aside = z.dom.create("aside", "main-sidebar");
                    aside.innerHTML = result;
                    TSAUtil.insertFirst(document.body, aside);
                    if (handler) {
                        handler.apply(context, ["aside"]);
                    }
                    TSAUtil.__initAsideExpandController();
                    if (current) {
                        var menu = z.dom.get("#menu_" + current);
                        if (menu) {
                            z.dom.cls(menu, "active");
                            var treeView = TSAUtil.__getTreeView(menu);
                            TSAUtil.__expandTreeView(treeView, false);
                        }
                    }
                }
            }
        });
    },
    __initAsideExpandController: function () {
        z.event.onclick(".treeview>a", function (event) {
            var treeView = TSAUtil.__getTreeView(z.event.getTarget(event));
            if (treeView) {
                if (!z.dom.hasClass(treeView, "expand")) {
                    z.dom.removeClass(".treeview", "expand");
                    TSAUtil.__expandTreeView(treeView, true);
                } else {
                    //z.dom.removeClass(treeView, "expand");
                    TSAUtil.__animateTreeViewCollapse(treeView);
                }
            }
        });
    },
    __expandTreeView: function (treeView, animate) {
        var parent = treeView;
        var index = 0;
        while (parent && parent !== document) {
            if (z.dom.hasClass(parent, "treeview")) {
                z.dom.cls(treeView, "expand");
                if (index === 0 && animate === true) {
                    TSAUtil.__animateTreeViewExpand(parent);
                }
                parent = parent.parentNode;
                index++;
            } else {
                return;
            }
        }
    },
    __animateTreeViewCollapse: function (treeView) {
        var subMenu = z.dom.get(".treeview-menu", treeView);
        if (subMenu) {
            var height = subMenu.offsetHeight;
            var step = height / 8;
            z.dom.css(subMenu, "height", height + "px");
            z.dom.css(subMenu, "overflow", "hidden");
            z.animation.animate({
                duration: 5000,
                step: function (process, index) {
                    height -= step;
                    z.dom.css(subMenu, "height", height + "px");
                    if (height <= 0) {
                        z.dom.css(subMenu, "height", "");
                        z.dom.css(subMenu, "overflow", "");

                        z.dom.removeClass(treeView, "expand");

                        return false;
                    }
                }
            });
        }
    },
    __animateTreeViewExpand: function (treeView) {
        var subMenu = z.dom.get(".treeview-menu", treeView);
        if (subMenu) {
            var height = 0;
            var offsetHeight = subMenu.offsetHeight;
            var step = offsetHeight / 8;
            z.dom.css(subMenu, "height", height + "px");
            z.dom.css(subMenu, "overflow", "hidden");
            z.animation.animate({
                duration: 5000,
                step: function (process, index) {
                    height += step;
                    z.dom.css(subMenu, "height", height + "px");
                    if (height >= offsetHeight) {
                        z.dom.css(subMenu, "height", "");
                        z.dom.css(subMenu, "overflow", "");
                        return false;
                    }
                }
            });
        }
    },
    __getTreeView: function (ele) {
        var parent = ele;
        while (parent && parent !== document) {
            if (z.dom.hasClass(parent, "treeview")) {
                return parent;
            }
            parent = parent.parentNode;
        }
        return null;
    },
    loadPageFooter: function (handler, context) {
        z.ajax.get("../static/modules/framework/footer.html", {
            dataType: "html",
            complete: function (result, success, timeout) {
                if (success && !timeout) {
                    var aside = z.dom.create("footer", "main-footer");
                    aside.innerHTML = result;
                    document.body.appendChild(aside);
                    //TSAUtil.insertFirst(document.body, aside);
                    if (handler) {
                        handler.apply(context, ["footer"]);
                    }
                }
            }
        });
    }
};