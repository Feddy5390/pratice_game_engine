export default class Level {
    #levelMap = new Map();

    constructor() {
        
    }

    addLevel(level) {
        this.#levelMap.set(level.levelName, level);
    }

    parse(levelName) {
        const level = this.#levelMap.get(levelName);

        const entities = level.
    }
}