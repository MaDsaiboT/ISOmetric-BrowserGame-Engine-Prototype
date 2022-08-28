class Scene {
  static scenes = new Map();

  constructor() {
    const name = this.constructor.name;
    console.log({name});
    if (!Scene.scenes.has(name)){
      Scene.scenes.set(name, this);
    }
    //return Scene.scenes.get(name);
  }
}


export { Scene };
export default Scene;
