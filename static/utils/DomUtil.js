/**
 * Created by taozh on 2016/2/28.
 */
var DomUtil = {
    loading: function (ele, show) {
        var _ele = z.dom.get(ele) || document.body;
        var overlay = z.dom.get(".overlay", _ele);
        if (show === false) {
            if (overlay) {
                overlay.parentNode.removeChild(overlay);
            }
        } else {
            if (overlay == null) {
                overlay = DomUtil._createLoadingDiv();
                _ele.appendChild(overlay);
            }
            return overlay;
        }
    },
    _createLoadingDiv: function () {
        var div = z.dom.create("div", "overlay");
        div.innerHTML = ' <i class="fa fa-refresh fa-spin"></i>';
        return div;
    },
    exportFile: function (url) {
        if (DomUtil.exportA == null) {
            DomUtil.exportA = z.dom.create("a");
            z.dom.attr(DomUtil.exportA, "target", "_blank");
            z.dom.attr(DomUtil.exportA, "download", "");
        }
        DomUtil.exportA.href = url;
        DomUtil.exportA.click();
    },
    closeModal: function () {
        window.top.DomUtil.__closeModal();
    },
    __closeModal: function () {
        $('.modal').modal('hide');
    },
    showModalPage: function (src, title, height, showClose) {
        var div = z.dom.create("div", "modal fade");
        z.dom.attr(div, {
            "tabindex": "-1",
            "role": "dialog"
        });
        var _h = (height || 120) + "px";

        var ih = ' <div class="modal-dialog" role="document">' +
            '<div class="modal-content">' + '<div class="modal-header">' +
            ' <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            ' <h4 class="modal-title" id="exampleModalLabel">' + (title || 0) + '</h4>' +
            ' </div>' +
            ' <div class="modal-body" style="height: ' + _h + '">' +
            '  <iframe style="position: absolute; left: 0px; right: 0px; top: 0px; bottom: 0px; width: 100%; height: 100%; border: none;" src="' + src + '"></iframe>' +
            '</div>';
        if (showClose !== false) {
            ih +=
                ' <div class="modal-footer">' +
                ' <button type="button"  class="btn btn-default" data-dismiss="modal">关闭</button>' +
                ' </div> </div> </div> </div>';
        }
        div.innerHTML = ih;
        $(div).modal();
    }
};