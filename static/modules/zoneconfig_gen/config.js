/**
 * Created by taozh on 2016/3/22.
 */
var Config = {
    init: function () {
        this.initView();
        this.initController();
    },
    initView: function () {
        TSAUtil.initFrameWork("cmd");
    },
    initController: function () {
        z.event.onclick("#sendBtn", this.generateCMD, this);
        z.event.onchange("#wwpnTA", function () {
            z.dom.val("#resultPRE","");
        });
    },
    generateCMD: function () {
        DomUtil.loading(document.body);
        AjaxDataUtil.loadDataByModule(ZoneAjaxDataUrls.wwpn, {wwpn: z.dom.val("#wwpnTA")}, this.handleLoadData, this);
    },
    handleLoadData: function (result, success, timeout) {
        DomUtil.loading(document.body, false);
         if (!AjaxDataUtil.showAjaxError(result, success, timeout, "生成配置")) {
            z.dom.val("#resultPRE","");
            return;
        }
        z.dom.val("#resultPRE",result);
    }

};
z.ready(function () {
    Config.init();
});