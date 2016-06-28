+ function($) {
    'use strict';

    // DROPDOWN CLASS DEFINITION
    // =========================

    var toggle = '[data-toggle="dropdown2"]';
    var Dropdown = function(element) {
        $(element).on('click.mn.dropdown2', this.toggle);
    };

    Dropdown.VERSION = '3.2.0';

    Dropdown.prototype.toggle = function(e) {
        var $this = $(this);

        if ($this.is('.disabled, :disabled')) return;

        var $parent = getParent($this);
        var isActive = $parent.hasClass('open');

        clearMenus();

        if (!isActive) {
            var relatedTarget = { relatedTarget: this };
            $parent.trigger(e = $.Event('show.mn.dropdown2', relatedTarget));

            if (e.isDefaultPrevented()) return;

            $this.trigger('focus');
            $parent
                .toggleClass('open')
                .trigger('shown.mn.dropdown2', relatedTarget);
        }

        return false;
    };

    Dropdown.prototype.keydown = function(e) {
        if (!/(38|40|27)/.test(e.keyCode)) return;

        var $this = $(this);

        e.preventDefault();
        e.stopPropagation();

        if ($this.is('.disabled, :disabled')) return;

        var $parent = getParent($this);
        var isActive = $parent.hasClass('open');

        if (!isActive || (isActive && e.keyCode == 27)) {
            if (e.which == 27) $parent.find(toggle).trigger('focus');
            return $this.trigger('click');
        }

        var desc = ' li:not(.divider):visible a';
        var $items = $parent.find('[role="menu"]' + desc + ', [role="listbox"]' + desc);

        if (!$items.length) return;

        var index = $items.index($items.filter(':focus'));

        if (e.keyCode == 38 && index > 0) index--; // up
        if (e.keyCode == 40 && index < $items.length - 1) index++; // down
        if (!~index) index = 0;

        $items.eq(index).trigger('focus');
    };

    function clearMenus(e) {
        if (e && e.which === 3) return;
        $(toggle).each(function() {
            var $parent = getParent($(this));
            var relatedTarget = { relatedTarget: this };
            if (!$parent.hasClass('open')) return;
            $parent.trigger(e = $.Event('hide.mn.dropdown2', relatedTarget));
            if (e.isDefaultPrevented()) return;
            $parent.removeClass('open').trigger('hidden.mn.dropdown2', relatedTarget);
        });
    }

    function getParent($this) {
        var selector = $this.attr('data-target');

        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
        }

        var $parent = selector && $(selector);

        return $parent && $parent.length ? $parent : $this.parent();
    }


    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data('mn.dropdown2');

            if (!data) $this.data('mn.dropdown2', (data = new Dropdown(this)));
            if (typeof option == 'string') data[option].call($this);
        });
    }

    var old = $.fn.dropdown;

    $.fn.dropdown = Plugin;
    $.fn.dropdown.Constructor = Dropdown;


    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.dropdown.noConflict = function() {
        $.fn.dropdown = old;
        return this;
    };


    // APPLY TO STANDARD DROPDOWN ELEMENTS
    // ===================================

    $(document)
        .on('click.mn.dropdown.data-api', clearMenus)
        .on('click.mn.dropdown.data-api', '.dropdown2', function(e) { e.stopPropagation(); })
        .on('click.mn.dropdown.data-api', toggle, Dropdown.prototype.toggle)
        // .on('keydown.mn.dropdown.data-api', toggle + ', [role="menu"], [role="listbox"]', Dropdown.prototype.keydown);

}(jQuery);

(function($) {
    var method = {
        initSection: function(callBack, $section, url, params) {
            $.ajax({
                url: url,
                data: params,
            })
            .done(function(res) {
                callBack(res.rows, $section);
            }); 
        },
        createLi: function(callBack, row) {
            var htmlStr = '';
            for (var i = row.length - 1; i >= 0; i--) {
                htmlStr += callBack(row[i]);
            }
            return htmlStr;
        },
        filterInit: function($container, key) {
            if(!key) {
                $container.find('ul li').show();
            }
            key = key.toLowerCase();
            $container.find('ul li').each(function(index, el) {
                if($(el).data('val').toString().toLowerCase().indexOf(key) > -1 || $(el).text().toString().toLowerCase().indexOf(key) > -1){
                    $(el).show();
                } else {
                    $(el).hide();
                }
            });
        }
    };

    var $advContainer = $('.menu-container[data-type=adv]'),
        $campContainer = $('.menu-container[data-type=camp]'),
        $advSection = $advContainer.find('.menu-section'),
        $campSection = $campContainer.find('.menu-section');

    method.initSection(function(rows, $section) {
        var innerHtml = method.createLi(function(row) {
            return '<li data-val=' + row.id + '><a href="javacript:void(0);">' + row.lite_name + '</a></li>';
        }, rows);

        $section.empty();
        $section.append(innerHtml);
    }, $advSection, 'adv.json', {param1: 'value1'});

    method.initSection(function(rows, $section) {
        var innerHtml = method.createLi(function(row) {
            return '<li data-val=' + row.id + '><a href="javacript:void(0);">' + row.name + '</a></li>';
        }, rows);

        $section.empty();
        $section.append(innerHtml);
    }, $campSection, 'camp.json', {param1: 'value1'});

    $advContainer.on('click', 'ul li', function(event) {
        event.preventDefault();
        
        var $this = $(this),
            id = $this.data('val');

        $this.addClass('active').siblings('li').removeClass('active');

        method.initSection(function(rows, $section) {
            var innerHtml = method.createLi(function(row) {
                return '<li data-val=' + row.id + '><a href="javacript:void(0);">' + row.name + '</a></li>';
            }, rows);

            $section.empty();
            $section.append(innerHtml);
        }, $campSection, 'camp.json', {id: id});
        return false;
    });
    var lastTime;
    $('.menu-container').on('keyup', 'input', function(event) {
        event.preventDefault();
        var val = $(this).val(),
            $container = $(this).closest('.menu-container');

        lastTime = event.timeStamp;
        setTimeout(function(){
            if(lastTime - event.timeStamp === 0){
                method.filterInit($container, val);
            }
        },500);
        return false;
    });

})(jQuery);
