/**
 * Created by taozh on 2016/2/29.
 */
var TABLE_COLUMNS = [
    {
        "title": "IP",
        "field": "arp_address"
        /*,"sort_order":"asc",
        render: function (td,data) {
            return td.innerHTML = '<a href="/inetwork/info/server_list?ip=107.0.133.31">0050.56b1.46c0</a>';
        }*/
    },
    {
        "title": "MAC",
        "field": "mac_address"
    },
    {
        "title": "Learned Device",
        "field": "hostname"
    },
    {
        "title": "Learned Interface",
        "field": "if_name"
    },
    {
        "title": "Zone",
        "field": "zone"
    },

    {
        "title": "Last Updated",
        "field": "timestamps",
        render: function (td, data) {
            var _ts = data.timestamps;
            var tsDate = new Date(_ts);
            var days = TSAUtil.getDaysToNow(tsDate);
            var cls;
            if (days >= 30) {
                cls = "badge bg-red";
            } else if (days >= 7) {
                cls = "badge bg-yellow";
            }
            if (cls) {
                td.innerHTML = "<span class='" + cls + "'>" + _ts + "</span>"
            } else {
                td.innerHTML = _ts;
            }
        }
    }
];

