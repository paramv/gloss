define([
    'vendor/jquery',
    'vendor/underscore',
    'bedrock/class',
    'bedrock/settable'
], function ($, _, Class, Settable) {

    var tmpl = function(tmpl) {
        return function(model, gridInstance, prop, nameAttr) {
            var val;
            prop = prop || '_checked';
            val = model.get? model.get(prop) : model[prop];
            return tmpl.replace('%s', val || '').replace('%n', nameAttr);
        };
    };

    return Class.extend({

        defaults: {
            name: '_checked',
            checkboxTemplate: tmpl('<input type=checkbox class=checkbox-column %s />'),
            radioTemplate: tmpl('<input type=radio name="%n" class=checkbox-column %s />'),
            type: 'checkbox', // set to 'radio' for radio buttons
            state: null // set to 'checked' for dafualt checked state
        },

        events: [
            {
                on: 'click',
                selector: 'th.col-_checked .checkbox-column',
                callback: 'headerChecked'
            },
            {
                on: 'click',
                selector: 'td.col-_checked .checkbox-column',
                callback: 'rowChecked'
            }
        ],

        init: function(opts) {
            if(opts && opts.state === 'checked') {
                opts.checkboxTemplate = tmpl('<input type=checkbox checked=checked class=checkbox-column %s />');
                opts.radioTemplate = tmpl('<input type=radio checked=checked name="%n" class=checkbox-column %s />');
            }
            this.set($.extend(true, {
                nameAttr: _.uniqueId('grid-checkbox-column')
            }, this.defaults, opts));
        },

        headerChecked: function(evt, grid, row) {
            var models,
                checked = $(evt.target).attr('checked') ? true : false;

            var rows = grid.options.rows;
            for(var i=0, l=rows.length; i < l; i++) {
                rows[i].$node.find('.checkbox-column').prop('checked', checked);
                rows[i].set('_checked', checked);
            }
        },

        rowChecked: function(evt, grid, row) {
            var checked = $(evt.target).attr('checked') ? true : false;
            // uncheck the header
            $(this.events[0].selector).attr('checked', false);
            // set the model property
            row.set('_checked', checked);
        },

        render: function(col, colValue, model) {
            return this.get('tmpl')(model, this.get('nameAttr'));
        },

        rerender: function(col, td, colValue, model) {
            td.innerHTML = this.render(col, colValue, model);
        },

        _settableProperty: null,

        _settableOnChange: function(changed) {
            if (changed.type) {
                this.set('tmpl', this.get(this.get('type') + 'Template'));
                this.set('label', this.get('type') === 'checkbox'?
                        this.render(null, null, {}) : '');
            }
        }
    }, {mixins: [Settable]});
});
