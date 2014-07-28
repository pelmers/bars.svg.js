function BarChart(container, width, height) {
    // Create bar charts.
    "use strict";
    var svgNS = "http://www.w3.org/2000/svg",
        chart = document.createElementNS(svgNS, 'svg'),
        minX = 0, maxX = 0, minY = 0, maxY = 0,
        xLabel = null, yLabel = null,
        xScale = null, yScale = null,
        curHeights = [],
        bars = [],
        barColor = "red",
        barOpacity = "1.0",
        title = null,
        animTime = 350, // total time of each animation
        easingFunc = function(t) { return t/getAnimTime(); }, // default to linear easing
        fontSize, textPadding, barPadding, leftPadding, rightPadding, topPadding, bottomPadding;

    function getChildren(element) {
        // Polyfill for getting children of SVG element (for Safari and IE)
        if (element.children)
            return element.children;
        var childNodes = element.childNodes,
            children = [];
        for (var i = 1; i < childNodes.length; i += 2) {
            children.push(childNodes[i]);
        }
        return children;
    }

    function calculatePaddings() {
        fontSize = height/32,
        textPadding = 4, // padding between text
        barPadding = 5, // 5pt between bars
        leftPadding = fontSize*2 + textPadding*2,
        rightPadding = textPadding,
        topPadding = (fontSize+2) + textPadding,
        bottomPadding = fontSize*2 + textPadding;
    }

    function setAnimTime(time) {
        // Set bar animation duration (in ms).
        animTime = time;
    }

    function setEasingFunc(easer) {
        // Set the easing function used to animate bar updates.
        easingFunc = easer;
    }

    function getAnimTime() {
        // Return current animation duration.
        return animTime;
    }

    function setLabels(x_label, y_label) {
        // Set x and y labels
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
        // Set color and opacity of bars
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
            barWidth = ~~((width - (leftPadding + rightPadding)) / (maxX - minX) - barPadding),
            children = getChildren(xScale);
        for (var i = children.length; i < 1+((maxX - minX) / xInterval)|0; i++)
            xScale.appendChild(document.createElementNS(svgNS, 'text'));
        var children = getChildren(xScale);
        for (var i = children.length - 1; i >= 1+((maxX-minX) / xInterval)|0; i--)
            xScale.removeChild(children[i]);
        var children = getChildren(xScale);
        for (var i = 0; i < children.length; i++) {
            children[i].textContent = xInterval*i;
            children[i].setAttributeNS(null, 'x', i*xInterval*(barWidth + barPadding) + fontSize + textPadding*2);
            children[i].setAttributeNS(null, 'y', height - bottomPadding + fontSize);
            children[i].setAttributeNS(null, 'font-size', fontSize+'px');
            children[i].setAttributeNS(null, 'text-anchor', 'start');
        }

        var yInterval = Math.ceil(((maxY - minY) / Math.min(maxY - minY, 9))),
            children = getChildren(yScale);
        for (var i = children.length; i < 1+((maxY - minY) / yInterval)|0; i++)
            yScale.appendChild(document.createElementNS(svgNS, 'text'));
        var children = getChildren(yScale);
        for (var i = children.length - 1; i >= 1+((maxY-minY) / yInterval)|0; i--)
            yScale.removeChild(children[i]);
        var children = getChildren(yScale);
        for (var i = 0; i < children.length; i++) {
            var labelHeight = ~~((i+1) * yInterval * (height - topPadding - bottomPadding + fontSize) / (maxY - minY))+fontSize/2;
            children[i].textContent = yInterval*(i+1);
            children[i].setAttributeNS(null, 'x', fontSize + barPadding);
            children[i].setAttributeNS(null, 'y', height - labelHeight);
            children[i].setAttributeNS(null, 'font-size', fontSize+'px');
            children[i].setAttributeNS(null, 'text-anchor', 'start');
        }
    }

    function trimScaleFromData(data) {
        // Trim scale to given data
        var domain = [0,0],
            range = [0,0];
        for (var k in data) {
            if (!data.hasOwnProperty(k)) continue;
            domain = [Math.min(~~k, domain[0]), Math.max(~~k+1, domain[1])];
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
            domain = [Math.min(~~k, domain[0]), Math.max(~~k+1, domain[1])];
            range = [Math.min(data[k], range[0]), Math.max(data[k], range[1])];
        }
        setScale(domain[0], domain[1], range[0], range[1]);
    }

    function load() {
        // Append the chart element to the container
        chart.setAttributeNS(null, 'width', width + 'px');
        chart.setAttributeNS(null, 'height', height + 'px');
        chart.setAttributeNS(null, 'viewBox', "0 0 " + width + " " + height);
        calculatePaddings();
        container.appendChild(chart);
    }

    function animateGrowth(bar, targetHeight, totalTime, easing) {
        var start,
            oldHeight = ~~bar.getAttributeNS(null, 'height');
        function anim(t) {
            // Store the time of the first frame of animation as the start time.
            if (!start)
                start = t;
            if (t >= start + totalTime) {
                // we're done, just push the bar to the end
                bar.setAttributeNS(null, 'height', targetHeight);
                bar.setAttributeNS(null, 'y', height - targetHeight - bottomPadding);
            } else {
                // get change in height from easing function
                var dH = (targetHeight - oldHeight) * easing(t-start);
                bar.setAttributeNS(null, 'height', oldHeight + dH);
                bar.setAttributeNS(null, 'y', height - (oldHeight+dH) - bottomPadding);
                window.requestAnimationFrame(anim);
            }
        }
        window.requestAnimationFrame(anim);
    }

    function update(newData) {
        // Overwrite existing data with that present in newData, expanding the scale if necessary
        setScaleFromData(newData);
        var offsetX = leftPadding,
            barWidth = ~~((width - (leftPadding + rightPadding)) / (maxX - minX) - barPadding);
        for (var i = 0; i < bars.length; i++) {
            // +2 here means that the bar is 2 at minimum 2 pixels high
            var barHeight = ~~(newData[i] * (height- topPadding - bottomPadding-2) / (maxY - minY))+2;
            bars[i].setAttributeNS(null, 'width', barWidth);
            bars[i].setAttributeNS(null, 'x', offsetX);
            bars[i].setAttributeNS(null, 'fill', barColor);
            bars[i].setAttributeNS(null, 'fill-opacity', barOpacity);
            offsetX += barWidth + barPadding;
            if (curHeights[i] !== barHeight)
                // only re-run the animation if the height has not changed
                animateGrowth(bars[i], barHeight, animTime, easingFunc);
            curHeights[i] = barHeight;
        }
        // set height of hidden bars back to 0
        for (var i = bars.length; i < curHeights.length; i++)
            curHeights[i] = 0;
    }

    load();
    return {
        update: update,
        setScale: setScale,
        setScaleFromData: setScaleFromData,
        trimScaleFromData: trimScaleFromData,

        // getters
        getAnimTime: getAnimTime,

        // setters
        setAnimTime: setAnimTime,
        setLabels: setLabels,
        setTitle: setTitle,
        setBarColor: setBarColor,
        setEasingFunc: setEasingFunc,
    };
}
