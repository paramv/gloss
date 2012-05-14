/*global test, asyncTest, ok, equal, deepEqual, start, module */
define([
    'component!vendor:jquery',
    'component!vendor:underscore',
    './../grid',
    './row',
    './editable',
    './../button',
    './../../data/mock',
    './../../test/api/v1/targetvolumeprofile',
    './../../test/api/v1/recordseries',
    'text!./../../test/api/v1/test/fixtures/targetvolumeprofile.json'
], function($, _, Grid, Row, Editable, Button, Mock, TargetVolumeProfile,
    RecordSeries, tvpFixture) {
    var RowClass,
        showGrid = function() {
            $('#qunit-fixture').css({position: 'static'});
        },
        hideGrid = function() {
            $('#qunit-fixture').css({position: 'absolute'});
        };

    function makeHugeFixture(origFixture) {
        var i, newTvp, copy = JSON.parse(JSON.stringify(origFixture)),
            dummy = JSON.parse(JSON.stringify(_.last(copy))),
            newFixture = [];

        for (i = 0; i < 1000; i++) {
            newTvp = JSON.parse(JSON.stringify(dummy));
            newTvp[1].id = i + 1;
            newTvp[1].name = 'target volume profile ' + (i+1);
            newFixture.push(newTvp);
        }

        return newFixture;
    }

    Mock(TargetVolumeProfile, makeHugeFixture(JSON.parse(tvpFixture)));

    RowClass = Row.extend({
        defaults: {
            colModel: [
                {name: 'grab', render: 'renderColGrab', modelIndependent: true},
                {name: 'name', label: 'Name'},
                {name: 'tasks_option', label: 'Tasks Option'},
                {name: 'volume_id', label: 'Volume ID'},
                {name: 'security_attributes', label: 'Security Attributes'},
                {name: 'set_children', render: 'renderColSetChildren', modelIndependent: true}
            ],
            events: [
                {
                    on: 'click',
                    selector: 'button.grab',
                    callback: 'onClickGrabButton'
                },
                {
                    on: 'click',
                    selector: 'button.set-children',
                    callback: 'onClickSetChildren'
                }
            ]
        },
        onClickGrabButton: function(evt) {
            console.log('grab button clicked:',this,evt);
        },
        onClickSetChildren: function(evt) {
            console.log('set children clicked:',this,evt);
        },
        renderColGrab: function(col) {
            return '<button type="button" class="button grab">m</button>';
        },
        renderColSetChildren: function(col) {
            return '<button type=button class="button set-children">Set children</button>';
        }
    });

    function verifyGridMatchesData(data, grid, limit) {
        if (limit != null) {
            equal(grid.$node.find('tbody tr').length, limit);
        }
        grid.$node.find('tbody tr').each(function(i, el) {
            equal($('td.col-name', el).text(), data[i].name);
        });
    }

    module('grid', {
        setup: function() {
            this.grid = Grid(undefined, {
                rowWidgetClass: RowClass
            });

            this.collection = TargetVolumeProfile.collection();
        }
    });

    asyncTest('instantiate grid', function() {
        var limit = 100, grid = this.grid, collection = this.collection;
        grid.appendTo($('#qunit-fixture'));
        collection.load({limit: limit}).done(function(data) {
            grid.set('models', data);
            verifyGridMatchesData(data, grid, limit);

            // give the rows a chance to attach handlers
            setTimeout(start, 15);
        });
    });

    asyncTest('switch pages on grid', function() {
        var limit = 100, grid = this.grid, collection = this.collection;
        grid.appendTo($('#qunit-fixture'));
        // grid.appendTo($('body'));
        $.when(
            collection.load({limit: limit, offset: 0}),
            collection.load({limit: limit, offset: limit}),
            collection.load({limit: limit, offset: limit*2})
        ).done(function(data1, data2, data3) {
            var $rows, models;

            grid.set('models', data1[0]);
            verifyGridMatchesData(data1[0], grid, limit);

            $rows = grid.$node.find('tbody tr');

            grid.set('models', data2[0]);
            verifyGridMatchesData(data2[0], grid, limit);

            grid.$node.find('tbody tr').each(function(i, tr) {
                equal(tr, $rows[i], 'table row was unnecessarily re-renderd');
                $('td', tr).each(function(j, td) {
                    equal(td, $rows.eq(i).find('td')[j],
                        'table column was unnecessarily re-rendered');
                });
            });

            grid.set('models', data3[0]);
            verifyGridMatchesData(data3[0], grid, limit);

            grid.set('models', data1[0]);
            verifyGridMatchesData(data1[0], grid, limit);

            grid.set('models', data1[0]);
            verifyGridMatchesData(data1[0], grid, limit);

            setTimeout(start, 15);
        });
    });

    asyncTest('add more rows to grid', function() {
        var limit = 100, grid = this.grid, collection = this.collection;
        grid.appendTo($('#qunit-fixture'));
        collection.load({limit: limit*3, offset: 0}).done(function(data) {
            var data1 = data.slice(0, limit),
                data1and2 = data.slice(0, limit*2),
                data1and2and3 = data.slice(0, limit*2 + 25);

            grid.set('models', data1);
            verifyGridMatchesData(data1, grid, limit);

            grid.set('models', data1and2);
            verifyGridMatchesData(data1and2, grid, limit*2);

            grid.set('models', data1and2and3);
            verifyGridMatchesData(data1and2and3, grid, limit*2 + 25);

            setTimeout(start, 15);
        });
    });

    asyncTest('add rows, remove rows, and then add more', function() {
        var limit = 100, grid = this.grid, collection = this.collection;
        grid.appendTo($('#qunit-fixture'));
        collection.load({limit: limit*3, offset: 0}).done(function(data) {
            var data1 = data.slice(0, limit),
                data2 = data.slice(0, limit - 25),
                data3 = data.slice(0, limit*2);

            grid.set('models', data1);
            verifyGridMatchesData(data1, grid, limit);

            grid.set('models', data2);
            verifyGridMatchesData(data2, grid, limit - 25);

            grid.set('models', data3);
            verifyGridMatchesData(data3, grid, limit*2);

            setTimeout(start, 15);
        });
    });

    module('editable grid', {
        setup: function() {
            var EditableRowClass,
                editableColModel = _.clone(RowClass.prototype.defaults.colModel);
            _.each([1, 2, 3, 4], function(i) {
                editableColModel[i].editable = true;
            });
            EditableRowClass = RowClass.extend({
                defaults: {
                    colModel: editableColModel,
                    modelClass: TargetVolumeProfile
                }
            }, {mixins: [Editable]});
            this.grid = Grid(undefined, {
                rowWidgetClass: EditableRowClass
            });

            this.collection = TargetVolumeProfile.collection();
        }
    });

    asyncTest('edit row', function() {
        var limit = 100, grid = this.grid, collection = this.collection;
        grid.appendTo($('#qunit-fixture'));
        // grid.appendTo($('body'));

        collection.load({limit: limit, offset: 0}).done(function(data) {
            grid.set('models', data);
            grid.options.rows[0].edit();
            grid.options.rows[0].form.$node.find('[name=name]').val('foo');
            grid.options.rows[0].form.trigger('submit');
            setTimeout(function() {
                equal(grid.options.rows[0].options.model.name, 'foo');
                start();
            }, 15);
        });
    });

    start();
});
