/**
 * Created by taozh on 2016/2/28.
 */
var GridConfig = function (module) {
    this.module = module;
    this._columnSortOrder = {};
    this._page_size = 20;
    if (module) {
        var ps = z.browser.getCookie(this.module + "_page-size");
        if (ps) {
            this._page_size = parseInt(ps) || 20;
        }
    }
};
z.extend(GridConfig, Object, {
    setColumnSort: function (col_field, order) {
        this._columnSortOrder = {};
        if (order == "asc" || order == "desc") {
            this._columnSortOrder[col_field] = order;
        }
    },
    getColumnSortOrder: function () {
        return this._columnSortOrder;
    },
    setPageSize: function (size) {
        this._page_size = size;
        z.browser.setCookie(this.module + "_page-size", size);
    },
    getPageSize: function () {
        return this._page_size;
    }
});
var GridUtil = {
    renderTimestamps: function (td, data, field) {
        var _field = field || "timestamps";
        var _ts = data[_field];
        var tsDate = new Date(_ts);
        var days = TSAUtil.getDaysToNow(tsDate);
        var cls;
        if (days >= 30) {
            cls = "timestamps badge bg-red";
        } else if (days >= 7) {
            cls = "timestamps badge bg-yellow";
        }
        if (cls) {
            td.innerHTML = "<span class='" + cls + "'>" + _ts + "</span>"
        } else {
            td.innerHTML = _ts;
        }
    },
    initTFoot: function (tfoot, columns, sortMap, onSortChange, context) {
        var _tfoot = z.dom.get(tfoot);
        if (_tfoot) {
            GridUtil.__initTH(_tfoot, columns, sortMap, onSortChange, context);
        }
        return _tfoot;
    },
    initTHead: function (thead, columns, sortMap, onSortChange, context) {
        var _thead = z.dom.get(thead);
        if (_thead) {
            GridUtil.__initTH(_thead, columns, sortMap, onSortChange, context);
        }
        return _thead;
    },
    __getNextOrder: function (order) {
        if (order === "asc") {
            return "desc";
        }
        if (order === "desc") {
            return "";
        }
        return "asc";
    },
    __initTH: function (theader, columns, sortMap, onSortChange, context) {
        var _theader = z.dom.get(theader);
        if (_theader == null) {
            return;
        }
        z.dom.empty(_theader);
        if (_theader._sortHandler) {
            z.event.off(_theader, "click", _theader._sortHandler);
            delete _theader._sortHandler;
        }
        if (onSortChange) {
            var clickHandler = function (evt) {
                var target = z.event.getTarget(evt);
                if (z.dom.isTagType(target, "i")) {
                    target = target.parentNode;
                }
                if (z.dom.isTagType(target, "th") && z.dom.hasClass(target, "p-sortable")) {
                    var currentOrder = z.dom.attr(target, "p-order");
                    var nextOrder = GridUtil.__getNextOrder(currentOrder);
                    var field = z.dom.attr(target, "p-field");
                    onSortChange.apply(context, [field, nextOrder]);
                }
            };
            _theader._sortHandler = clickHandler;
            z.event.onclick(_theader, clickHandler);
        }
        var tr = z.dom.create("tr");
        var thSortable = false;
        z.util.each(columns, function (col) {
            var th = z.dom.create("th");
            z.dom.attr(th, "p-field", col.field);

            var ih = col.title;
            if (col.sortable !== false) {
                thSortable = true;
                //sortable
                z.dom.cls(th, "p-sortable");
                var order = sortMap[col.field];
                if (order) {
                    z.dom.attr(th, "p-order", order);
                }

                if (order === "asc") {
                    //z.dom.cls(th, "asc");
                    ih += "<i class='fa fa-fw fa-long-arrow-up'></i>";
                } else if (order === "desc") {
                    ih += "<i class='fa fa-fw fa-long-arrow-down'></i>";
                    //z.dom.cls(th, "desc")
                }
            }
            th.innerHTML = ih;
            tr.appendChild(th);
        });
        _theader.appendChild(tr);
    },
    updateTBodyRows: function (tbody, datas, columns) {
        var _tbody = z.dom.get("tbody");
        if (_tbody) {
            z.dom.empty(_tbody);
            z.util.each(datas, function (data) {
                GridUtil.createTBodyRow(_tbody, data, columns);
            });
        }
        return _tbody;
    },
    createTBodyRow: function (tbody, data, columns) {
        var _tbody = z.dom.get(tbody);
        if (_tbody) {
            var tr = z.dom.create("tr");
            z.util.each(columns, function (col) {
                var td = z.dom.create("td");
                if (col.render) {
                    col.render(td, data, col)
                } else {
                    td.innerHTML = data[col.field]||"";
                }
                tr.appendChild(td);
            });
            _tbody.appendChild(tr);
        }
        return _tbody;
    },
    addPaginationChangeListener: function (paginationEle, paginationInfoEle, pageChangeHandler, context) {
        z.event.onclick(paginationEle, function (event) {
            var target = z.event.getTarget(event);
            if (z.dom.isTagType(target, "a") && target.parentNode) {
                target = target.parentNode;
            }
            if (z.dom.isTagType(target, "li")) {
                if (!z.dom.hasClass(target, "active") && !z.dom.hasClass(target, "disabled")) {
                    var p_index = parseInt(z.dom.attr(target, "p_index"));
                    var pagination = target.parentNode;
                    var total = parseInt(z.dom.attr(pagination, "total"));
                    GridUtil.updatePagination(paginationEle, paginationInfoEle, total, p_index);
                    if (pageChangeHandler) {
                        pageChangeHandler.apply(context, [total, p_index])
                    }
                }
            }
            z.event.stop(event);
            return false;
        });
    },
    updatePagination: function (paginationEle, paginationInfoEle, total, index, pageSize) {
        //index from 0
        total = parseInt(total);
        var pageNumber = pageSize || 20;
        var pageCount = Math.ceil(total / pageNumber);

        var pi = z.dom.get(paginationInfoEle);
        var p = z.dom.get(paginationEle);

        if (index >= 0) {
            index = parseInt(index);
            index = Math.min(index, total - 1);
        } else {
            index = parseInt(z.dom.attr(p, "index")) || 0;
        }

        var p_start = (index * pageNumber + 1);
        var p_end = Math.min(total, (index + 1) * pageNumber);
        //pi.innerHTML = "Showing " + p_start + " to " + p_end + " of " + total + " entries";
        pi.innerHTML =  p_start + " - " + p_end + " | " + total ;

        z.dom.empty(p);
        z.dom.attr(p, "total", total);
        z.dom.attr(p, "index", index);

        p.appendChild(GridUtil._createPreviousPaginationButton(index - 1));
        var i = 0;
        if (pageCount <= 6) {
            for (i = 0; i < pageCount; i++) {
                p.appendChild(GridUtil._createPaginationButton(i + 1, i, false, i === index));
            }
            //p.appendChild(GridUtil._createNextPaginationButton(index + 1, pageCount));
        } else {
            //...
            if (index < 4) {
                //...  in right
                for (i = 0; i < 5; i++) {
                    p.appendChild(GridUtil._createPaginationButton(i + 1, i, false, i === index));
                }
                p.appendChild(GridUtil._createEllipsisPaginationButton());
                p.appendChild(GridUtil._createPaginationButton(pageCount, pageCount - 1, false, pageCount - 1 === index));
            } else if (index > (pageCount - 5)) {
                //... in left
                p.appendChild(GridUtil._createPaginationButton(1, 0, false, i === index));//1
                p.appendChild(GridUtil._createEllipsisPaginationButton());
                for (i = pageCount - 5; i < pageCount; i++) {
                    p.appendChild(GridUtil._createPaginationButton(i + 1, i, false, i === index));
                }
            } else {
                //... in left and right
                p.appendChild(GridUtil._createPaginationButton(1, 0, false, i === index));//1
                p.appendChild(GridUtil._createEllipsisPaginationButton());
                for (i = index - 1; i < index + 2; i++) {
                    p.appendChild(GridUtil._createPaginationButton(i + 1, i, false, i === index));
                }
                p.appendChild(GridUtil._createEllipsisPaginationButton());
                p.appendChild(GridUtil._createPaginationButton(pageCount, pageCount - 1, false, pageCount - 1 === index));
            }
        }
        p.appendChild(GridUtil._createNextPaginationButton(index + 1, pageCount));

    },
    _createPreviousPaginationButton: function (index) {
        return GridUtil._createPaginationButton("&laquo;", index, index < 0);
    },
    _createNextPaginationButton: function (index, pageCount) {
        return GridUtil._createPaginationButton("&raquo;", index, index > pageCount - 1);
    },
    _createPaginationButton: function (text, index, disable, active) {
        var cls = "paginate_button";
        if (disable === true) {
            cls += " disabled";
        }
        if (active === true) {
            cls += " active";
        }
        var li = z.dom.create("li", cls);
        var a = z.dom.create("a");
        z.dom.attr(a, "href", "#");
        //if (disable === true) {
        z.dom.attr(a, "onclick", "return false;");
        //}
        if (z.util.isNumeric(index)) {
            z.dom.attr(li, "p_index", index);
        }
        a.innerHTML = text;
        li.appendChild(a);
        return li;
    },
    _createEllipsisPaginationButton: function () {
        return GridUtil._createPaginationButton("...", null, true)
    }
};