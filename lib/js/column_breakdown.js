"use strict";

var ColumnBreakdownChart = function(elemId) {
  this.selector = elemId;
  this.settings = this._defaultSettings;
};

ColumnBreakdownChart.prototype.init = function(data) {
  this.dataSet = data;
  this._normalizeDataSet();
  this._appendChart();
  /**
   * Performance on resize was shaky at best, and it
   * wasn't really needed, since our app isn't responsive,
   * so we'll just leave the b
   */
  // this._bind();
  this._render();
};


ColumnBreakdownChart.prototype.addData = function(newData) {
  this.dataSet.push(newData)
  this.normalizedDataSet.push(this._normalizeDataPoint(newData));
  this._reRender();
};

ColumnBreakdownChart.prototype._defaultSettings = {
  barSpacing: 20,
  padding: {
    top: 40,
    right: 20,
    bottom: 30,
    left: 80,
  },
  colors: [
    "#022636",
    "#103D50",
    "#467386"
  ]
};

ColumnBreakdownChart.prototype._appendChart = function() {
  this.$chart = d3.select('#'+this.selector)
    .append('svg')
    .style("padding-top",    this.settings.padding.top)
    .style("padding-right",  this.settings.padding.right)
    .style("padding-bottom", this.settings.padding.bottom)
    .style("padding-left",   this.settings.padding.left);
};

ColumnBreakdownChart.prototype._bind = function() {
  var self = this;
  window.addEventListener('resize', function(){
    self._reRender();
  });
};

ColumnBreakdownChart.prototype._setDimensions = function() {
  var $elem = document.getElementById(this.selector);
  this.settings.width = $elem.offsetWidth - this.settings.padding.right - this.settings.padding.left;
  this.settings.height = $elem.offsetHeight - this.settings.padding.top - this.settings.padding.bottom;
};

ColumnBreakdownChart.prototype._destroy = function() {
  this.$chart.selectAll("g, rect, text").remove();
};

ColumnBreakdownChart.prototype._render = function() {
  this._setDimensions();
  this._drawYAxis();
  this._drawColumns();
  this._drawKeys();
  this._drawLabels();
};

ColumnBreakdownChart.prototype._reRender = function() {
  this._destroy();
  this._render();
};



/**
 * Data Normalization
 * -------------------------------------------------------
 */

ColumnBreakdownChart.prototype._normalizeDataSet = function(data) {
  var self = this;
  if (data === undefined) data = self.dataSet;
  var normalizedDataSet = [];
  data.forEach(function(i){
    normalizedDataSet.push(self._normalizeDataPoint(i));
  })
  self.normalizedDataSet = normalizedDataSet;
};

ColumnBreakdownChart.prototype._normalizeDataPoint = function(dataPoint) {
  var self = this;
  var normalized = {
    totalValue: self._totalDataPoint(dataPoint),
    groups: self._calcGroupPercentages(dataPoint),
    color: dataPoint.color,
    label: dataPoint.label
  };
  return normalized;
};

ColumnBreakdownChart.prototype._totalDataPoint = function(dataPoint) {
  var total = 0;
  dataPoint.groups.forEach(function(i){
    total += i.value;
  })
  return total;
};

ColumnBreakdownChart.prototype._calcGroupPercentages = function(dataPoint) {
  var self = this;
  var groups = dataPoint.groups;
  groups.forEach(function(i){
    i.percentageOfTotal = i.value / self._totalDataPoint(dataPoint);
  })
  return groups;
};




/**
 * Helper Methods
 * -------------------------------------------------------
 */

ColumnBreakdownChart.prototype._maxValue = function() {
  return d3.max(this.normalizedDataSet, function(d) {
    return d.totalValue;
  });
};

ColumnBreakdownChart.prototype._yScale = function(input) {
  var scale = d3.scale.linear()
    .domain([0, this._maxValue()])
    .range([0, this.settings.height]);
  return scale(input);
};

ColumnBreakdownChart.prototype._totalWidth = function() {
  return this.settings.width + this.settings.barSpacing;
};

ColumnBreakdownChart.prototype._calcBarWidth = function() {
  var width = this._totalWidth() / this.normalizedDataSet.length;
  width -= this.settings.barSpacing;
  return width;
};

ColumnBreakdownChart.prototype._calcBarPositionX = function(i) {
  return i * (this._totalWidth() / this.normalizedDataSet.length);
};

ColumnBreakdownChart.prototype._calcBarPositionY = function(d) {
  return this.settings.height - this._yScale(d.totalValue);
};

ColumnBreakdownChart.prototype._calcSegmentHeight = function(d, groupHeight) {
  return d.percentageOfTotal * groupHeight;
};



/**
 * Drawing Methods
 * -------------------------------------------------------
 */

ColumnBreakdownChart.prototype._drawYAxis = function() {
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
    .attr("transform", "translate(-30, 0)")
    .call(yAxis);
};

ColumnBreakdownChart.prototype._drawColumns = function() {
  var self = this;
  var $columns = self.$chart.selectAll("g.full-column")
    .data(self.normalizedDataSet)
    .enter()
    .append("g")
    .attr("class", "full-column")
    .attr('width', self._calcBarWidth())
    .attr('height', function(d) {
      var height = self._yScale(d.totalValue);
      d.columnHeight = height;
      return height;
    })
    .attr('y', function(d) {
      return self._calcBarPositionY(d);
    })
    .attr("x", function(d, i) {
      return self._calcBarPositionX(i);
    })
    // draw individual column segments
    self._drawColumnSegments($columns);
};

ColumnBreakdownChart.prototype._drawColumnSegments = function($columns) {
  var self = this;
  var currRectY = 0;
  $columns.selectAll('rect')
    .data(function(d){
      return d.groups;
    })
    .enter()
    .append("rect")
    .attr('width', function(d){
      var width = this.parentNode.attributes.width.value;
      return width;
    })
    .attr('height', function(d) {
      var groupHeight = this.parentNode.attributes.height.value;
      return self._calcSegmentHeight(d, groupHeight);
    })
    .attr('y', function(d, i) {
      if (i === 0) currRectY = 0;
      var groupAttr = this.parentNode.attributes;
      var groupY = Number(groupAttr.y.value);
      var groupHeight = Number(groupAttr.height.value);
      var segmentHeight = self._calcSegmentHeight(d, groupHeight);
      var baseline = groupY + groupHeight - segmentHeight;
      var segY = baseline - currRectY;
      currRectY += segmentHeight;
      return segY;
    })
    .attr("x", function(d, i) {
      var groupX = this.parentNode.attributes.x.value;
      return groupX;
    })
    .attr("fill", function(d, i) {
      return self.settings.colors[i];
    });
};

ColumnBreakdownChart.prototype._drawLabels = function() {
  var self = this;
  self.$chart.selectAll("text.label")
    .data(self.normalizedDataSet)
    .enter()
    .append("text")
    .text(function(d) {
      return d.totalValue;
    })
    .attr('class', 'label')
    .attr('y', function(d) {
      return self._calcBarPositionY(d);
    })
    .attr("x", function(d, i) {
      return self._calcBarPositionX(i);
    });
};

ColumnBreakdownChart.prototype._drawKeys = function() {
  var self = this;
  self.$chart.selectAll("text.key")
    .data(self.normalizedDataSet)
    .enter()
    .append("text")
    .text(function(d) {
      return d.label;
    })
    .attr('class', 'key')
    .attr('y', function() {
      return self.settings.height + 20;
    })
    .attr("x", function(d, i) {
      return self._calcBarPositionX(i);
    });
};