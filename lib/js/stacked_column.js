"use strict";

var StackedColumnChart = function(elemId) {
  this.selector = elemId;
  this.settings = this._defaultSettings;
};

StackedColumnChart.prototype.init = function(data) {
  this.dataSet = data;
  this._normalizeDataSet();
  this._appendChart();
  this._bind();
  this._render();
};

StackedColumnChart.prototype.addData = function(newData) {
  this.dataSet.push(newData);
  var normalized = this._normalizeDataPoint(newData);
  this.normalizedDataSet.push(normalized);
  this._reRender();
};

StackedColumnChart.prototype._defaultSettings = {
  columnSpacing: 20,
  currency: true,
  yAxisMargin: 90,
  padding: {
    top: 40,
    right: 40,
    bottom: 40,
    left: 120
  },
  colors: [
    {
      base: "#022636",
      hover: "maroon"
    },
    {
      base: "#103D50",
      hover: "teal"
    },
    {
      base: "#467386",
      hover: "lightpink"
    }
  ]
};

StackedColumnChart.prototype._appendChart = function() {
  this.$wrapper = d3.select('#'+this.selector);
  this.$wrapper.style('position', 'relative');
  this.$chart = this.$wrapper.append('svg');
};

StackedColumnChart.prototype._bind = function() {
  var self = this;
  window.addEventListener('resize', function(){
    self._reRender();
  });
};


/**
 * Data Normalization
 * -------------------------------------------------------
 */

StackedColumnChart.prototype._normalizeDataSet = function() {
  var self = this;
  var normalizedDataSet = [];
  self.dataSet.forEach(function(i){
    var normalized = self._normalizeDataPoint(i);
    normalizedDataSet.push(normalized);
  });
  self.normalizedDataSet = normalizedDataSet;
};

StackedColumnChart.prototype._normalizeDataPoint = function(dataPoint) {
  var self = this;
  var total = self._totalDataPoint(dataPoint);
  var displayValue = (self.settings.currency) ? total.toMoney() : total;
  var normalized = {
    totalValue: total,
    displayValue: displayValue,
    segments: self._formatSegments(dataPoint),
    label: dataPoint.label
  };
  return normalized;
};

StackedColumnChart.prototype._totalDataPoint = function(dataPoint) {
  var total = 0;
  dataPoint.segments.forEach(function(i){
    total += i.value;
  });
  return total;
};

StackedColumnChart.prototype._formatSegments = function(dataPoint) {
  var self = this;
  var segments = dataPoint.segments;
  segments.forEach(function(i){
    i.percentageOfTotal = i.value / self._totalDataPoint(dataPoint);
    i.displayValue = (self.settings.currency) ? i.value.toMoney() : i.value;
  });
  return segments;
};



/**
 * Helper Methods
 * -------------------------------------------------------
 */

Number.prototype.toMoney = function() {
  var float = this / 100.0;
  var formatted = float.toFixed(2).replace(/./g, function(c, i, a) {
    return i && c !== "." && !((a.length - i) % 3) ? ',' + c : c;
  });
  return '$' + formatted;
};

StackedColumnChart.prototype._maxValue = function() {
  return d3.max(this.normalizedDataSet, function(d) {
    return d.totalValue;
  });
};

StackedColumnChart.prototype._yScale = function(input) {
  var scale = d3.scale.linear()
    .domain([0, this._maxValue()])
    .range([0, this.settings.height]);
  return scale(input);
};

StackedColumnChart.prototype._totalWidth = function() {
  return this.settings.width + this.settings.columnSpacing;
};

StackedColumnChart.prototype._calcColumnWidth = function() {
  var width = this._totalWidth() / this.normalizedDataSet.length;
  width -= this.settings.columnSpacing;
  return width;
};

StackedColumnChart.prototype._calcColumnPositionX = function(index) {
  var offset = index * (this._totalWidth() / this.normalizedDataSet.length);
  return offset + this.settings.padding.left;
};

StackedColumnChart.prototype._calcColumnPositionY = function(d) {
  var offset = this.settings.height - this._yScale(d.totalValue);
  return offset + this.settings.padding.top;
};

StackedColumnChart.prototype._calcSegmentHeight = function(d, groupHeight) {
  return d.percentageOfTotal * groupHeight;
};

StackedColumnChart.prototype._columnCenter = function(index) {
  var columnPos = this._calcColumnPositionX(index);
  var columnWidth = this._calcColumnWidth();
  return columnPos + (columnWidth / 2);
};



/**
 * Drawing Methods
 * -------------------------------------------------------
 */

StackedColumnChart.prototype._drawYAxis = function() {
  var self = this;

  var scale = d3.scale.linear()
    .domain([self._maxValue(), 0])
    .range([0, self.settings.height]);

  var yAxis = d3.svg.axis()
    .scale(scale)
    .ticks(8)
    .tickFormat(function(d){
      return (self.settings.currency) ? d.toMoney() : d;
    })
    .orient("left");

  self.$chart.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + this.settings.yAxisMargin + "," + this.settings.padding.top + ")")
    .call(yAxis);
};

StackedColumnChart.prototype._drawLabels = function() {
  var self = this;
  self.$chart.append('g')
    .attr('class', 'labels')
    .selectAll("text.label")
    .data(self.normalizedDataSet)
    .enter()
    .append("text")
    .text(function(d) {
      return d.label;
    })
    .attr('class', 'label')
    .attr('y', function() {
      return self.settings.height + self.settings.padding.top +  20;
    })
    .attr("x", function(d, i) {
      return self._columnCenter(i);
    })
    .style("text-anchor", "middle");
};

StackedColumnChart.prototype._drawColumns = function() {
  var self = this;
  self.$columns = self.$chart.selectAll("g.column")
    .data(self.normalizedDataSet)
    .enter()
    .append("g")
    .attr("class", "column")
    .attr('width', self._calcColumnWidth())
    .attr('height', function(d) {
      var height = self._yScale(d.totalValue);
      d.columnHeight = height;
      d.segmentHeightCounter = 0;
      return height;
    })
    .attr('y', function(d) {
      d.y = self._calcColumnPositionY(d);
      return d.y;
    })
    .attr("x", function(d, i) {
      d.xCenter = self._columnCenter(i);
      d.x = self._calcColumnPositionX(i);
      return d.x;
    });

    self._drawSegments();
    self._drawTotals();
};

StackedColumnChart.prototype._drawSegments = function() {
  var self = this;
  self.$segments = self.$columns.selectAll('g.column-segment')
    .data(function(d){
      return d.segments;
    })
    .enter()
    .append('rect')
    .attr('class', 'column-segment')
    .attr('width', function(d){
      d.$column = this.parentNode;
      d.columnData = d.$column.__data__;
      var width = d.$column.attributes.width.value;
      return width;
    })
    .attr('height', function(d) {
      var groupHeight = d.$column.attributes.height.value;
      return self._calcSegmentHeight(d, groupHeight);
    })
    .attr('y', function(d) {
      var columnAttr = d.$column.attributes;
      var columnY = Number(columnAttr.y.value);
      var columnHeight = Number(columnAttr.height.value);
      var segmentHeight = self._calcSegmentHeight(d, columnHeight);
      var baseline = columnY + columnHeight - segmentHeight;
      d.y = baseline - d.columnData.segmentHeightCounter;
      d.columnData.segmentHeightCounter += segmentHeight;
      return d.y;
    })
    .attr("x", function(d) {
      d.x = d.$column.attributes.x.value;
      d.xCenter = d.columnData.xCenter;
      return d.x;
    })
    .attr("fill", function(d, i) {
      d.color = {
        base: d3.rgb(self.settings.colors[i].base),
        hover: d3.rgb(self.settings.colors[i].hover)
      };
      return d.color.base;
    });

    self.$segments
      .on('mousemove', function(d){
        var $seg = this;
        d3.select(this).style('fill', d.color.hover);
        self.$tooltip.select('.tooltip-label').text(d.label);
        self.$tooltip.select('.tooltip-value').text(d.displayValue);
        self.$tooltip
          .style('opacity', '1')
          .transition()
          .duration(50)
          .style('left', function(d){
            return d3.mouse($seg)[0];
          })
          .style('top', function(d){
            return d3.mouse($seg)[1];
          });
      })
      .on('mouseleave', function(d){
        self.$tooltip.style('opacity', '0')
        d3.select(this).style('fill', d.color.base);
      });

    self._drawTooltip();
};

StackedColumnChart.prototype._drawTooltip = function() {
  this.$tooltip = this.$wrapper.append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('opacity', '0')
    .style('pointer-events', 'none');

  this.$tooltip.append('span').attr('class', 'tooltip-label');
  this.$tooltip.append('span').attr('class', 'tooltip-value');
};

StackedColumnChart.prototype._drawTotals = function() {
  var self = this;
  self.$columns.append('text')
    .text(function(d) {
      return d.displayValue;
    })
    .attr('class', 'total')
    .attr('y', function(d) {
      var columnTop = d.y;
      return columnTop - 15;
    })
    .attr("x", function(d, i) {
      return self._columnCenter(i);
    })
    .style("text-anchor", "middle");
};

StackedColumnChart.prototype._render = function() {
  this._setDimensions();
  this._drawYAxis();
  this._drawLabels();
  this._drawColumns();
};

StackedColumnChart.prototype._setDimensions = function() {
  var $elem = document.getElementById(this.selector);
  var padding = this.settings.padding;
  this.settings.width = $elem.offsetWidth - padding.right - padding.left;
  this.settings.height = $elem.offsetHeight - padding.top - padding.bottom;
};

StackedColumnChart.prototype._destroy = function() {
  this.$chart.selectAll("g, rect, text").remove();
};

StackedColumnChart.prototype._reRender = function() {
  this._destroy();
  this._render();
};
