/**
 * Created with IntelliJ IDEA.
 * User: omer.saeed
 * Date: 11/8/12
 * Time: 3:49 PM
 * To change this template use File | Settings | File Templates.
 */
define([
    'vendor/underscore',
    'strings'
], function(_, strings) {

    var flattenErrors = function(structuralErrors, flattenedErrors, parentFieldName) {
        var self = this;
        flattenedErrors = (typeof flattenedErrors === "undefined") ? {} : flattenedErrors;
        if(structuralErrors) {
            if($.isArray(structuralErrors)) {
                if (structuralErrors[0].message) {
                    flattenedErrors[parentFieldName] = structuralErrors;
                } else {
                    $.each(structuralErrors, function(field, errors) {
                        self.flattenErrors(errors, flattenedErrors, parentFieldName);
                    });
                }
            } else {
                $.each(structuralErrors, function(field, errors) {
                    var contextField = field;
                    if (parentFieldName) {
                        contextField = parentFieldName + '.' + contextField;
                    }
                    self.flattenErrors(errors, flattenedErrors, contextField);
                });
            }
        }
        return flattenedErrors;
    };

    var processGlobalErrors =  function(response, xhr, messageList, errorCls, extraStrings) {
        var globalErrors = response && response[0],
            allStrings = _.extend.apply(_,
                    _.compact(_.flatten([{}, strings.errors, extraStrings]))),
            tokensToStrings = function(errors) {
                return _.map(errors, function(error) {
                    return  allStrings[error.token] ||
                            error.message ||
                            error.token ||
                            '';
                });
            };

        errorCls = errorCls || 'invalid';

        if (messageList) {
            if (globalErrors) {
                messageList.append(errorCls, tokensToStrings(globalErrors));
            } else if (xhr && xhr.status === 500) {
                messageList.append(errorCls, xhr.statusText); // empty 500
            } else {
                // don't know how we could get here...
                messageList.append(errorCls,
                    (strings.errors && strings.errors.invalid) ||
                        'there was an error');
            }
        }
    };

    return {
        flattenErrors: flattenErrors,
        processGlobalErrors: processGlobalErrors
    };
});
