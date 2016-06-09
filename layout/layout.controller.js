(function(module) {
  'use strict';
  module.controller('layoutController', function($scope) {
    var vm = this;
    vm.expanded = false;

    vm.toggleSideBar = function() {
      vm.expanded = !vm.expanded;
    };
    /**
     * Function to config global configuration items
     * @return {[type]} [description]
     */
    function _getDefaultNavItem() {
      return [{
        state: 'layout.dashboard',
        text: 'Home',
        icon: 'icon-home',
        disabled: false
      }, {
        state: 'layout.audit',
        text: 'Finalized',
        icon: 'icon-list',
        disabled: false
      }, {
        state: 'layout.idb',
        text: 'Dashboard',
        icon: 'icon-tachometer',
        disabled: false
      }, {
        state: 'layout.admin',
        text: 'Admin',
        icon: 'icon-repair-tools-cross',
        disabled: false
      }, {
        state: 'layout.profile',
        icon: 'icon-user',
        text: 'Profile',
        disabled: false
      }, {
        state: 'layout.settings',
        icon: 'icon-cog',
        text: 'Settings',
        disabled: false
      }, {
        state: 'layout.help',
        icon: 'icon-question-circle',
        text: 'Help',
        disabled: false
      }];
    }


    /**
     * Functin to configure contextual menus for checklist page
     * @param  {Int} id    Checklist ID
     * @return {Array} Return list of menu items
     */
  });
})(angular.module('layout'));
