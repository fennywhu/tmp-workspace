(function($) {

    var lineObjOffsetTop = 6,
        lineNumber = 1;
    $.fn.codetextarea = function(options) {
        var id = this.attr('id');
        id = id?id:'codetextarea-' + new Date().getTime();

        var settings = jQuery.extend({
            pid:id,
            hold_div:'#'+ id +'_hold_div',
            line_div : '#' + id +'_line_div'
        }, options);
        this.css({
            position: 'absolute',
            left:30
        });

        var $parentDiv = $('<div id="' + id + '_hold_div" class="textAreaWithLines"></div>');
        $parentDiv.css({
            // width : this.innerWidth() + 30,
            height : this.height(),
            overflow : 'hidden',
            position :"relative"

        });
        this.wrap($parentDiv);
        var $lineObj = $('<div id="' + id + '_line_div" class="lineObj"></div>');
        $lineObj.css({
            position: 'absolute',
            top : lineObjOffsetTop,
            'background-color': '#D7D4D4',
            left : 0,
            width : 27,
            textAlign : 'right'
        });
        this.before($lineObj);
        $lineObj.html("1<br>");

        this.keydown(function(event) {
            $lineObj.css('top', $(this).scrollTop() * -1 + lineObjOffsetTop);
            if(event.keyCode == 13)
                $lineObj[0].innerHTML += (++lineNumber) + '<br>'
        });

        this.bind('mousedown scroll blur focus mouseover' ,function(event) {
            $lineObj.css('top', ($(this).scrollTop() * -1 + lineObjOffsetTop));
        });

    };

})(jQuery);
