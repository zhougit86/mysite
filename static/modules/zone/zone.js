/**
 * Created by taozh on 2016/3/28.
 */
/**

 "status": "aaaaa",
 "name": "fc2/17",
 "power": -3.4,
 "fcid": "10:00:00:90:fa:b4:32:92",
 "lastchange": "2015-11-28 22:52:43",
 "mode": "F",
 "device": "NF97SN32-L3",
 "vsan": "20",
 "description": "RH5885_010100119873_B\r"

 */
var TABLE_COLUMNS = [
    {
        "title": "Status",
        "field": "status"
    },
    {
        "title": "Name",
        "field": "name"
    },
    {
        "title": "Power",
        "field": "power",
        "render":function(td,data){
            var dp = data.power;
            td.innerHTML = dp;
                if(dp<-4){
                z.dom.css(td,"color","red");
                }
        }
    },
     {
        "title": "WWPN",
        "field": "wwpn"
    },
    {
        "title": "mode",
        "field": "mode"
    },
    {
        "title": "Device",
        "field": "device"
    },
    {
        "title": "VSAN",
        "field": "vsan"
    },
    {
        "title": "Description",
        "field": "description"
    },
    {
        "title": "更新时间",
        "field": "lastchange"/*,
        render: function (td, data) {
            GridUtil.renderTimestamps(td, data);
        }*/
    },
    {
        "title": "#",
        render: function (td, data) {
            //<button type="button" class="btn btn-link">Link</button>v
            var btn = z.dom.create("button", "btn btn-link");
            btn.innerHTML = "加载Zone";//展开

            z.event.onclick(btn, function () {
                var tr = td.parentNode;
                if (tr.__loaded === true) {
                    zone.toggleZoneVisible(td.parentNode);
                } else {
                    zone.loadZone(td.parentNode, data);
                }
            });
            td.appendChild(btn);
        }
    }
];
TablePageJS.initModel = function () {
};
/*TablePageJS.__getSearch = function () {
    return zone.__searchText;
};*/
var zone = {
    init: function () {
        this.initController();
    },
    initController: function () {
        z.event.onclick("#searchIFBtn", this.__search,this);
        z.event.on("#interfaceInput", "keydown", this.__handleInputKeyDown, this);
        z.event.on("#deviceInput", "keydown", this.__handleInputKeyDown, this);
    },
    __handleInputKeyDown: function (event) {
        var keyCode = event.keyCode;
        if (keyCode === 13) {
            this.__search();
        }
    },
    __search: function () {
        var interface = z.dom.val("#interfaceInput") || "";
        var device = z.dom.val("#deviceInput") || "";
        this.__searchIF = interface;
        this.__searchDevice = device
//        this.__searchText = "interface=" + interface + "|device=" + device;
        TablePageJS.loadData(0);
    },
    toggleZoneVisible: function (tr) {
        var zonetr = tr.__zonetr;
        if (z.dom.css(zonetr, "display") === "none") {
            z.dom.show(zonetr);
            z.dom.get("button", tr).innerHTML = "隐藏";
        } else {
            z.dom.hide(zonetr);
            z.dom.get("button", tr).innerHTML = "显示";
        }
    },
    loadZone: function (tr, data) {
        DomUtil.loading("#tableDiv");
        AjaxDataUtil.loadDataByModule(ZoneAjaxDataUrls.zone, {wwpn:data.wwpn}, function (result, success, timeout) {
            DomUtil.loading("#tableDiv", false);
            if (!AjaxDataUtil.showAjaxError(result, success, timeout, "加载数据")) {
                return;
            }
            tr.__loaded = true;
            var zoneTR = ZoneUtil.insertZonesAfterIF(tr, TABLE_COLUMNS, result.result_list);
            tr.__zonetr = zoneTR;
            z.dom.get("button", tr).innerHTML = "隐藏";
        });
    }
};
z.ready(function () {
    zone.init();
});
var page_config = {
    module: ZoneAjaxDataUrls.interface,
    menu_id: "zone"
};