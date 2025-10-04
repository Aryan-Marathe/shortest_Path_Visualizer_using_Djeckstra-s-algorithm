const rows = 20;
const cols = 20;
const grid = document.getElementById('grid');

let gridArray = [];
let startNode = null;
let endNode = null;
let selectionMode = 'start';

function createGrid() {
  gridArray = [];
  grid.innerHTML = '';
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const node = document.createElement('div');
      node.className = 'node';
      node.id = `node-${r}-${c}`;
      grid.appendChild(node);
      row.push({
        element: node,
        row: r,
        col: c,
        distance: Infinity,
        previous: null,
        visited: false,
        wall: false
      });
    }
    gridArray.push(row);
  }
}

function getNode(r, c) {
  if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
  return gridArray[r][c];
}


function addWallListeners() {
  grid.addEventListener('click', e => {
    if (!e.target.classList.contains('node')) return;
    const [_, r, c] = e.target.id.split('-').map(Number);
    const node = getNode(r, c);

    
    if (selectionMode === 'start') {
      if (startNode) getNode(startNode.row, startNode.col).element.classList.remove('start');
      startNode = { row: r, col: c };
      node.element.classList.add('start');
      selectionMode = 'end';
      return;
    }
    if (selectionMode === 'end') {
      if (endNode) getNode(endNode.row, endNode.col).element.classList.remove('end');
      
      if (startNode && startNode.row === r && startNode.col === c) return;
      endNode = { row: r, col: c };
      node.element.classList.add('end');
      selectionMode = null;
      return;
    }
    
    if (startNode && startNode.row === r && startNode.col === c) return;
    if (endNode && endNode.row === r && endNode.col === c) return;
    node.wall = !node.wall;
    node.element.classList.toggle('wall');
  });
}


async function dijkstra() {
  
  if (!startNode || !endNode) {
    alert('Select start and end points first!');
    return;
  }
  let unvisited = [];
  gridArray.forEach(row => {
    row.forEach(node => {
      node.distance = Infinity;
      node.previous = null;
      node.visited = false;
      node.element.classList.remove('visited', 'path');
    });
  });
  getNode(startNode.row, startNode.col).element.classList.add('start');
  getNode(endNode.row, endNode.col).element.classList.add('end');
  const start = getNode(startNode.row, startNode.col);
  start.distance = 0;
  unvisited.push(start);

  while (unvisited.length > 0) {
    unvisited.sort((a,b) => a.distance - b.distance);
    const current = unvisited.shift();
    if (current.visited || current.wall) continue;
    current.visited = true;
    current.element.classList.add('visited');

    if (current === getNode(endNode.row, endNode.col)) {
      await reconstructPath(current);
      return;
    }
    const neighbors = [
      getNode(current.row - 1, current.col),
      getNode(current.row + 1, current.col),
      getNode(current.row, current.col - 1),
      getNode(current.row, current.col + 1)
    ];
    for (const neighbor of neighbors) {
      if (!neighbor || neighbor.visited || neighbor.wall) continue;
      const alt = current.distance + 1;
      if (alt < neighbor.distance) {
        neighbor.distance = alt;
        neighbor.previous = current;
        unvisited.push(neighbor);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  alert('No path found!');
}

async function reconstructPath(node) {
  let current = node;
  while (current.previous && current !== getNode(startNode.row, startNode.col)) {
    current.element.classList.remove('visited');
    current.element.classList.add('path');
    current = current.previous;
    await new Promise(resolve => setTimeout(resolve, 40));
  }
}

createGrid();
addWallListeners();

const startBtn = document.getElementById('startBtn');
startBtn.addEventListener('click', () => {
  dijkstra();
});


document.body.insertAdjacentHTML('afterbegin', `
  <div style='padding:10px 0;color:#555'>
    <b>Instructions:</b><br>
    1. Click on a cell to set the <span style='color:#0984e3;'>Start</span> node (blue).<br>
    2. Click another cell to set the <span style='color:#d63031;'>End</span> node (red).<br>
    3. Click additional cells to add/remove walls (black).<br>
    4. Press <i>Start Dijkstra</i> to visualize the path.<br>
    To reset start/end, reload this page.
  </div>
`);
