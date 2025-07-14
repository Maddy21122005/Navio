const board = document.querySelector('.board');
let cells;
var matrix =[];
let row;
let col;

function renderboard(cellWidth = 22) {
    row = Math.floor(board.clientHeight / cellWidth);
    col = Math.floor(board.clientWidth / cellWidth);
    console.log(row, col);
    cells = [];

    for (let i = 0; i < row; i++) {
        const rowArr=[];
        const rowElement = document.createElement('div');
        rowElement.classList.add('row');
        rowElement.setAttribute('id', `${i}`);

        for (let j = 0; j < col; j++) {
            const colElement = document.createElement('div');
            colElement.classList.add('col');
            colElement.setAttribute('id', `${i}-${j}`);
            cells.push(colElement);
            rowArr.push(colElement);
            rowElement.appendChild(colElement);
        }
        matrix.push(rowArr);

        board.appendChild(rowElement);
    }
}
// console.log(matrix);

renderboard();


// ======== Dropdown Logic ========
const navOptions = document.querySelectorAll('.nav-menu > li');
const dropMenus = document.querySelectorAll('.drop-menu');
const VisualizeBtn = document.getElementById('visualize');

// Remove all active classes
function removeActive(elements) {
    elements.forEach(el => el.classList.remove('active'));
}

// For nav items (Speed, Algorithm)
navOptions.forEach(navOption => {
    navOption.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent bubbling to document

        const isActive = navOption.classList.contains('active');
        removeActive(navOptions); // Close all others

        if (!isActive) {
            navOption.classList.add('active');

            // If dropdown (like Speed or Algorithm), print its text
            const mainText = navOption.querySelector('a').innerText.trim();
            console.log(mainText);  // ✅ Only "Speed" or "Algorithm"
        }
    });
});

let speed='normal';
let Algorithm='BFS';

// For dropdown items (Fast, DFS, etc.)
dropMenus.forEach(menu => {
    const items = menu.querySelectorAll('li');

    items.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();

            removeActive(items);
            item.classList.add('active');

            const text = item.innerText.trim();
            console.log(text); // ✅ Only clicked item, like "Fast"

            const parentBox = menu.closest('.drop-box');
            if (parentBox.innerText.includes("Speed")) {
                speed = item.innerText.trim().toLowerCase();
                console.log("Speed selected:", speed);
            }
            if (parentBox.innerText.includes("Algorithm")) {
                Algorithm = item.innerText.trim();
                console.log("Algorithm selected:", Algorithm);
                VisualizeBtn.innerText = `Visualize ${Algorithm}`;
            }


            removeActive(navOptions);
        });
    });
});

// Close dropdown on clicking outside
document.addEventListener('click', (e) => {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu.contains(e.target)) {
        removeActive(navOptions);
    }
});




//board interaction
function isValid(x,y){
    return (x>=0&&y>=0&&x<row&&y<col);
}

function set(className,x=-1,y=-1){
     if (!isValid(x, y)) {
        x = Math.floor(Math.random() * row);
        y = Math.floor(Math.random() * col);
    }

    const cell = matrix[x][y];

    // Avoid setting source/target on wall
    if (cell.classList.contains('wall')) {
        return set(className); // Retry
    }

    cell.classList.add(className);
    return { x, y };
    
}

let source_cordinate=set('source');
let target_cordinate;


do {
    target_cordinate = set('target');
} while (
    source_cordinate.x === target_cordinate.x &&
    source_cordinate.y === target_cordinate.y ||
    matrix[target_cordinate.x][target_cordinate.y].classList.contains('source') ||
    matrix[target_cordinate.x][target_cordinate.y].classList.contains('wall')
);

 let isDrawing=false;
let isDragging=false;
let DragPoint=null;
cells.forEach((cell)=>{
   
    const pointerdown =(e)=>{
        if(e.target.classList.contains('source')){
            isDragging=true;
            DragPoint='source';
        }
        else if(e.target.classList.contains('target')){
            isDragging=true;
            DragPoint='target';
            
        }
        else {
            isDrawing=true;
        }
    }
    const pointermove =(e)=>{
        // console.log(e.target);
        if(isDrawing){
            e.target.classList.add('wall');
        }

        else if(DragPoint && isDragging){
            // it will move source and target
            cells.forEach(cell => {
                cell.classList.remove(`${DragPoint}`);
            });
            e.target.classList.add(`${DragPoint}`)
            // console.log(`${DragPoint}`);
            // console.log(e.target.id.split('-'));
            let cordinate=e.target.id.split('-');

            if(DragPoint==='source'){
                source_cordinate.x=+cordinate[0];
                source_cordinate.y=+cordinate[1];
            }

            if(DragPoint==='target'){
                target_cordinate.x=+cordinate[0];
                target_cordinate.y=+cordinate[1];
            }


            console.log(source_cordinate);
            console.log(target_cordinate);

        }
    }
    const pointerup =()=>{
        isDragging=false;
        isDrawing=false;
        DragPoint=null;
    }
    //pointer islie kyuki agar pc mein hoga to uske liye mousemove,phone ke liye touchevent so alag alag na lagana pade islie
    cell.addEventListener('pointerdown',pointerdown);
    cell.addEventListener('pointermove',pointermove);
    cell.addEventListener('pointerup',pointerup);
    cell.addEventListener('click',()=>{
        cell.classList.toggle('wall');
    })
})

const clearPathbtn=document.getElementById('ClearPathbtn');
const clearBoardbtn=document.getElementById('ClearBoardbtn');




const clearPath=()=>{
    cells.forEach(cell=>{
        cell.classList.remove('visited');
        cell.classList.remove('path');
        
    })
}

const clearBoard=()=>{
    cells.forEach(cell=>{
        cell.classList.remove('visited');
        cell.classList.remove('wall');
        cell.classList.remove('maze-wall');
        cell.classList.remove('path');
    })
}

clearPathbtn.addEventListener('click',clearPath);

clearBoardbtn.addEventListener('click',clearBoard);





/// Maze genertion
// generateMaze(0,row-1,0,col-1,false,'horizontal');
var walltoanimate=[];
const GenerateMazebtn=document.getElementById('GenerateMazebtn');
GenerateMazebtn.addEventListener('click',()=>{
    walltoanimate=[];
    clearPath();
    generateMaze(1, row - 2, 1, col - 2, false, 'horizontal');
    animate(walltoanimate,'maze-wall');
});

function generateMaze(rowStart, rowEnd, colStart, colEnd, surroundingWall, orientation) {
    if (rowEnd < rowStart || colEnd < colStart) return;

    if (!surroundingWall) {
        for (let i = 0; i < col; i++) {
            if (!matrix[0][i].classList.contains('source') && !matrix[0][i].classList.contains('target'))
                walltoanimate.push(matrix[0][i]);
            if (!matrix[row - 1][i].classList.contains('source') && !matrix[row - 1][i].classList.contains('target'))
                walltoanimate.push(matrix[row - 1][i]);
        }

        for (let i = 0; i < row; i++) {
            if (!matrix[i][0].classList.contains('source') && !matrix[i][0].classList.contains('target'))
                walltoanimate.push(matrix[i][0]);
            if (!matrix[i][col - 1].classList.contains('source') && !matrix[i][col - 1].classList.contains('target'))
                walltoanimate.push(matrix[i][col - 1]);
        }

        surroundingWall = true;
    }

    if (orientation === 'horizontal') {
        if (rowEnd - rowStart < 2) return;

        let possibleRows = [];
        for (let i = rowStart + 1; i < rowEnd; i += 2) {
            possibleRows.push(i);
        }

        let possibleCols = [];
        for (let i = colStart; i <= colEnd; i += 2) {
            possibleCols.push(i);
        }

        const currentRow = possibleRows[Math.floor(Math.random() * possibleRows.length)];
        const hole = possibleCols[Math.floor(Math.random() * possibleCols.length)];

        for (let i = colStart; i <= colEnd; i++) {
            if (i === hole) continue;
            if (!matrix[currentRow][i].classList.contains('source') && !matrix[currentRow][i].classList.contains('target'))
                walltoanimate.push(matrix[currentRow][i])
        }

        generateMaze(rowStart, currentRow - 1, colStart, colEnd, true, 'vertical');
        generateMaze(currentRow + 1, rowEnd, colStart, colEnd, true, 'vertical');
    } else {
        if (colEnd - colStart < 2) return;

        let possibleCols = [];
        for (let i = colStart + 1; i < colEnd; i += 2) {
            possibleCols.push(i);
        }

        let possibleRows = [];
        for (let i = rowStart; i <= rowEnd; i += 2) {
            possibleRows.push(i);
        }

        const currentCol = possibleCols[Math.floor(Math.random() * possibleCols.length)];
        const hole = possibleRows[Math.floor(Math.random() * possibleRows.length)];

        for (let i = rowStart; i <= rowEnd; i++) {
            if (i === hole) continue;
            if (!matrix[i][currentCol].classList.contains('source') && !matrix[i][currentCol].classList.contains('target'))
                walltoanimate.push(matrix[i][currentCol]);
        }

        generateMaze(rowStart, rowEnd, colStart, currentCol - 1, true, 'horizontal');
        generateMaze(rowStart, rowEnd, currentCol + 1, colEnd, true, 'horizontal');
    }
}

// PathFinding
//Bfs

var Visitedcell=[];
VisualizeBtn.addEventListener('click',()=>{
    clearPath();
    Visitedcell=[];
    pathtoanimate=[];
    switch (Algorithm){
        case  'BFS':
        BFS();
        break;
        case  'DFS':
        DFS(source_cordinate);
        break;
        case  'Dijkstra':
        Dijsktra();
        break;
    }
    // BFS();
    // Dijsktra();
    // DFS(source_cordinate);
    animate(Visitedcell,'visited');
});
function BFS(){
    const queue=[];
    const visited=new Set();
    const parent=new Map();

    // x={x:10,y:20};
    // y={x:10,y:20};
    // this is false
    // console.log(x==y);
    //you cannt add cordinate to a set ,bcz it can give error;
    // queue.push(source_cordinate);
    // visited.add(source_cordinate);

    queue.push(source_cordinate);
    visited.add(`${source_cordinate.x}-${source_cordinate.y}`);


    while(queue.length>0){
        const current=queue.shift();
        Visitedcell.push(matrix[current.x][current.y]);


        //target found
        if(current.x===target_cordinate.x&&current.y===target_cordinate.y){
            getPath(parent,target_cordinate);
            return ;
        }

        const neighbours =[
            {x: current.x , y: current.y+1},//top
            {x: current.x+1 , y: current.y},//right
            {x: current.x , y: current.y-1},//down
            {x: current.x-1 , y: current.y}//left
        ];


        for(const neighbour of neighbours){
            const key=`${neighbour.x}-${neighbour.y}`;
            if(isValid(neighbour.x,neighbour.y)&&!visited.has(key)&&!matrix[neighbour.x][neighbour.y].classList.contains('wall')&&!matrix[neighbour.x][neighbour.y].classList.contains('maze-wall')){
                queue.push(neighbour);
                visited.add(key);
                parent.set(key,current);
            }
        }
    }
};

function getPath(parent,target){
    if(!target)return // reached source ,source ka koi parent nhi hai;
    pathtoanimate.push(matrix[target.x][target.y]);

    const p=parent.get(`${target.x}-${target.y}`);
    getPath(parent,p);
}

function animate(elements,className){
    let delay=10;
    switch(speed){
        case 'slow':
        delay=20;
        break;

        case 'normal':
        delay=10;
        break;

        case 'fast':
        delay=5;
        break;
            
    }
    if(className==='path')delay*=3.5;
    // if(className==='maze-wall')delay=5;
    for(let i=0;i<elements.length;i++){
        setTimeout(() => {
            elements[i].classList.remove('visited');
            elements[i].classList.add(className);
            if(i===elements.length-1&&className==='visited'){
                // console.log("Serach Finished");
                animate(pathtoanimate,'path');
            }
        },delay*i);
    }
}


//Dijsktra's Algorithm

class PriorityQueue{
    constructor(){
        this.elements=[];
        this.length=0;
        }

        push(data){
            this.elements.push(data);
            this.length++;
            this.upHeapify(this.length-1);
        }

        pop(data){
            this.swap(0,this.length-1);
            const popped=this.elements.pop();
            this.length--;
            // this.upHeapify
            this.downHeapify(0);
            return popped;
        }

        upHeapify(i){
            if(i==0)return ;
            const parent=Math.floor((i-1)/2);
            if(this.elements[i].cost<this.elements[parent].cost){
                this.swap(parent,i);
                this.upHeapify(parent);
            }
        }


        downHeapify(i){
            let minNode=i;
            const leftChild=(2*i)+1;
            const rightChild=(2*i)+2;

            if(leftChild<this.length&&this.elements[leftChild].cost<this.elements[minNode].cost){
                minNode=leftChild;
            }

            if(rightChild<this.length&&this.elements[rightChild].cost<this.elements[minNode].cost){
                minNode=rightChild;
            }


            if( minNode!== i){
                this.swap(minNode,i);
                this.downHeapify(minNode);
            }



        }

        isEmpty(){
            return this.length===0;
        }


        swap(x,y){
            [this.elements[x],this.elements[y]] = [this.elements[y],this.elements[x]]; 
        }
    
}

// const pq=new PriorityQueue();
// pq.push({cost:2});
// pq.push({cost:1});
// pq.push({cost:0});

// console.log(pq.pop());
// console.log(pq.pop());
// console.log(pq.pop());

function Dijsktra(){
    const pq=new PriorityQueue();
    const parent=new Map();
    const distance=[];

    for(let i=0;i<row;i++){
        const INF=[];

        for(let j=0;j<col;j++){
            INF.push(Infinity);
        }
        distance.push(INF);
    }



    distance[source_cordinate.x][source_cordinate.y]=0;
    pq.push({cordinate: source_cordinate, cost: 0});
    


    while(!pq.isEmpty()){
        const {cordinate: current, cost: distanceSoFar}=pq.pop();
        Visitedcell.push(matrix[current.x][current.y]);


        //target found
        if(current.x===target_cordinate.x&&current.y===target_cordinate.y){
            getPath(parent,target_cordinate);
            return ;
        }

        const neighbours =[
            {x: current.x , y: current.y+1},//top
            {x: current.x+1 , y: current.y},//right
            {x: current.x , y: current.y-1},//down
            {x: current.x-1 , y: current.y}//left
        ];


        for(const neighbour of neighbours){
            const key=`${neighbour.x}-${neighbour.y}`;
            if(isValid(neighbour.x,neighbour.y)&&!matrix[neighbour.x][neighbour.y].classList.contains('wall')&&!matrix[neighbour.x][neighbour.y].classList.contains('maze-wall')){
                const distanceToNeighbour=distanceSoFar+1;
                if(distanceToNeighbour<distance[neighbour.x][neighbour.y]){
                    distance[neighbour.x][neighbour.y]=distanceToNeighbour
                    pq.push({cordinate: neighbour, cost: distanceToNeighbour});
                    parent.set(key,current);
                }
                
            }
        }
    }
};

// const visited = new Set();
// function DFS(current){
//     if(current.x===target_cordinate.x&&current.y==target_cordinate.y)return true;

//     Visitedcell.push(matrix[current.x][current.y]);
//     // visited.add(matrix[current.x][current.y]);
//     visited.add(`${current.x}-${current.y}`);
//     const neighbours =[
//             {x: current.x , y: current.y+1},//top
//             {x: current.x+1 , y: current.y},//right
//             {x: current.x , y: current.y-1},//down
//             {x: current.x-1 , y: current.y}//left
//     ];

//     for(const neighbour of neighbours){
//         if(isValid(neighbour.x,neighbour.y)&&!visited.has(`${neighbour.x}-${neighbour.y}`)&&!matrix[neighbour.x][neighbour.y].classList.contains('wall')&&!matrix[neighbour.x][neighbour.y].classList.contains('maze-wall')){
//             if(DFS(neighbour)){
//                 pathtoanimate.push(matrix[neighbour.x][neighbour.y]);
//                 return true;
//             }
        
//         }
//     }


// }

function DFS(start) {
    Visitedcell = [];
    pathtoanimate = [];
    const visited = new Set(); // Now it resets every time

    function dfsHelper(current) {
        if (current.x === target_cordinate.x && current.y === target_cordinate.y) {
            pathtoanimate.push(matrix[current.x][current.y]);
            return true;
        }

        Visitedcell.push(matrix[current.x][current.y]);
        visited.add(`${current.x}-${current.y}`);

        const neighbours = [
            { x: current.x, y: current.y + 1 },
            { x: current.x + 1, y: current.y },
            { x: current.x, y: current.y - 1 },
            { x: current.x - 1, y: current.y }
        ];

        for (const neighbour of neighbours) {
            if (isValid(neighbour.x, neighbour.y) &&
                !visited.has(`${neighbour.x}-${neighbour.y}`) &&
                !matrix[neighbour.x][neighbour.y].classList.contains('wall') &&
                !matrix[neighbour.x][neighbour.y].classList.contains('maze-wall')) {
                
                if (dfsHelper(neighbour)) {
                    pathtoanimate.push(matrix[neighbour.x][neighbour.y]);
                    return true;
                }
            }
        }

        return false;
    }

    dfsHelper(start);
}






