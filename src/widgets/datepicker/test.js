/*global test, asyncTest, ok, equal, deepEqual, start, module, strictEqual, notStrictEqual, raises*/
define([
    'vendor/jquery',
    'vendor/underscore',
    'vendor/moment',
    './../datepicker'
], function($, _, moment, DatePicker) {

    var yyyy = moment().format('YYYY'), mm = moment().format('MM');

    test('DatePicker.numDaysInMonth', function() {
        _.each([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], function(days, i) {
            // get the first day of month 'i' (on a non-leap-year)
            var firstDayOfMonth = moment('2001-' + (i+1) + '-01', 'YYYY-MM-DD');
            equal(DatePicker.numDaysInMonth(firstDayOfMonth), days);
        });
        equal(DatePicker.numDaysInMonth(moment('2000 2', 'YYYY MM')), 29);
    });

    module('mothview');

    test('instantiation', function() {
        ok(DatePicker.MonthView());
    });

    test('monthview date placement 1', function() {
        var m = DatePicker.MonthView(undefined, {date: moment('2012-07-13')});
        equal(m.$node.find('tr:first td:eq(0)').text().trim(), '1');
        equal(m.$node.find('tr:last td:eq(2)').text().trim(), '31');
        equal(m.$node.find('tr:last td:eq(3)').text().trim(), '');
        equal(m.$node.find('tr:last td:eq(4)').text().trim(), '');
        equal(m.$node.find('tr:last td:eq(5)').text().trim(), '');
        equal(m.$node.find('tr:last td:eq(6)').text().trim(), '');
    });

    test('monthview date placement 2', function() {
        var m = DatePicker.MonthView(undefined, {date: moment('2012-06-02')});
        equal(m.$node.find('tr:first td:eq(0)').text().trim(), '');
        equal(m.$node.find('tr:first td:eq(1)').text().trim(), '');
        equal(m.$node.find('tr:first td:eq(2)').text().trim(), '');
        equal(m.$node.find('tr:first td:eq(3)').text().trim(), '');
        equal(m.$node.find('tr:first td:eq(4)').text().trim(), '');
        equal(m.$node.find('tr:first td:eq(5)').text().trim(), '1');
        equal(m.$node.find('tr:last td:last').text().trim(), '30');
    });

    test('monthview date placement 3', function() {
        var m = DatePicker.MonthView(undefined, {date: moment('2012-05-02')});
        equal(m.$node.find('tr:first td:eq(0)').text().trim(), '');
        equal(m.$node.find('tr:first td:eq(1)').text().trim(), '');
        equal(m.$node.find('tr:first td:eq(2)').text().trim(), '1');
        equal(m.$node.find('tr:last td:eq(4)').text().trim(), '31');
        equal(m.$node.find('tr:last td:eq(5)').text().trim(), '');
    });

    test('current date class', function() {
        var m = DatePicker.MonthView(undefined, {date: moment('2012-07-13')});
        ok(m.$node.find('tr:eq(1) td:eq(5)').hasClass('current'));
    });

    module('datepicker');

    var openDatePicker = function(datePicker, options) {
            if (options && options.method === 'click') {
                datePicker.$node.find('input').trigger('click').trigger('focus');
            } else {
                datePicker.$node.find('input').trigger('focus');
            }
        },
        dateIsSelected = function(datePicker, date) {
            date = moment(date);
            if (datePicker.getValue() == null || date == null) {
                ok(datePicker.getValue() == null && date == null);
                equal(datePicker.monthView.$node.find('td.selected').length, 0);
                equal(datePicker.$node.find('input[type=text]').val(), '');
                return;
            }
            equal(datePicker.getValue().toString(), date._d.toString());
            datePicker.monthView.$node.find('td').each(function(i, el) {
                if ((new RegExp('^' + date.date().toString() + '$')).test($(el).text().trim())) {
                    ok($(el).hasClass('selected'), [
                        'expected el to be selected,' +
                        'date: ', date.format('YYYY-MM-DD'), ', ' + 
                        'el.class:' + el.className + ', ' + 
                        'text: ' + $(el).text()].join());
                } else {
                    ok(!$(el).hasClass('selected'), [
                        'expected el NOT to be selected,' +
                        'date: ', date.format('YYYY-MM-DD'), ', ' + 
                        'el.class:' + el.className + ', ' + 
                        'text: ' + $(el).text()].join());
                }
            });
            equal(datePicker.$node.find('input[type=text]').val(),
                    date.format('YYYY-MM-DD'));
        },
        clickOnDate = function(datePicker, date) {
            var dfd = $.Deferred();
            date = _.isString(date)? moment(date) : date;
            datePicker.$node
                .find('td:contains('+date.date()+')').trigger('mouseup').end()
                .find('input[type=text]').trigger('blur');
            setTimeout(function() {dfd.resolve();}, 0);
            return dfd;
        },
        clickOutsideOfPicker = function() {
            $('body div:first').trigger('mousedown');
        };


    test('instantiation', function() {
        var $node = $('<div>').appendTo('#qunit-fixture');
        ok(DatePicker($node).menu.show());
        ok(DatePicker());
    });

    test('clicking input box opens the datepicker', function() {
        var dp = DatePicker(undefined, {date: moment('2012-07-13')});
        openDatePicker(dp);
        ok(dp.menu.isShown());
    });

    test('clicking right arrow advances the month', function() {
        var dp = DatePicker(undefined, {date: moment('2012-07-13')});
        openDatePicker(dp);
        dp.menu.$node.find('h4 .right').trigger('click');
        equal(dp.options.date.format('YYYY-MM-DD'), '2012-08-13');
    });

    test('clicking left arrow retreats the month', function() {
        var dp = DatePicker(undefined, {date: moment('2012-07-13')});
        openDatePicker(dp);
        dp.menu.$node.find('h4 .left').trigger('click');
        equal(dp.options.date.format('YYYY-MM-DD'), '2012-06-13');
    });

    test('disabling', function() {
        var dp = DatePicker().appendTo('#qunit-fixture');
        dp.disable();
        equal(dp.$node.hasClass('disabled'), true);
        equal(dp.input.$node.is(':disabled'), true);
    });

    asyncTest('clicking a day sets the selected date', function() {
        var dp = DatePicker(undefined, {date: moment('2012-07-13')});
        openDatePicker(dp);

        clickOnDate(dp, '2012-07-14').done(function() {
            dateIsSelected(dp, moment('2012-07-14'));

            clickOnDate(dp, '2012-07-28').done(function() {
                dateIsSelected(dp, moment('2012-07-28'));
                start();
            });
        });
    });

    module('datepicker input');

    test('setting value in the input sets value', function() {
        var dp = DatePicker(undefined, {date: moment('2012-07-13')});

        openDatePicker(dp);
        dp.$node.find('input[type=text]').val('2012-07-12')
            .trigger($.Event('keydown', {which: 9}));
        dateIsSelected(dp, moment('2012-07-12'));

        openDatePicker(dp);
        dp.$node.find('input[type=text]').val('2012-07-28')
            .trigger($.Event('keydown', {which: 13}));
        dateIsSelected(dp, moment('2012-07-28'));
    });

    test('invalid value in the input is reset', function() {
        var dp = DatePicker()
            .appendTo($('#qunit-fixture'))
            .set('date', moment('2012-07-13'));

        openDatePicker(dp);
        dp.$node.find('input[type=text]').val('asdfasdf')
            .trigger($.Event('keydown', {which: 9}));
        dateIsSelected(dp, null);

        openDatePicker(dp);
        dp.$node.find('input[type=text]').val('2012-07-12')
            .trigger($.Event('keydown', {which: 9}));
        dateIsSelected(dp, moment('2012-07-12'));

        openDatePicker(dp);
        dp.$node.find('input[type=text]').val('asdfasdf')
            .trigger($.Event('keydown', {which: 13}));
        dateIsSelected(dp, moment('2012-07-12'));
    });

    module('datepicker tracking');

    test('from date tracks start date when start date > end date', function() {
        var start = DatePicker(), end = DatePicker(), date;
        start.track(end);

        end.setValue('2011-01-01');
        start.setValue('2011-01-20');
        ok(moment(end.getValue()).diff(moment(start.getValue())) === 0,
            'end date tracks start date');

        date = moment(end.getValue());
        equal(date.year(), '2011', 'year is equal');
        equal(date.month(), '0', 'month is equal'); // zero indexed
        equal(date.date(), '20', 'day is equal'); // date is the day, day is the day of the week
    });

    test('start date tracks end date when end date < start date', function() {
        var start = DatePicker(), end = DatePicker(), date;
        start.track(end);

        start.setValue('2011-01-20');
        end.setValue('2011-01-01');
        ok(moment(end.getValue()).diff(moment(start.getValue())) === 0,
            'start date tracks end date');

        date = moment(start.getValue());
        equal(date.year(), '2011', 'year is equal');
        equal(date.month(), '0', 'month is equal'); // zero indexed
        equal(date.date(), '01', 'day is equal'); // date is the day, day is the day of the week
    });

    module('random @$$ corner cases');

    asyncTest('open and click a date, click outside, reopen and click another date', function() {
        var $node = $('<div>').appendTo('#qunit-fixture'), dp = DatePicker($node, {
            date: moment('2012-07-13')
        });

        setTimeout(function() {
            openDatePicker(dp, 'click');
            clickOnDate(dp, '2012-07-02').done(function() {
                clickOutsideOfPicker();
                dateIsSelected(dp, '2012-07-02');

                openDatePicker(dp, 'click');
                clickOnDate(dp, '2012-07-03').done(function() {
                    dateIsSelected(dp, '2012-07-03');
                    start();
                });
            });
        }, 0);
    });

    asyncTest('selecting a date then clicking right arrow doesnt show selection', function() {
        var dp = DatePicker(undefined, {date: moment('2012-07-13')});
        openDatePicker(dp);
        clickOnDate(dp, '2012-07-14').done(function() {
            dp.menu.$node.find('h4 .right').trigger('click');
            equal(dp.options.date.format('YYYY-MM-DD'), '2012-08-14');
            equal(dp.$node.find('td.selected').length, 0);
            start();
        });
    });

    // see DAQ-223
    asyncTest('calling getValue w/o bluring after keyboard entry', function() {
        var dp = DatePicker().appendTo('#qunit-fixture');
        openDatePicker(dp);
        clickOnDate(dp, yyyy+'-'+mm+'-14').done(function() {
            dp.$node.find('input').focus();
            setTimeout(function() {
                dp.$node.find('input')
                    .val('2010-'+mm+'-14')
                    .trigger($.Event('keyup', {which: 48}));
                setTimeout(function() {
                    equal(dp.getValue().toString(),
                        moment('2010-'+mm+'-14')._d.toString());
                    start();
                }, 15);
            }, 15);
        });
    });

    module('testing by hand');

    test('make a datepicker', function() {
        var $dpDiv = $('<div class=dpdiv></div>').appendTo('body'),
            dp = DatePicker().appendTo($dpDiv),
            $display = $('<div>value: <span class=display></span></div>')
                .appendTo('body')
                .find('.display');

        $dpDiv.height(250);

        dp.on('change keyup mouseup', function() {
            setTimeout(function() {
                $display.html(dp.getValue());
            }, 0);
        });

        ok(dp);
    });

    start();
});

