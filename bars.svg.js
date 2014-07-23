function BarChart(container, width, height) {
    "use strict";
    var svgNS = "http://www.w3.org/2000/svg",
        chart = document.createElementNS(svgNS, 'svg'),
        minX = 0, maxX = 0, minY = 0, maxY = 0,
        xLabel = null, yLabel = null,
        xScale = null, yScale = null,
        values = [],
        bars = [],
        barColor = "red",
        barOpacity = "1.0",
        title = null,
        fontSize = height/32,
        animTime = 350, // total time of each animation
        textPadding = 4, // padding between text
        barPadding = 5, // 5pt between bars
        leftPadding = fontSize*2 + textPadding,
        rightPadding = textPadding,
        topPadding = (fontSize+2) + textPadding,
        bottomPadding = fontSize*2 + textPadding;

    function setLabels(x_label, y_label) {
        // Set x and y labels, use before load()
        if (!xLabel) {
            xLabel = document.createElementNS(svgNS, 'text');
            chart.appendChild(xLabel);
        }
        if (!yLabel) {
            yLabel = document.createElementNS(svgNS, 'text');
            chart.appendChild(yLabel);
        }
        xLabel.setAttributeNS(null, 'x', width/2);
        xLabel.setAttributeNS(null, 'y', height);
        xLabel.setAttributeNS(null, 'font-size', fontSize+'px');
        xLabel.setAttributeNS(null, 'text-anchor', 'middle');
        xLabel.textContent = x_label;

        yLabel.setAttributeNS(null, 'x', fontSize);
        yLabel.setAttributeNS(null, 'y', height/2);
        yLabel.setAttributeNS(null, 'transform', 'rotate(-90,'+fontSize+','+height/2+')');
        yLabel.setAttributeNS(null, 'font-size', fontSize+'px');
        yLabel.setAttributeNS(null, 'text-anchor', 'middle');
        yLabel.textContent = y_label;
    }

    function setTitle(text) {
        // Set the title of the chart
        if (!title) {
            title = document.createElementNS(svgNS, 'text');
            chart.appendChild(title);
        }
        title.setAttributeNS(null, 'y', fontSize);
        title.setAttributeNS(null, 'x', width/2);
        title.setAttributeNS(null, 'font-size', (fontSize+2)+'px');
        title.setAttributeNS(null, 'font-weight', 'bold');
        title.setAttributeNS(null, 'text-anchor', 'middle');
        title.textContent = text;
    }

    function setBarColor(color, opacity) {
        barColor = color;
        barOpacity = (opacity)?opacity:barOpacity;
    }

    function setScale(min_x, max_x, min_y, max_y) {
        // Set the domain and range of the chart.
        minX = min_x;
        maxX = max_x;
        minY = min_y;
        maxY = max_y;
        for (var i = 0; i < maxX - minX; i++) {
            if (i === bars.length) {
                bars.push(document.createElementNS(svgNS, 'rect'));
                chart.appendChild(bars[i]);
            }
        }
        // remove any extra bars
        for (var i = bars.length-1; i >= maxX - minX; i--) {
            chart.removeChild(bars[i]);
            bars.pop();
        }
        if (!xScale) {
            xScale = document.createElementNS(svgNS, 'g');
            chart.appendChild(xScale);
        }
        if (!yScale) {
            yScale = document.createElementNS(svgNS, 'g');
            chart.appendChild(yScale);
        }
        var xInterval = Math.ceil(((maxX - minX) / Math.min(maxX - minX, 9))),
            barWidth = ~~((width - (leftPadding + rightPadding)) / (maxX - minX) - barPadding);
        while (xScale.children.length < 1+((maxX - minX) / xInterval)|0)
            xScale.appendChild(document.createElementNS(svgNS, 'text'));
        for (var i = xScale.children.length - 1; i >= 1+((maxX-minX) / xInterval)|0; i--)
            xScale.removeChild(xScale.children[i]);
        for (var i = 0; i < xScale.children.length; i++) {
            xScale.children[i].textContent = xInterval*i;
            xScale.children[i].setAttributeNS(null, 'x', i*xInterval*(barWidth + barPadding) + fontSize + textPadding*2);
            xScale.children[i].setAttributeNS(null, 'y', height - bottomPadding + fontSize);
            xScale.children[i].setAttributeNS(null, 'font-size', fontSize+'px');
            xScale.children[i].setAttributeNS(null, 'text-anchor', 'start');
        }

        var yInterval = Math.ceil(((maxY - minY) / Math.min(maxY - minY, 9)));
        while (yScale.children.length < 1+((maxY - minY) / yInterval)|0)
            yScale.appendChild(document.createElementNS(svgNS, 'text'));
        for (var i = yScale.children.length - 1; i >= 1+((maxY-minY) / yInterval)|0; i--)
            yScale.removeChild(yScale.children[i]);
        for (var i = 0; i < yScale.children.length; i++) {
            var labelHeight = ~~((i+1) * (height - topPadding - bottomPadding + fontSize) / (maxY - minY))+fontSize/2;
            yScale.children[i].textContent = yInterval*(i+1);
            yScale.children[i].setAttributeNS(null, 'x', fontSize + barPadding);
            yScale.children[i].setAttributeNS(null, 'y', height - labelHeight);
            yScale.children[i].setAttributeNS(null, 'font-size', fontSize+'px');
            yScale.children[i].setAttributeNS(null, 'text-anchor', 'start');
        }
    }

    function trimScaleFromData(data) {
        // Trim scale to given data
        var domain = [0,0],
            range = [0,0];
        for (var k in data) {
            if (!data.hasOwnProperty(k)) continue;
            domain = [Math.min(~~k, domain[0]), Math.max(~~k, domain[1])];
            range = [Math.min(data[k], range[0]), Math.max(data[k], range[1])];
        }
        setScale(domain[0], domain[1], range[0], range[1]);
    }

    function setScaleFromData(data) {
        // Increase domain and/or range to acommondate for data mapping.
        var domain = [minX,maxX],
            range = [minY,maxY];
        for (var k in data) {
            if (!data.hasOwnProperty(k)) continue;
            domain = [Math.min(~~k, domain[0]), Math.max(~~k, domain[1])];
            range = [Math.min(data[k], range[0]), Math.max(data[k], range[1])];
        }
        setScale(domain[0], domain[1], range[0], range[1]);
    }

    function load() {
        // Append the chart element to the container
        chart.setAttributeNS(null, 'width', width + 'px');
        chart.setAttributeNS(null, 'height', height + 'px');
        container.appendChild(chart);
    }

    function animateGrowth(bar, targetHeight, totalTime, easing) {
        var requestId,
            start = window.performance.now(),
            oldHeight = ~~bar.getAttributeNS(null, 'height');
        function anim(t) {
            if (t >= start + totalTime) {
                // we're done, push to the end and cancel animation
                bar.setAttributeNS(null, 'height', targetHeight);
                bar.setAttributeNS(null, 'y', height - targetHeight - bottomPadding);
                window.cancelAnimationFrame(requestId);
            } else {
                var dH = (targetHeight - oldHeight) * easing(t-start);
                bar.setAttributeNS(null, 'height', oldHeight + dH);
                bar.setAttributeNS(null, 'y', height - (oldHeight+dH) - bottomPadding);
                requestId = window.requestAnimationFrame(anim);
            }
        }
        requestId = window.requestAnimationFrame(anim);
    }

    function update(newData) {
        // Overwrite existing data with that present in newData, expanding the scale if necessary
        setScaleFromData(newData);
        var offsetX = leftPadding,
            barWidth = ~~((width - (leftPadding + rightPadding)) / (maxX - minX) - barPadding);
        for (var i = 0; i < bars.length; i++) {
            var barHeight = ~~(newData[i] * (height- topPadding - bottomPadding-2) / (maxY - minY))+2;
            bars[i].setAttributeNS(null, 'width', barWidth);
            bars[i].setAttributeNS(null, 'x', offsetX);
            bars[i].setAttributeNS(null, 'fill', barColor);
            bars[i].setAttributeNS(null, 'fill-opacity', barOpacity);
            animateGrowth(bars[i], barHeight, animTime, function(t) {
                return t/animTime;
            });
            offsetX += barWidth + barPadding;
            values[i] = newData[i];
        }
    }

    load();
    return {
        update: update,
        setScale: setScale,
        setScaleFromData: setScaleFromData,
        trimScaleFromData: trimScaleFromData,
        setLabels: setLabels,
        setTitle: setTitle,
        setBarColor: setBarColor,
    };
}
