/*global todomvc, angular  */
/*jslint nomen:true  */

/**
 * The main controller for the app. The controller:
 * - retrieves and persist the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
todomvc.controller('TodoCtrl', function TodoCtrl($scope, $location, $log, todoStorage, filterFilter) {
    'use strict';
    var todos = {};
    todoStorage.query(function (data) {
        $log.info(data);
        $scope.todos = data;
        todos = data;
        $scope.newTodo = "";
        $scope.remainingCount = data.length - filterFilter(data, {completed: true}).length;
        $scope.editedTodo = null;

        if ($location.path() === '') {
            $location.path('/');
        }
        $scope.location = $location;

        $scope.$watch('location.path()', function (path) {
            $scope.statusFilter = (path === '/active') ?
                    { completed: false } : (path === '/completed') ?
                    { completed: true } : null;
        });

    });

    $scope.$watch('remainingCount == 0', function (val) {
        $scope.allChecked = val;
    });

    $scope.addTodo = function () {
        $log.info('adding something');
        if ($scope.newTodo.length === 0) {
            return;
        }

        var todo = {
            title: $scope.newTodo,
            completed: false
        };

        todoStorage.create(todo, function (data) {
            // not important because kinvey creates its own id _id
            todo.id = data._id;
            todo._id = data._id;
            todos.push(todo);
            $log.info(todos);
            $scope.newTodo = '';
            $scope.remainingCount += 1;
        });
    };


    $scope.editTodo = function (todo) {
        $log.info('edit data', todo);
        $scope.editedTodo = todo;
    };

    $scope.notBlackListed = function (value) {
        var blacklist = ['bad@domain.com', 'verybad@domain.com'];
        return blacklist.indexOf(value) === -1;
    };

    $scope.doneEditing = function (todo) {
        $log.info('editing data', todo);
        $log.info('collection', todos);
        $scope.editedTodo = null;
        $log.info(!todo.title);
        if (!todo.title) {
            $scope.removeTodo(todo);
        }
        // kinvey does not return an id, but a _id
        // extend the object and add the id property using the _id
        angular.extend(todo, {id: todo._id});
        todoStorage.save(todo);

    };


    $scope.removeTodo = function (todo) {
        $log.info('remove data', todo);
        todos.splice(todos.indexOf(todo), 1);
        // kinvey does not return an id, but a _id
        // pass in the _id as an id to the endpoint
        todoStorage.destroy({id: todo._id}, function () {
            $scope.remainingCount -= 1;
        });
    };


    $scope.todoCompleted = function (todo) {
        $log.info('completed', todo);
        if (todo.completed) {
            $scope.remainingCount -= 1;
        } else {
            $scope.remainingCount += 1;
        }
        angular.extend(todo, {id: todo._id});
        todoStorage.save(todo);
    };


    $scope.clearDoneTodos = function () {
        var completed = null, $todo = null;
        $log.info('clear done todos', todos);
        $todo = todos;
        $scope.todos = todos = todos.filter(function (val) {
            return !val.completed;
        });

        completed = $todo.filter(function (val) { return val.completed; });

        completed.forEach(function (todo) {
            todoStorage.destroy({id: todo._id});
        });
    };


    $scope.markAll = function (done) {
        todos.forEach(function (todo) {
            todo.completed = done;
        });
        $scope.remainingCount = done ? 0 : todos.length;
        todos.forEach(function (todo) {
            angular.extend(todo, {id: todo._id});
            todoStorage.save(todo);
        });
    };
});
