define([
    'vendor/jquery',
    'vendor/underscore',
    'vendor/t',
    './../../base/widget',
    '../grid/row'
], function($, _, t, Widget, Row) {
    return Row.extend({
        defaults: {
            node: null, // required
            expandText: '&#x25bc;',
            collapseText: '&#x25ba;',
            childText: '&#9679;', // black circle
            indentText: '&nbsp;&nbsp;&nbsp;&nbsp;'
        },

        __new__: function(constructor, base, prototype) {
            var i, l, col, defaults = prototype.defaults, colModel = defaults.colModel;
            if (colModel) {
                for (i = 0, l = colModel.length; i < l; i++) {
                    col = colModel[i];
                    if (col.expandCol) {
                        defaults.expandColIndex = i;
                        defaults.expandColName = col.name;
                        col.render = 'renderColExpand';
                        col.rerender = 'rerenderColExpand';
                        break;
                    }
                }
            }
            if (! defaults.events) {
                defaults.events = [];
            }
            defaults.events.push({
                on: 'click',
                selector: '.expand',
                callback: 'onClickExpand'
            });

            // we need to run the Widget.prototype.__new__ method as well so
            // that the derived class's 'defaults' is extended with this
            // class's 'defaults'
            Widget.prototype.__new__.apply(this, arguments);
        },

        create: function() {
            var i, l, col, self = this,
                colModel = self.options.colModel;
            self._super();
        },

        _childRows: function() {
            var childCount = 0,
                options = this.options,
                index = options.idx,
                grid = options.grid;
            t.dfs(options.node.children || [], function() {
                childCount++;
            });
            return grid.options.rows.slice(index+1, index+childCount+1);
        },

        _parentRow: function() {
            var i, options = this.options,
                rows = options.grid.options.rows,
                par = options.node.par,
                idx = options.idx;
            if (!idx || par.model.id == null) {
                return undefined;
            } else {
                for (i = idx-1; i >= 0; i--) {
                    if (rows[i].options.node === par) {
                        return rows[i];
                    }
                }
            }
        },

        _expandSpan: function() {
            return this.$node.find('td').eq(this.options.expandColIndex)
                .find('.expand');
        },

        collapse: function() {
            var options = this.options, node = options.node;
            this.options.grid.unhighlight();
            if (! node.model.isparent) {
                return $.Deferred().resolve();
            }
            options.grid.setExpanded(node, false);
            this._expandSpan().html(this.options.collapseText);
            _.each(this._childRows(), function(row) { row.hide(); });
            return $.Deferred().resolve();
        },

        expand: function() {
            var self = this, options = self.options, node = options.node;
            self.options.grid.unhighlight();
            if (! node.model.isparent) {
                return $.Deferred().resolve();
            }
            options.grid.setExpanded(node, true);
            self._expandSpan().html(self.options.expandText);
            return node.load().done(function() {
                var expand = [];
                t.dfs(node.children, function() {
                    expand.push(options.grid.getExpanded(this.par));
                });
                _.each(self._childRows(), function(row, i) {
                    row[expand[i]? 'show' : 'hide']();
                });
            });
        },

        moveTo: function(row, index) {
            var self = this,
                options = self.options,
                node = options.node;
            if (row) {
                if (row !== self) {
                    return row.expand().done(function() {
                        node.moveTo(row.options.node, index);
                    });
                }
            } else {
                node.moveTo(options.grid.options.tree.root, index);
            }
            return $.Deferred().resolve();
        },

        onClickExpand: function() {
            if (this.options.model.isparent && !this.options.grid.getState('disabled')) {
                this.toggle();
            }
        },

        render: function() {
            var self = this, options = self.options;
            self._super();
            if (options.grid.getExpanded(options.node.par)) {
                self.show();
            } else {
                self.hide();
            }
        },

        renderColExpand: function() {
            var i, l,
                options = this.options,
                node = options.node,
                ret = ['<span class=indent>'],
                indentText = options.indentText;
            for (i = 0, l = node.level; i < l; i++) {
                ret.push(indentText);
            }
            ret.push('</span><span class="expand');
            if (! node.model.isparent) {
                ret.push('">', options.childText);
            } else if (options.grid.getExpanded(node)) {
                ret.push(' parent">', options.expandText);
            } else {
                ret.push(' parent">', options.collapseText);
            }
            ret.push('</span><span class=content>');
            ret.push(options.model[this.options.expandColName] || '');
            ret.push('</span>');
            return ret.join('');
        },

        rerenderColExpand: function() {
            var options = this.options,
                node = options.node,
                expanded = options.grid.getExpanded(node),
                index = options.expandColIndex,
                name = options.expandColName,
                expandCol = this.node.childNodes[index],
                indentTxt = Array(node.level+1).join(options.indentText),
                indent = expandCol.childNodes[0],
                expandTxt = !node.model.isparent? options.childText :
                            expanded? options.expandText :
                            options.collapseText,
                expand = expandCol.childNodes[1],
                value = expandCol.childNodes[2];
            if (indent.innerText != null) {
                indent.innerHTML = indentTxt;
                expand.innerHTML = expandTxt;
                value.innerText = node.model[name] || '';
            } else {
                indent.innerHTML = indentTxt;
                expand.innerHTML = expandTxt;
                value.textContent = node.model[name] || '';
            }
        },

        toggle: function() {
            if (this.options.grid.getExpanded(this.options.node)) {
                return this.collapse();
            } else {
                return this.expand();
            }
        },

        updateWidget: function(updated) {
            var self = this,
                options = self.options;
            if (updated.node) {
                options.model = options.node.model;
                updated.model = true;
            }
            self._super(updated);
        }

    });
});
