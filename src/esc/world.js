export default class World {
  _maxEntities;
  _masks; // entity masks
  _componentCursor = 0; // component bit index
  _componentBits = {}; // type -> bit
  components = {}; // type -> store
  _systems = {
    beforeUpdate: [],
    update: [],
    afterUpdate: [],
  };
  _nextEntityId = 0;
  _recycledEntities = [];
  _queries = new Map();
  _renderQueue = []; // renderer 最終需要繪製的 entityId

  constructor(maxEntities = 100) {
    this._maxEntities = maxEntities;
    this._masks = new Uint32Array(maxEntities);
  }

  registerComponent(component) {
    const id = this._componentCursor++;
    const { type, stride, createStore, onAdd, onRemove, onChange } = component;

    this._componentBits[type] = 1 << id;
    this.components[type] = {
      store: createStore(this._maxEntities),
      stride,
    };
  }

  createQuery(types) {
    let mask = 0;
    for (let i = 0; i < types.length; i++) {
      mask |= this._componentBits[types[i]];
    }

    if (this._queries.has(mask)) {
      return this._queries.get(mask);
    }

    const query = {
      mask,
      entities: [],
      indices: new Map(),
    };
    this._queries.set(mask, query);

    return query;
  }

  createEntity() {
    let entityId;
    if (this._recycledEntities.length > 0) {
      entityId = this._recycledEntities.pop();
    } else {
      entityId = this._nextEntityId++;
    }

    this._masks[entityId] = 0;

    return entityId;
  }

  destroyEntity(entityId) {
    const oldMask = this._masks[entityId];
    this._masks[entityId] = 0;
    this._onMaskChanged(entityId, oldMask, 0);
    this._recycledEntities.push(entityId);
  }

  addComponent(entityId, type, data) {
    const bit = this._componentBits[type];
    const oldMask = this._masks[entityId];
    this._masks[entityId] |= bit;
    this._onMaskChanged(entityId, oldMask, this._masks[entityId]);
    this.setComponent(entityId, type, data);
  }

  removeComponent(entityId, types) {
    const bit = this._componentBits[types];
    const oldMask = this._masks[entityId];
    this._masks[entityId] &= ~bit;
    this._onMaskChanged(entityId, oldMask, this._masks[entityId]);
  }

  setComponent(entityId, type, data) {
    const { store, stride } = this.components[type];
    store.set(data, entityId * stride);
  }

  _onMaskChanged(entityId, oldMask, newMask) {
    for (const query of this._queries.values()) {
      const mask = query.mask;
      const wasMatch = (oldMask & mask) === mask;
      const isMatch = (newMask & mask) === mask;

      if (!wasMatch && isMatch) {
        // add
        query.indices.set(entityId, query.entities.length);
        query.entities.push(entityId);
      } else if (wasMatch && !isMatch) {
        // remove
        const index = query.indices.get(entityId);
        const lastEntityId = query.entities[query.entities.length - 1];
        // swap remove
        if (entityId !== lastEntityId) {
          query.entities[index] = lastEntityId;
          query.indices.set(lastEntityId, index);
        }
        query.indices.delete(entityId);
        query.entities.pop();
      }
    }
  }

  addSystem(Class, phase = 'update') {
    const system = new Class(this);
    this._systems[phase].push(system);
  }

  _update(phase, dt) {
    const systems = this._systems[phase];
    for (let i = 0, c = systems.length; i < c; i++) {
      systems[i].update(dt);
    }
  }
}
