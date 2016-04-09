/**
 * Created by taozh on 2016/2/29.
 */

var AjaxDataUtil = {
    loadDataByModule: function (module, parameters, complete, context) {
        z.ajax.post(module.load, parameters, {
            complete: complete,
            context: context
        });
    },
    updateDataByModule: function (module, parameters, complete, context) {
        z.ajax.post(module.update, parameters, {
            complete: complete,
            context: context
        });
    }
};

z.util.extend(AjaxDataUtil, {
    showAjaxError: function (result, success, timeout, opre) {
        if (timeout) {
            //z.widgets.alert(opre + " time out!!");
            alert(opre + "超时!!");
            return false;
        }
        /* if (!success) {
             alert(opre + " fails! " + result);
             return false;
         }*/
        if (success != true) {
            //z.widgets.alert(opre + " fails!  Request failed");
            alert(opre + "失败");
            return false;
        }
        /*if (result.success !== true) {
            z.widgets.alert(opre + " fails! " + result.message);
            return false;
        }*/

        return true;
    }
});