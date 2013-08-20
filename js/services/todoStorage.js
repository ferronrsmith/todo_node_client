/*global todomvc, angular  */

/**
 * Services that persists and retrieves TODOs from Python Server.
 */

/**
 * User: ferron
 * Date: 10/29/12
 * Time: 4:29 AM
 */

angular.module('todoStorage', ['ngResource']).
    factory('todoStorage', function ($resource, $rootScope) {
        'use strict';
        return $resource($rootScope.serverUrl + '/:collectionName/:id', {
            collectionName: $rootScope.collectionName,
            id: '@id'
        }, {
            query: { method: 'GET', isArray: true}, //this can also be called index or all. default get expects an array like structure
            create: { method: 'POST' }, //this is create method
            save: { method: 'PUT' }, //this is the update method
            destroy: { method: 'DELETE' }
        });
    });