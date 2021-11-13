'use strict';
var row=0;
var blocks=0;
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    moveDown() {
        return new Point(this.x, this.y + 1);
    }

    moveUp() {
        return new Point(this.x, this.y - 1);
    }

    moveLeft() {
        return new Point(this.x - 1, this.y);
    }

    moveRight() {
        return new Point(this.x + 1, this.y);
    }
}

const availableColors = ['red','blue','yellow'];


//Klasa odpowiadająca za tworzenie jednego bloku
class Block {
    constructor(point, color, id = 0) {
        if (availableColors.includes(color)) {
            this.color = color;
        } else {
            throw new Error('Unavailable color.');
        }
        this.point = point;
        this.id = id;
    }

    get x() {
        return this.point.x;
    }

    get y() {
        return this.point.y;
    }

    moveDown() {
        this.point = this.point.moveDown();
    }

    moveUp() {
        this.point = this.point.moveUp();
    }


    moveLeft() {
        this.point = this.point.moveLeft();
    }

    moveRight() {
        this.point = this.point.moveRight();
    }
}

class BlockGroup {
    constructor(firstBlock, secondBlock, id = 0) {
        this.firstBlock = firstBlock;
        this.secondBlock = secondBlock;
        this.firstBlock.id = id;
        this.secondBlock.id = id;
    }

    rotateLeft() {
        if (this.firstBlock.y === this.secondBlock.y) {
            const rightBlock = this.rightBlock;
            rightBlock.moveUp();
            rightBlock.moveLeft();
        } else {
            const topBlock = this.topBlock;
            const bottomBlock = this.bottomBlock;
            topBlock.moveDown();
            bottomBlock.moveRight();
        }
    }

    rotateRight() {
        if (this.firstBlock.y === this.secondBlock.y) {
            const leftBlock = this.leftBlock;
            const rightBlock = this.rightBlock;
            leftBlock.moveUp();
            rightBlock.moveLeft();
        } else {
            const topBlock = this.topBlock;
            topBlock.moveRight();
            topBlock.moveDown();
        }
    }

    get leftBlock() {
        if (this.firstBlock.x < this.secondBlock.x) {
            return this.firstBlock;
        } else {
            return this.secondBlock;
        }
    }

    get rightBlock() {
        if (this.firstBlock.x > this.secondBlock.x) {
            return this.firstBlock;
        } else {
            return this.secondBlock;
        }
    }

    get rightBlocks() {
        if (this.firstBlock.x === this.secondBlock.x) {
            return [this.firstBlock, this.secondBlock];
        } else {
            return [this.rightBlock];
        }
    }
    get leftBlocks() {
        if (this.firstBlock.x === this.secondBlock.x) {
            return [this.firstBlock, this.secondBlock];
        } else {
            return [this.leftBlock];
        }
    }

    isVertical() {
        return this.rightBlocks.length > 1;
    }

    get topBlock() {
        if (this.firstBlock.y < this.secondBlock.y) {
            return this.firstBlock;
        } else {
            return this.secondBlock;
        }
    }

    get bottomBlock() {
        if (this.firstBlock.y > this.secondBlock.y) {
            return this.firstBlock;
        } else {
            return this.secondBlock;
        }
    }

    moveDown() {
        this.firstBlock.moveDown();
        this.secondBlock.moveDown();
    }

    moveUp() {
        this.firstBlock.moveUp();
        this.secondBlock.moveUp();
    }

    moveLeft() {
        this.firstBlock.moveLeft();
        this.secondBlock.moveLeft();
    }

    moveRight() {
        this.firstBlock.moveRight();
        this.secondBlock.moveRight();
    }
}

class Board {
    constructor(selector, width, height) {
        this.blockGroups = [];
        this.blocks = [];
        this.selector = selector;
        this.width = width;
        this.height = height;
        this.addElementsToSelector();
        this.render();
    }

    addElementsToSelector() {
        const body = document.querySelector(this.selector);
        for (var i = 0; i < this.height; i++) {
            var row = document.createElement('DIV');
            row.classList.add('divTableRow');
            for (var j = 0; j < this.width; j++) {
                var cell = document.createElement('DIV');
                cell.setAttribute('data-y', i);
                cell.setAttribute('data-x', j);
                cell.setAttribute('id', j + '-' + i);
                cell.classList.add('divTableCell');
                row.appendChild(cell);
            }
            body.appendChild(row);
        }
    }

    render() {
        document.querySelectorAll(this.selector + ' .divTableCell').forEach(cell => {
            cell.textContent = '';
            availableColors.forEach(color => cell.classList.remove(color));
        })
        this.blockGroups.forEach(blockGroup => {
            document.getElementById(this.generateId(blockGroup.firstBlock)).classList.add(blockGroup.firstBlock.color);
            document.getElementById(this.generateId(blockGroup.secondBlock)).classList.add(blockGroup.secondBlock.color);
            // document.getElementById(this.generateId(blockGroup.firstBlock)).textContent = blockGroup.firstBlock.id;
            // document.getElementById(this.generateId(blockGroup.secondBlock)).textContent = blockGroup.secondBlock.id;
        });
        if (this.blocks.length > 0) {
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    const block = this.blocks[x][y];
                    if (block !== null) {
                        document.getElementById(this.generateId(block)).classList.add(block.color);
                        if (block.id > 0) {
                            // document.getElementById(this.generateId(block)).textContent = block.id;
                        }
                    }
                }
            }
        }
    }

    generateId(block) {
        return block.x + '-' + block.y;
    }

    addBlockGroup(blockGroup, blocks) {
        this.blockGroups = [];
        this.blockGroups.push(blockGroup);
        this.blocks = blocks;
    }

    removeBlockGroups() {
        this.blockGroups = [];
    }
}

class Game {

    constructor(board) {
        this.idCounter = 1;
        this.board = board;
        this.activeBlockGroup = null;
        this.currentInterval = null;
        this.intervalMillis = null;

        this.collisionData = new Array(board.width);
        for (let x = 0; x < this.collisionData.length; x++) {
            this.collisionData[x] = new Array(board.height);
        }
        for (let x = 0; x < board.width; x++) {
            for (let y = 0; y < board.height; y++) {
                this.collisionData[x][y] = null;
            }
        }

        this.blocks = new Array(board.width);
        for (let x = 0; x < this.blocks.length; x++) {
            this.blocks[x] = new Array(board.height);
        }
        for (let x = 0; x < board.width; x++) {
            for (let y = 0; y < board.height; y++) {
                this.blocks[x][y] = null;
            }
        }
        // this.generateViruses();
    }

    start() {
        this.addNewActiveBlockGroup();
        window.addEventListener('keydown', e => {
            if (e.code === 'ArrowLeft') {
                e.preventDefault();
                if (this.activeBlockGroup !== null && !this.hasLeftCollision()) {
                    this.activeBlockGroup.moveLeft();
                    this.board.render();
                }
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                if (this.activeBlockGroup !== null && !this.hasRightCollision()) {
                    this.activeBlockGroup.moveRight();
                    this.board.render();
                }
            } else if (e.code === 'ArrowUp') {
                e.preventDefault();
                if (this.activeBlockGroup !== null && !(this.hasRightCollision() && this.isVertical()) && !this.hasTopCollision()) {
                    this.activeBlockGroup.rotateLeft();
                    this.board.render();
                }
            } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                e.preventDefault();
                if (this.activeBlockGroup !== null && !(this.hasRightCollision() && this.isVertical()) && !this.hasTopCollision()) {
                    this.activeBlockGroup.rotateRight();
                    this.board.render();
                }
            } else if (e.code === 'ArrowDown') {
                e.preventDefault();
                if (this.activeBlockGroup !== null) {
                    this.reconfigureInterval(100);
                }
            }
        });
        window.addEventListener('keyup', e => {
            if (this.activeBlockGroup !== null && e.code === 'ArrowDown') {
                e.preventDefault();
                this.reconfigureInterval(1000);
            }
        });
        this.reconfigureInterval(1000);
    }

    generateViruses() {
        let virusCounter = 0;
        const minY = 5;
        while (virusCounter < 5) {
            const x = this.generateRandomNumberInRange(0, this.board.width - 1);
            const y = this.generateRandomNumberInRange(minY, this.board.height - 1);
            if (this.blocks[x][y] === null) {
                this.blocks[x][y] = new Block(new Point(x, y), this.getRandomColor());
                virusCounter++;
            }
        }
        this.refreshCollisionData();
    }

    hasRightCollision() {
        const rightBlocks = this.activeBlockGroup.rightBlocks;
        let hasCollision = false;
        rightBlocks.forEach(block => {
            if (block.x + 1 >= this.board.width) {
                hasCollision = true;
            } else if (this.collisionData[block.x + 1][block.y] !== null) {
                hasCollision = true;
            }
        });
        return hasCollision;
    }
    hasLeftCollision() {
        const leftBlocks = this.activeBlockGroup.leftBlocks;
        let hasCollision = false;
        leftBlocks.forEach(block => {
            if (block.x === 0) {
                hasCollision = true;
            } else if (this.collisionData[block.x - 1][block.y] !== null) {
                hasCollision = true;
            }
        })
        return hasCollision
    }
    hasTopCollision() {
        if (this.activeBlockGroup.secondBlock.y === 0 && !this.isVertical()) {
            return true;
        }
        return false;
    }

    isVertical() {
        return this.activeBlockGroup.isVertical();
    }

    reconfigureInterval(intervalMillis, force = false) {
        if (force || this.intervalMillis !== intervalMillis) {
            this.intervalMillis = intervalMillis;
            if (this.currentInterval !== null) {
                clearInterval(this.currentInterval);
            }
            this.currentInterval = setInterval(() => {
                if (this.checkCollision()) {
                    clearInterval(this.currentInterval);
                    this.addNewActiveBlockGroup();
                } else {
                    if (this.activeBlockGroup !== null) {
                        this.activeBlockGroup.moveDown();
                        this.board.render();
                    }
                }
            }, intervalMillis);
        }
    }

    refreshCollisionData() {
        for (let x = 0; x < this.board.width; x++) {
            for (let y = 0; y < this.board.height; y++) {
                this.collisionData[x][y] = null;
            }
        }
        for (let x = 0; x < this.blocks.length; x++) {
            for (let y = 0; y < this.blocks[x].length; y++) {
                if (this.blocks[x][y] !== null) {
                    this.collisionData[x][y] = this.blocks[x][y];
                }
            }
        }
    }

    addNewActiveBlockGroup() {
        if (this.activeBlockGroup !== null) {
            const { firstBlock, secondBlock } = this.activeBlockGroup;
            this.blocks[firstBlock.x][firstBlock.y] = firstBlock;
            this.blocks[secondBlock.x][secondBlock.y] = secondBlock;
            this.activeBlockGroup = null;
            this.board.removeBlockGroups();
            this.refreshCollisionData();
            this.removeColorLines();
        } else {
            this.startNewBlockGroup();
        }
    }

    startNewBlockGroup() {
        let oneColor=this.getRandomColor()
        this.activeBlockGroup = new BlockGroup(new Block(new Point(3, 0), oneColor), new Block(new Point(4, 0), oneColor), this.idCounter++);
        // console.log(this.activeBlockGroup.firstBlock);
        // console.log(this.activeBlockGroup.secondBlock)
        this.board.addBlockGroup(this.activeBlockGroup, this.blocks);
        this.board.render();
        this.reconfigureInterval(1000, true);
    }

    removeColorLines() {
        var condition=0
        const maxX = this.blocks.length - 1;
        const maxY = this.blocks[0].length - 1;
        const toRemove = [];
        const allRemoved = [];
        for (let x = 0; x < this.blocks.length; x++) {
            for (let y = 0; y < this.blocks[x].length; y++) {
                if (this.blocks[x][y] !== null) {
                    const horizontal = [[x, y]];
                    const vertical = [[x, y]];
                    const currentColor = this.blocks[x][y].color;
                    for (let lx = x + 1; lx <= maxX; lx++) {
                        if (this.blocks[lx][y] !== null) {
                            horizontal.push([lx, y]);
                        } else {
                            break;
                        }
                    }
                    for (let lx = x - 1; lx >= 0; lx--) {
                        if (this.blocks[lx][y] !== null) {
                            horizontal.unshift([lx, y]);
                        } else {
                            break;
                        }
                    }
                    for (let ly = y + 1; ly <= maxY; ly++) {
                        if (this.blocks[x][ly] !== null) {
                            vertical.push([x, ly]);
                        } else {
                            break;
                        }
                    }
                    for (let ly = y - 1; ly >= 0; ly--) {
                        if (this.blocks[x][ly] !== null) {
                            vertical.unshift([x, ly]);
                        } else {
                            break;
                        }
                    }
                    if (horizontal.length >= 8) {
                        toRemove.push(horizontal);
                    }
                    // if (vertical.length >= 8) {
                    //     toRemove.push(vertical);
                    // }
                   
                }
            }
        }
        console.log(toRemove)
        console.log("Jesteśmy przy zmiennej toRemove")
        var checkFirstPosition=document.querySelectorAll('[data-x="3"][data-y="0"]');
        var checkSecondPosition=document.querySelectorAll('[data-x="4"][data-y="0"]');
        console.log(checkFirstPosition)
        console.log(checkSecondPosition)
        // for(var h=0;h<checkFirstRow.length;h++){
            if(checkFirstPosition[0].classList.value.length>12 && checkSecondPosition[0].classList.value.length>12){
                var displayComunicate=document.getElementById('comunicateDiv')
                displayComunicate.innerHTML="Koniec gry"
                var scoreForm=document.querySelectorAll('[class="scoreFormHidden"]')
                console.log(scoreForm[0])
                scoreForm[0].classList.remove('scoreFormHidden')
                
            }

        // }
        // console.log(checkFirstRow)
        toRemove.forEach(line => {
            line.forEach(xy => {
                if (allRemoved.filter(block => block.x === xy[0] && block.y === xy[1]).length === 0) {
                    allRemoved.push(this.blocks[xy[0]][xy[1]]);
                }
            });
        });
        const removedData = [];
        for (let i = 0; i < this.board.width; i++) {
            removedData[i] = {
                minY: this.board.height,
                number: 0,
            }
        }
        allRemoved.forEach(block => {
            removedData[block.x].minY = Math.min(removedData[block.x].minY, block.y);
            removedData[block.x].number++;
        });
        const removedAtTheVeryTop = [];
        for (let x = 0; x < this.board.width; x++) {
            if (removedData[x].number > 0) {
                removedAtTheVeryTop.push([x, removedData[x].minY]);
            }
        }
        //ZAKOMENTOWAŁEM ZNIKANIE 4 BLOKÓW O TYM SAMYM KOLORZE
        toRemove.forEach(line => {
            line.forEach(xy => {
                this.blocks[xy[0]][xy[1]] = null;
                this.collisionData[xy[0]][xy[1]] = null;
                condition=1
                
            });
        });
        this.refreshCollisionData();
        this.board.render();
        if (this.findCanFallGroups().length > 0) {
            setTimeout(() => this.fallAllBlocks(), 500);
        } else {
            this.refreshCollisionData();
            this.startNewBlockGroup();
           
        }
        
        // var findAllElementsOfLastRow=document.querySelectorAll('[data-y="14"]');
        // for(var i=0;i<findAllElementsOfLastRow.length;i++ ){
        //     // console.log(findAllElementsOfLastRow[i].classList)
        //     //Zrobić pętle i sprawdzić czy elementy mają dwie klasy i wyświetlić komunikat o schownaiu lini
        //     if(findAllElementsOfLastRow[i].classList.value.length>12){
        //         findAllElementsOfLastRow[i].classList.add('toDelete')
        //         var allElementsToDelete= document.querySelectorAll('.toDelete')
        //         // console.log(allElementsToDelete.length)
        //         if(allElementsToDelete.length==8){
        //             for(var j=0;j<allElementsToDelete.length;j++){
        //                 console.log(allElementsToDelete[j])
                        
        //                 if(allElementsToDelete[j].classList.contains('red')==true){
        //                     allElementsToDelete[j].classList.remove('red')
        //                     allElementsToDelete[j].classList.remove('toDelete')
                            
        //                 }else if(allElementsToDelete[j].classList.contains('blue')==true){
        //                     allElementsToDelete[j].classList.remove('blue')
        //                     allElementsToDelete[j].classList.remove('toDelete')
                            
                            
        //                 }else if(allElementsToDelete[j].classList.contains('yellow')==true){
        //                     allElementsToDelete[j].classList.remove('yellow')
        //                     allElementsToDelete[j].classList.remove('toDelete')
                            
        //                 }

        //             }
        //         }
        //     }else{
        //         // console.log('Warunek nie jest spełniony')
        //     }
        // }
        if(condition==1){
            row+=1
            blocks+=8
            var getNumberOfRows=document.getElementById('beatedRows')
            getNumberOfRows.innerHTML='Zbite rzędy:'+row
            var getNumberOfBlock=document.getElementById('beatedBlocks')
            getNumberOfBlock.innerHTML='Zbite bloki:'+blocks
            console.log(getNumberOfRows)
            // console.log(row)
            // console.log(blocks)
        }

    }

    findCanFallGroups() {
        const canFallGroups = [];
        const fallData = new Array(this.board.width);
        for (let x = 0; x < fallData.length; x++) {
            fallData[x] = new Array(this.board.height);
        }
        for (let x = 0; x < this.board.width; x++) {
            for (let y = 0; y < this.board.height; y++) {
                fallData[x][y] = this.blocks[x][y] !== null ? 1 : 0;
            }
        }
        const groups = [];
        const checkedCoordinates = [];
        for (let x = 0; x < this.board.width; x++) {
            for (let y = 0; y < this.board.height; y++) {
                const currentBlock = this.blocks[x][y];
                if (!checkedCoordinates.includes(x + '-' + y) && currentBlock !== null) {
                    const secondBlock = this.findSecondBlock(currentBlock);
                    if (secondBlock !== null) {
                        groups.push([currentBlock, secondBlock]);
                        checkedCoordinates.push(secondBlock.x + '-' + secondBlock.y);
                    } else {
                        groups.push([currentBlock]);
                    }
                }
            }
        }
        const findMaxY = (blocks) => {
            let maxY = -1;
            blocks.forEach(block => {
                maxY = Math.max(block.y, maxY);
            });
            return maxY;
        }
        groups.sort((group1, group2) => {
            return findMaxY(group2) - findMaxY(group1);
        });
        groups.forEach(group => {
            if (this.canFall(group, fallData)) {
                canFallGroups.push(group);
            }
        });

        return canFallGroups;
    }

    fallAllBlocks() {

        const canFallGroups = this.findCanFallGroups();

        canFallGroups.forEach(blocks => {
            blocks.sort((block1, block2) => {
                return block2.point.y - block1.point.y;
            });
            blocks.forEach(block => {
                const currentBlock = this.blocks[block.x][block.y];
                const color = currentBlock.color;
                const id = currentBlock.id;
                this.blocks[block.x][block.y + 1] = new Block(new Point(block.x, block.y + 1), color, id);
            });
            if (blocks.length >= 2 && blocks[0].y !== blocks[1].y) {
                let minY = this.board.height;
                blocks.forEach(block => {
                    minY = Math.min(block.y, minY);
                });
                blocks.forEach(block => {
                    if (block.y === minY) {
                        this.blocks[block.x][block.y] = null;
                    }
                });
            } else {
                blocks.forEach(block => {
                    this.blocks[block.x][block.y] = null;
                });
            }
        });
        this.refreshCollisionData();
        this.board.render();
        
        if (canFallGroups.length > 0) {
            setTimeout(() => this.fallAllBlocks(), 500);
        } else {
            this.refreshCollisionData();
            this.removeColorLines();
        }
    }

    canFall(blocks, fallData) {

        const virusBlocks = blocks.filter(block => block.id === 0);
        if (virusBlocks.length > 0) {
            return false;
        }

        let maxY = -1;
        blocks.forEach(block => {
            maxY = Math.max(block.y, maxY);
        });
        const bottomBlocks = [];
        blocks.forEach(block => {
            if (block.y === maxY) {
                bottomBlocks.push(block);
            }
        });
        let canFall = true;
        bottomBlocks.forEach(block => {
            if (block.y === this.board.height - 1 || fallData[block.x][block.y + 1] === 1) {
                canFall = false;
            }
        });
        bottomBlocks.forEach(block => {
            fallData[block.x][block.y] = canFall ? 0 : 1;
        });
        return canFall;
    }

    findSecondBlock(block) {
        for (let x = 0; x < this.blocks.length; x++) {
            for (let y = 0; y < this.blocks[x].length; y++) {
                if (this.blocks[x][y] !== null && this.blocks[x][y].id === block.id && this.blocks[x][y] !== block) {
                    return this.blocks[x][y];
                }
            }
        }
        return null;
    }

    getRandomColor() {
        return availableColors[Math.floor(Math.random() * availableColors.length)];
    }

    generateRandomNumberInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    checkCollision() {

        const firstBlock = this.activeBlockGroup.firstBlock;
        const secondBlock = this.activeBlockGroup.secondBlock;
        const maxY = Math.max(firstBlock.y, secondBlock.y);
        const collisionBlocks = [];
        if (firstBlock.y === maxY) {
            collisionBlocks.push(firstBlock);
        }
        if (secondBlock.y === maxY) {
            collisionBlocks.push(secondBlock);
        }
        if (this.activeBlockGroup.firstBlock.y === this.board.height - 1 || this.activeBlockGroup.secondBlock.y === this.board.height - 1) {
            return true;
        }

        let hasCollision = false;
        collisionBlocks.forEach(collisionBlock => {
            if (this.collisionData[collisionBlock.x][collisionBlock.y + 1] !== null) {
                hasCollision = true;
            }
        });

        if (hasCollision) {
            return true;
        }

        return false;
    }
}

window.addEventListener('load', () => {
    const board = new Board('#board', 8, 15);
    const game = new Game(board);
    game.start();
});
