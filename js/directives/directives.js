/*jslint unparam : true*/
/*global todomvc, angular  */


/**
 * General-purpose Event binding. Bind any event not natively supported by Angular
 * Pass an object with keynames for events to ng-event
 * Allows $event object and $params object to be passed
 *
 * @example <input ng-event="{ focus : 'counter++', blur : 'someCallback()' }">
 * @example <input ng-event="{ myCustomEvent : 'myEventHandler($event, $params)'}">
 *
 * @param ng-event {string|object literal} The event to bind to as a string or a hash of events with their callbacks
 */
todomvc.directive('ngEvent', ['$parse',
    function ($parse) {
        "use strict";
        return function (scope, elm, attrs) {
            var events = scope.$eval(attrs.ngEvent);
            angular.forEach(events, function (ngEvent, eventName) {
                var fn = $parse(ngEvent);
                elm.bind(eventName, function (evt) {
                    var params = Array.prototype.slice.call(arguments);
                    //Take out first parameter (event object);
                    params = params.splice(1);
                    fn(scope, {$event: evt, $params: params});
                    // check if if there is something to digest
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                });
            });
        };
    }]);


/**
 * General-purpose validator for ngModel.
 * angular.js comes with several built-in validation mechanism for input fields (ngRequired, ngPattern etc.) but using
 * an arbitrary validation function requires creation of a custom formatters and / or parsers.
 * The ng-validate directive makes it easy to use any function(s) defined in scope as a validator function(s).
 * A validator function will trigger validation on both model and input changes.
 *
 * @example <input ng-validate=" 'myValidatorFunction($value)' ">
 * @example <input ng-validate="{ foo : '$value > anotherModel', bar : 'validateFoo($value)' }">
 * @example <input ng-validate="{ foo : '$value > anotherModel' }" ng-validate-watch=" 'anotherModel' ">
 * @example <input ng-validate="{ foo : '$value > anotherModel', bar : 'validateFoo($value)' }" ng-validate-watch=" { foo : 'anotherModel' } ">
 *
 * @param ng-validate {string|object literal} If strings is passed it should be a scope's function to be used as a validator.
 * If an object literal is passed a key denotes a validation error key while a value should be a validator function.
 * In both cases validator function should take a value to validate as its argument and should return true/false indicating a validation result.
 */
todomvc.directive('ngValidate', function () {
    "use strict";
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            var validateFn, validators = {},
                validateExpr = scope.$eval(attrs.ngValidate);

            if (!validateExpr) {
                return;
            }

            if (angular.isString(validateExpr)) {
                validateExpr = { validator: validateExpr };
            }

            angular.forEach(validateExpr, function (exprssn, key) {
                validateFn = function (valueToValidate) {
                    var expression = scope.$eval(exprssn, { '$value': valueToValidate });
                    if (angular.isObject(expression) && angular.isFunction(expression.then)) {
                        // expression is a promise
                        expression.then(function () {
                            ctrl.$setValidity(key, true);
                        }, function () {
                            ctrl.$setValidity(key, false);
                        });
//                        return valueToValidate;
                    } else if (expression) {
                        // expression is true
                        ctrl.$setValidity(key, true);
//                        return valueToValidate;
                    } else {
                        // expression is false
                        ctrl.$setValidity(key, false);
//                        return undefined;
                    }
                    return valueToValidate;
                };
                validators[key] = validateFn;
                ctrl.$formatters.push(validateFn);
                ctrl.$parsers.push(validateFn);
            });

            function apply_watch(watch) {
                //string - update all validators on expression change
                if (angular.isString(watch)) {
                    scope.$watch(watch, function () {
                        angular.forEach(validators, function (validatorFn) {
                            validatorFn(ctrl.$modelValue);
                        });
                    });
                    return;
                }

                //array - update all validators on change of any expression
                if (angular.isArray(watch)) {
                    angular.forEach(watch, function (expression) {
                        scope.$watch(expression, function () {
                            angular.forEach(validators, function (validatorFn) {
                                validatorFn(ctrl.$modelValue);
                            });
                        });
                    });
                    return;
                }

                //object - update appropriate validator
                if (angular.isObject(watch)) {
                    angular.forEach(watch, function (expression, validatorKey) {
                        //value is string - look after one expression
                        if (angular.isString(expression)) {
                            scope.$watch(expression, function () {
                                validators[validatorKey](ctrl.$modelValue);
                            });
                        }

                        //value is array - look after all expressions in array
                        if (angular.isArray(expression)) {
                            angular.forEach(expression, function (intExpression) {
                                scope.$watch(intExpression, function () {
                                    validators[validatorKey](ctrl.$modelValue);
                                });
                            });
                        }
                    });
                }
            }

            // Support for ng-validate-watch
            if (attrs.ngValidateWatch) {
                apply_watch(scope.$eval(attrs.ngValidateWatch));
            }
        }
    };
});

