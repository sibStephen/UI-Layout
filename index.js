(function() {
  'use strict';
  angular
    .module('uiform', [
      'dashboard'
    ]);
    function appRun(routerHelper) {
      var otherwise = '/dashboard';
      routerHelper.configureStates(getStates(), otherwise);

    }

    angular
      .module('dashboard')
      .run(appRun);



    function getStates() {
      return [{
        state: '404',
        config: {
          url: '/404',
          templateUrl: 'app/404.html',
          title: '404'
        }
      }];
    }
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
})();
