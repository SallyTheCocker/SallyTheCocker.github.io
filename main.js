import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

const AXES_LENGTH = 1.5;
const PI = 3.14159265359

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 50);
camera.layers.enableAll();
renderer.setSize(window.innerWidth * 0.75, window.innerHeight * 0.75);
scene.background = new THREE.Color(0xfff0ff);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth * 0.75, window.innerHeight * 0.75);
labelRenderer.domElement.style.position = 'absolute';

const controls = new OrbitControls(camera, labelRenderer.domElement);
camera.position.set(1, 2, 3);
controls.update();


document.getElementById("displaychild").appendChild(renderer.domElement);
document.getElementById("displaychild").appendChild(labelRenderer.domElement);

renderer.domElement.style.cssFloat = 'right'

function animate() {
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('click', onPointerClick);


function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth * 0.75, window.innerHeight * 0.75);
  labelRenderer.setSize(window.innerWidth * 0.75, window.innerHeight * 0.75);
}

var cubeArray = createCubeArray(createCubeFrame);
cubeArray.flat().flat().forEach((e) => scene.add(e));

var axes = createAxes()
axes.forEach((e) => scene.add(e))

var axesDivs = createAxesLabels()
var axesLabels = addAxesLabels()

const axesOptions = createAxesOptions(axesLabels)

var piCharts = createPieCharts()
piCharts.flat().flat().flat().forEach((e) => scene.add(e));

const checkbox = document.getElementById('showPieChartCheckbox')
checkbox.addEventListener('change', (event) => {
  if (event.currentTarget.checked) {
    piCharts.flat().flat().flat().forEach((e) => scene.add(e));
  } else {
    piCharts.flat().flat().flat().forEach((e) => scene.remove(e));
  }
})

function onPointerClick(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  console.log("Pointer coordinates:", pointer.x, pointer.y);

  raycaster.setFromCamera(pointer, camera);

  const allPieCharts = piCharts.flat(3); 

  const intersects = raycaster.intersectObjects(allPieCharts, true);

  if (intersects.length > 0) {
    const firstObject = intersects[0].object;

    if (firstObject.userData?.pieChartData) {
      const { value, position } = firstObject.userData.pieChartData;
      
      const modal = document.getElementById('pieChartModal');
      const infoDiv = document.getElementById('pieChartInfo');
      
      infoDiv.innerHTML = `
        <p><strong>Value:</strong> ${value}%</p>
        <p><strong>Position:</strong> X: ${position[3]}, Y: ${position[4]}, Z: ${position[5]}</p>
        <p><strong>Color:</strong> ${firstObject === firstObject.parent.children[0] ? 'Green (Positive)' : 'Red (Negative)'}</p>
      `;
      
      modal.style.display = 'block';
    }
  }
}


function createCubeArray(func) {
  const wide = .382;
  const thin = .236;
  const dis = .309;
  var arrx0 = [
    [func([wide, wide, wide], [-dis, -dis, -dis]), func([wide, wide, thin], [-dis, -dis, 0]), func([wide, wide, wide], [-dis, -dis, dis])],
    [func([wide, thin, wide], [-dis, 0, -dis]), func([wide, thin, thin], [-dis, 0, 0]), func([wide, thin, wide], [-dis, 0, dis])],
    [func([wide, wide, wide], [-dis, dis, -dis]), func([wide, wide, thin], [-dis, dis, 0]), func([wide, wide, wide], [-dis, dis, dis])]
  ]
  var arrx1 = [
    [func([thin, wide, wide], [0, -dis, -dis]), func([thin, wide, thin], [0, -dis, 0]), func([thin, wide, wide], [0, -dis, dis])],
    [func([thin, thin, wide], [0, 0, -dis]), func([thin, thin, thin], [0, 0, 0]), func([thin, thin, wide], [0, 0, dis])],
    [func([thin, wide, wide], [0, dis, -dis]), func([thin, wide, thin], [0, dis, 0]), func([thin, wide, wide], [0, dis, dis])]
  ]
  var arrx2 = [
    [func([wide, wide, wide], [dis, -dis, -dis]), func([wide, wide, thin], [dis, -dis, 0]), func([wide, wide, wide], [dis, -dis, dis])],
    [func([wide, thin, wide], [dis, 0, -dis]), func([wide, thin, thin], [dis, 0, 0]), func([wide, thin, wide], [dis, 0, dis])],
    [func([wide, wide, wide], [dis, dis, -dis]), func([wide, wide, thin], [dis, dis, 0]), func([wide, wide, wide], [dis, dis, dis])]
  ]

  return [arrx0, arrx1, arrx2];
}

function createCubeFrame(lengths, position) {
  const geometry = new THREE.BoxGeometry(lengths[0], lengths[1], lengths[2]);
  var geo = new THREE.EdgesGeometry(geometry);
  var mat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 10 });
  var wireframe = new THREE.LineSegments(geo, mat);
  wireframe.position.set(position[0], position[1], position[2])
  return wireframe;
}

function createPieCharts() {
  const shortVertDis = .118;
  const longVertDis = .191;
  const dis = .309;
  var arrx0 = [
    [createPieChartPair(100, [-dis, -dis - longVertDis, -dis, "x0", "y0", "x0"]), createPieChartPair(83.4, [-dis, -dis - longVertDis, 0, "x0", "y0", "z1"]), createPieChartPair(66.7, [-dis, -dis - longVertDis, dis, "x0", "y0" ,"z2"])],
    [createPieChartPair(83.4, [-dis, 0 - shortVertDis, -dis, "x0", "y1", "x0"]), createPieChartPair(66.7, [-dis, 0 - shortVertDis, 0, "x0" ,"y1" , "z1"]), createPieChartPair(50, [-dis, 0 - shortVertDis, dis, "x0", "y1", "z2"])],
    [createPieChartPair(66.7, [-dis, dis - longVertDis, -dis, "x0", "y2", "x0"]), createPieChartPair(50, [-dis, dis - longVertDis, 0, "x0" ,"y2", "z1"]), createPieChartPair(33.3, [-dis, dis - longVertDis, dis, "x0" ,"y2" , "z2"])]
  ]
  var arrx1 = [
    [createPieChartPair(83.4, [0, -dis - longVertDis, -dis, "x1", "y0" ,"x0"]), createPieChartPair(66.7, [0, -dis - longVertDis, 0,"x1" ,"y0", "z1"]), createPieChartPair(50, [0, -dis - longVertDis, dis, "x1","y0","z2"])],
    [createPieChartPair(66.7, [0, 0 - shortVertDis, -dis, "x1", "y1", "x0"]), createPieChartPair(50, [0, 0 - shortVertDis, 0,"x1","y1","z1"]), createPieChartPair(33.3, [0, 0 - shortVertDis, dis,"x1","y1","z2"])],
    [createPieChartPair(50, [0, dis - longVertDis, -dis, "x1", "y2", "x0"]), createPieChartPair(33.3, [0, dis - longVertDis, 0,"x1","y2","z1"]), createPieChartPair(16.7, [0, dis - longVertDis, dis,"x1","y2","z2"])]
  ]
  var arrx2 = [
    [createPieChartPair(66.7, [dis, -dis - longVertDis, -dis,"x2","y0","x0"]), createPieChartPair(50, [dis, -dis - longVertDis, 0,"x2","y0","z1"]), createPieChartPair(33.3, [dis, -dis - longVertDis, dis,"x2","y0","z2"])],
    [createPieChartPair(50, [dis, 0 - shortVertDis, -dis,"x2","y1","x0"]), createPieChartPair(33.3, [dis, 0 - shortVertDis, 0,"x2","y1","z1"]), createPieChartPair(16.7, [dis, 0 - shortVertDis, dis,"x2","y1","z2"])],
    [createPieChartPair(33.3, [dis, dis - longVertDis, -dis,"x2","y2","x0"]), createPieChartPair(16.7, [dis, dis - longVertDis, 0,"x2","y2","z1"]), createPieChartPair(0, [dis, dis - longVertDis, dis,"x2","y2","z2"])]
  ]

  return [arrx0, arrx1, arrx2]
}

function createPieChartPair(greenSize, position) {
  const greenRad = greenSize * 0.01 * 2 * PI
  const posgeometry = new THREE.CircleGeometry(0.075, 128, 0.5 * PI, greenRad);
  const posmaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
  const poscircle = new THREE.Mesh(posgeometry, posmaterial);
  poscircle.rotateX(-0.5 * PI)

  const neggeometry = new THREE.CircleGeometry(0.075, 128, greenRad + 0.5 * PI, 2 * PI - greenRad);
  const negmaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
  const negcircle = new THREE.Mesh(neggeometry, negmaterial);
  negcircle.rotateX(-0.5 * PI)

  poscircle.position.set(position[0], position[1], position[2])
  negcircle.position.set(position[0], position[1], position[2])

  poscircle.userData.pieChartData = { value: greenSize, position: [...position] };
  negcircle.userData.pieChartData = { value: 100 - greenSize, position: [...position] };

  return [poscircle, negcircle]
}


function createAxes() {
  return [makeLine([-.5, -.5, -.5], [AXES_LENGTH, -.5, -.5], 0xff8000),
  makeLine([-.5, -.5, -.5], [-.5, AXES_LENGTH, -.5], 0x990099),
  makeLine([-.5, -.5, -.5], [-.5, -.5, AXES_LENGTH], 0x4296f5)]
}

function makeLine(from, to, color) {
  const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(from[0], from[1], from[2]), new THREE.Vector3(to[0], to[1], to[2])]);
  const material = new THREE.LineBasicMaterial({ color: color, linewidth: 2 });
  return new THREE.Line(geometry, material);
}

function createAxesLabels() {
  return [createDiv("xAxis", "DO THINGS (What we do)"), createDiv("yAxis", "THINGS (Who we are)"), createDiv("zAxis", "SOMEWHERE (Where we are)")]
}

function createDiv(id, text) {
  const div = document.createElement('p');
  div.id = id;
  div.textContent = text;
  return div;
}

function addAxesLabels() {
  var arr = new Array();
  arr.push(addCss2dObject(new CSS2DObject(axesDivs[0]), [AXES_LENGTH, -.5, -.5], scene))
  arr.push(addCss2dObject(new CSS2DObject(axesDivs[1]), [-.5, AXES_LENGTH + .25, -.5], scene))
  arr.push(addCss2dObject(new CSS2DObject(axesDivs[2]), [-.5, -.5, AXES_LENGTH], scene))
  return arr;
}

function addCss2dObject(label, position, to) {
  label.position.set(position[0], position[1], position[2])
  label.center.set(0, 1)
  to.add(label)
  return label
}

function createAxesOptions(axesLabels) {
  var xOptions = document.getElementById("xOptions")
  var yOptions = document.getElementById("yOptions")
  var zOptions = document.getElementById("zOptions")

  xOptions.remove()
  yOptions.remove()
  zOptions.remove()

  xOptions.hidden = false
  yOptions.hidden = false
  zOptions.hidden = false

  var xoptionsobject = new CSS2DObject(xOptions)
  xoptionsobject.center.set(0, -1)
  axesLabels[0].add(xoptionsobject)

  var yoptionsobject = new CSS2DObject(yOptions)
  yoptionsobject.center.set(0, -1)
  axesLabels[1].add(yoptionsobject)

  var zoptionsobject = new CSS2DObject(zOptions)
  zoptionsobject.center.set(0, -1)
  axesLabels[2].add(zoptionsobject)

  yOptions.onchange = function () {
    if (yOptions.value == "systemOption") {
      xOptions.value = "subsystemsOption"
      zOptions.value = "supersystemOption"
    } else if (yOptions.value == "organisationOption") {
      xOptions.value = "productOptions"
      zOptions.value = "marketOption"
    } else if (yOptions.value == "leadershipStyleOption") {
      xOptions.value = "tasksOption"
      zOptions.value = "resourceOption"
    }
    labelRenderer.domElement.click()
  }
} 