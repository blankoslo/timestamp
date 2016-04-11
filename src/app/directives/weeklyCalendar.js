import moment from 'moment';

export default function() {

  function buildWeek(start) {
    var weekDays = [];
    var date = start.clone();
    for (var i = 0; i < 7; i++) {
      weekDays.push({
        dayInMonth: date.get('date'),
        nameOfDay: date.format('ddd'),
        date: date.format('YYYY-MM-DD'),
        logged: 0
      });
      date = date.clone().add(1, 'd');
    }
    return weekDays;
  }

  return {
    controller: ($scope, $rootScope, Api, Auth) => {
      var weekStart = moment().startOf('isoweek');

      $scope.selected = moment();
      $scope.week = buildWeek(weekStart);

      $scope.getHeader = () => {
          var weekNumber = weekStart.get('week');
          var startDate = weekStart.get('date');
          var endOfWeek = weekStart.clone().endOf("isoweek");
          var endDate = endOfWeek.get('date');
          var year = endOfWeek.format('YYYY');
          var month = () => {
            if (weekStart.isSame(endOfWeek, 'month')) {
              return weekStart.format('MMMM')
            } else {
              return `${weekStart.format('MMMM')}/${endOfWeek.format('MMMM')}`
            }
          }
          return `Uke ${weekNumber} ${startDate} - ${endDate}. ${month()} ${year}`;
      }

      $scope.select = (date) => {
        $scope.selected = moment(date);
      }

      $scope.isSelected = (date) => {
          return moment(date).isSame($scope.selected, 'day');
      }

      $scope.previous = () => {
          weekStart = weekStart.clone().subtract(1, 'w');
          $scope.week = buildWeek(weekStart);
          $scope.selected = weekStart;
          $scope.weekNumber = weekStart.get('week');
          fetchHoursForWeek();
      };

      $scope.next = () => {
          weekStart = weekStart.clone().add(1, 'w');
          $scope.week = buildWeek(weekStart);
          $scope.selected = weekStart;
          $scope.weekNumber = weekStart.get('week');
          fetchHoursForWeek();
      }

      function fetchHoursForWeek() {
        Api.getWeeklyEntries(Auth.getEmployee().id, weekStart.format('YYYY-MM-DD')).then((result) => {
          appendHours($scope.week, result.data);
        });
      }

      function appendHours(week, hours) {
        hours.forEach((e) => {
          var day = moment(e.date).get('day');
          week[day-1].logged = e.sum;
        });
      }

      $scope.$on('userChanged', () => {
        fetchHoursForWeek();
      })

      $scope.$watch('selected', (change) => {
        $rootScope.$broadcast('dateChanged', $scope.selected.format('YYYY-MM-DD'));
      });
    },
    link: ($scope) => {

    },
    template: require('../views/weeklyCalendar.html')
  }
}