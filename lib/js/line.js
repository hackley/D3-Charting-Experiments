"use strict";

var LineChart = function(selector) {
  this.selector = selector;
  this.settings = this._defaultSettings;
};

LineChart.prototype.init = function(data) {
  this.dataSet = data;
  this._appendChart();
  this._render();
};

LineChart.prototype.addData = function(newData) {
  this.dataSet.push(newData);
  this._reRender();
};

LineChart.prototype._defaultSettings = {
  width: 900,
  height: 240,
  chartBg: "#EEE",
  lineColor: "teal",
  padding: {
    top: 40,
    right: 20,
    bottom: 50,
    left: 40,
  }
};

LineChart.prototype._appendChart = function() {
  this.$chart = d3.select(this.selector)
    .append('svg')
    .attr("width",  this.settings.width)
    .attr("height", this.settings.height)
    .style("background",     this.settings.chartBg)
    .style("padding-top",    this.settings.padding.top)
    .style("padding-right",  this.settings.padding.right)
    .style("padding-bottom", this.settings.padding.bottom)
    .style("padding-left",   this.settings.padding.left);
};

LineChart.prototype._destroy = function() {
  this.$chart.selectAll("g, path, text, circle").remove();
};

LineChart.prototype._render = function() {
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

LineChart.prototype._yScale = function(input) {
  var scale = d3.scale.linear()
    .domain([0, this._maxValue()])
    .range([0, this.settings.height]);
  return scale(input);
};

LineChart.prototype._xScale = function(input) {
  var scale = d3.scale.linear()
    .domain([0, this._maxDate()])
    .range([0, this.settings.width]);
  return scale(input);
};


/**
 * Build an in-memory representation of our chart's line
 * using the data array.
 */
LineChart.prototype._buildLine = function() {
  var self = this;
  var fn = d3.svg.line()
    .x(function(d) {
      return self._xScale(d.date);
    })
    .y(function(d) {
      return self.settings.height - self._yScale(d.value);
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
    .ticks(8)
    .orient("left");

  self.$chart.append("g")
    .attr("class", "axis")
    .call(yAxis);
};

LineChart.prototype._drawXAxis = function() {
  var self = this;

  var scale = d3.scale.linear()
    .domain([0, self._maxDate()])
    .range([0, self.settings.width]);

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
    .attr('stroke', this.settings.lineColor)
    .attr('stroke-width', 2)
    .attr('fill', 'none');
};

LineChart.prototype._drawPoints = function() {
  var self = this;
  self.$chart.selectAll("circ")
    .data(self.dataSet)
    .enter()
    .append("circle")
    .attr('stroke', this.settings.lineColor)
    .attr('stroke-width', 2)
    .attr('fill', "#FFF")
    .attr('r', '6')
    .attr('cy', function(d) {
      return self.settings.height - self._yScale(d.value);
    })
    .attr("cx", function(d, i) {
      return self._xScale(d.date);
    });
};
