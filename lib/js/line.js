"use strict";

function LineGraph(elementId, data) {
  this.chart = document.getElementById(elementId);
  this.data = data
  this.height = this._style('height');
  this.width = this._style('width');
  this.$chart = d3.select(this.chart).append('svg');
  this.margins = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 50
  }
}

LineGraph.prototype._style = function(property) {
  var style = window.getComputedStyle(this.chart)[property];
  return style.replace('px', '');
};

LineGraph.prototype._setAxisX = function() {
  this.xAxis = d3.svg.axis()
    .scale(this.xRange)
    .tickSize(2)
    .tickSubdivide(true);
};

LineGraph.prototype._appendAxisX = function() {
  this._setAxisX();
  var height = this.height - this.margins.bottom;
  this.$chart.append('svg:g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(this.xAxis);
};

LineGraph.prototype._setAxisY = function() {
  this.yAxis = d3.svg.axis()
    .scale(this.yRange)
    .tickSize(2)
    .orient('left')
    .tickSubdivide(true);
};

LineGraph.prototype._appendAxisY = function() {
  this._setAxisY();
  this.$chart.append('svg:g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(' + this.margins.left + ',0)')
    .call(this.yAxis);
};

LineGraph.prototype._setRangeX = function() {
  var width = this.width - this.margins.right;
  this.xRange = d3.scale.linear()
    .range([this.margins.left, width])
    .domain([1, this.data.length]);
};

LineGraph.prototype._setRangeY = function() {
  var height = this.height - this.margins.top;
  this.yRange = d3.scale.linear()
    .range([height, this.margins.bottom])
    .domain([d3.min(this.data), d3.max(this.data)]);
};

LineGraph.prototype._generateLine = function() {
  var self = this;
  var index = 0;
  var fn = d3.svg.line()
    .x(function(d) {
      index++;
      return self.xRange(index);
    })
    .y(function(d) {
      return self.yRange(d);
    })
    .interpolate('linear');
  return fn(self.data);
};

LineGraph.prototype._appendPlotPoints = function() {
  for (var i=0; i < this.data.length; i++) {
    var xCoord = this.xRange(i+1);
    var yCoord = this.yRange(this.data[i]);
    this.$chart.append("circle")
      .attr("cx", xCoord)
      .attr("cy", yCoord)
      .attr("r", 6);
  }
}

LineGraph.prototype._appendLine = function() {
  this.$chart.append('svg:path')
    .attr('d', this._generateLine())
    .attr('stroke', 'grey')
    .attr('stroke-width', 2)
    .attr('fill', 'none');
};

LineGraph.prototype._draw = function() {
  this._appendLine();
  this._appendPlotPoints();
}

LineGraph.prototype.init = function() {
  this._setRangeX();
  this._setRangeY();
  this._appendAxisX();
  this._appendAxisY();
  this._draw();
};

LineGraph.prototype.reDraw = function() {
  this.$chart.selectAll("*").remove();
  this.init();
}

LineGraph.prototype.addPoint = function(point, tickerMode) {
  if (tickerMode) {
    this.data.shift();
  }
  this.data.push(point);
  this.reDraw();
}
