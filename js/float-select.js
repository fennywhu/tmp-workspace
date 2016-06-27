/*
浮动下拉框插件，版本1.0(2015.05.19)
用法：$("#myDiv").floatSelect({switchingMode:"click"});
参数解释：

样式：

*/
;
(function($) {
    $.fn.floatSelect = function(options) {
        var $selectBox = $(this);
        $(this).wrap('<div tabindex="0" class="select_wrapper"></div>')
        $(this).css('display', 'none');

        var $parentDiv = $(this).parent();
        $parentDiv.prepend('<span>' + $(this).find(':selected').text() + '</span>');
        $parentDiv.children('span').width($(this).width());
        $parentDiv.append('<ul class="select_inner"></ul>');

        $(this).children().each(function() {
            var opttext = $(this).text();
            var optval = $(this).val();
            $parentDiv.children('.select_inner').append('<li>' + '<input type="radio" value="' + opttext + '"/>' + opttext + '</li>');
        });

        $parentDiv.find('li').on('click', function(event) {
            var cur = $(this).find('input').val(),
                $ul = $(this).parent('ul');
            $parentDiv.children('span').text(cur);
            $selectBox.val(cur);
            $ul.slideToggle('fast');
            event.stopPropagation();
            // return false;
        });
        $parentDiv.on('click', function() {
            var cur = $(this).children('span').text();
            $(this).find('ul').slideToggle('fast');
            $(this).find('input').removeAttr('checked');
            $(this).find('input[value="' + cur + '"]').prop('checked', 'checked');
        });


        $parentDiv.on('blur', function() {
            var $ul = $(this).find('ul');
            if (!$ul.is(":hidden")) {
                $ul.slideToggle('fast');
            };
            return false;
        });
    };
})(jQuery);
