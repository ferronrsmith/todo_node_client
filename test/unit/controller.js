/*global describe, beforeEach, module, inject, it, expect, angular, jasmine  */
/*jslint nomen:true*/

describe('Todo Webapp Kinvey Test Controller', function () {
    "use strict";

    beforeEach(module('todomvc'));

    var TodoCtrl, scope, $httpBackend, todols, $headers;

    beforeEach(inject(function (_$httpBackend_, $rootScope, $controller) {
        $httpBackend =  _$httpBackend_;
        $headers = {
            'Accept': 'application/json, text/plain, */*',
            'X-Requested-With': 'XMLHttpRequest',
            Authorization : 'Basic a2lkX2VlWDBjVEpvQmY6N2IzOTc1ZWNiODhhNDNlYzk5OGUzMWJiNjcwMjIyODI='
        };

        todols = [
            {
                "title": "hey there",
                "completed": false,
                "_acl": {
                    "creator": "kid_eeX0cTJoBf"
                },
                "_kmd": {
                    "lmt": "2013-01-22T15:22:46.412Z"
                },
                "_id": "50feaec65b32762404000516",
                "id": "50feaec65b32762404000516"
            },
            {
                "title": "something there",
                "completed": false,
                "_acl": {
                    "creator": "kid_eeX0cTJoBf"
                },
                "_kmd": {
                    "lmt": "2013-01-22T17:45:53.575Z"
                },
                "_id": "50fed0515b327624040005fb"
            }
        ];

        $httpBackend.whenGET('http://localhost:3000/todo').respond(todols);
        $httpBackend.whenDELETE('http://localhost:3000/todo/50feaec65b32762404000516').respond(todols[0]);
        $httpBackend.whenDELETE('http://localhost:3000/todo/50fed0515b327624040005fb').respond(todols[1]);
        $httpBackend.whenPUT('http://localhost:3000/todo/50fed0515b327624040005fb').respond(todols[1]);
        $httpBackend.whenPUT('http://localhost:3000/todo/50feaec65b32762404000516').respond(todols[0]);
        $httpBackend.whenPOST('http://localhost:3000/todo', {
            "title" : "something there",
            "completed": false
        }).respond(todols[1]);

        scope = $rootScope.$new();
        TodoCtrl = $controller('TodoCtrl', {
            $scope : scope
        });
    }));

    it('get todos from server', function () {
        expect(scope.todos).toBeUndefined();
        $httpBackend.flush();
        expect(scope.todos).toBeDefined();
        expect(scope.todos).toEqualData(todols);
    });

    it('add a todo', function () {
        $httpBackend.flush();
        scope.newTodo = 'something there';
        scope.addTodo();
        $httpBackend.flush();
        expect(scope.newTodo).toEqual('');
        expect(scope.remainingCount).toEqual(3);

    });

    it('add a todo without title', function () {
        $httpBackend.flush();
        scope.newTodo = '';
        scope.addTodo();
        // no neeed to $httpBackEnd.flush() ... call was cancelled due to lack of title
        expect(scope.newTodo).toEqual('');
        expect(scope.remainingCount).toEqual(2);

    });

    it('remove a todo', function () {
        $httpBackend.flush();
        scope.removeTodo(todols[0]);
        $httpBackend.flush();
        expect(scope.remainingCount).toBe(1);

    });

    it('start editing a todo', function () {
        $httpBackend.flush();
        expect(scope.editedTodo).toBeNull();
        scope.editTodo(todols[0]);
        expect(scope.editedTodo).toEqualData(todols[0]);
    });

    it('done editing todo', function () {
        $httpBackend.flush();
        var todoEdited = todols[0];
        scope.editedTodo = todoEdited;
        todoEdited.title = 'something new';
        scope.doneEditing(todoEdited);
        expect(scope.editedTodo).toBeNull();
    });

    it('create a new element, no title exists todo', function () {
        $httpBackend.flush();
        var todoEdited = todols[0];
        scope.editedTodo = todoEdited;
        todoEdited.title = null;
        scope.doneEditing(todoEdited);
        expect(scope.editedTodo).toBeNull();
    });


    it('completed an item on todo list', function () {
        $httpBackend.flush();
        var todoEdited = todols[0];
        todoEdited.completed = true;
        scope.todoCompleted(todoEdited);
        $httpBackend.flush();
        expect(scope.remainingCount).toBe(1);
    });

    it('did not complete an item on todo list', function () {
        $httpBackend.flush();
        var todoEdited = todols[0];
        scope.todoCompleted(todoEdited);
        $httpBackend.flush();
        expect(scope.remainingCount).toBe(3);
    });


    it('clear done todos from list', function () {
        $httpBackend.flush();

        angular.forEach(scope.todos, function (value) {
            value.completed = true;
        });
        scope.clearDoneTodos();
        $httpBackend.flush();
        expect(scope.todos.length).toBe(0);
    });

    it('mark all as completed', function () {
        $httpBackend.flush();
        scope.markAll(true);
        $httpBackend.flush();
        expect(scope.remainingCount).toBe(0);
    });

    it('mark all as in progress/not completed', function () {
        $httpBackend.flush();
        angular.forEach(scope.todos, function (value) {
            value.completed = true;
        });
        expect(scope.todos).not.toEqualData(todols);
        scope.markAll(false);
        $httpBackend.flush();
        expect(scope.remainingCount).toBe(2);
    });

    it('check filter updates when path is changed to active', inject(function ($location, $rootScope, $route) {
        var callback = jasmine.createSpy('onChange');
        $httpBackend.flush();
        expect(scope.statusFilter).toBeNull();

        $rootScope.$on('$routeChangeStart', callback);

        expect($route.current).toBeUndefined();
        expect(callback).not.toHaveBeenCalled();

        $location.path('/active');
        $rootScope.$digest();

        expect(scope.statusFilter.completed).toBeFalsy();

    }));

    it('check filter updates when path is changed to completed', inject(function ($location, $rootScope, $route) {
        var callback = jasmine.createSpy('onChange');
        $httpBackend.flush();
        expect(scope.statusFilter).toBeNull();

        $rootScope.$on('$routeChangeStart', callback);

        expect($route.current).toBeUndefined();
        expect(callback).not.toHaveBeenCalled();

        $location.path('/completed');
        $rootScope.$digest();

        expect(scope.statusFilter.completed).toBeTruthy();

    }));

    describe('testing blacklist functionality', function () {

        it('use email has not been blacklisted', function () {
            expect(scope.notBlackListed('ferronrsmith@gmail.com')).toBeTruthy();
        });

        it('use email has been blacklisted', function () {
            expect(scope.notBlackListed('bad@domain.com')).toBeFalsy();
        });
    });


});