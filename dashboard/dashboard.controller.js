(function(module) {
  'use strict';
  module.controller('dashboardController', function(toastr, Report, Internet,
    shareData, indexedDBChecklist, localStorage, $scope) {
    var vm = this;
    var deleteNidsArray = localStorage.get('toBeDeleted') || [];
    vm.reports = {
      data: [],
      total: 0
    };
    vm.currentPage = 1;
    vm.showOffline = false;
    var _uncheckCheckboxes = function() {
      angular.element('.form-assesment .field-checkbox').prop('checked', false);
      vm.offline_nids.length=0;
    };
    /**
     * Function to handle pagination for dashboard
     * @param  {Int}      page         Page
     * @param  {Boolean}  showOffline  Show offline items or not
     */
    vm.pagination = function(page, showOffline) {
      _uncheckCheckboxes();
      Report.getSubmitAudit({
        reportid: 'getDrafts'
      }, {
        page: page,
        length: 10,
        delete_nids: deleteNidsArray,
        showOffline: showOffline
      }, function(data) {
        localStorage.add('toBeDeleted', []);
        if (angular.isArray(data.data)) {
          vm.reports = data;
        } else {
          vm.reports = {
            data: [],
            total: 0
          };
        }
      });
    };

    $scope.$watch(function() {
      return Internet.state;
    }, function(newData) {
      if (newData) {
        vm.pagination(1, false);
        vm.showOffline = false;
      } else {
        vm.pagination(1, true);
        vm.showOffline = true;
      }
    });

    vm.offline_nids = [];
    /**
     * Private function to get new item for list
     */
    var _callNewAssessment = function() {
      _uncheckCheckboxes();
      if (vm.reports.data.length == 9) {
        Report.getSubmitAudit({
          reportid: 'getDrafts'
        }, {
          page: 10 * vm.currentPage,
          length: 1,
          showOffline: vm.showOffline
        }, function(data) {
          if (angular.isArray(data.data)) {
            var newObj = data.data[0];
            vm.reports.data.push(newObj);
          }
        });
      }
      vm.reports.total -= 1;
    };

    /**
     * Function to select items from list to store offline
     * @param  {Object} report Report item object
     */
    vm.select_reports = function(report) {
      var index = vm.offline_nids.indexOf(report.nid);
      if (index < 0) {
        vm.offline_nids.push(report.nid);
        report.checked = true;
      } else {
        vm.offline_nids.splice(index, 1);
        report.checked = false;
      }
    };

    /**
     * Function to mark report as finalize
     * @param  {Int} id    Report ID
     * @param  {Int} index Index of report in list
     */
    vm.finalizeAssessment = function(id, index) {
      Report.finalizeAssessment({
        nid: id,
        finalize: true
      }, function(server) {
        if (server.code === 'SERVICE_SUCCESS') {
          indexedDBChecklist.remove({
            id: id
          }, function() {});
          vm.reports.data.splice(index, 1);
          _callNewAssessment();
        }
      });
    };

    /**
     * Function to store reports offline (indexDB)
     */
    vm.store_offline = function() {
      Report.getOfflineData({
        reportid: 'getOfflineDrafts'
      }, {
        nids: vm.offline_nids,
        delete_nids: deleteNidsArray
      }, function(data) {
        if (angular.isObject(data.message)) {
          var newArr = [];
          angular.forEach(data.message, function(d, k) {
            d.checklist_basic_info.isUserSelected = 1;
            d.id = k - 0;
            newArr.push(d);
          });
          indexedDBChecklist.deleteUserSelected().then(function() {
            indexedDBChecklist.save(newArr);
          });
        }
        localStorage.add('toBeDeleted', []);
        vm.offline_nids.length = 0;
        _uncheckCheckboxes();
      });
    };

    /**
     * Function to sync report to server
     * @param  {Object} report  Report object to sync to Drupal
     * @param  {Int}    index   Index of report in list
     */
    vm.sync = function(report, index) {
      indexedDBChecklist.get(report.nid).then(function(d) {
        var data = d.message;
        var id = data.id;
        Report.save(data, function(newData) {
          var newId = parseInt(newData.message.nid);
          if (report.isSync == 0) {
            indexedDBChecklist.remove({
              id: id
            }, function() {
              indexedDBChecklist.get(newId).then(function(
                newchecklistData) {
                var newAuditData = shareData.getAuditJson(
                  newchecklistData.message);
                vm.reports.data[index] = newAuditData;
              });
            });
          } else {
            indexedDBChecklist.get(newId).then(function(
              newchecklistData) {
              var newAuditData = shareData.getAuditJson(
                newchecklistData.message);
              vm.reports.data[index] = newAuditData;
            });
          }
          toastr.success('Uploaded Successfully!');
        }, function(err) {
          console.log(err);
        });
      });
    };

    /**
     * Function to soft delete reports
     * @param  {Object} reportData Report item
     * @param  {Array}  arr        Array of reports list
     * @param  {Int}    $index     Index of given report in list
     */
    vm.remove = function(reportData, arr, $index) {
      if (window.confirm('Are you sure?')) {
        Report.remove(reportData, function(res) {
          if (res.code == 'SERVICE_SUCCESS') {
            arr.splice($index, 1);
            _callNewAssessment();
            toastr.success('Removed Successfully!');
          } else {
            toastr.error(res.message);
          }
        });
      }
    };

    /**
     * Function to render dashboard chart
     * Renders the graph on dashboard
     */
    vm.renderCharts = function() {
      Report.getChartData({
        reportid: 'getDashboardCharts'
      }, null, function(res) {
        if (res.code === 'SERVICE_SUCCESS') {
          var data = res.message;
          // Chart 1
          if (!data.status_wise[0].y && !data.status_wise[1].y) {
            data.status_wise.length = 0;
          }
          if (data.status_wise.length) {
            var total_perct = 0;
            if (data.status_wise[0].y) {
              var total_asmnt_item = data.status_wise[0].y +
                                      data.status_wise[1].y;
              var aip_ratio = data.status_wise[0].y / total_asmnt_item;
              total_perct = aip_ratio * 100;
            }
            var options_chart1 = {
              data: data.status_wise,
              div: 'chart1',
              tickness: '67%',
              labels: false,
              donut_text: total_perct,
              legend: {
                enabled: false
              }
            };
            _renderPieCharts(options_chart1);
          } else {
            angular.element('#chart1').text('There are no assessments');
          }

          // Chart 2
          if (data.ytd_wise.length) {
            var options_chart2 = {
              data: data.ytd_wise,
              div: 'chart2',
              tickness: '67%',
              labels: true,
              donut_text: false,
              legend: {
                enabled: true,
                align: 'right',
                verticalAlign: 'bottom',
                layout: 'vertical',
                floating: false
              }
            };
            _renderPieCharts(options_chart2);
          } else {
            angular.element('#chart2').text('There are no finalized assessments');
          }

          // Chart 3
          if (data.country_wise.months.length) {
            var options_chart3 = {
              div: 'chart3',
              base: data.country_wise.months,
              inner: data.country_wise.country,
              legend: {
                enabled: false
              }
            };
            _renderdoublePieCharts(options_chart3);
          } else {
            angular.element('#chart3').text('There are no finalized assessments');
          }
        }
      });
    };

    // Init the charts
    vm.renderCharts();

    /**
     * Private function to plot chart with given options
     * @param  {Object} options Options for highcahrt config
     */
    function _renderPieCharts(options) {
      new Highcharts.Chart({
        chart: {
          renderTo: options.div,
          type: 'pie',
          margin: [0, 0, 0, 0],
          spacingTop: 0,
          spacingBottom: 0,
          spacingLeft: 0,
          spacingRight: 0,
          // width: 300,
          height: 190,
          style: {
            margin: options.legend.enabled ? '0' : '0 auto'
          }
        },
        title: {
          text: null
        },
        legend: options.legend,
        plotOptions: {
          pie: {
            shadow: false
          }
        },
        tooltip: {
          formatter: function() {
            return '<b>' + this.point.name + '</b>: ' + this.y;
          }
        },
        series: [{
          name: 'Charts',
          data: options.data,
          dataLabels: {
            enabled: options.labels,
            shadow: false,
            connectorPadding: 0,
            connectorWidth: 0,
            distance: 5,
            formatter: function() {
              return Highcharts.numberFormat(this.percentage, 1) + '%';
            }
          },
          size: '90%',
          innerSize: options.tickness,
          showInLegend: true
        }],
        annotationsOptions: {
          enabledButtons: false
        },
        exporting: false,
        credits: false
      },
      function(chart) {
        if (options.div === 'chart1') {
          // Render the text
          var text = Highcharts.numberFormat(options.donut_text, 1);
          var textBox = chart.renderer.text(text + '%').add();
          var total_space_half_radius = chart.plotWidth / 2;
          var text_box_half_width = textBox.element.clientWidth / 2;
          // Still its little bit right, not sure why so reduce 10 more
          var xPt = total_space_half_radius - text_box_half_width - 10;
          textBox.css({
            color: '#4572A7',
            fontSize: '20px',
            textAlign: 'center'
          }).attr({
            x: xPt,
            y: 105,
            zIndex: 999
          });
        }
      });
    }

    function _renderdoublePieCharts(options) {
      var chart1 = new Highcharts.Chart({
        chart: {
          renderTo: options.div,
          type: 'pie',
          margin: [0, 0, 0, 0],
          spacingTop: 0,
          spacingBottom: 0,
          spacingLeft: 0,
          spacingRight: 0,
          // width: 300,
          height: 190,
          style: {
            margin: options.legend.enabled ? '0' : '0 auto'
          }
        },
        title: {
          text: null
        },
        legend: options.legend,
        plotOptions: {
          pie: {
            shadow: false,
            center: ['50%', '50%'],
            dataLabels: {
              shadow: false,
              connectorPadding: 1,
              connectorWidth: 2,
              distance: 10,
              formatter: function() {
                return this.point.name + '    (' + this.point.y + ')';
              }
            },
            tooltip: {
              headerFormat: '',
              pointFormatter: function() {
                return '<b>' + this.name + '</b>: ' + this.y;
              }
            }
          }
        },
        series: [{
          name: 'Month',
          data: options.base,
          dataLabels: {
            formatter: function() {
              var date = new Date(this.point.name * 1000);
              var date_breaks = date.toString().split(' ');
              var month = date_breaks[1];
              var year = date_breaks[3];
              return month + '-' + year + '    ('+ this.point.y +')';
            }
          },
          tooltip: {
            headerFormat: '',
            pointFormatter: function() {
              var date = new Date(this.name * 1000);
              var date_breaks = date.toString().split(' ');
              var month = date_breaks[1];
              var year = date_breaks[3];
              return '<b>' + (month + '-' + year) + '</b>: ' + this.y;
            }
          },
          showInLegend: true
        }],
        drilldown: {
          series: options.inner
        },
        annotationsOptions: {
          enabledButtons: false
        },
        exporting: false,
        credits: false
      });
    }

    /**
     * Private function to plot chart with given options
     * @param  {Object} options Options for highcahrt config
     */
    function _renderStackedColumnCharts(options) {
      new Highcharts.Chart({
        chart: {
          renderTo: options.div,
          type: 'column',
          height: 190,
          style: {
            margin: '0 auto'
          }
        },
        title: {
          text: null
        },
        xAxis: {
          type: 'category',
          gridLineWidth: 0
        },
        yAxis: {
          title: {
            text: null
          },
          gridLineWidth: 0,
          tickAmount: 5
        },
        legend: {
          align: 'left',
          verticalAlign: 'bottom',
          shadow: false
        },
        tooltip: {
          headerFormat: '<b>{point.x}</b><br/>',
          pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
        },
        plotOptions: {
          column: {
            stacking: 'normal'
          },
          series: {
            pointWidth: 30,
            borderWidth: 0
          }
        },
        series: options.data.series,
        annotationsOptions: {
          enabledButtons: false
        },
        exporting: false,
        credits: false
      });
    }
  });
})(angular.module('dashboard'));
