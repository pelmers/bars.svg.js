function BarChart(container, width, height) {
    // Create bar charts.
    "use strict";
    var svgNS = "http://www.w3.org/2000/svg",
        chart = document.createElementNS(svgNS, 'svg'),
        minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity,
        xLabel = null, yLabel = null,
        xScale = null, yScale = null,
        xMult = 1, yMult = 1,
        curHeights = [],
        bars = [],
        barColor = "red",
        barOpacity = "1.0",
        title = null,
        animTime = 350, // total time of each animation
        easingFunc = function(t) { return Math.pow(t/getAnimTime(), 2); }, // default to quadratic ease in
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
        barPadding = 3, // 3pt between bars
        leftPadding = fontSize*2 + textPadding*2,
        rightPadding = textPadding,
        topPadding = (fontSize+2) + textPadding,
        bottomPadding = fontSize*2 + textPadding;
    }

    function objToArray(obj) {
        // Turn a key:value mapping of numbers into an array in order of ascending keys.
        // {0.1:2, 3.6:4, 5:1} -> [2,4,1]
        var arr = [];
        for (var k in obj) {
            if (!obj.hasOwnProperty(k)) continue;
            arr.push(parseFloat(k));
        }
        // sort by keys
        arr.sort();
        // replace keys with values
        for (var i = 0; i < arr.length; i++) {
            arr[i] = obj[arr[i]];
        }
        return arr;
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

    function setUnits(xMultiplier, yMultiplier) {
        // Set scale label multipliers
        xMult = (xMultiplier)?xMultiplier:xMult;
        yMult = (yMultiplier)?yMultiplier:yMult;
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
        // add rects for bars to the svg DOM
        for (var i = 0; i < maxX - minX; i++) {
            if (i === bars.length) {
                bars.push(document.createElementNS(svgNS, 'rect'));
                chart.appendChild(bars[i]);
            }
        }
        // remove any extra bars
        for (var i = bars.length-1; i >= maxX - minX && i >= 0; i--) {
            chart.removeChild(bars[i]);
            bars.pop();
        }
        // create scale groups if they don't exist
        if (!xScale) {
            xScale = document.createElementNS(svgNS, 'g');
            chart.appendChild(xScale);
        }
        if (!yScale) {
            yScale = document.createElementNS(svgNS, 'g');
            chart.appendChild(yScale);
        }
        var // interval between axis ticks, ensure no more than 10 ticks
            xInterval = Math.ceil(((maxX - minX) / Math.min(maxX - minX, 9))),
            // width of each bar
            barWidth = ~~((width - (leftPadding + rightPadding)) / (maxX - minX) - barPadding),
            children = getChildren(xScale);

        for (var i = children.length; i < 1+((maxX - minX) / xInterval)|0; i++)
            // add new text elements as needed
            xScale.appendChild(document.createElementNS(svgNS, 'text'));
        var children = getChildren(xScale);
        for (var i = children.length - 1; i >= 1+((maxX-minX) / xInterval)|0; i--)
            // remove extra text elements
            xScale.removeChild(children[i]);
        var children = getChildren(xScale);
        for (var i = 0; i < children.length; i++) {
            // label and position axis text correctly
            children[i].textContent = (xMult !== ~~xMult)?
                // if xMult is a floating point, then do some formatting to make sure the label looks ok
                parseFloat((xInterval*i*xMult).toPrecision(3)).toExponential():
                xInterval*i*xMult;
            children[i].setAttributeNS(null, 'x', i*xInterval*(barWidth + barPadding) + fontSize + textPadding*2);
            children[i].setAttributeNS(null, 'y', height - bottomPadding + fontSize);
            children[i].setAttributeNS(null, 'font-size', fontSize+'px');
            children[i].setAttributeNS(null, 'text-anchor', 'start');
        }

        var // interval between axis ticks, allow no more than 10 ticks
            yInterval = Math.ceil(((maxY - minY) / Math.min(maxY - minY, 9))),
            children = getChildren(yScale);
        // add new text elements and remove unneeded text elements from the scale
        for (var i = children.length; i < 1+((maxY - minY) / yInterval)|0; i++)
            yScale.appendChild(document.createElementNS(svgNS, 'text'));
        var children = getChildren(yScale);
        for (var i = children.length - 1; i >= ((maxY-minY) / yInterval)|0; i--)
            yScale.removeChild(children[i]);
        var children = getChildren(yScale);
        for (var i = 0; i < children.length; i++) {
            // calculate the distance from container's bottom to the label
            var labelHeight = ~~((i+1) * yInterval * (height- topPadding - bottomPadding-2) / (maxY - minY))+2 + fontSize*2;
            children[i].textContent = (yMult !== ~~yMult)?
                parseFloat((yInterval*(i+1)*yMult).toPrecision(3)).toExponential():
                yInterval*(i+1)*yMult;
            children[i].setAttributeNS(null, 'x', fontSize + barPadding);
            children[i].setAttributeNS(null, 'y', height - labelHeight);
            children[i].setAttributeNS(null, 'font-size', fontSize+'px');
            children[i].setAttributeNS(null, 'text-anchor', 'start');
        }
    }

    function adjustScaleFromData(startingDomain, startingRange, data) {
        var domain = startingDomain, range = startingRange;
        for (var k in data) {
            if (!data.hasOwnProperty(k)) continue;
            var x = parseFloat(k);
            domain = [Math.min(x, domain[0]), Math.max(x+1, domain[1])];
            range = [Math.min(data[k], range[0]), Math.max(data[k], range[1])];
        }
        setScale(domain[0], domain[1], range[0], range[1]);
    }

    function trimScaleFromData(data) {
        // Trim scale to given data
        adjustScaleFromData([0,0], [0,0], data)
    }

    function setScaleFromData(data) {
        // Increase domain and/or range to acommondate for data mapping.
        adjustScaleFromData([minX,maxX],[minY,maxY],data);
    }

    function load() {
        // Append the chart element to the container
        chart.setAttributeNS(null, 'width', width + 'px');
        chart.setAttributeNS(null, 'height', height + 'px');
        chart.setAttributeNS(null, 'viewBox', "0 0 " + width + " " + height);
        chart.setAttributeNS(null, 'overflow', 'visible');
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
            barWidth = ~~((width - (leftPadding + rightPadding)) / (maxX - minX) - barPadding),
            dataArr = (newData instanceof Array)?newData:objToArray(newData);
        for (var i = 0; i < bars.length; i++) {
            // +2 here means that the bar is 2 at minimum 2 pixels high
            var barHeight = ~~(dataArr[i] * (height- topPadding - bottomPadding-2) / (maxY - minY))+2;
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
        // set height of hidden bars to undefined
        for (var i = bars.length; i < curHeights.length; i++)
            curHeights[i] = undefined;
    }

    load();
    return {
        update: update,

        // getters
        getAnimTime: getAnimTime,

        // setters
        setAnimTime: setAnimTime,
        setLabels: setLabels,
        setTitle: setTitle,
        setBarColor: setBarColor,
        setEasingFunc: setEasingFunc,

        setUnits: setUnits,
        setScale: setScale,
        setScaleFromData: setScaleFromData,
        trimScaleFromData: trimScaleFromData,
    };
}
