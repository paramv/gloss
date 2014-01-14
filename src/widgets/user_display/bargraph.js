/**
 * Author: Ralph Smith
 * Date: 4/26/12
 * Time: 12:10 PM
 * Description: builds a bar graph from a JSON object
 */

define([
    'vendor/jquery',
    './../base/widget',
    './../../util/format',
    'tmpl!./bargraph/bargraph.mtpl',
    'tmpl!./bargraph/verticalbargraph.mtpl',
    'css!./bargraph/bargraph.css'
], function ($, Widget, Format, template, verticalTemplate) {
    return Widget.extend({
        defaults: {
            data: null,         /* list of the format: [
             * {content: '...', values: ['...', '...']},
             * {content: '...', values: ['...', '...']},
             * {content: '...', values: ['...', '...']},
             * ...
             * ]
             */
            verticalLayout: false,
            formatData: false,
            barHeight: 10,      // height in px
            maxWidth: 100,      // width in px
            animationDuration: 1000
        },
        nodeTemplate: '<div>',

        create: function() {
            var self = this;
            this._super();

            self.$graphBars;
            self.maxValue;
            self.lerpValue;
            self.$node.addClass('bargraph');

            self.update();
        },
        renderGraphBars: function() {
            var self = this;
            for(var i=0, l=self.$graphBars.length; i < l; i++) {
                self.renderGraphBar($(self.$graphBars[i]));
            }
        },
        renderGraphBar: function($bar) {
            var self = this,
                cssProps, width;

            // -- interpolate width for max width
            width = $bar.attr('value') * self.lerpValue;
            cssProps = {
                width: ((width < 1) ? 1 : width) + 'px'
            }
            $bar.css('height', self.options.barHeight);
            $bar.animate(cssProps, self.options.animationDuration);
        },
        _getMaxValue: function() {
            var self = this,
                data = self.options.data,
                max = 0;

            for(var i=data.length-1; i >= 0; i--) {
                for(var j=data[i].values.length-1; j >=0; j-- ) {
                    max = (data[i].values[j] > max) ? data[i].values[j] : max;
                }
            }
            return max;
        },
        updateWidget: function(updated) {
            var self = this;
            this._super(updated);

            if(updated.data) {
                if(self.options.data !== null){
                    var $graphCells, $html,
                        mtplParams = {
                            data: self.options.data,
                            formatData: self.options.formatData,
                            Format: Format
                        }


                    $html = (self.options.verticalLayout) ?
                        $(verticalTemplate(mtplParams)) :
                        $(template(mtplParams));

                    // -- set initial size of the graph cell to max
                    $graphCells = $html.find('.graph-bar-cell');
                    for(var i=$graphCells.length; i >= 0; i--) {
                        $($graphCells[i]).css('width', self.options.maxWidth);
                    }

                    self.maxValue = self._getMaxValue();
                    self.lerpValue = self.options.maxWidth / self.maxValue;
                    self.$node.find('table').remove();
                    self.$node.append($html);
                    self.$graphBars = self.$node.find('.graph-bar');
                    self.renderGraphBars();
                }
            }
        }
    });
});
