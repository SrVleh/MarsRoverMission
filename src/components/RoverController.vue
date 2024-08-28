<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import GridNode from "../types/grid-node.ts"
import Terrain from "../types/terrain.ts"
import Rover from "../types/rover.ts"

export default defineComponent({
  name: "RoverController",
  components: {},
  setup() {
    let gridHeight = ref<number>(0);
    let gridWidth = ref<number>(0);

    let startingPosX = ref<number>(0);
    let startingPosY = ref<number>(0);
    let selectedDirection = ref<string>(null);
    let commands = ref<string[]>([]);
    let currentCommand = ref<string>(null);
    let report = ref<string[]>([]);

    let defaultNode = ref<GridNode>({
      posX: 0,
      posY: 0,
      isObstacle: false,
    });


    let terrain = ref<Terrain>({});
    let rover = ref<Rover>({
      currentNode: defaultNode,
      direction: "N",
      commandsList: commands
    });


    return {
      defaultNode, terrain,
      gridHeight, gridWidth,
      selectedDirection,
      startingPosX, startingPosY,
      rover, commands, currentCommand,
      report
    }
  },
  methods: {
    generateGrid() {
      this.terrain.grid = [];
      if (this.gridHeight === 0 || this.gridWidth === 0) return;

      this.terrain = {
        width: this.gridWidth,
        height: this.gridHeight,
        grid: []
      }

      for (let i = 0; i < this.gridHeight; i++) {
        for (let j = 0; j < this.gridWidth; j++) {
          let node: GridNode = reactive({
            posX: i,
            posY: j,
            isObstacle: false,
          })
          this.terrain.grid.push(node)
        }
      }
    },

    setStartingPoint() {
      this.defaultNode = {
        posX: this.startingPosX,
        posY: this.startingPosY,
        isObstacle: false,
      }

      this.rover = {
        currentNode: this.defaultNode,
        direction: this.selectedDirection == null ? this.rover.direction : this.selectedDirection,
        commandsList: []
      }
    },

    addCommandsToList() {
      if (this.currentCommand == null) return;
      this.commands.push(this.currentCommand)
    },

    emptyCommandList() {
      this.commands = [];
    },

    setAsObstacle(node: GridNode) {
      if (this.roverAtPosition(node)) return;
      let nodeIndex = this.terrain.grid.indexOf(node)
      this.terrain.grid[nodeIndex].isObstacle = !this.terrain.grid[nodeIndex].isObstacle ;
    },

    roverAtPosition(roverNode: GridNode): boolean {
      let nodeIndex = this.terrain.grid.findIndex(node => node.posX === roverNode.posX && node.posY === roverNode.posY);
      return this.terrain.grid[nodeIndex].posX == this.rover.currentNode.posX && this.terrain.grid[nodeIndex].posY == this.rover.currentNode.posY;
    },

    obstacleAtPosition(obstacleNode: GridNode): boolean {
      let nodeIndex = this.terrain.grid.findIndex(node => node.posX === obstacleNode.posX && node.posY === obstacleNode.posY);
      return this.terrain.grid[nodeIndex].isObstacle;
    },

    runSimulation() {
      this.report.push(`Rover starts at X:${this.rover.currentNode.posX} - Y:${this.rover.currentNode.posY} - Direction: ${this.rover.direction}`);
      this.commands.forEach( command => {
        if (command.toUpperCase() === "F") {
          this.move()
        } else {
          this.handleDirection(command)
        }
      })
    },

    handleDirection(command: string) {
      let directionsList: Array<string> = ["N", "E", "S", "W"];
      let currentDirectionIndex = directionsList.findIndex(direction => direction === this.rover.direction);

      if (command.toUpperCase() ===  "L") {
        this.rover.direction = currentDirectionIndex - 1 == -1 ? directionsList[directionsList.length - 1] : directionsList[currentDirectionIndex - 1]
      } else {
        this.rover.direction = currentDirectionIndex + 1 == directionsList.length ? directionsList[0] : directionsList[currentDirectionIndex + 1]
      }
      this.report.push(`Rover rotates to: ${this.rover.direction}`);
    },

    move() {
      let nextNode: GridNode = {}
      switch (this.rover.direction) {
        case "N":
          nextNode = {
            posX: this.rover.currentNode.posX - 1,
            posY: this.rover.currentNode.posY,
          }
          if (this.obstacleAtPosition(nextNode) || nextNode.posX === -1) {
            this.report.push(`Rover encounters obstacle on X:${nextNode.currentNode.posX} - Y:${nextNode.currentNode.posY} - Direction: ${this.rover.direction}`);
            this.abortOperation()
          } else {
            this.rover.currentNode.posX -= 1;
            this.report.push(`Rover moves to X:${this.rover.currentNode.posX} - Y:${this.rover.currentNode.posY} - Direction: ${this.rover.direction}`);
          }
          break;
        case "E":
          nextNode = {
            posX: this.rover.currentNode.posX,
            posY: this.rover.currentNode.posY + 1,
          }
          if (this.obstacleAtPosition(nextNode) || nextNode.posY === this.gridHeight - 1) {
            this.report.push(`Rover encounters obstacle on X:${nextNode.currentNode.posX} - Y:${nextNode.currentNode.posY} - Direction: ${this.rover.direction}`);
            this.abortOperation()
          } else {
            this.rover.currentNode.posY += 1;
            this.report.push(`Rover moves to X:${this.rover.currentNode.posX} - Y:${this.rover.currentNode.posY} - Direction: ${this.rover.direction}`);
          }
          break;
        case "S":
          nextNode = {
            posX: this.rover.currentNode.posX + 1,
            posY: this.rover.currentNode.posY,
          }
          if (this.obstacleAtPosition(nextNode) || nextNode.posX === this.gridWidth - 1) {
            this.report.push(`Rover encounters obstacle on X:${nextNode.posX} - Y:${nextNode.posY} - Direction: ${this.rover.direction}`);
            this.abortOperation()
          } else {
            this.rover.currentNode.posX += 1;
            this.report.push(`Rover moves to X:${this.rover.currentNode.posX} - Y:${this.rover.currentNode.posY} - Direction: ${this.rover.direction}`);
          }
          break;
        case "W":
          nextNode = {
            posX: this.rover.currentNode.posX,
            posY: this.rover.currentNode.posY - 1,
          }
          if (this.obstacleAtPosition(nextNode) || nextNode.posX === -1) {
            this.report.push(`Rover encounters obstacle on X:${nextNode.currentNode.posX} - Y:${nextNode.currentNode.posY} - Direction: ${this.rover.direction}`);
            this.abortOperation()
          } else {
            this.rover.currentNode.posY -= 1;
            this.report.push(`Rover moves to X:${this.rover.currentNode.posX} - Y:${this.rover.currentNode.posY} - Direction: ${this.rover.direction}`);
          }
          break;
      }
    },

    abortOperation() {
      this.report.push(`Rover moves to X:${this.rover.currentNode.posX} - Y:${this.rover.currentNode.posY} - Direction: ${this.rover.direction}`);
      this.lookUp()
      this.moveUntilEndOfMap()
    },

    lookUp() {
      if (this.rover.direction === "N") return;
      while (this.rover.direction !== "N") {
        this.handleDirection("L")
      }
    },

    moveUntilEndOfMap() {
      if (this.rover.currentNode.posX === 0) return;
      if (this.rover.currentNode.posY === 0) return;
      if (this.rover.currentNode.posX === this.gridWidth - 1) return;
      if (this.rover.currentNode.posY === this.gridHeight - 1) return;

      let nextNode: GridNode = {
        posX: this.rover.currentNode.posX - 1,
        posY: this.rover.currentNode.posY,
      }
      while (this.rover.currentNode.posX !== 0 && !this.obstacleAtPosition(nextNode)) {
        nextNode = {
          posX: this.rover.currentNode.posX - 1,
          posY: this.rover.currentNode.posY,
        }
        if (this.obstacleAtPosition(nextNode)) {
          this.report.push(`Rover stops at X:${this.rover.currentNode.posX} - Y:${this.rover.currentNode.posY} - Direction: ${this.rover.direction}`);
        } else {
          this.rover.currentNode.posX -= 1;
          this.report.push(`Rover moves to X:${this.rover.currentNode.posX} - Y:${this.rover.currentNode.posY} - Direction: ${this.rover.direction}`);
        }
      }
    },
  }
})

</script>

<template>
  <main class="container">
    <h1>Mars Rover Mission</h1>

    <div class="configuration-container">
      <section class="section-view">
        <h3>Select grid size:</h3>
        <input v-model="gridWidth" type="number" value="0" min="0" step="1" />
        <input v-model="gridHeight" type="number" value="0" min="0" step="1" />
        <button @click="generateGrid">Generate Grid</button>
      </section>

      <section class="section-view">
        <h3>Set starting point and direction:</h3>

        <input v-model="startingPosX" type="number" value="0" min="0" step="1" />
        <input v-model="startingPosY" type="number" value="0" min="0" step="1" />

        <select v-model="selectedDirection">
          <option value="N">North</option>
          <option value="E">East</option>
          <option value="S">South</option>
          <option value="W">West</option>
        </select>

        <button @click="setStartingPoint">Set</button>
      </section>

      <section class="section-view">
        <h3>Add commands and run!</h3>

        <div class="command-selection-container">
          <select v-model="currentCommand">
            <option value="F">Forward</option>
            <option value="R">Right</option>
            <option value="L">Left</option>
          </select>

          <button @click="addCommandsToList">Add to command list</button>
          <button @click="emptyCommandList">Empty command list</button>

          <div class="command-list" v-if="commands.length > 0">
            <p v-for="command in commands" :key="command.id">{{ command }}</p>
          </div>
        </div>
      </section>
    </div>

    <section class="section-view">
      <button @click="runSimulation">Run Simulation!</button>

      <p>You can add/remove obstacles by clicking the nodes!</p>
      <div class="grid" :class="{ 'active' :  Object.keys(this.terrain).length !== 0 }"
           v-bind:style="{ 'grid-template-rows': 'repeat(' + this.terrain.height + ', 1fr)',
        'grid-template-columns': 'repeat(' + this.terrain.width + ', 1fr)' }">
        <div v-for="node in this.terrain.grid" :key="node.id" class="node"
             :class="{ 'obstacle' : node.isObstacle, 'has-rover' : roverAtPosition(node).valueOf() }" @click="setAsObstacle(node)">
          <p class="node-coord">{{ node.posX }} - {{ node.posY }}</p>
          <h5 v-if="roverAtPosition(node)" class="rover">R</h5>
        </div>
      </div>
    </section>

    <section class="section-view">
      <h3>Simulation report</h3>

      <div class="report-container" v-if="this.report.length != null">
        <li class="report-line" v-for="line in this.report" :key="line.id">{{ line }}</li>
      </div>
    </section>
  </main>
</template>

<style>
  .container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 2.2rem;
  }

  .configuration-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    gap: 3rem;
    width: 100%;
    height: 100%;
  }

  .section-view {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 1.5rem;
    min-width: 300px;
    min-height: 250px;
  }

  .grid {
    width: auto;
    height: auto;
    display: grid;
    gap: 1em;
  }

  .active {
    border: 1px solid black;
    border-radius: 4px;
    padding: 5px;
  }

  .node {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 35px;
    height: 35px;
    border: 1px solid black;
    border-radius: 4px;
    padding: 5px;
  }

  .node:hover {
    background-color: #dd9f9f;
    cursor: pointer;
  }

  .node-coord {
    font-size: 8px;
    margin: 0;
  }

  .has-rover {
    background-color: #78c0df;
  }

  .rover {
    margin: 0;
  }

  .obstacle {
    background-color: #df6b6b;
  }

  .command-selection-container {
    display: flex;
    flex-direction: column;
  }

  .command-list {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  .report-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: flex-start;
    align-items: flex-start;
  }

  .report-line {
    margin: 0;
    padding: 0;
  }

  input {
    width: 12rem;
    text-align: center;
    margin-bottom: 1rem;
  }

  select {
    margin-bottom: 1rem;
    width: 12rem;
  }

  button {
    margin-bottom: 1rem;
    width: 12rem;
  }

  h3 {
    margin-bottom: 1.8rem;
  }
</style>