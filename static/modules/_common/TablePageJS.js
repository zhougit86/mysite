/**
 * Created by taozh on 2016/3/14.
 */
var TablePageJS = {
    init: function () {
        this._initSearch = z.browser.getPageVar("init_search") || "";
        this.initView();
        this.initModel();
        this.initController();
    },

    ///////////////////////////////////////////////view//////////////////////////////////////////////
    initView: function () {
        this.initTable();
        this.initPagination();

        TSAUtil.initFrameWork(page_config.menu_id || null);
    },
    initTable: function () {
        this.gridConfig = new GridConfig(page_config.menu_id);

        z.dom.val("#pageSizeSelect", this.gridConfig.getPageSize());
        this.gridConfig.setPageSize(parseInt(z.dom.val("#pageSizeSelect")));

        //init order
        z.util.each(TABLE_COLUMNS, function (col) {
            if (col.sortable !== false) {
                var order = col.sort_order;
                if (order == "asc" || order === "desc") {
                    this.gridConfig.setColumnSort(col.field, order);
                }
            }
        }, this);
        GridUtil.initTHead("#dataTHead", TABLE_COLUMNS, this.getColumnSortOrderMap(), this._handleSortChange, this);
        GridUtil.initTFoot("#dataTFoot", TABLE_COLUMNS, this.getColumnSortOrderMap(), this._handleSortChange, this);
    },
    initPagination: function () {
        GridUtil.addPaginationChangeListener("#pagination", "#tableInfo", this.handlePageChange, this);
    },

    //////////////////////////////////////////////sort//////////////////////////////////////////////
    getColumnSortOrderMap: function () {
        return this.gridConfig.getColumnSortOrder();
    },
    _handleSortChange: function (col_field, order) {
        this.__setColumnSort(col_field, order);
    },
    __setColumnSort: function (col_field, order) {
        this.gridConfig.setColumnSort(col_field, order);
        this._updateTHeaderAndFoot();
        this.loadData(0);
    },
    _updateTHeaderAndFoot: function () {
        GridUtil.initTHead("#dataTHead", TABLE_COLUMNS, this.getColumnSortOrderMap(), this._handleSortChange, this);
        GridUtil.initTFoot("#dataTFoot", TABLE_COLUMNS, this.getColumnSortOrderMap(), this._handleSortChange, this);
    },

    //////////////////////////////////////////////controller//////////////////////////////////////////////
    initController: function () {
        z.event.onchange("#pageSizeSelect", function () {
            this.gridConfig.setPageSize(parseInt(z.dom.val("#pageSizeSelect")));
            this.loadData(0);
        }, this);

        z.event.onclick("#importBtn", function () {
            DomUtil.showModalPage("../framework/upload.html?url=" + page_config.module.import,"导入");
        });
        z.event.onclick("#exportBtn", function () {
            DomUtil.exportFile(page_config.module.export);
        });
        z.event.onclick("#templeteBtn", function () {
            DomUtil.exportFile(page_config.module.templete);
        });

        z.event.onclick("#searchBtn", function () {
            this._handleSearchChange();
        }, this);
        z.event.on("#searchInput", "keydown", this._handleSearchInputEnter, this);
        z.util.callLater(function () {
            z.dom.focus("#searchInput");
        }, 200);
    },

    _handleSearchInputEnter: function (evt) {
        var keyCode = event.keyCode;
        if (keyCode === 13) {
            this._handleSearchChange();
        }
    },
    _handleSearchChange: function () {
        this._searchText = z.dom.val("#searchInput").trim();
        this.loadData(0);
    },
    handlePageChange: function (total, index) {
        this.loadData(index);
    },

    //////////////////////////////////////////////model//////////////////////////////////////////////
    initModel: function () {
        this.loadData(0);
    },
    __getSearch: function () {//override by zone
        return  this._searchText;
    },
    loadData: function (p_index) {
        DomUtil.loading("#tableDiv");
        var ps = {
            page: p_index,
            page_number: this.gridConfig.getPageSize(),
            interface: zone.__searchIF,
            device: zone.__searchDevice,
        };
        if(ps.search){
            var ss = ps.search.split("&");

        }
        if (this._initSearch) {
            ps.init_search = this._initSearch;
        }
        z.util.each(this.getColumnSortOrderMap(), function (col, order) {
            ps.sort_column = col;
            ps.sort_order = order;
        });
        AjaxDataUtil.loadDataByModule(page_config.module, ps, this.handleLoadData, this);
        delete this._initSearch;
    },
    handleLoadData: function (result, success, timeout) {
        DomUtil.loading("#tableDiv", false);
        if (!AjaxDataUtil.showAjaxError(result, success, timeout, "加载数据")) {
            GridUtil.updateTBodyRows("#dataTable", [], TABLE_COLUMNS);
            return;
        }

        var total = result.total_number;
        var data = result.result_list;
        var size = data.length;
        if (size < 9) {
            z.dom.hide("#dataTFoot");
        } else {
            z.dom.show("#dataTFoot");
        }
        GridUtil.updateTBodyRows("#dataTable", data, TABLE_COLUMNS);
        GridUtil.updatePagination("#pagination", "#tableInfo", total, -1, this.gridConfig.getPageSize());
    }
};
z.ready(function () {
    TablePageJS.init();
});