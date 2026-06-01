import './style.css';
import { mat4, vec2, vec3, vec4 } from 'gl-matrix';
import { Object3D, Cilinder, Camera, Grid } from './utils3D';

const canvasContainerElmt = document.getElementById('canvasContainerElmt') as HTMLDivElement;
const canvasElmt = document.getElementById('canvasElmt') as HTMLCanvasElement;
const pitchRangeElmt = document.getElementById('pitchRangeElmt') as HTMLInputElement;
const rollRangeElmt = document.getElementById('rollRangeElmt') as HTMLInputElement;
const camHeightRangeElmt = document.getElementById('camHeightRangeElmt') as HTMLInputElement;
const pitchDisplayElmt = document.getElementById('pitchDisplayElmt');
const rollDisplayElmt = document.getElementById('rollDisplayElmt');
const heightDisplayElmt = document.getElementById('heightDisplayElmt');

const ctx = canvasElmt.getContext('2d');
let width = canvasElmt.width;
let height = canvasElmt.height;
let heightSet = false;
const resizeObserver = new ResizeObserver(
  entries => {
    if (!heightSet) {
      //heightSet = true;
      canvasElmt.width = width = entries[0].contentRect.width;
      canvasElmt.height = height = entries[0].contentRect.height - 4;
    }
  }
)

const fov = 90;
const far = 10;
const near = 1;
const projMat = mat4.fromValues(
  1 / (Math.tan(fov / 2 * Math.PI / 180)), 0, 0, 0,
  0, 1 / (Math.tan(fov / 2 * Math.PI / 180)), 0, 0,
  0, 0, -far / (far - near), -1,
  0, 0, -far * near / (far - near), 0
);


function main() {
  const camera = new Camera();
  camera.pos[1] = 0;

  const scene: Object3D[] = [
    new Cilinder(),
    new Grid(10, 10)
  ];

  pitchRangeElmt.addEventListener('input', (ev: any) => {
    const pitch = ev.target.value;
    camera.rot[0] = pitch * Math.PI / 180;
    if (pitchDisplayElmt) pitchDisplayElmt.innerText = pitch;
  });
  rollRangeElmt.addEventListener('input', (ev: any) => {
    const roll = ev.target.value;
    camera.rot[2] = roll * Math.PI / 180;
    if (rollDisplayElmt) rollDisplayElmt.innerText = roll;
  });
  canvasElmt.addEventListener('click', (ev) => {
    console.log(ev.offsetX, ev.offsetY);
  })
  camHeightRangeElmt.addEventListener('input', (ev: any) => {
    camera.pos[1] = ev.target.value;
    if (heightDisplayElmt) heightDisplayElmt.innerText = ev.target.value;
  })
  resizeObserver.observe(canvasContainerElmt);

  vec3.add(scene[0].pos, scene[0].pos, vec3.fromValues(0, 2, -5.5));
  scene[0].scale[1] = 4;
  scene[1].pos[2] = -5.5;

  const draw = () => {
    if (!ctx) return;
    
    
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,width,height);
    
    ctx.strokeStyle = 'yellow';

    const matView = mat4.create();
    // projection
    mat4.mul(matView, matView, projMat);
    
    // camera
    mat4.rotateZ(matView, matView, -camera.rot[2]);
    mat4.rotateX(matView, matView, -camera.rot[0]);
    mat4.rotateY(matView, matView, -camera.rot[1]);
    mat4.translate(matView, matView, vec3.negate(vec3.create(), camera.pos));

    for (let obj of scene) {
      const verticies: vec2[] = [];

      const mat = mat4.create();

      // translate model
      mat4.translate(mat, matView, obj.pos);
      
      // rotate model
      mat4.rotateZ(mat, mat, obj.rot[2]);
      mat4.rotateX(mat, mat, obj.rot[0]);
      mat4.rotateY(mat, mat, obj.rot[1]);

      // scale model
      mat4.scale(mat, mat, obj.scale);

      for (let m of obj.model.verticies) {
        
        const p = vec4.fromValues(m[0], m[1], m[2], 1);
        vec4.transformMat4(p, p, mat);
        vec3.scale(p, p, 1 / p[3]);

        // scale to screen coordinates
        vec3.scale(p, p, -height);
        vec3.add(p, p, vec2.fromValues(width / 2, height / 2))

        verticies.push(p);
      }
      const indicies = obj.model.indicies;
      for (let i = 0; i < indicies.length; i += 2) {
        ctx.beginPath();
        ctx.moveTo(verticies[indicies[i]][0], verticies[indicies[i]][1]);
        ctx.lineTo(verticies[indicies[i + 1]][0], verticies[indicies[i + 1]][1]);
        ctx.stroke();
      }
    }
    

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

main();