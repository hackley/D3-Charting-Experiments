function BarChart(elem) {
  this.settings = {
    width: 600,
    height: 240,
    barSpacing: 10,
    chartBg: "#eee"
  };
  this._setElem(elem);
}

BarChart.prototype.init = function(data) {
  this.dataSet = data;
  this._render();
}

BarChart.prototype.addData = function(data) {
  this.dataSet.push(data);
  this._reRender();
};

BarChart.prototype._setElem = function(elem) {
  this.$chart = d3.select(elem)
    .append('svg')
    .attr("width", this.settings.width)
    .attr("height", this.settings.height)
    .style("background", this.settings.chartBg);
};

BarChart.prototype._maxValue = function() {
  return d3.max(this.dataSet, function(d) {
    return d.value;
  });
};

BarChart.prototype._yScale = function(input) {
  var scale = d3.scale.linear()
    .domain([0, this._maxValue()])
    .range([0, this.settings.height]);
  return scale(input)
};

BarChart.prototype._calcBarWidth = function() {
  var divided =  this.settings.width / this.dataSet.length;
  var width = divided - this.settings.barSpacing;
  return width;
};

BarChart.prototype._calcBarPositionX = function(i) {
  return i * (this.settings.width / this.dataSet.length);
};

BarChart.prototype._calcBarPositionY = function(d) {
  return this.settings.height - this._yScale(d.value);
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
  self.$chart.selectAll("text")
    .data(self.dataSet)
    .enter()
    .append("text")
    .text(function(d) {
      return d.value;
    })
    .attr('y', function(d) {
      return self._calcBarPositionY(d);
    })
    .attr("x", function(d, i) {
      return self._calcBarPositionX(i);
    })
};

BarChart.prototype._render = function() {
  this._drawBars();
  this._drawLabels();
};

BarChart.prototype._destroy = function() {
  this.$chart.selectAll("rect, text").remove();
};

BarChart.prototype._reRender = function() {
  this._destroy();
  this._render();
};
