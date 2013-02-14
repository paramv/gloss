define([
    'vendor/underscore'
], function(_) {
    return function() {

        // var self = this;
        // _.wrap(this.init, function(init) {
        //     if (!self.get('keyboardNavigation')) {
        //         return;
        //     }
        //     self.$el.bind('keyup', 'tbody tr', function(evt) {
        //         var selectModel, selectIndex,
        //             selected = self.selected(),
        //             models = self.get('models');

        //         if (!selected || !self.$rowInnerWrapper.is(':visible')) {
        //             return;
        //         }
        //         if (evt.which === 13) {      //  - enter key
        //             self._trFromModel(selected).trigger('dblclick');
        //             console.log('trigger');
        //             return;
        //         } else if (evt.which === 38) {             //  - up arrow
        //             selectIndex = models.indexOf(selected) - 1;
        //         } else if (evt.which === 40) {      //  - down arrow
        //             selectIndex = models.indexOf(selected) + 1;
        //         }
        //         selectModel = models[selectIndex];
        //         if (selectModel) {
        //             self.select(selectModel);
        //         }
        //     });
        // });
        var _bindKeyboardNavigation = function() {
            var self = this;
            if (!this.get('keyboardNavigation')) {
                return;
            }
            //  - We don't want the page to scroll when were trying to navigate
            //  - with the keyboard so we're going to prevent that here.
            var keys = [38,40];
            this.$el.bind('keydown', 'tbody tr', function(evt) {
                var key = evt.which;
                if(_.contains(keys, key)) {
                    evt.preventDefault();
                    return false;
                }
                return true;
            });
            this.$el.bind('keyup', 'tbody tr', function(evt) {
                var selectModel, selectIndex,
                    selected = self.selected(),
                    models = self.get('models'),
                    scrollTop = 0,
                    trHeight = self.$rowInnerWrapper.find('tr').first().height();

                if (!selected || !self.$rowInnerWrapper.is(':visible')) {
                    return;
                }
                if (evt.which === 13) {      //  - enter key
                    self._trFromModel(selected).trigger('dblclick');
                    console.log('trigger');
                    return;
                } else if (evt.which === 38) {             //  - up arrow
                    selectIndex = models.indexOf(selected) - 1;
                    scrollTop = self.$rowInnerWrapper.scrollTop() - trHeight;
                } else if (evt.which === 40) {      //  - down arrow
                    selectIndex = models.indexOf(selected) + 1;
                    scrollTop = self.$rowInnerWrapper.scrollTop() + trHeight;
                }
                selectModel = models[selectIndex];
                if (selectModel) {
                    self.select(selectModel);
                    var top = self._trFromModel(selectModel).position().top,
                        gridHeight = self.$rowInnerWrapper.height();
                    if (top > gridHeight || top < trHeight) {
                        self.$rowInnerWrapper.scrollTop(scrollTop);
                    }
                }
            });
        };

        if(!this.afterInit) {
            this.afterInit = [];
        }
        this.afterInit.push(_bindKeyboardNavigation);
    };
});
