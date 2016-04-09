/**
 * Created by taozh on 2016/3/28.
 */
var ZoneUtil = {
    insertZonesAfterIF: function (ifTR, ifColumn, zones) {
        var tr = z.dom.create("tr","_expand");
        var td = z.dom.create("td");
        z.dom.attr(td, "colspan", ifColumn.length);
        var zp = ZoneUtil.createZonesPanel(zones);
        td.appendChild(zp);
        tr.appendChild(td);
        ifTR.parentNode.insertBefore(tr,z.dom.next(ifTR));
        return tr;
    },
    createZonesPanel: function (zones) {
        var div = z.dom.create("div","_zone");
        z.util.each(zones, function (zone) {
            div.appendChild(ZoneUtil._createZonePanel(zone));
        });
        return div;
    },

    _createZonePanel: function (zone) {
        var columns = [
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
        "field": "power"
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
        "field": "lastchange"
    }
        ];
        var div = z.dom.create("div", "box box-success");
        var header = z.dom.create("div", "box-header with-border");
        header.innerHTML = '<h3 class="box-title">' + zone.name + '</h3>';
        var table = ZoneUtil._createZoneTable(columns, zone.interface);
        div.appendChild(header);
        div.appendChild(table);
        return div;
    },
    _createZoneTable: function (columns, datas) {
        var table = z.dom.create("table", "table dataTable");
        var thead = z.dom.create("thead");
        var tbody = z.dom.create("tbody");
        GridUtil.initTHead(thead, columns, {});
        table.appendChild(thead);
        table.appendChild(tbody);
        z.util.each(datas, function (data) {
            GridUtil.createTBodyRow(tbody, data, columns);
        });
        return table;
    }
};