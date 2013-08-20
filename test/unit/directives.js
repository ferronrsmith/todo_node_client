/*global describe, beforeEach, module, inject, it, expect, angular, jasmine, $  */
/*jslint nomen:true*/

describe('ngEvents Unit Test', function () {
    "use strict";
    var $scope, $rootScope, $compile;

    beforeEach(module('todomvc'));
    beforeEach(inject(function (_$rootScope_, _$compile_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    //helper for creating event elements
    function eventElement(scope, eventObject) {
        scope._ngEvent = eventObject || {};
        return $compile('<span ng-event="_ngEvent">')(scope);
    }

    // describe('test', function () {
    it('should work with dblclick event and assignment', function () {
        $scope = $rootScope.$new();
        var elm = eventElement($scope, {'dblclick': 'dbl=true'});
        expect($scope.dbl).toBeUndefined();
        elm.trigger('dblclick');
        expect($scope.dbl).toBe(true);
    });

    it('should work with two events in one key a function', function () {
        $scope = $rootScope.$new();
        $scope.counter = 0;
        $scope.myfn = function () {
            $scope.counter += 1;
        };
        var elm = eventElement($scope, {'keyup mouseenter': 'myfn()'});
        elm.trigger('keyup');
        elm.trigger('mouseenter');
        expect($scope.counter).toBe(2);
    });

    it('should work work with multiple entries', function () {
        $scope = $rootScope.$new();
        $scope.amount = 5;
        var elm = eventElement($scope, {
            'click': 'amount=amount*2',
            'mouseenter': 'amount=amount*4',
            'keyup': 'amount=amount*3'
        });
        elm.trigger('click');
        expect($scope.amount).toBe(10);
        elm.trigger('mouseenter');
        expect($scope.amount).toBe(40);
        elm.trigger('keyup');
        expect($scope.amount).toBe(120);
    });

    it('should allow passing of $event object', function () {
        $scope = $rootScope.$new();
        $scope.clicky = function (par1, $event, par2) {
            expect($event.foo).toBe('bar');
            expect(par1).toBe(1);
            expect(par2).toBe(2);
        };
        var elm = eventElement($scope, {'click': 'clicky(1, $event, 2)'});
        $(elm).trigger({
            type: 'click',
            foo: 'bar'
        });
    });

    it('should allow passing of $params object', function () {
        $scope = $rootScope.$new();
        $scope.onStuff = function ($event, $params) {
            expect($event.type).toBe('stuff');
            expect($params[0]).toBe('foo');
            expect($params[1]).toBe('bar');
        };
        var elm = eventElement($scope, {'stuff': 'onStuff($event, $params)'});
        $(elm).trigger('stuff', ['foo', 'bar']);
    });
    // });

});

describe('ngValidate Unit Test', function ($compile) {
    "use strict";
    var scope, compileAndDigest, trueValidator, falseValidator, passedValueValidator;

    trueValidator = function () {
        return true;
    };

    falseValidator = function () {
        return false;
    };

    passedValueValidator = function (valueToValidate) {
        return valueToValidate;
    };

    beforeEach(module('todomvc'));
    beforeEach(inject(function ($rootScope, $compile) {

        scope = $rootScope.$new();
        compileAndDigest = function (inputHtml, scope) {
            var inputElm = angular.element(inputHtml), formElm;
            formElm = angular.element('<form name="form"></form>');
            formElm.append(inputElm);
            $compile(formElm)(scope);
            scope.$digest();

            return inputElm;
        };
    }));

    describe('initial validation', function () {

        it('should mark input as valid if initial model is valid', inject(function () {

            scope.validate = trueValidator;
            compileAndDigest('<input name="input" ng-model="value" ng-validate="\'validate($value)\'">', scope);
            expect(scope.form.input.$valid).toBeTruthy();
            expect(scope.form.input.$error).toEqual({validator: false});
        }));

        it('should mark input as invalid if initial model is invalid', inject(function () {

            scope.validate = falseValidator;
            compileAndDigest('<input name="input" ng-model="value" ng-validate="\'validate($value)\'">', scope);
            expect(scope.form.input.$valid).toBeFalsy();
            expect(scope.form.input.$error).toEqual({ validator: true });
        }));
    });

    describe('validation on model change', function () {

        it('should change valid state in response to model changes', inject(function () {

            scope.value = false;
            scope.validate = passedValueValidator;
            compileAndDigest('<input name="input" ng-model="value" ng-validate="\'validate($value)\'">', scope);
            expect(scope.form.input.$valid).toBeFalsy();

            scope.$apply('value = true');
            expect(scope.form.input.$valid).toBeTruthy();
        }));
    });

    describe('validation on element change', function () {

        var sniffer;
        beforeEach(inject(function ($sniffer) {
            sniffer = $sniffer;
        }));

        it('should change valid state in response to element events', function () {

            scope.value = false;
            scope.validate = passedValueValidator;
            var inputElm = compileAndDigest('<input name="input" ng-model="value" ng-validate="\'validate($value)\'">', scope);
            expect(scope.form.input.$valid).toBeFalsy();

            inputElm.val('true');
            inputElm.trigger((sniffer.hasEvent('input') ? 'input' : 'change'));

            expect(scope.form.input.$valid).toBeTruthy();
        });
    });

    describe('multiple validators with custom keys', function () {

        it('should support multiple validators with custom keys', function () {

            scope.validate1 = trueValidator;
            scope.validate2 = falseValidator;

            compileAndDigest('<input name="input" ng-model="value" ng-validate="{key1 : \'validate1($value)\', key2 : \'validate2($value)\'}">', scope);
            expect(scope.form.input.$valid).toBeFalsy();
            expect(scope.form.input.$error.key1).toBeFalsy();
            expect(scope.form.input.$error.key2).toBeTruthy();
        });
    });

    describe('Testing ngValidateWatch', function () {
        function validateWatch(watchMe) {
            return watchMe;
        }

        beforeEach(function () {
            scope.validateWatch = validateWatch;
        });

        it('should watch the string and refire the single validator', function () {
            scope.watchMe = false;
            compileAndDigest('<input name="input" ng-model="value" ng-validate="\'validateWatch(watchMe)\'" ng-validate-watch="\'watchMe\'">', scope);
            expect(scope.form.input.$valid).toBe(false);
            expect(scope.form.input.$error.validator).toBe(true);
            scope.$apply('watchMe=true');
            expect(scope.form.input.$valid).toBe(true);
            expect(scope.form.input.$error.validator).toBe(false);
        });

        it('should watch the string and refire all validators', function () {
            scope.watchMe = false;
            compileAndDigest('<input name="input" ng-model="value" ng-validate="{foo:\'validateWatch(watchMe)\',bar:\'validateWatch(watchMe)\'}" ng-validate-watch="\'watchMe\'">', scope);
            expect(scope.form.input.$valid).toBe(false);
            expect(scope.form.input.$error.foo).toBe(true);
            expect(scope.form.input.$error.bar).toBe(true);
            scope.$apply('watchMe=true');
            expect(scope.form.input.$valid).toBe(true);
            expect(scope.form.input.$error.foo).toBe(false);
            expect(scope.form.input.$error.bar).toBe(false);
        });

        it('should watch the all object attributes and each respective validator', function () {
            scope.watchFoo = false;
            scope.watchBar = false;
            compileAndDigest('<input name="input" ng-model="value" ng-validate="{foo:\'validateWatch(watchFoo)\',bar:\'validateWatch(watchBar)\'}" ng-validate-watch="{foo:\'watchFoo\',bar:\'watchBar\'}">', scope);
            expect(scope.form.input.$valid).toBe(false);
            expect(scope.form.input.$error.foo).toBe(true);
            expect(scope.form.input.$error.bar).toBe(true);
            scope.$apply('watchFoo=true');
            expect(scope.form.input.$valid).toBe(false);
            expect(scope.form.input.$error.foo).toBe(false);
            expect(scope.form.input.$error.bar).toBe(true);
            scope.$apply('watchBar=true');
            scope.$apply('watchFoo=false');
            expect(scope.form.input.$valid).toBe(false);
            expect(scope.form.input.$error.foo).toBe(true);
            expect(scope.form.input.$error.bar).toBe(false);
            scope.$apply('watchFoo=true');
            expect(scope.form.input.$valid).toBe(true);
            expect(scope.form.input.$error.foo).toBe(false);
            expect(scope.form.input.$error.bar).toBe(false);
        });

    });

    describe('Testing error cases', function () {
        it('should fail if ngModel not present', inject(function () {
            expect(function () {
                compileAndDigest('<input name="input" ng-validate="\'validate($value)\'">', scope);
            }).toThrow(new Error('No controller: ngModel'));
        }));
        it('should have no effect if validate expression is empty', inject(function () {
            compileAndDigest('<input ng-model="value" ng-validate="">', scope);
        }));
    });
});
