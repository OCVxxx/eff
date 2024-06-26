import React, { useEffect } from "react";

import * as THREE from "three";
import { Face, FaceletCubeT } from "../../lib/Defs";
import { arrayEqual } from "../../lib/Math";
import { OrbitControls } from "../../lib/three/OrbitControls";

type Config = {
  cube: FaceletCubeT;
  width: number;
  height: number;
  colorScheme: Array<string>;
  facesToReveal: Face[];
  theme: string;
  hintDistance?: number;
  enableControl?: boolean;
};
let { Vector3 } = THREE;

/*
How to propagate control of keypress ..? maybe not here, in the app.

Let's look at click analogy: if a user click on sub-component,
that message should be propagated upwards to the parent.

That is, "keydown" should transform to some kind of message, e.g. the resulting cube state
to be passed to the App, which then decides whether to trigger state change or let the cube keep being solved

*/

type AxesInfo = [THREE.Vector3, THREE.Euler];
const TAU = Math.PI * 2;
const axesInfo: [THREE.Vector3, THREE.Euler][] = [
  // UDFBLR
  [new THREE.Vector3(0, 1, 0), new THREE.Euler(-TAU / 4, 0, 0)],
  [new THREE.Vector3(0, -1, 0), new THREE.Euler(TAU / 4, 0, 0)],
  [new THREE.Vector3(0, 0, 1), new THREE.Euler(0, 0, 0)],
  [new THREE.Vector3(0, 0, -1), new THREE.Euler(0, TAU / 2, 0)],
  [new THREE.Vector3(-1, 0, 0), new THREE.Euler(0, -TAU / 4, 0)],
  [new THREE.Vector3(1, 0, 0), new THREE.Euler(0, TAU / 4, 0)],
];

enum CameraState {
  HOME,
  PEEK_UFL,
  PEEK_DFL,
  PEEK_DFR,
  PEEK_UBR,
  PEEK_UBL,
}
type ConfigT = {
  width: number;
  height: number;
  colorScheme: Array<string>;
  mode?: string;
  faces?: Face[];
  theme?: string;
  hintDistance?: number;
  enableControl?: boolean;
  cameraState?: CameraState;
};

const roundedFace = (rounded?: number[], cornerRadius?: number) => {
  rounded = rounded || [1, 1, 1, 1];
  let geo = new THREE.BufferGeometry();
  let cornerVertices = [];
  let cornerCenter = new THREE.Vector3(1, 1, 0);
  let squareCorner = new THREE.Vector3(1, 1, 0);
  for (let i = 0; i <= 90; i += 10) {
    cornerVertices.push(cornerCenter);
  }
  let vertices = [];
  for (let i = 0; i < 4; i++) {
    if (rounded[i]) {
      vertices.push(...cornerVertices);
    } else {
      vertices.push(squareCorner.clone());
    }
    cornerVertices = cornerVertices.map((x) =>
      x.clone().applyAxisAngle(new Vector3(0, 0, 1), 0.5 * Math.PI)
    );
    squareCorner.applyAxisAngle(new Vector3(0, 0, 1), 0.5 * Math.PI);
  }
  //vertices.push(new Vector3(0, 0, 0))

  //let vertices_float32 = new Float32Array( vertices.length * 3)
  //let vertices_attr = new THREE.BufferAttribute(vertices_float32, 3).copyVector3sArray( vertices)
  // console.log(vertices_attr)
  let faces = [];
  for (let i = 0; i < vertices.length; i++) {
    let i1 = (i + 1) % vertices.length;
    faces.push(vertices[vertices.length - 1]);
    faces.push(vertices[i]);
    faces.push(vertices[i1]);
  }
  geo.setFromPoints(faces);

  return geo;
};

const getCameraPosFromState = function (
  cstate: CameraState
): [number[], THREE.Vector3] {
  const cameraPosUFR = [3.5, 3.5, 3.5];
  const cameraPosUFL = [-2, 3.5, 3];
  const cameraPosDFL = [-2, -3.5, 3];
  const cameraPosDFR = [2, -3.5, 3];
  const cameraPosUBR = [2.5, 3.5, -3];
  const cameraPosUBL = [-2, 3.5, -3];

  const upVecLookingDownUB = new THREE.Vector3(0, 0, -1);
  const upVecLookingDownUBL = new THREE.Vector3(0, 0.1, -1);
  const upVecDefault = new THREE.Vector3(0, 1, 0);
  switch (cstate) {
    case CameraState.HOME:
      return [cameraPosUFR, upVecDefault];
    case CameraState.PEEK_DFL:
      return [cameraPosDFL, upVecDefault];
    case CameraState.PEEK_DFR:
      return [cameraPosDFR, upVecDefault];
    case CameraState.PEEK_UFL:
      return [cameraPosUFL, upVecDefault];
    case CameraState.PEEK_UBL:
      return [cameraPosUBL, upVecLookingDownUBL];
    default:
      return [cameraPosUBR, upVecLookingDownUB];
  }
};
const redraw_cube = function (cube: FaceletCubeT, config: ConfigT) {
  let { width, height, colorScheme, mode, faces, theme, enableControl } =
    config;
  let hintDistance = config.hintDistance || 3;

  mode = mode || "FRU";
  let facesToReveal = faces || [Face.L, Face.B, Face.D];
  //facesToReveal = [Face.L]

  const scene = new THREE.Scene();
  const angle = 50;
  const camera = new THREE.PerspectiveCamera(20, height / width, 0.1, 20);

  const mag = 1.0;
  const alpha = 0.5;
  const enableBorder = true;

  const renderer = new THREE.WebGLRenderer({ antialias: true });

  renderer.setSize(width, height, true);
  //renderer.setViewport( 0, 0, width * window.devicePixelRatio, height * window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0); // #70788a') //#5a606e') // '#373B43') // '#eeeeee')
  renderer.setPixelRatio(window.devicePixelRatio);
  let controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = !!config.enableControl;

  const angleScale =
    Math.sin((70 / 180) * Math.PI) / Math.sin((angle / 180) * Math.PI);
  const scale = hintDistance > 5 ? 0.96 * angleScale : 0.9 * angleScale;

  const cameraState = config.cameraState || CameraState.HOME;
  const [cameraPositionRaw, cameraUp] = getCameraPosFromState(cameraState);

  const cameraPosition = new THREE.Vector3(2, 4, 4);

  //console.log("Setting camera up ", cameraUp, " camera pos", cameraPosition)
  camera.up.copy(cameraUp);

  const spherical = new THREE.Spherical(6, 1.16355283464836, 0.785398);
  spherical.makeSafe();
  camera.position.setFromSpherical(spherical);

  camera.aspect = width / height;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const off = 0;
  let yoff = 0;
  let excess = 0;
  if (height > width) {
    excess = height - width;
    yoff = -Math.floor(0.5 * excess);
  }
  camera.aspect = width / height;
  camera.setViewOffset(width, height - excess, off, yoff, width, height);

  let stickers_tmpl: THREE.Mesh[], stickerwrap_tmpl: THREE.Mesh;

  const geos: THREE.BufferGeometry[] = []; // new THREE.PlaneGeometry(0.89 * mag * 2, 0.89 * mag * 2)
  const geo_border = new THREE.PlaneGeometry(2.0, 2.0); //1.0 * mag * 2, 1.0 * mag * 2)

  let materials_border = new THREE.MeshBasicMaterial({
    color: 0x333333,
    side: THREE.FrontSide,
  });
  stickerwrap_tmpl = (() => {
    let mesh = new THREE.Mesh(geo_border, materials_border);
    mesh.setRotationFromEuler(axesInfo[0][1]);
    return mesh;
  })();

  const sticker_scale = 0.88;
  const corner_radius = 0;
  const hint_scale = 0.95;
  const rounded_patterns = [
    [0, 0, 0, 1],
    [0, 0, 1, 1],
    [0, 0, 1, 0],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
    [0, 1, 1, 0],
    [1, 0, 0, 0],
    [1, 1, 0, 0],
    [0, 1, 0, 0],
  ];

  function drawCube(
    faces: FaceletCubeT,
    colorScheme: Array<string>
  ): THREE.Group {
    //console.log("update color scheme ", colorScheme_)
    let materials = Array(7)
      .fill(0)
      .map((_, i) => {
        let mat = new THREE.MeshBasicMaterial({
          color: colorScheme[i],
          side: THREE.DoubleSide,
        });
        mat.alphaTest = alpha;
        return mat;
      });

    stickers_tmpl = materials
      .map((mat) => {
        return rounded_patterns.map((pattern) => {
          let geo = roundedFace(pattern, corner_radius);
          geos.push(geo);
          let mesh = new THREE.Mesh(geo, mat);
          mesh.scale.set(sticker_scale, sticker_scale, sticker_scale);
          mesh.setRotationFromEuler(axesInfo[0][1]);
          return mesh;
        });
      })
      .flat();

    let hint_mesh = Array(7)
      .fill(0)
      .map((_, i) => {
        let color = colorScheme[i];

        //
        //chroma.default(colorScheme[i]).brighten(0.7).hex()
        //desaturate(2).hex() //darken(0.5).hex()
        let mat = new THREE.MeshBasicMaterial({
          color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5,
        });

        let geo = roundedFace([1, 1, 1, 1], corner_radius);
        geos.push(geo);
        let mesh = new THREE.Mesh(geo, mat);
        mesh.scale.set(hint_scale, hint_scale, hint_scale);
        mesh.setRotationFromEuler(axesInfo[0][1]);
        return mesh;
      });

    const cube = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const cubie = new THREE.Group();
      const rot = new THREE.Matrix4().makeRotationFromEuler(axesInfo[i][1]);
      const rot1 = new THREE.Matrix4().makeRotationFromEuler(axesInfo[1][1]);
      cubie.setRotationFromMatrix(rot.multiply(rot1));
      for (let z = -1; z <= 1; z++) {
        for (let x = -1; x <= 1; x++) {
          let idx = (z + 1) * 3 + (x + 1);

          const curr_tmpl = stickers_tmpl[faces[i][idx] * 9 + idx];
          const sticker = curr_tmpl.clone();
          const stickerwrap = stickerwrap_tmpl.clone();

          const eps = 0.05;
          sticker.position.copy(new THREE.Vector3(x * 2, 3, z * 2));
          stickerwrap.position.copy(new THREE.Vector3(x * 2, 3 - eps, z * 2));

          if (facesToReveal.indexOf(i) > -1) {
            // (i === 5 && mode === "UF")) {
            const stickerhint = hint_mesh[faces[i][idx]].clone();
            stickerhint.position.copy(
              new THREE.Vector3(x * 2, 3 + hintDistance, z * 2)
            );
            cubie.add(stickerhint);
          }
          if (enableBorder) cubie.add(stickerwrap);

          cubie.add(sticker);
        }
      }
      cube.add(cubie);
    }

    const cube_scale = 1 / 5;
    cube.scale.set(cube_scale, cube_scale, cube_scale);
    return cube;
  }

  let cubeG = drawCube(cube, colorScheme);
  scene.add(cubeG);

  const render = () => {
    controls.update();
    renderer.render(scene, camera);
  };
  render();

  let frameID = -1;
  const animate = () => {
    frameID = requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };
  animate();

  const updateCubeAndColor = (
    cube: FaceletCubeT,
    colorScheme: Array<string>
  ) => {
    scene.remove(cubeG);
    cubeG.clear();
    cubeG = drawCube(cube, colorScheme);
    scene.add(cubeG);
    renderer.render(scene, camera);
    return renderer;
  };

  const cleanup = () => {
    geos.forEach((g) => g.dispose());
    materials_border.dispose();
    geo_border.dispose();
    scene.remove(cubeG);
    cancelAnimationFrame(frameID);
  };

  return {
    updateCubeAndColor,
    getRenderer: () => renderer,
    cleanupFunc: cleanup,
    renderControls: render,
  };
  //let defaultColorScheme = [ 0x00ff00, 0x0000ff, 0xff0000,0xff8800,0xffff00, 0xffffff]
};

let drawCube = function () {
  let config_cache: ConfigT | null = null;
  let painter: Painter | null = null;
  let func = (cube: FaceletCubeT, config: ConfigT) => {
    if (config_cache === null) {
      painter?.cleanupFunc();

      painter = redraw_cube(cube, config);
      config_cache = config;
      return painter;
    } else if (
      config.width === config_cache.width &&
      config.height === config_cache.height &&
      arrayEqual(config.faces || [], config_cache.faces || []) &&
      config.theme === config_cache.theme &&
      config.hintDistance === config_cache.hintDistance &&
      config.enableControl === config_cache.enableControl &&
      config.cameraState === config_cache.cameraState
    ) {
      painter?.updateCubeAndColor(cube, config.colorScheme);
      config_cache = config;
      return painter!;
    } else {
      painter?.cleanupFunc();
      painter = redraw_cube(cube, config);
      config_cache = config;
      return painter!;
    }
  };
  return func;
};

type Painter = {
  updateCubeAndColor: (
    cube: FaceletCubeT,
    scheme: Array<string>
  ) => THREE.WebGLRenderer;
  getRenderer: () => THREE.WebGLRenderer;
  cleanupFunc: () => void;
  renderControls: () => void;
};

function CubeSim(props: Config) {
  const mount = React.useRef<HTMLDivElement | null>(null);
  const [cameraState, setCameraState] = React.useState<CameraState>(
    CameraState.HOME
  );
  let { width, height, colorScheme, facesToReveal, hintDistance, theme } =
    props;
  let cubePainter = React.useMemo(drawCube, []);

  //const gt_xs = useMediaQuery(useTheme().breakpoints.up('sm'));
  const enableControl = false;

  let painter = cubePainter(props.cube, {
    width,
    height,
    colorScheme,
    faces: facesToReveal,
    theme,
    hintDistance,
    enableControl,
    cameraState,
  });

  useEffect(() => {
    let dom = window; //painter.getRenderer().domElement
    function downHandler(event: KeyboardEvent) {
      let suppressLogging = 0;
      // intercept keyboard event for local control
      if (event.key === "1") {
        setCameraState(CameraState.PEEK_DFL);
      }
      if (event.key === "2") {
        setCameraState(CameraState.PEEK_DFR);
      }
      if (event.key === "3") {
        setCameraState(CameraState.PEEK_UFL);
      }
      if (event.key === "9") {
        setCameraState(CameraState.PEEK_UBL);
      }
      if (event.key === "0") {
        setCameraState(CameraState.PEEK_UBR);
      } else {
        suppressLogging = 1;
      }
      if (~suppressLogging) {
        //console.log("CubeSim camera rotateion with key ", event.key)
      }
    }
    function upHandler(event: KeyboardEvent) {
      setCameraState(CameraState.HOME);
    }
    dom.addEventListener("keydown", downHandler);
    dom.addEventListener("keyup", upHandler);
    return () => {
      dom.removeEventListener("keydown", downHandler);
      dom.addEventListener("keyup", upHandler);
    };
  });

  useEffect(() => {
    let dom = mount.current!;
    let renderer = painter.getRenderer();
    const canvas = renderer.domElement;
    // look up the size the canvas is being displayed
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    // renderer.setSize(dom.clientWidth, height, false);

    dom.appendChild(painter.getRenderer().domElement); //renderer.domElement)
    return () => {
      dom.removeChild(renderer.domElement);
    };
  });

  return <div className="cube" ref={mount} />;
}

export default CubeSim;
