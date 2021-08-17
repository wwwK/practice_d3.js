// const width = window.innerWidth;
// const height = window.innerHeight;

// const svg = d3.select('div').append('svg').attr('width', width).attr('height', height).attr('cursor', 'pointer');

// const mapInfo = [
//     {
//         "name":"서울",
//         "lat" : "37.532600",
//         "lon" : "127.024612"
//     },
//     {
//         "name": "",
//         "lat" : "40.730610",
//         "lon" : "-73.935242"
//     }
// ];

// d3.json("world.json")
//     .then(data => {
//         const worldMap = data;
//         const geojson = topojson.feature(worldMap, worldMap.objects.countries);
//         const center = d3.geoCentroid(geojson);
//         console.log(center);

//         const projection = d3.geoMercator()
//             .scale(1)
//             .translate([0, 0]);

//         const path = d3.geoPath(projection);

//         const g = svg.append('g');
//         const bounds = path.bounds(geojson);
//         const widthScale = (bounds[1][0] - bounds[0][0]) / width; 
//         const heightScale = (bounds[1][1] - bounds[0][1]) / height; 
//         const scale = 1 /Math.max(widthScale, heightScale); //축척
//         const xoffset = width/2 - scale * (bounds[1][0] + bounds[0][0])/2; 
//         const yoffset = height/2 - scale * (bounds[1][1] + bounds[0][1])/2; 
//         const offset = [xoffset, yoffset];
//         projection.scale(scale).translate(offset);
//         console.log(scale, offset);

//         g
//         .selectAll('path').data(geojson.features)
//         .enter().append('path')
//         .attr('class', 'country')
//         .attr('d', path);

//         const cur_brower = browserCheck();
//         const transforms = cur_brower === 'Chrome' ? 'scale(2)' : 'translate(' + -width/2 + ',' + -height/2 + ') scale(' + 2 + ')';

//         const icons = svg.append('g').selectAll('svg')
//             .data(mapInfo)
//             .enter()  
//             .append("rect")
//             .attr("width", 10)
//             .attr("height", 10)
//             .attr('fill', 'green')
//             .attr('x' ,  d => projection([d.lon, d.lat])[0])
//             .attr('y' ,  d => projection([d.lon, d.lat])[1])
//             .attr('opacity', 1)
//             .on('click', function(d, i) {
//                 console.log(projection([i.lon, i.lat])[0]);
//                 g.transition()
//                 .duration(2000)
//                 .attr('transform-origin', 'center')
//                 // .attr('transform', 'translate(' + (center[0] + offset[0] - projection([i.lon, i.lat])[0])*5 + ',' + (center[1] + offset[1] - projection([i.lon, i.lat])[1])*5 + ') scale(' + 5 + ')');
                
//                 // .attr('transform', 'translate(' + (offset[0] - projection([i.lon, i.lat])[0]) + ',' + (offset[1] - projection([i.lon, i.lat])[1] + 15) + ')');
//                 .attr('transform', transforms + ' translate(' + (width/2-projection([i.lon, i.lat])[0]) + ',' + (height/2-projection([i.lon, i.lat])[1]) + ')');
//                 // .attr('transform', 'translate(' + -width/2 + ',' + -height/2 + ') scale(' + 2 + ')');   //사파리

//                 // .attr('transform', 'scale(' + 2 + ') translate(' + (offset[0] - projection([i.lon, i.lat])[0]) + ',' + (offset[1] - projection([i.lon, i.lat])[1] + 15) + ')');
//             });

//         const testCenter = svg.append('g').selectAll('svg')
//             .data([center])
//             .enter()
//             .append("rect")
//             .attr("width", 10)
//             .attr("height", 10)
//             .attr('fill', 'blue')
//             .attr('x' ,  d => width/2 - 5)
//             .attr('y' ,  d => height/2 - 5);
//             // .attr('x' ,  d => projection([d[0], d[1]])[0])
//             // .attr('y' ,  d => projection([d[0], d[1]])[1]);
// }); 

// function browserCheck(){ 
// 	const agt = navigator.userAgent.toLowerCase(); 
// 	if (agt.indexOf("chrome") != -1) return 'Chrome'; 
// 	if (agt.indexOf("opera") != -1) return 'Opera'; 
// 	if (agt.indexOf("staroffice") != -1) return 'Star Office'; 
// 	if (agt.indexOf("webtv") != -1) return 'WebTV'; 
// 	if (agt.indexOf("beonex") != -1) return 'Beonex'; 
// 	if (agt.indexOf("chimera") != -1) return 'Chimera'; 
// 	if (agt.indexOf("netpositive") != -1) return 'NetPositive'; 
// 	if (agt.indexOf("phoenix") != -1) return 'Phoenix'; 
// 	if (agt.indexOf("firefox") != -1) return 'Firefox'; 
// 	if (agt.indexOf("safari") != -1) return 'Safari'; 
// 	if (agt.indexOf("skipstone") != -1) return 'SkipStone'; 
// 	if (agt.indexOf("netscape") != -1) return 'Netscape'; 
// 	if (agt.indexOf("mozilla/5.0") != -1) return 'Mozilla'; 
// 	if (agt.indexOf("msie") != -1) { 
//     	let rv = -1; 
// 		if (navigator.appName == 'Microsoft Internet Explorer') { 
// 			let ua = navigator.userAgent; var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})"); 
// 		if (re.exec(ua) != null) 
// 			rv = parseFloat(RegExp.$1); 
// 		} 
// 		return 'Internet Explorer '+rv; 
// 	} 
// }

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


//
// Handler
//

function enter(country) {
  var country = countryList.find(function(c) {
    return parseInt(c.id, 10) === parseInt(country.id, 10)
  })
  current.text(country && country.name || '')
}

function leave(country) {
  current.text('')
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

function dragstarted() {
  v0 = versor.cartesian(projection.invert(d3.pointer(this)))
  r0 = projection.rotate()
  q0 = versor(r0)
  stopRotation()
}

function dragged() {
  var v1 = versor.cartesian(projection.rotate(r0).invert(d3.pointer(this)))
  var q1 = versor.multiply(q0, versor.delta(v0, v1))
  var r1 = versor.rotation(q1)
  projection.rotate(r1)
  render()
}

function dragended() {
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
    rotation = projection.rotate()
    rotation[0] += diff * degPerMs
    projection.rotate(rotation)
    render()
  }
  lastTime = now
}

function loadData(cb) {
  d3.json('https://unpkg.com/world-atlas@1/world/110m.json', function(error, world) {
    if (error) throw error
    d3.tsv('https://gist.githubusercontent.com/mbostock/4090846/raw/07e73f3c2d21558489604a0bc434b3a5cf41a867/world-country-names.tsv', function(error, countries) {
      if (error) throw error
      cb(world, countries)
    })
  })
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

function mousemove() {
  var c = getCountry(this)
  if (!c) {
    if (currentCountry) {
      leave(currentCountry)
      currentCountry = undefined
      render()
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
  var pos = projection.invert(d3.pointer(event))
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

setAngles()

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