"use strict";

var BarChart = function(elemId) {
  this.selector = elemId;
  this.settings = this._defaultSettings;
};

BarChart.prototype.init = function(data) {
  this.dataSet = data;
  this._appendChart();
  this._bind();
  this._render();
};

BarChart.prototype.addData = function(newData) {
  var normalizedNewData = {
    value: Number(newData.value),
    color: newData.color,
    name: newData.name
  };
  this.dataSet.push(normalizedNewData);
  this._reRender();
};

BarChart.prototype._defaultSettings = {
  barSpacing: 20,
  padding: {
    top: 40,
    right: 20,
    bottom: 30,
    left: 80,
  }
};

BarChart.prototype._appendChart = function() {
  this.$chart = d3.select('#'+this.selector)
    .append('svg')
    .style("padding-top",    this.settings.padding.top)
    .style("padding-right",  this.settings.padding.right)
    .style("padding-bottom", this.settings.padding.bottom)
    .style("padding-left",   this.settings.padding.left);
};

BarChart.prototype._bind = function() {
  var self = this;
  window.addEventListener('resize', function(){
    self._reRender();
  });
};

BarChart.prototype._setDimensions = function() {
  var $elem = document.getElementById(this.selector);
  this.settings.width = $elem.offsetWidth - this.settings.padding.right - this.settings.padding.left;
  this.settings.height = $elem.offsetHeight - this.settings.padding.top - this.settings.padding.bottom;
};

BarChart.prototype._destroy = function() {
  this.$chart.selectAll("g, rect, text").remove();
};

BarChart.prototype._render = function() {
  this._setDimensions();
  this._drawYAxis();
  this._drawBars();
  this._drawKeys();
  this._drawLabels();
};

BarChart.prototype._reRender = function() {
  this._destroy();
  this._render();
};



/**
 * Helper Methods
 * -------------------------------------------------------
 */

BarChart.prototype._maxValue = function() {
  return d3.max(this.dataSet, function(d) {
    return d.value;
  });
};

BarChart.prototype._yScale = function(input) {
  var scale = d3.scale.linear()
    .domain([0, this._maxValue()])
    .range([0, this.settings.height]);
  return scale(input);
};

BarChart.prototype._totalWidth = function() {
  return this.settings.width + this.settings.barSpacing;
};

BarChart.prototype._calcBarWidth = function() {
  var width = this._totalWidth() / this.dataSet.length;
  width -= this.settings.barSpacing;
  return width;
};

BarChart.prototype._calcBarPositionX = function(i) {
  return i * (this._totalWidth() / this.dataSet.length);
};

BarChart.prototype._calcBarPositionY = function(d) {
  return this.settings.height - this._yScale(d.value);
};



/**
 * Drawing Methods
 * -------------------------------------------------------
 */

BarChart.prototype._drawYAxis = function() {
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

BarChart.prototype._drawBars = function() {
  var self = this;
  self.$chart.selectAll("rect")
    .data(self.dataSet)
    .enter()
    .append("rect")
    .attr('width', self._calcBarWidth())
    .attr('height', function(d) {
      return self._yScale(d.value);
    })
    .attr('y', function(d) {
      return self._calcBarPositionY(d);
    })
    .attr("x", function(d, i) {
      return self._calcBarPositionX(i);
    })
    .attr("fill", function(d) {
      return d.color;
    });
};

BarChart.prototype._drawLabels = function() {
  var self = this;
  self.$chart.selectAll("text.label")
    .data(self.dataSet)
    .enter()
    .append("text")
    .text(function(d) {
      return d.value;
    })
    .attr('class', 'label')
    .attr('y', function(d) {
      return self._calcBarPositionY(d);
    })
    .attr("x", function(d, i) {
      return self._calcBarPositionX(i);
    });
};

BarChart.prototype._drawKeys = function() {
  var self = this;
  self.$chart.selectAll("text.key")
    .data(self.dataSet)
    .enter()
    .append("text")
    .text(function(d) {
      return d.name;
    })
    .attr('class', 'key')
    .attr('y', function() {
      return self.settings.height + 20;
    })
    .attr("x", function(d, i) {
      return self._calcBarPositionX(i);
    });
};
