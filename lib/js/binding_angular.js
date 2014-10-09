var app = angular.module("d3BindingExample", []);

app.controller("ChartCtrl", function($scope){

  var settings = {
    width: 600,
    height: 240,
    barSpacing: 10,
    chartBg: "#eee"
  };

  var $chart = d3.select("#wrapper")
    .append('svg')
    .attr("width", settings.width)
    .attr("height", settings.height)
    .style("background", settings.chartBg);

  $scope.dataSet = [
    {value: 5, color: 'red'},
    {value: 10, color: 'blue'},
    {value: 20, color: 'green'},
    {value: 25, color: 'teal'},
    {value: 30, color: 'orange'},
    {value: 50, color: 'purple'},
  ];

  $scope.addData = function() {
    $scope.dataSet.push($scope.newData);
    $scope.newData = {};
  };

  _maxValue = function() {
    return d3.max($scope.dataSet, function(d) {
      return d.value;
    });
  };

  _yScale = function(input) {
    var scale = d3.scale.linear()
      .domain([0, _maxValue()])
      .range([0, settings.height]);
    return scale(input)
  };

  console.log(settings.height);

  _calcBarWidth = function() {
    var divided =  settings.width / $scope.dataSet.length;
    var width = divided - settings.barSpacing;
    return width;
  };

  _calcBarPositionX = function(i) {
    return i * (settings.width / $scope.dataSet.length);
  };

  _calcBarPositionY = function(d) {
    return settings.height - _yScale(d.value);
  };

  _render = function() {
    $chart.selectAll("rect")
      .data($scope.dataSet)
      .enter()
      .append("rect")
      .attr('width', _calcBarWidth())
      .attr('height', function(d) {
        return _yScale(d.value);
      })
      .attr('y', function(d) {
        return _calcBarPositionY(d);
      })
      .attr("x", function(d, i) {
        return _calcBarPositionX(i);
      })
      .attr("fill", function(d) {
        return d.color;
      });

    $chart.selectAll("text")
      .data($scope.dataSet)
      .enter()
      .append("text")
      .text(function(d) {
        return d.value;
      })
      .attr('y', function(d) {
        return _calcBarPositionY(d);
      })
      .attr("x", function(d, i) {
        return _calcBarPositionX(i);
      })
  };

  _destroy = function() {
    $chart.selectAll("rect, text").remove();
  };

  _reRender = function() {
    _destroy();
    _render();
  };

  $scope.$watch('dataSet', function() {
    _reRender();
  }, true);

});
