// 3D GLOBE EXAMPLE CODE

//
// Configuration
//

// ms to wait after dragging before auto-rotating
var rotationDelay = 3000
// scale of the globe (not the canvas element)
var scaleFactor = 0.9
// autorotation speed
var degPerSec = 6
// start angles
var angles = { x: -20, y: 40, z: 0}
// colors
var colorWater = '#fff'
var colorLand = '#111'
var colorGraticule = '#ccc'
var colorCountry = '#a00'

var currentPercent = d3.select('#percent');


//
// Handler
//

function enter(country) {
  var country = countryList.find(function(c) {
    return parseInt(c.id, 10) === parseInt(country.id, 10)
  })
  current.text(country && country.name || '');
  currentPercent.text(country && country.fullyVaccinated || '');
}

function leave(country) {
  current.text('')
  currentPercent.text('');
}

//
// Variables
//

var current = d3.select('#current')
var canvas = d3.select('#globe')
var context = canvas.node().getContext('2d')
var water = {type: 'Sphere'}
var projection = d3.geoOrthographic().precision(0.1)
var graticule = d3.geoGraticule10()
var path = d3.geoPath(projection).context(context)
var v0 // Mouse position in Cartesian coordinates at start of drag gesture.
var r0 // Projection rotation as Euler angles at start.
var q0 // Projection rotation as versor at start.
var lastTime = d3.now()
var degPerMs = degPerSec / 1000
var width, height
var land, countries
var countryList
var autorotate, now, diff, roation
var currentCountry

//
// Functions
//

function setAngles() {
  var rotation = projection.rotate()
  rotation[0] = angles.y
  rotation[1] = angles.x
  rotation[2] = angles.z
  projection.rotate(rotation)
}

function scale() {
  width = document.documentElement.clientWidth
  height = document.documentElement.clientHeight
  canvas.attr('width', width).attr('height', height)
  projection
    .scale((scaleFactor * Math.min(width, height)) / 2)
    .translate([width / 2, height / 2])
  render()
}

function startRotation(delay) {
  autorotate.restart(rotate, delay || 0)
}

function stopRotation() {
  autorotate.stop()
}

function dragstarted(e) {
  console.log('dragstarted');
  v0 = versor.cartesian(projection.invert(d3.pointer(e, this)));
  // v0 = versor.cartesian(projection.invert(d3.pointer(this)));
  r0 = projection.rotate()
  q0 = versor(r0)
  stopRotation()
}

function dragged(e) {
  console.log('dragged');
  var v1 = versor.cartesian(projection.rotate(r0).invert(d3.pointer(e, this)));
  var q1 = versor.multiply(q0, versor.delta(v0, v1))
  var r1 = versor.rotation(q1)
  projection.rotate(r1)
  render()
}

function dragended() {
  console.log('dragended');
  startRotation(rotationDelay)
}

function render() {
  context.clearRect(0, 0, width, height)
  fill(water, colorWater)
  stroke(graticule, colorGraticule)
  fill(land, colorLand)
  if (currentCountry) {
    fill(currentCountry, colorCountry)
  }
}

function fill(obj, color) {
  context.beginPath()
  path(obj)
  context.fillStyle = color
  context.fill()
}

function stroke(obj, color) {
  context.beginPath()
  path(obj)
  context.strokeStyle = color
  context.stroke()
}

function rotate(elapsed) {
  now = d3.now()
  diff = now - lastTime
  if (diff < elapsed) {
    var rotation = projection.rotate()
    rotation[0] += diff * degPerMs
    projection.rotate(rotation)
    render()
  }
  lastTime = now
}

// function loadData(cb) {
//   d3.json('https://unpkg.com/world-atlas@1/world/110m.json', function(error, world) {
//     if (error) throw error
//     d3.tsv('https://gist.githubusercontent.com/mbostock/4090846/raw/07e73f3c2d21558489604a0bc434b3a5cf41a867/world-country-names.tsv', function(error, countries) {
//       if (error) throw error
//       cb(world, countries)
//     })
//   })
// }

function loadData(cb) {
    console.log('loadData');
    d3.json('https://unpkg.com/world-atlas@1/world/110m.json')
        .then(function(world) {
            // d3.tsv('vaccinated_full.tsv')
            d3.csv('percent_noworld.csv')
                .then(function(countries) {
                    cb(world, countries);
                })
            // d3.tsv('fullyVaccinated.tsv')
            // .then(function(countries) {
            //     cb(world, countries);
            // })
  });          
}

// https://github.com/d3/d3-polygon
function polygonContains(polygon, point) {
  var n = polygon.length
  var p = polygon[n - 1]
  var x = point[0], y = point[1]
  var x0 = p[0], y0 = p[1]
  var x1, y1
  var inside = false
  for (var i = 0; i < n; ++i) {
    p = polygon[i], x1 = p[0], y1 = p[1]
    if (((y1 > y) !== (y0 > y)) && (x < (x0 - x1) * (y - y1) / (y0 - y1) + x1)) inside = !inside
    x0 = x1, y0 = y1
  }
  return inside
}

function mousemove(e) {
  console.log('mousemove');
  var c = getCountry(e);
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.log(c);
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!');
  if (!c) {
    if (currentCountry) {
      leave(currentCountry);
      currentCountry = undefined;
      render();
    }
    return
  }
  if (c === currentCountry) {
    return
  }
  currentCountry = c
  render()
  enter(c)
}

function getCountry(event) {
  console.log('getCountry');
  var pos = projection.invert(d3.pointer(event, this))
  console.log(pos);
  return countries.features.find(function(f) {
    return f.geometry.coordinates.find(function(c1) {
      return polygonContains(c1, pos) || c1.find(function(c2) {
        return polygonContains(c2, pos)
      })
    })
  })
}


//
// Initialization
//

setAngles() //set angle

canvas
  .call(d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended)
   )
  .on('mousemove', mousemove)

loadData(function(world, cList) {
  land = topojson.feature(world, world.objects.land)
  countries = topojson.feature(world, world.objects.countries)
  countryList = cList
  
  window.addEventListener('resize', scale)
  scale()
  autorotate = d3.timer(rotate)
})

const w = window.innerWidth, h = window.innerHeight;
const svg = d3.select('div')
  .append('svg')
  .attr('width', w)
  .attr('height', h);



// 우리나라 지도
d3.json('korea.json')
  .then(data => {
    d3.csv('korea_code_sum_diff.csv')
        .then(function(infoData) {
      const koreaMap = data;
      const geojson = topojson.feature(koreaMap, koreaMap.objects.skorea_provinces_2018_geo);
      const center = d3.geoCentroid(geojson);

      const k_projection = d3.geoMercator()
        .scale(1)
        .translate([0, 0]);
      
      const mappath = d3.geoPath(k_projection);

      const g = svg.append('g').attr('class', 'koreamap');
      const bounds = mappath.bounds(geojson);
      const widthScale = (bounds[1][0] - bounds[0][0]) / w; 
      const heightScale = (bounds[1][1] - bounds[0][1]) / h; 
      const scale = 1 /Math.max(widthScale, heightScale); //축척
      const xoffset = w/2 - scale * (bounds[1][0] + bounds[0][0])/2; 
      const yoffset = h/2 - scale * (bounds[1][1] + bounds[0][1])/2; 
      const offset = [xoffset, yoffset];
      k_projection.scale(scale).translate(offset);

      const colorScale = d3.scaleLinear().domain([0, 10000, 50000, 100000])
          .range(['white', 'rgb(0, 128, 255)', 'rgb(0, 76, 255)']);

      g
        .selectAll('path')
        .data(geojson.features)
        .enter().append('path')
        .attr('class', 'province')
        .attr('id', dta => 'id' + dta.properties.code)
        .attr('d', mappath)
        .attr('fill', 'orange')   //나중에 colorScale 만들기
        .attr('stroke', 'transparent')
        .attr('fill', function(d) {
          console.log(d);
          const temp_fill = infoData.find(dta => dta.code === d.properties.code);
          console.log(parseInt(temp_fill.sum.replace(',', ''), 10));
          console.log(colorScale(parseInt(temp_fill.sum.replace(',', ''), 10)));
          return colorScale(parseInt(temp_fill.sum.replace(',', ''), 10));
        })
        .on('mouseover', mouseOver)
        .on('mouseleave', mouseLeave);

      const seoul = d3.select('svg').select('g').select('#id11').attr('fill', 'blue');
      console.log('================');
      console.log(seoul.node().parentNode);
      console.log('================');
      seoul.node().parentNode.appendChild(seoul.node());

      var currentText = svg.append('text')
        .text('test')
        .attr('x', 100)
        .attr('y', 40)
        .attr('text-anchor', 'left')
        .style('font-size', 20);

      var sumText = svg.append('text')
        .attr('x', 100)
        .attr('y', 80)
        .attr('text-anchor', 'left')
        .style('font-size', 15);
      
      var diffText = svg.append('text')
        .attr('x', 100)
        .attr('y', 120)
        .attr('text-anchor', 'left')
        .style('color', 'gray')
        .style('font-size', 12);

      function mouseOver(d, i) {
        this.parentNode.appendChild(this);//the path group is on the top with in its parent group
        d3.select(this).style('stroke', 'black');
        // currentText.text(i.properties.name);

        const temp_text = infoData.find(d => d.code === i.properties.code);
        currentText.text(temp_text.area);
        console.log(temp_text);
        console.log(temp_text.sum)
        console.log(temp_text.diff)
        sumText.text(temp_text.sum);
        diffText.text(temp_text.diff);
      }

      function mouseLeave(d) {
        d3.select(this)
          .style("stroke", "transparent");
        currentText.text('');
        sumText.text('');
        diffText.text('');
      }
    });
});

// var colorScale = d3.scale.ordinal()
//   .domain([0, 1000, 50000])
//   .range(['blue', 'red']);

  //   svg
  //     .on('mousemove', k_mousemove);

  //   function k_mousemove(e) {
  //     console.log('mousemove');
  //     var c = getProvince(e);
  //     console.log(c);
  //     // if (!c) {
  //     //   if (currentProvince) {
  //     //     currentText.text('');
  //     //     currentProvince = undefined;
  //     //     renderKorea();
  //     //   }
  //     //   return
  //     // }
  //     // if (c === currentCountry) {
  //     //   return
  //     // }
  //     // currentCountry = c
  //     // render()
  //     // enter(c)
  //   }
    
  //   function getProvince(event) {
  //     var pos = k_projection.invert(d3.pointer(event, this))
  //     // console.log(pos);
  //     return geojson.features.find(function(f) {
  //       return f.geometry.coordinates.find(function(c1) {
  //         return polygonContains(c1, pos) || c1.find(function(c2) {
  //           return polygonContains(c2, pos)
  //         })
  //       })
  //     })
  //   }
  // })

  // // function renderKorea() {
  // //   context.clearRect(0, 0, width, height)
  // //   fill(water, colorWater)
  // //   stroke(graticule, colorGraticule)
  // //   fill(land, colorLand)
  // //   if (currentCountry) {
  // //     fill(currentCountry, colorCountry)
  // //   }
  // // }


const ageInfo = [
  {
    name: '80세 이상', 
    sum: 1738733,
    percent: 77.1,
  },
  {
    name: '70 ~ 79', 
    sum: 1548144, 
    percent: 41.2,
  },
  {
    name: '60 ~ 69', 
    sum: 543993, 
    percent: 7.6,
  },
  {
    name: '50 ~ 59',
    sum: 632641, 
    percent: 7.4,
  },
  {
    name: '40 ~ 49', 
    sum: 662120, 
    percent: 8.2,
  },
  {
    name: '30 ~ 39', 
    sum: 1165851, 
    percent: 17.4,
  },
  {
    name: '18 ~ 29', 
    sum: 854927, 
    percent: 11.2,
  }
];

console.log('whyyyy');


const fillIcons = ageInfo.map(a => {
  return Math.round(a.percent/4);
})

console.log(fillIcons);

// icon chart
const iconCharts = document.getElementsByClassName('icon-chart');
for (let i=0; i<ageInfo.length; i++) {
  for (let j=0; j<25; j++) {
    let newIcon = document.createElement('i');
    newIcon.setAttribute('class', 'fas fa-syringe');

    // console.log('result'+ i + ',' + fillIcons[i]);
    // if (j <= fillIcons[i]) newIcon.style.color = 'red';
    iconCharts[i].setAttribute('id', i);
    iconCharts[i].appendChild(newIcon);
    iconCharts[i].addEventListener('mouseover', handleIconHover)
    iconCharts[i].addEventListener('mouseleave', handleIconHover);
  }
}

var pointerX = -1;
var pointerY = -1;

document.onmousemove = function(e) {
  pointerX = e.pageX;
  pointerY = e.pageY;
}



var checkHoverTimePassed = 'mouseleave';
var checkID = -1;
function handleIconHover(e) {
  let icons = this.children;
  
  console.log(checkHoverTimePassed);
  console.log(e.type);
  if (checkHoverTimePassed != e.type || checkID !== this.id){
    let idx = 0;
    var tt = setInterval(() => {
      icons[idx].style.color = 'red';
      idx += 1;
      if (idx === fillIcons[this.id]) {
        idx = 0;
        setTimeout(() => {
          console.log('settimeout');
          var getRect = this.getClientRects()[0];
          if ((pointerX < getRect.x || pointerX > (getRect.x + getRect.width)) || (pointerY-1592 < getRect.y || pointerY-1592 > (getRect.y + getRect.height))) {
            let idx2 = fillIcons[this.id] - 1;
            var ttt = setInterval(() => {
              icons[idx2].style.color = 'gray';
              idx2 -= 1;
              if (idx2 < 0) {
                idx2 = fillIcons[this.id] - 1;
                clearInterval(ttt);
              }
            }, 50);
          }
          else {
            console.log('in');
          }
          console.log(getRect.x, getRect.x + getRect.width);
          console.log(pointerX);
          console.log(getRect.y, getRect.y + getRect.height);
          console.log(pointerY-1592);

          checkHoverTimePassed = e.type;
          checkID = this.id;
        }, 1000);
        clearInterval(tt);
      }
    }, 10);

    // if (e.type === 'mouseleave' && checkHoverTimePassed) {
    //   console.log('it is okay to do the animation');
    // }
  }
  // for (let idx=0; idx<fillIcons[this.id]; idx++) {
  //   icons[idx].style.color = 'red';
  // }
}