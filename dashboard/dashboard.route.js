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
      state: 'layout.dashboard',
      config: {
        url: '/dashboard',
        templateUrl: 'dashboard/dashboard.html',
        controller: 'dashboardController as vm',
        title: 'dashboard',
        authRequired: true
      }
    }];
  }
})(angular.module('app.dashboard'));
