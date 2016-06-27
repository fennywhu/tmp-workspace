(function($) {
    function CreateLi(strValue, settings) {
        if (strValue == '') return;
        var parentsDiv = $(settings.tags_container);
        parentsDiv.append('<span class="tag"><span>' + strValue + '&nbsp;&nbsp;</span><a class="tagstextarea-remove-link"></a></span>');
        var lastSpan = parentsDiv.children('span:last'),
            height = lastSpan.height(),
            divHeight = parentsDiv.height(),
            postion_T = lastSpan.position().top,
            position_L = lastSpan.position().left;
        if (postion_T + height > 105) {
            /*var lastSpan = strHTML;
            while(postion_T + height > divHeight){
                lastSpan.remove();
                lastSpan = parentsDiv.children('span:last');
                postion_T = lastSpan.position().top;
            }
            lastSpan.replaceWith('<span class="tag"><span>...</span></span>');
            return true;*/
            lastSpan.remove();
            parentsDiv.children('span:last').replaceWith('<span class="tag"><span>...</span></span>');
            return true;
        };
    }

    function resizeTheTags(settings) {
        $(settings.tags_container).children().remove();

        var valuesStr = $(settings.real_input).val(),
            arr = valuesStr.split(',');
        $.each(arr, function(index, val) {
            if(!val) return;
            if (CreateLi($.trim(val), settings)) return false;
        });
        $(settings.textarea).attr('rows' , (settings.rows - $(settings.tags_container).height()/34));
    }

    $.fn.textareaTags = function(options) {
        var id = this.attr('id'),
            rows = this.attr('rows'),
            name = this.attr('name'),
            id = id?id:'textarea-' + new Date().getTime();

        this.attr('id', id);
        this.removeAttr('name');

        var settings = jQuery.extend({
            name:name?name:'textarea_tags',
            rows: (rows && rows >= 3)?rows:3,
            pid : id,
            textarea : '#' + id,
            tags_container : '#' + id + '_tag_container',
            real_input : '#' + id + '_real_input'
        }, options);

        this.before('<input id="' + settings.pid + '_real_input" style="display:none" name="' + settings.name + '">');
        this.before('<div class="tagstextarea"id="' + settings.pid + '_tag_container"></div>');

        if(this.val()){
            convertTags($(this))
        };
        function convertTags(th){
            var $realInput = $(settings.real_input),
                str = th.val(),
                arr = str.split("\n"),
                tmpValue = $realInput.val();
            arr = $.map(arr, function(val, index) {
                return $.trim(val);
            });

            $realInput.val(tmpValue?tmpValue + ',' +arr.join(','):arr.join(','));
            th.val('');
            resizeTheTags(settings);
        }

        $(settings.tags_container).delegate('span[class=tag]','click', function(event) {
            var $realInput = $(settings.real_input),

                valueToDel = $.trim($(this).children('span').text()),
                arr = $realInput.val().split(',');

            arr.splice($.inArray(valueToDel,arr),1);
            $realInput.val(arr.join(','));

            $(this).remove();
            resizeTheTags(settings);
        });

        $(this).blur(function(event) {
            convertTags($(this));
        });
        $(this).keyup(function(event) {
            if (event.keyCode == 100 || event.keyCode == 13 || event.keyCode == 188){
                convertTags($(this));
            }
        });
    };
})(jQuery);
