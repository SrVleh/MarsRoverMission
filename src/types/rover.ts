interface Rover {
    currentNode: Node;
    direction: 'N' | 'S' | 'E' | 'W';
    commandsList: string[];
}

export default Rover;
