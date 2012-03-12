define([
    'vendor/jquery',
    'vendor/underscore',
    'vendor/gloss/widgets/widget',
    'vendor/gloss/widgets/button',
    'vendor/gloss/widgets/numberbox',
    'vendor/gloss/widgets/checkbox',
    'vendor/gloss/widgets/radiogroup',
    'vendor/gloss/widgets/selectbox',
    'vendor/gloss/widgets/textbox',
    'vendor/gloss/widgets/messagelist'
], function($, _, Widget, Button, NumberBox, CheckBox, RadioGroup, SelectBox, TextBox, MessageList) {
    return Widget.extend({
        defaults: {
            widgets: null,
            widgetize: false,
            widgetMap: [
                ['button', Button],
                ['input[type=checkbox]', CheckBox],
                ['input[type=text],input[type=password],input[type=search]', TextBox],
                ['input[type=submit],input[type=reset]', Button],
                ['input[type=number]', NumberBox],
                ['select,div.select', SelectBox],
                ['textarea', TextBox],
                ['div[class=radiogroup]', RadioGroup]
            ],
            widgetSelector: 'button[name],input[name],select[name],div.select[name],textarea[name],div[name][class=radiogroup]'
        },

        create: function() {
            var self = this;
            if (self.options.widgets == null) {
                self.options.widgets = {};
            }
            if (self.options.widgetize) {
                self.widgetizeDescendents();
            }
            $.each(self.options.widgets, function(name, widget) {
                if (widget.options.messageList === null) {
                    var candidate = self.$node.find('.messagelist[data-for=' + name + ']');
                    if (candidate.length === 1) {
                        widget.set('messageList', MessageList(candidate));
                    }
                }
            });
        },

        getValues: function() {
            var self = this, values = {};
            $.each(self.options.widgets, function(name, widget) {
                if (widget.getValue) {
                    values[name] = widget.getValue();
                }
            });
            return values;
        },

        getWidget: function(name) {
            return this.options.widgets[name];
        },

        widgetizeDescendents: function() {
            var self = this, map = this.options.widgetMap, widgets = this.options.widgets;
            self.$node.find(self.options.widgetSelector).each(function(i, node) {
                var $node = $(node);
                if (!self.registry.isWidget($node)) {
                    $.each(map, function(i, candidate) {
                        if ($node.is(candidate[0])) {
                            widgets[$node.attr('name')] = candidate[1]($node);
                        }
                    });
                }
            });
        }
    });
});
