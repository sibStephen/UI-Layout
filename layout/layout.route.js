(function(module) {
  'use strict';

  /**
   * Function to configure ui-states for router
   * @param  {[type]} routerHelper [description]
   */
  function _appRun(routerHelper) {
    routerHelper.configureStates(_getStates());
  }

  module.run(_appRun);

  /**
   * Function to configure state for module
   * @return {Array} Array of ui-states
   */
  function _getStates() {
    return [{
      state: 'layout',
      config: {
        abstract: true,
        url: '/app',
        templateUrl: 'layout/layout.html',
        controller: 'layoutController as vm'
      }
    }];
  }
})(angular.module('app.layout'));
