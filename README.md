Example usage:

```js
// height and width in pixels
var width = 800, height = 600;
// describe where to put the chart and how big it is
var barChart = BarChart(document.getElementById("container"), width, height),
    data = [3, 0, 4, 5];
// set title and axis labels
barChart.setTitle("Demo");
barChart.setLabels("x", "y");
// put the data into the bar chart
barChart.update(data);

// subsequent updates will be animated
```
