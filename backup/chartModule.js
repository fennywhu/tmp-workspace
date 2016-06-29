var BASE_URL = '';

var ASSETS_PATH = '/cms/assets/';

//+---------------------------------------------------
//| 判断是否为数组
//+---------------------------------------------------

var isArray = function(o){
    return Object.prototype.toString.call(o) === '[object Array]';
};

(function($){

    var numberWithCommas = function(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    };
    var getChartParams = function() {
        var param = $('#crumbs-select').serializeObject(),
            dateRange = getDateRange(param),

            params = $.extend(true, {
                start_date: '',
                end_date: '',
                granu: '',
                advertiser_id: '',
                campaign_id: '',
                lineitem_id: '',
                target: 'Impression',
                cost_type: 'media_costs',
                type: ''
            }, param, dateRange);

        if(param.lineitem_id && param.lineitem_id != 0){
            params.lineitem_id = param.lineitem_id.split(',');

        }
        if(param.campaign_id && param.campaign_id != 0){
            params.campaign_id = param.campaign_id.split(',');

        }
        if(param.advertiser_id && param.advertiser_id != 0){
            params.advertiser_id = param.advertiser_id.split(',');

        }
        return params;
    };

    var getTarget = function() {
        var tmp =  $('#yAxisSelect').val().split(' / ');

        return [tmp[0]?tmp[0].split(' - '):[], tmp[1]?tmp[1].split(' - '):[]];
    };

    var getDateRange = function(obj){
        var startDate = new Date(obj.start_date),
            endDate = new Date(obj.end_date),
            start = startDate.Format('yyyy-MM-dd hh:mm:ss'),
            end = endDate.Format('yyyy-MM-dd hh:mm:ss');

        return {
            start_date: start,
            end_date: end,
            granu:Math.abs(endDate.getTime() - startDate.getTime()) / 3600000 > 24 ? "day" : "hour"
        };
    };

    var formatData = function(arg){
        var datas = [],
            fields = [],
            rows = [];

        // 判断其是否为单Ajax 请求
        if(typeof arg[1] == 'string'){
            rows.push(arg[0].data);
            datas[0] = [];
            fields[0] = [];
        }else{
            $.each(arg, function(index, item) {
                rows.push(item[0].data);
                datas[index] = [];
                fields[index] = [];
            });
        }

        var xLeb = [];

        $.each(rows[0], function(index, val) {
            xLeb.push(val.time);
        });


        $.each(rows, function(index, row) {
            for (var i in row[0]) {
                if (i != 'time' && i != 'advertiser_id')
                    fields[index].push(i);
            }
            $.each(fields[index], function(i, _v) {
                datas[index][_v] = [];
            });


            $.each(row, function(i, _v) {
                $.each(fields[index], function(i, id) {
                    datas[index][id].push(Number(_v[id]));
                });
            });
        });
        return {
            datas: datas,
            xLeb: xLeb,
            fields: fields
        };
    };

    var buildChart = function(setting, formated){
        var dashStyles = [
            'Solid',
            'Solid',
            'Solid',
            'Solid',
            'Solid'
        ];
        var options = {
            chart: {
                renderTo: setting.renderTo,
                backgroundColor: '#FFF',
                zoomType: 'xy'
            },
            title: {
                text: setting.title
            },
            subtitle: {
                text: setting.subtitle
            },
            loading: {
                labelStyle: {
                    // backgroundImage: 'url("../assets/img/ajax-loader.gif")',
                    display: 'block'
                }
            },
            exporting:{
                buttons:{
                    contextButton:{
                        enabled:false
                    }
                }
            },
            xAxis: {
                categories: []
            },
            // yAxis: yAxis,
            tooltip: {
                crosshairs: {
                    width: '1px',
                    color: '#333'
                },
                shared: true
            },
            plotOptions: {
                spline: {
                    marker: {
                        radius: 4,
                        lineWidth: 1
                    }
                },
                line: {
                    marker: {
                        radius: 4,
                        lineWidth: 1
                    }
                }
            },
            series: [],
            credits:{
                enabled: false
            }
        };
        var targetArr = setting.target,
            sliceIndex = targetArr[0].length,
            allTarget = targetArr[0].concat(targetArr[1]),
            yAxis = [];

        $.each(targetArr[0], function(index, val) {
             yAxis.push({
                title:{
                    text: lang('dictTarget', val)
                },
                min: setting.min
            });
        });
        $.each(targetArr[1], function(index, val) {
             yAxis.push({
                title:{
                    text: lang('dictTarget', val)
                },
                min: setting.min,
                opposite:true
            });
        });
        options.yAxis = yAxis;

        var datas = formated.datas,
            xLeb = formated.xLeb,
            fields = formated.fields;

        options.xAxis.tickInterval = parseInt(xLeb.length/13) + 1;
        options.xAxis.categories = xLeb;
        options.series = [];

        $.each(datas, function(order, data) {
            if(order < sliceIndex){
                $.each(fields[order], function(index, val) {
                    options.series.push({
                        data: data[val],
                        yAxis:order,
                        type:'column',
                        zIndex: 0,
                        name: (function(kk){
                            var field = setting.namefield;
                            for (var i = field.length - 1; i >= 0; i--) {
                                if($.trim(field[i].id) == $.trim(kk)){
                                    return field[i].text + ' / <span style="color:#B8B8B8;">' + lang('dictTarget', allTarget[order]) + '</span>';
                                }
                            }
                            return val;
                        })(val)
                    });
                });
            }else{
                $.each(fields[order], function(index, val) {
                    options.series.push({
                        data: data[val],
                        yAxis:order,
                        zIndex: 1,
                        dashStyle: dashStyles[order],
                        type:'spline',
                        name: (function(kk){
                            var field = setting.namefield;
                            for (var i = field.length - 1; i >= 0; i--) {
                                if($.trim(field[i].id) == $.trim(kk)){
                                    return field[i].text + ' / <span style="color:#B8B8B8">' + lang('dictTarget', allTarget[order]) + '</span>';
                                }
                            }
                            return val;
                        })(val)
                    });
                });
            }

        });
        var charts = new Highcharts.Chart(options);
        // rebind the export btn of chart
        var $exportBtn = $('#exportBtn');

        $("*[data-type]", $exportBtn).each(function(){
            var jThis = $(this),
                type = jThis.data("type");

            if(Highcharts.exporting.supports(type)) {
                jThis.click(function() {
                    charts.exportChartLocal({ type: type });
                });
            }
            else if($(".export.btn-group *[data-type='" + type + "']").length){
                /*jThis.click(function() {
                    $(".export.btn-group *[data-type='" + type + "']").click();
                });*/

            }else {
              jThis.remove();
            }
        });
        //-----------end
        return $('#'+setting.renderTo);
    };

    var HighchartsToTable = function(div, table, unitName) {
        //获取图表对象
        var chart = div.highcharts();
        if (chart) {
            //获取X轴集合对象 获取series集合
            var categories = chart.xAxis[0].categories,
                seriesList = chart.series,
                title = chart.title.textStr,
                rows = [];

            //转秩
            for (var j = 0; j < categories.length; j++) {
                rows[j] = [categories[j]];
                for (var i = 0; i < seriesList.length; i++) {
                    rows[j].push(seriesList[i].data[j].y);
                }
            }

            //先清空原表格内容
            table.html("");
            //获取表格div对象
            var tableObj = table,
                tr, tab;

            tab = $("<table cellspacing='1' cellpadding='1'  width='100%' style=\"border:solid #ccc; border-width:1px 0px 0px 1px;text-align:center;margin: 2px;\" ></table>");
            tab.appendTo(tableObj);

            tr = $("<tr></tr>");
            tr.appendTo(tab);
            var td = $("<td colspan='" + categories.length + 1 + "' style=\"border:solid #ccc; border-width:0px 1px 1px 0px; padding:5px 0px;\" >" + title +"<b style=\"font-size:14px;font-family:'Times New Roman','Microsoft YaHei';float:right\">"+unitName+"</b>"+ "</td>");
            td.appendTo(tr);

            // 插入head
            tr = $("<tr ></tr>");
            tr.appendTo(tab);
            td = $("<td style=\"border:solid #ccc; border-width:0px 1px 1px 0px; padding:5px 0px;\"></td>");
            td.appendTo(tr);

            $.each(seriesList, function(index, val) {
                td = $("<td style=\"border:solid #ccc; border-width:0px 1px 1px 0px; padding:5px 0px;\">" + val.name + "</td>");
                td.appendTo(tr);
            });

            //分批插入数据
            $.each(rows, function(_i, row) {
                tr = $("<tr></tr>");
                tr.appendTo(tab);
                $.each(row, function(index, val) {
                    if(index > 0)
                        td = $("<td style=\"border:solid #ccc; border-width:0px 1px 1px 0px; padding:5px 0px;align:center\">" + numberWithCommas(val) + "</td>");
                    else
                        td = $("<td style=\"border:solid #ccc; border-width:0px 1px 1px 0px; padding:5px 0px;align:center\">" + val + "</td>");
                    td.appendTo(tr);
                });
            });
            return table;
        } else {
            alert("获取图表对象失败!");
            }
    };

    var drawMultiAxisChart = function(setting){
        var $chartContainer = $('#' + setting.renderTo);
        $chartContainer.empty().append('<img src="../assets/img/ajax-loader.gif" style="margin:200px 600px">');

        if (!setting.url) {
            return ;
        }

        var targetArr = setting.target,
            sliceIndex = targetArr[0].length,
            allTarget = targetArr[0].concat(targetArr[1]),

            ajaxs = [],
            target_str = allTarget.join(','),
            param;

        param = $.extend({}, setting.params, {targets:target_str});

        $.ajax({url : setting.url, data: param}).done(function(a){console.log(a);});
        return ;
        $.each(allTarget, function(index, val) {
            param = $.extend({}, setting.params, {target:val});
            ajaxs.push($.ajax({url : setting.url, data: param}));
        });

        $.when.apply(this, ajaxs).done(function(){
            $chartContainer.empty();
            var formated = formatData(arguments);
            if($('#showChart').hasClass('active')){
                buildChart(setting, formated).show();
            }else{
                buildChart(setting, formated).hide();
            }
            if($('#showGrid').hasClass('active')){
                HighchartsToTable($chartContainer, $('#detail-grid-container'), '').show();
            }else{
                HighchartsToTable($chartContainer, $('#detail-grid-container'), '').hide();
            }
        });

        /*var targetArr = setting.target,
            sliceIndex = targetArr[0].length,
            allTarget = targetArr[0].concat(targetArr[1]),

            ajaxs = [],
            param;

        $.each(allTarget, function(index, val) {
            param = $.extend({}, setting.params, {target:val});
            ajaxs.push($.ajax({url : setting.url, data: param}));
        });

        $.when.apply(this, ajaxs).done(function(){
            $chartContainer.empty();
            var formated = formatData(arguments);
            if($('#showChart').hasClass('active')){
                buildChart(setting, formated).show();
            }else{
                buildChart(setting, formated).hide();
            }
            if($('#showGrid').hasClass('active')){
                HighchartsToTable($chartContainer, $('#detail-grid-container'), '').show();
            }else{
                HighchartsToTable($chartContainer, $('#detail-grid-container'), '').hide();
            }
        });*/
        return ;
    };

    var drawHighChart = function(config) {
        var $targetComp = $('#chartToolBarDiv .input-prepend.input-group'),
            setting = $.extend({
            url: '',
            min: 0,
            namefield: [],
            target: getTarget(),
            params: getChartParams(),
            renderTo: "chart-container",
            title: 'Example high chart',
            subtitle: 'Subtitle'
        }, config);

        drawMultiAxisChart(setting);
    };

    var drawExampleMap = function(){

        $('#chartToolBarDiv .input-prepend.input-group').hide();

        $.getJSON(ASSETS_PATH + 'static/highMap.json', function (data) {

            // Make codes uppercase to match the map data
            $.each(data.data1, function () {
                this.code = this.code.toUpperCase();
            });

            // $("#chartToolBarDiv").hide();
            // Instanciate the map
            $('#chart-container').highcharts('Map', {

                chart : {


                },//animation图表刷新的动画效果默认为true backgroundColor borderColor
                //borderRadius边框角半径 borderWidth边框 className cssclass for container div
                //renderTo某一元素对象即id=container的div对象

                title : {
                    text : 'GEO - US'
                },

                exporting:{
                    buttons:{
                        contextButton:{
                            enabled:false
                        }
                    }
                },

                legend: {
                    layout: 'vertical',
                    borderWidth: 1,
                    backgroundColor: 'rgba(255,255,255,0.85)',//css3中的属性a代表透明度
                    floating: true,//可在数据区域图之上
                    align: 'right',
                    x: -10   //和verticalAlign一起设置为垂直对齐
                },//legend是包含图标中数列标志和名称的容器
                credits:{
                    enabled: false
                },

                mapNavigation: {
                    enabled: true,
                    enableMouseWheelZoom:false
                },//鼠标滚动放大缩小

                colorAxis: {
                    min: 1,
                    type: 'logarithmic',//linear or logarithmic
                    minColor: '#EEEEFF',
                    maxColor: '#000022',
                    stops: [
                        [0, '#EFEFFF'],
                        [0.67, '#4444FF'],
                        [1, '#000022']
                    ]
                },//axis指轴 地图分布的轴

                series : [{
                    animation: {
                        duration: 1000
                    },//应该在chart中
                    data : data.data1,
                    mapData: Highcharts.maps['countries/us/us-all'],//绘制地图
                    joinBy: ['postal-code', 'code'],
                    dataLabels: {
                        enabled: true,
                        color: 'white',
                        format: '{point.code}'//地图上的显示
                    },
                    name:'<strong>Detail</strong>',//数据展示的标题
                    tooltip: {
                        pointFormat: '<strong>{point.code}</strong>'+':<br>click:{point.value}<br>conv:{point.conv}<br>cpm:{point.cpm}<br>cpa:{point.cpa}<br>cost:{point.cost} '
                    }//数据展示
                }]
            });
        });
    };

    var drawAdvertiserSummuryChart = function(){
        var params = getChartParams(),
            items = lang('dictLimitedDimension', 'advertiser');

        if(params.advertiser_id != '0'){
            items = $('.trigger.active span').text();
        }

        drawHighChart({
            url: BASE_URL + 'report/report/displaySummaryInChart',
            namefield: [{
                id: "0",
                text: lang('labelSumData')
            }],
            title:lang('labelAdver'),
            subtitle:items,
            target: getTarget(),
            params: params
        });

    };

    var drawCampaginSummaryChart = function(){
        var params = getChartParams(),
            items = lang('dictLimitedDimension', 'campaign');

        if(params.campaign_id != '0'){
            items = $('.trigger.active span').text();
        }

        if(params.campaign_id != '0'){
            drawHighChart({
                url: BASE_URL + 'report/report/displaySummaryCampaignInChart',
                namefield: [{
                    id: "0",
                    text: lang('labelSumData')
                }],
                title:lang('labelCamp'),
                subtitle:items,
                target: getTarget(),
                params: params
            });
        }else{
            drawHighChart({
                url: BASE_URL + 'report/report/displaySummaryAdvertiserInChart',
                namefield: [{
                    id: "0",
                    text: lang('labelSumData')
                }],
                title:lang('labelCamp'),
                subtitle:items,
                target: getTarget(),
                params: params
            });
        }

    };

    var drawLineitemSummaryChart = function(){
        var params = getChartParams(),
            items = lang('dictLimitedDimension', 'lineitem');

        if(params.advertiser_id != '0'){
            items = $('.trigger.active span').text();
        }

        if(params.lineitem_id != '0'){
            drawHighChart({
                url: BASE_URL + 'report/report/displaySummaryLineitemInChart',
                namefield: [{
                    id: "0",
                    text: lang('labelSumData')
                }],
                subtitle:lang('labelLine'),
                title: items,
                target: getTarget(),
                params: params
            });
        }else if(params.campaign_id != '0'){
            drawHighChart({
                url: BASE_URL + 'report/report/displaySummaryCampaignInChart',
                namefield: [{
                    id: "0",
                    text: lang('labelSumData')
                }],
                subtitle:lang('labelLine'),
                title: items,
                target: getTarget(),
                params: params
            });
        }else{
            drawHighChart({
                url: BASE_URL + 'report/report/displaySummaryAdvertiserInChart',
                namefield: [{
                    id: "0",
                    text: lang('labelSumData')
                }],
                subtitle:lang('labelLine'),
                title: items,
                target: getTarget(),
                params: params
            });
        }
    };
    var drawDimensionSummaryChart = function(type){
        var params = getChartParams(),
            items = lang('dictLimitedDimension', type);


         drawHighChart({
            url: BASE_URL + 'report/report/displaySummaryDimensionInChart',
            namefield: [{
                id: "0",
                text: lang('labelSumData')
            }],
            subtitle:lang('dictDimension', type),
            title: items,
            target: getTarget(),
            params: params
        });

    };
    var drawAdvChart = function(nameObj){
        var par = $('#crumbs-select').serializeObject(),

            dateRange = getDateRange(par),

            params = $.extend(true, {
                start_date: '',
                end_date: '',
                granu: '',
                data_center: 'US',
                cost_type: 'media_costs'
            }, dateRange, {
                data_center: par.datacenter
            });

        var valueField = [],
            displayField =[];
        $.each(nameObj, function(index, el) {
            displayField.push(el.text);
            valueField.push(el.id);
        });
        drawHighChart({
            url: BASE_URL + 'report/report/displayAdvertiserInChart',
            title: lang('labelAdver'),
            subtitle: displayField.join(','),
            namefield: nameObj,
            target: getTarget(),
            params: params
        });
    };

    var drawCampChart = function(nameObj){
        var par = $('#crumbs-select').serializeObject(),

            dateRange = getDateRange(par),

            params = $.extend(true, {
                start_date: '',
                end: '',
                granu: '',
                data_center: 'US',
                campaign_id: '',
                cost_type: 'media_costs'
            }, dateRange, {
                data_center: par.datacenter,
                campaign_id: par.campaign
            });

        var valueField = [],
            displayField =[];
        $.each(nameObj, function(index, el) {
            displayField.push(el.text);
            valueField.push(el.id);
        });
        drawHighChart({
            url: BASE_URL + 'report/report/displayCampaignsInChart',
            title: lang('labelCamp'),
            subtitle: displayField.join(','),
            namefield: nameObj,
            target: getTarget(),
            params: params
        });
    };

    var drawLineitemChart = function(nameObj){
        var par = $('#crumbs-select').serializeObject(),

            dateRange = getDateRange(par),
            lineitemId = isArray(par.lineitem)?par.lineitem.join(','):par.lineitem,

            params = $.extend(true, {
                start_date: '',
                end: '',
                granu: '',
                data_center: 'US',
                campaign_id: '',
                cost_type: 'media_costs'
            }, dateRange, {
                data_center: par.datacenter,
                lineitem_id: lineitemId
            });

        var valueField = [],
            displayField = [],
            campValueField = [];

        $.each(nameObj, function(index, el) {
            displayField.push(el.text);
            valueField.push(el.id);
            // campValueField.push(el.campId)
        });

        drawHighChart({
            url: BASE_URL + 'report/report/displayLineitemInChart',
            title: lang('labelLine'),
            subtitle: displayField.join(','),
            namefield: nameObj,
            target: getTarget(),
            params: params
        });
    };

    $.fn.drawRtChart = function(options){
        if(options.type == 'advertiser'){
            drawAdvertiserSummuryChart();
            return ;
        }
        if (options.type == 'campaign') {
            drawCampaginSummaryChart();
            return ;
        }
        if (options.type == 'lineitem') {
            drawLineitemSummaryChart();
            return ;
        }
        drawDimensionSummaryChart(options.type);
        return this;
    };

    $.fn.drawRtChart.drawCheckedchart = function(options){
        var param = options.params,

            selectMsg = options.selected,
            nameObj = selectMsg.nameObj,
            displayField = selectMsg.displayField.join(','),
            valueField = selectMsg.valueField.join(','),

            dateRange = getDateRange(param),
            target = getTarget();


        if(param.type == 'advertiser'){
            params = $.extend(true, {
                start_date: '',
                end_date: '',
                data_center: 'US',
                cost_type: 'media_costs'
            }, dateRange, {
                data_center: param.datacenter,
                advertiser_id: valueField
            });
            drawHighChart({
                url: BASE_URL + 'report/report/displayAdvertiserInChart',
                title: lang('labelAdver'),
                subtitle: displayField,
                namefield: nameObj,
                target: target,
                params: params
            });
            return ;
        }
        if(param.type == 'campaign'){
            params = $.extend(true, {
                start_date: '',
                end_date: '',
                data_center: 'US',
                cost_type: 'media_costs'
            }, dateRange, {
                data_center: param.datacenter,
                campaign_id: valueField
            });
            drawHighChart({
                url: BASE_URL + 'report/report/displayCampaignsInChart',
                title: lang('labelCamp'),
                subtitle: displayField,
                namefield: nameObj,
                target: target,
                params: params
            });
            return ;
        }
        if(param.type == 'lineitem'){
            params = $.extend(true, {
                start_date: '',
                end_date: '',
                data_center: 'US',
                cost_type: 'media_costs'
            }, dateRange, {
                data_center: param.datacenter,
                lineitem_id: valueField
            });
            drawHighChart({
                url: BASE_URL + 'report/report/displayLineitemInChart',
                title: lang('labelLine'),
                subtitle: displayField,
                namefield: nameObj,
                target: target,
                params: params
            });
            return ;
        }
        params = $.extend(true, {
            start_date: '',
            end_date: '',
            granu: '',
            data_center: 'US',
            cost_type: 'media_costs'
        }, dateRange, {
            data_center: param.datacenter,
            campaign_id: param.campaign_id,
            values: valueField,
            dimension: param.type
        });

        drawHighChart({
            url: BASE_URL + 'report/report/displayDimensionInChart',
            title: lang('dictDimension', param.type),
            subtitle: displayField,
            namefield: nameObj,
            target: target,
            params: params
        });

        return this;
    };

})(jQuery);
