define([
    'vendor/jquery',
    './statefulwidget'
], function($, StatefulWidget) {
    return StatefulWidget.extend({
        managedStates: StatefulWidget.prototype.managedStates.concat('invalid', 'valid'),
        defaults: {
            initialValue: null,
            messageList: null
        },
        create: function() {
            var self = this;
            self._super();
            self.status = null;
            self.$node.addClass('formwidget');
        },
        clearStatus: function(options) {
            var messageList = this.options.messageList;
            if (messageList) {
                messageList.clear(options);
            }
            this.status = null;
            this.removeState(['invalid', 'valid']);
            return this;
        },
        disable: function() {
            this.$node.prop('disabled', true);
            this._super();
            return this;
        },
        enable: function() {
            this.$node.removeProp('disabled');
            this._super();
            return this;
        },
        getValue: function() {
            return this.$node.val();
        },
        setStatus: function(status, messages, append) {
            var messageList = this.options.messageList;
            if(messageList && !append) {
                messageList.clear();
            }
            this.removeState(['invalid', 'valid'], true);

            this.status = status;
            if(status != null) {
                this.addState(status, true);
                if(messageList && messages) {
                    messageList.append(status, messages);
                }
            }

            this.updateState();
            this.propagate('setStatus', status, messages, append);
            return this;
        },
        setValue: function(value, silent) {
            if(value !== this.$node.val()) {
                this.$node.val(value);
                if(!silent) {
                    this.trigger('change');
                }
            }
            return this;
        }
    });
});
