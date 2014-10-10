"use strict";

var LineChart = function(elemId) {
  this.selector = elemId;
  this.settings = this._defaultSettings;
};

LineChart.prototype.init = function(data) {
  this.dataSet = data;
  this._appendChart();
  this._bind();
  this._render();
};

LineChart.prototype.addData = function(newData) {
  var normalizedNewData = {
    value: Number(newData.value),
    date: Number(newData.date)
  };
  this.dataSet.push(normalizedNewData);
  this._reRender();
};

LineChart.prototype._defaultSettings = {
  padding: {
    top: 40,
    right: 20,
    bottom: 50,
    left: 80,
  }
};

LineChart.prototype._appendChart = function() {
  this.$chart = d3.select('#'+this.selector)
    .append('svg')
    .style("padding-top",    this.settings.padding.top)
    .style("padding-right",  this.settings.padding.right)
    .style("padding-bottom", this.settings.padding.bottom)
    .style("padding-left",   this.settings.padding.left);
};

LineChart.prototype._bind = function() {
  var self = this;
  window.addEventListener('resize', function(){
    self._reRender();
  });
};

LineChart.prototype._setDimensions = function() {
  var $elem = document.getElementById(this.selector);
  this.settings.width = $elem.offsetWidth - this.settings.padding.right - this.settings.padding.left;
  this.settings.height = $elem.offsetHeight - this.settings.padding.top - this.settings.padding.bottom;
};

LineChart.prototype._destroy = function() {
  this.$chart.selectAll("g, path, text, circle").remove();
};

LineChart.prototype._render = function() {
  this._setDimensions();
  this._drawYAxis();
  this._drawXAxis();
  this._drawLine();
  this._drawPoints();
};

LineChart.prototype._reRender = function() {
  this._destroy();
  this._render();
};



/**
 * Helper Methods
 * -------------------------------------------------------
 */

LineChart.prototype._maxValue = function() {
  return d3.max(this.dataSet, function(d) {
    return d.value;
  });
};

LineChart.prototype._minDate = function() {
  return d3.min(this.dataSet, function(d) {
    return d.date;
  });
};

LineChart.prototype._maxDate = function() {
  return d3.max(this.dataSet, function(d) {
    return d.date;
  });
};

LineChart.prototype._yScale = function() {
  var scale = d3.scale.linear()
    .domain([0, this._maxValue()])
    .range([0, this.settings.height]);
  return scale;
};

LineChart.prototype._xScale = function() {
  var scale = d3.scale.linear()
    .domain([this._minDate(), this._maxDate()])
    .range([0, this.settings.width]);
  return scale;
};

LineChart.prototype._buildLine = function() {
  var self = this;
  var yScale = self._yScale();
  var xScale = self._xScale();
  var fn = d3.svg.line()
    .x(function(d) {
      return xScale(d.date);
    })
    .y(function(d) {
      return self.settings.height - yScale(d.value);
    })
    .interpolate('linear');
  return fn(self.dataSet);
};



/**
 * Drawing Methods
 * -------------------------------------------------------
 */

LineChart.prototype._drawYAxis = function() {
  var self = this;

  var scale = d3.scale.linear()
    .domain([self._maxValue(), 0])
    .range([0, self.settings.height]);

  var yAxis = d3.svg.axis()
    .scale(scale)
    .ticks(6)
    .orient("left");

  self.$chart.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(-30, 0)")
    .call(yAxis);
};

LineChart.prototype._drawXAxis = function() {
  var self = this;
  var scale = self._xScale();

  var xAxis = d3.svg.axis()
    .scale(scale)
    .ticks(self.dataSet.length)
    .orient("top");

  self.$chart.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + (self.settings.height + 35) + ")")
    .call(xAxis);
};

LineChart.prototype._drawLine = function() {
  this.$line = this.$chart.append('svg:path')
    .attr('d', this._buildLine())
    .attr('class', 'line')
    .attr('fill', 'none');
};

LineChart.prototype._drawPoints = function() {
  var self = this;
  var yScale = self._yScale();
  var xScale = self._xScale();
  self.$chart.selectAll("circ")
    .data(self.dataSet)
    .enter()
    .append("circle")
    .attr('class', 'point')
    .attr('r', '6')
    .attr('cy', function(d) {
      return self.settings.height - yScale(d.value);
    })
    .attr("cx", function(d, i) {
      return xScale(d.date);
    });
};
