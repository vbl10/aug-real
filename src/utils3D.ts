import { vec3 } from 'gl-matrix';


export class Camera {
  pos = vec3.create();
  rot = vec3.create();
}

type Model = {
  verticies: vec3[];
  indicies: number[];
}
export class Object3D {
  model: Model;
  constructor(model: Model) {
    this.model = model;
  }

  pos = vec3.create();
  scale = vec3.fromValues(1, 1, 1);
  rot = vec3.create();
}

export class Cube extends Object3D {
  private static _model = (() => {
    const aux = {
      verticies: [
        vec3.fromValues(0, 0, 0),
        vec3.fromValues(1, 0, 0),
        vec3.fromValues(1, 1, 0),
        vec3.fromValues(0, 1, 0),
        vec3.fromValues(0, 0, 1),
        vec3.fromValues(1, 0, 1),
        vec3.fromValues(1, 1, 1),
        vec3.fromValues(0, 1, 1),
      ],
      indicies: [
        0, 1, 1, 2, 2, 3, 3, 0,
        4, 5, 5, 6, 6, 7, 7, 4,
        0, 4, 1, 5, 2, 6, 3, 7
      ]
    };
    for (let v of aux.verticies) 
      vec3.add(v, v, vec3.fromValues(-0.5,-0.5,-0.5));
    return aux;
  })()
  constructor() {
    super(Cube._model);
  }
}

export class Cilinder extends Object3D {
  constructor(n: number = 12, h: number = 4) {
    const verticies: vec3[] = [];
    const indicies: number[] = [];
    const k = h + 1;

    for (let i = 0; i < n; i++) {
      const x = Math.cos(Math.PI * 2 / n * i);
      const z = Math.sin(Math.PI * 2 / n * i);

      for (let j = 0; j < k; j++) {
        verticies.push(vec3.fromValues(x, j / (k - 1) - 0.5, z));
      }

      // longitude
      for (let j = 0; j < k - 1; j++) {
        indicies.push(i * k + j, i * k + j + 1);
      }

      // latitude
      for (let j = 0; j < k; j++) {
        indicies.push(i * k + j, (i * k + k + j) % (k * n));
      }
      
      //indicies.push(
      //  i * 3, (i * 3 + 3) % (3 * n),
      //  i * 3 + 1, (i * 3 + 4) % (3 * n),
      //  i * 3 + 2, (i * 3 + 5) % (3 * n)
      //)
    }

    super({indicies, verticies});
  }
}

export class Grid extends Object3D {
  constructor(dimX: number, dimZ: number) {
    const verticies: vec3[] = [];
    const indicies: number[] = [];

    for (let x = 0; x <= dimX; x++) {
      verticies.push(vec3.fromValues(x - dimX / 2, 0, -dimZ / 2));
      verticies.push(vec3.fromValues(x - dimX / 2, 0, dimZ / 2));
      indicies.push(x * 2, x * 2 + 1);
    }
    for (let z = 0; z <= dimZ; z++) {
      verticies.push(vec3.fromValues(-dimX / 2, 0, z - dimZ / 2));
      verticies.push(vec3.fromValues(dimX / 2, 0, z - dimZ / 2));
      indicies.push(z * 2 + (dimX + 1) * 2, z * 2 + 1 + (dimX + 1) * 2);
    }

    super({verticies, indicies});
  }
}