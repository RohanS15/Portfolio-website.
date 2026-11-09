import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { useTheme } from "../theme/ThemeProvider";

type OrbitId = "security" | "build" | "independent";
type StageId = "threat" | "signal" | "response";
type OrbitAnchorRefs = Record<OrbitId, MutableRefObject<THREE.Group | null>>;
type CubeSurfaceRef = MutableRefObject<THREE.Mesh | null>;
type OrbitLabelRefs = MutableRefObject<Record<OrbitId, HTMLButtonElement | null>>;
type OrbitLeaderRefs = MutableRefObject<Record<OrbitId, SVGLineElement | null>>;
type CapturableTarget = EventTarget & {
  setPointerCapture: (pointerId: number) => void;
  releasePointerCapture: (pointerId: number) => void;
};

const stages: StageId[] = ["threat", "signal", "response"];
const orbits: Array<{
  id: OrbitId;
  label: string;
  number: string;
  rx: number;
  ry: number;
  speed: number;
  direction: number;
  rotation: [number, number, number];
  angle: number;
}> = [
  { id: "security", label: "SECURITY", number: "01", rx: 2.2, ry: 1.12, speed: 0.23, direction: -1, rotation: [0.12, 0.16, -0.22], angle: Math.PI },
  { id: "build", label: "BUILD", number: "02", rx: 1.9, ry: 1.45, speed: 0.18, direction: 1, rotation: [0.72, -0.25, 0.3], angle: -0.1 },
  { id: "independent", label: "INDEPENDENT PRACTICE", number: "03", rx: 2.52, ry: 2.02, speed: 0.135, direction: -1, rotation: [0.48, 0.26, -0.08], angle: -1.55 },
];

function createCodeTexture(color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = color;
    context.font = "bold 78px monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("</>", 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createThemeAwareFaceTexture(source: THREE.Texture, dark: boolean, monochrome = false, linux = false) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.CanvasTexture(canvas);
  const image = source.image as HTMLImageElement;
  const imageWidth = image.naturalWidth || image.width || 128;
  const imageHeight = image.naturalHeight || image.height || 128;
  const imageScale = Math.min(210 / imageWidth, 210 / imageHeight);
  const width = imageWidth * imageScale;
  const height = imageHeight * imageScale;
  const drawX = (256 - width) / 2;
  const drawY = (256 - height) / 2;
  context.drawImage(image, drawX, drawY, width, height);
  const pixels = context.getImageData(0, 0, 256, 256);
  const color = dark ? [210, 255, 247] : [25, 91, 95];
  for (let index = 0; index < pixels.data.length; index += 4) {
    const red = pixels.data[index];
    const green = pixels.data[index + 1];
    const blue = pixels.data[index + 2];
    if (pixels.data[index + 3] === 0) continue;
    const grayscale = Math.max(red, green, blue) - Math.min(red, green, blue) <= 28;
    if (!monochrome && !grayscale) continue;
    const luminance = red * 0.299 + green * 0.587 + blue * 0.114;
    if (monochrome || luminance < 225) {
      pixels.data[index] = color[0];
      pixels.data[index + 1] = color[1];
      pixels.data[index + 2] = color[2];
    }
  }
  context.putImageData(pixels, 0, 0);
  if (linux && dark) {
    const eyeScale = width / 128;
    context.fillStyle = "#102b30";
    for (const eyeX of [58, 72]) {
      context.beginPath();
      context.arc(drawX + eyeX * eyeScale, drawY + 27 * eyeScale, 5.2 * eyeScale, 0, Math.PI * 2);
      context.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function makeOrbitGeometry(rx: number, ry: number, count = 112) {
  const positions = new Float32Array((count + 1) * 3);
  for (let index = 0; index <= count; index += 1) {
    const angle = (index / count) * Math.PI * 2;
    positions[index * 3] = rx * Math.cos(angle);
    positions[index * 3 + 1] = ry * Math.sin(angle);
    positions[index * 3 + 2] = 0;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geometry;
}

function OrbitTrack({
  orbit,
  anchorRef,
  active,
  color,
  muted,
  dark,
  reducedMotion,
  coarsePointer,
}: {
  orbit: (typeof orbits)[number];
  anchorRef: MutableRefObject<THREE.Group | null>;
  active: boolean;
  color: string;
  muted: string;
  dark: boolean;
  reducedMotion: boolean;
  coarsePointer: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(
    () => makeOrbitGeometry(orbit.rx, orbit.ry, coarsePointer ? 72 : 112),
    [coarsePointer, orbit.rx, orbit.ry],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  const viewportScale = useThree((state) => state.size.width < 360 ? 0.64 : state.size.width < 430 ? 0.74 : state.size.width < 600 ? 0.84 : state.size.width < 800 ? 0.9 : 1);

  useFrame((_, delta) => {
    if (group.current && !reducedMotion) {
      group.current.rotation.z += delta * orbit.speed * orbit.direction;
    }
  });

  const labelX = orbit.rx * Math.cos(orbit.angle);
  const labelY = orbit.ry * Math.sin(orbit.angle);
  return (
    <group ref={group} rotation={orbit.rotation} scale={viewportScale}>
      <points geometry={geometry}>
        <pointsMaterial
          color={active ? color : muted}
          size={active ? 0.034 : dark ? 0.022 : 0.027}
          transparent
          opacity={active ? 0.96 : dark ? 0.48 : 0.82}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      <mesh position={[labelX, labelY, 0.025]}>
        <sphereGeometry args={[active ? 0.05 : 0.032, 10, 10]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <group ref={anchorRef} position={[labelX, labelY, 0.025]} />
    </group>
  );
}

function InteractiveCube({
  pointer,
  dark,
  reducedMotion,
  cubeSurfaceRef,
  onActivate,
}: {
  pointer: MutableRefObject<THREE.Vector2>;
  dark: boolean;
  reducedMotion: boolean;
  cubeSurfaceRef: CubeSurfaceRef;
  onActivate: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const drag = useRef({ active: false, pointerId: -1, x: 0, y: 0, rx: 0, ry: 0 });
  const cubeMaterial = useRef<THREE.MeshPhysicalMaterial>(null);
  const hoverLight = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);
  const invalidate = useThree((state) => state.invalidate);
  const scale = useThree((state) => state.size.width < 360 ? 0.72 : state.size.width < 430 ? 0.8 : state.size.width < 600 ? 0.9 : state.size.width < 900 ? 1.08 : state.size.width > 1600 ? 1.15 : 1);
  const cubeBaseColor = dark ? "#75a6aa" : "#729b9b";
  const cubeHoverColor = dark ? "#a4eee4" : "#b5e4dc";
  const cubeBaseOpacity = dark ? 0.16 : 0.11;
  const cubeHoverOpacity = dark ? 0.3 : 0.19;
  const logoTextures = useLoader(THREE.TextureLoader, [
    "/images/hero/identity-logos/n8n.svg",
    "/images/hero/identity-logos/vercel.svg",
    "/images/hero/identity-logos/github.svg",
    "/images/hero/identity-logos/nextjs.svg",
    "/images/hero/identity-logos/linux.svg",
  ]);
  const faceTextures = useMemo(() => [
    createCodeTexture(dark ? "#d2fff7" : "#195b5f"),
    ...logoTextures.map((texture, index) => createThemeAwareFaceTexture(texture, dark, index === 0, index === 4)),
  ], [dark, logoTextures]);
  const environment = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context.createLinearGradient(0, 0, 512, 256);
      gradient.addColorStop(0, dark ? "#17383c" : "#d3f5f0");
      gradient.addColorStop(0.28, dark ? "#263a55" : "#ffffff");
      gradient.addColorStop(0.52, dark ? "#090f1c" : "#dce4f6");
      gradient.addColorStop(0.76, dark ? "#363052" : "#d2d9ee");
      gradient.addColorStop(1, dark ? "#122d32" : "#e2f3f0");
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = dark ? "rgba(121,239,225,.72)" : "rgba(72,171,163,.38)";
      context.fillRect(42, 36, 112, 8);
      context.fillStyle = dark ? "rgba(177,161,255,.64)" : "rgba(107,96,186,.25)";
      context.fillRect(332, 204, 126, 7);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [dark]);
  const fresnelMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uRimColor: { value: new THREE.Color(dark ? "#65e0d4" : "#176b70") },
      uRimOpacity: { value: dark ? 0.24 : 0.38 },
    },
    vertexShader: `varying vec3 vNormalView; varying vec3 vViewDirection; void main(){ vec4 viewPosition=modelViewMatrix*vec4(position,1.0); vNormalView=normalize(normalMatrix*normal); vViewDirection=normalize(-viewPosition.xyz); gl_Position=projectionMatrix*viewPosition; }`,
    fragmentShader: `uniform vec3 uRimColor; uniform float uRimOpacity; varying vec3 vNormalView; varying vec3 vViewDirection; void main(){ float facing=abs(dot(normalize(vNormalView),normalize(vViewDirection))); float fresnel=pow(1.0-facing,2.8); gl_FragColor=vec4(uRimColor,fresnel*uRimOpacity); }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  }), [dark]);
  const faceGeometry = useMemo(() => new RoundedBoxGeometry(1.9, 1.9, 1.9, 6, 0.2), []);
  const edgeGeometry = useMemo(() => {
    return new THREE.EdgesGeometry(faceGeometry, 24);
  }, [faceGeometry]);
  useEffect(() => () => {
    faceGeometry.dispose();
    edgeGeometry.dispose();
    environment.dispose();
    fresnelMaterial.dispose();
    faceTextures.forEach((texture) => texture.dispose());
  }, [edgeGeometry, environment, faceGeometry, faceTextures, fresnelMaterial]);
  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const targetX = 0.3 + Math.sin(t * 0.13) * 0.24 + pointer.current.y * 0.16 + drag.current.rx;
    const targetY = -0.42 + t * 0.12 + pointer.current.x * 0.22 + drag.current.ry;
    const targetZ = Math.sin(t * 0.075) * 0.1 + pointer.current.x * 0.035;
    group.current.scale.setScalar(scale * (hovered ? 1.035 : 1));
    if (reducedMotion) {
      group.current.rotation.set(targetX, targetY, targetZ);
      group.current.scale.setScalar(scale * (hovered ? 1.035 : 1));
      group.current.position.y = 0;
      if (cubeMaterial.current) {
        cubeMaterial.current.color.set(hovered ? cubeHoverColor : cubeBaseColor);
        cubeMaterial.current.opacity = hovered ? cubeHoverOpacity : cubeBaseOpacity;
        cubeMaterial.current.emissive.set(hovered ? "#3dd8d0" : "#10252c");
        cubeMaterial.current.emissiveIntensity = hovered ? (dark ? 0.42 : 0.2) : 0.08;
      }
      if (hoverLight.current) hoverLight.current.intensity = hovered ? (dark ? 2.8 : 1.6) : 0;
      return;
    }
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 2.6, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 2.6, delta);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, targetZ, 2.2, delta);
    const targetScale = scale * (hovered ? 1.035 : 1);
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, targetScale, 5, delta));
    group.current.position.y = Math.sin(t * 0.52) * 0.035;
    if (cubeMaterial.current) {
      cubeMaterial.current.color.lerp(new THREE.Color(hovered ? cubeHoverColor : cubeBaseColor), 1 - Math.exp(-delta * 5));
      cubeMaterial.current.opacity = THREE.MathUtils.damp(cubeMaterial.current.opacity, hovered ? cubeHoverOpacity : cubeBaseOpacity, 5, delta);
      cubeMaterial.current.emissive.lerp(new THREE.Color(hovered ? "#3dd8d0" : "#10252c"), 1 - Math.exp(-delta * 5));
      cubeMaterial.current.emissiveIntensity = THREE.MathUtils.damp(cubeMaterial.current.emissiveIntensity, hovered ? (dark ? 0.42 : 0.2) : 0.08, 5, delta);
    }
    if (hoverLight.current) hoverLight.current.intensity = THREE.MathUtils.damp(hoverLight.current.intensity, hovered ? (dark ? 2.8 : 1.6) : 0, 5, delta);
  });

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    drag.current = { ...drag.current, active: true, pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    (event.target as CapturableTarget).setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!drag.current.active || drag.current.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    drag.current.ry += dx * 0.008;
    drag.current.rx += dy * 0.008;
    drag.current.x = event.clientX;
    drag.current.y = event.clientY;
    invalidate();
  };
  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    if (drag.current.pointerId === event.pointerId) {
      drag.current.active = false;
      (event.target as CapturableTarget).releasePointerCapture(event.pointerId);
      invalidate();
    }
  };

  return (
    <group ref={group} rotation={[0.3, -0.42, 0]}>
      <mesh geometry={faceGeometry}
        ref={cubeSurfaceRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerOver={(event) => { event.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        onClick={(event) => { event.stopPropagation(); onActivate(); }}
      >
        <meshPhysicalMaterial ref={cubeMaterial}
          color={cubeBaseColor}
          transparent
          opacity={cubeBaseOpacity}
          metalness={0.02}
          roughness={0.12}
          transmission={dark ? 0.88 : 0.96}
          thickness={dark ? 0.72 : 0.46}
          ior={1.46}
          envMap={environment}
          envMapIntensity={dark ? 0.24 : 0.12}
          clearcoat={1}
          clearcoatRoughness={0.12}
          emissive={dark ? "#071719" : "#648a88"}
          emissiveIntensity={dark ? 0.025 : 0.012}
        />
      </mesh>
      <mesh geometry={faceGeometry} scale={1.004} renderOrder={2}>
        <primitive object={fresnelMaterial} attach="material" />
      </mesh>
      <lineSegments geometry={edgeGeometry}>
        <lineBasicMaterial color={dark ? "#6ce6d2" : "#176b70"} transparent opacity={hovered ? 1 : dark ? 0.58 : 0.82} toneMapped={false} />
      </lineSegments>
      {faceTextures.map((texture, index) => {
        const placements: Array<{ position: [number, number, number]; rotation: [number, number, number] }> = [
          { position: [0, 0, 0.961], rotation: [0, 0, 0] },
          { position: [0, 0, -0.961], rotation: [0, Math.PI, 0] },
          { position: [0.961, 0, 0], rotation: [0, Math.PI / 2, 0] },
          { position: [-0.961, 0, 0], rotation: [0, -Math.PI / 2, 0] },
          { position: [0, 0.961, 0], rotation: [-Math.PI / 2, 0, 0] },
          { position: [0, -0.961, 0], rotation: [Math.PI / 2, 0, 0] },
        ];
        const placement = placements[index];
        return <mesh key={index} position={placement.position} rotation={placement.rotation}>
          <planeGeometry args={[0.88, 0.88]} />
          <meshBasicMaterial map={texture} transparent toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>;
      })}
      <pointLight ref={hoverLight} color={dark ? "#50eee0" : "#279b91"} intensity={0} distance={4.2} decay={2} position={[0, 0, 1.4]} />
    </group>
  );
}

function LabelProjector({
  anchors,
  labels,
  leaders,
  cubeSurfaceRef,
}: {
  anchors: OrbitAnchorRefs;
  labels: OrbitLabelRefs;
  leaders: OrbitLeaderRefs;
  cubeSurfaceRef: CubeSurfaceRef;
}) {
  const point = useMemo(() => new THREE.Vector3(), []);
  const worldPoint = useMemo(() => new THREE.Vector3(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  useFrame(({ camera, size }) => {
    const projected = Object.keys(anchors).map((key) => {
      const id = key as OrbitId;
      const anchor = anchors[id].current;
      const label = labels.current[id];
      if (!anchor || !label) return null;
      anchor.getWorldPosition(worldPoint);
      const distance = camera.position.distanceTo(worldPoint);
      point.copy(worldPoint).project(camera);
      ndc.set(point.x, point.y);
      raycaster.setFromCamera(ndc, camera);
      const obstruction = cubeSurfaceRef.current
        ? raycaster.intersectObject(cubeSurfaceRef.current, false)[0]
        : undefined;
      const isVisible = point.z >= -1 && point.z <= 1 && (!obstruction || obstruction.distance >= distance - 0.04);
      label.style.visibility = isVisible ? "visible" : "hidden";
      const line = leaders.current[id];
      if (line) line.style.visibility = isVisible ? "visible" : "hidden";
      return {
        id,
        label,
        x: (point.x * 0.5 + 0.5) * size.width,
        y: (-point.y * 0.5 + 0.5) * size.height,
        visible: isVisible,
      };
    });
    const items = projected.filter((item): item is NonNullable<typeof item> => item !== null && item.visible);
    const placements = items.map(({ id, label, x, y }) => {
      const placeLeft = x < size.width * 0.5;
      const offsetX = placeLeft ? -label.offsetWidth - 10 : 10;
      return { id, label, x, y, width: label.offsetWidth, height: label.offsetHeight, labelX: THREE.MathUtils.clamp(x + offsetX, 4, Math.max(4, size.width - label.offsetWidth - 4)), labelY: THREE.MathUtils.clamp(y, label.offsetHeight / 2 + 3, size.height - label.offsetHeight / 2 - 3) };
    });
    for (let pass = 0; pass < placements.length; pass += 1) {
      for (let index = 1; index < placements.length; index += 1) {
        const current = placements[index];
        for (let priorIndex = 0; priorIndex < index; priorIndex += 1) {
          const prior = placements[priorIndex];
          const overlapX = (current.width + prior.width) / 2 - Math.abs((current.labelX + current.width / 2) - (prior.labelX + prior.width / 2));
          const overlapY = (current.height + prior.height) / 2 + 4 - Math.abs(current.labelY - prior.labelY);
          if (overlapX <= 0 || overlapY <= 0) continue;
          const direction = current.labelY >= prior.labelY ? 1 : -1;
          const nextY = current.labelY + direction * overlapY;
          const minY = current.height / 2 + 3;
          const maxY = size.height - current.height / 2 - 3;
          current.labelY = nextY >= minY && nextY <= maxY ? nextY : THREE.MathUtils.clamp(current.labelY - direction * overlapY, minY, maxY);
        }
      }
    }
    placements.forEach(({ id, label, x, y, labelX, labelY }) => {
      label.dataset.side = x < size.width * 0.5 ? "left" : "right";
      label.style.transform = `translate3d(${labelX}px, ${labelY}px, 0) translate(0, -50%)`;
      label.style.opacity = "1";
      const line = leaders.current[id];
      if (line) {
        const left = labelX;
        const right = labelX + label.offsetWidth;
        const top = labelY - label.offsetHeight / 2;
        line.setAttribute("x1", `${x}`); line.setAttribute("y1", `${y}`);
        line.setAttribute("x2", `${THREE.MathUtils.clamp(x, left, right)}`);
        line.setAttribute("y2", `${THREE.MathUtils.clamp(y, top, top + label.offsetHeight)}`);
      }
    });
  });
  return null;
}

function ResponsiveCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.position.z = size.width < 460 ? 7.65 : size.width < 800 ? 7.05 : 6.55;
    camera.updateProjectionMatrix();
  }, [camera, size.width]);
  return null;
}

function IdentityScene({
  anchors,
  labels,
  leaders,
  pointer,
  activeOrbit,
  stageColor,
  dark,
  reducedMotion,
  coarsePointer,
  onCubeActivate,
}: {
  anchors: OrbitAnchorRefs;
  labels: OrbitLabelRefs;
  leaders: OrbitLeaderRefs;
  pointer: MutableRefObject<THREE.Vector2>;
  activeOrbit: OrbitId | null;
  stageColor: string;
  dark: boolean;
  reducedMotion: boolean;
  coarsePointer: boolean;
  onCubeActivate: () => void;
}) {
  const cyanLight = useRef<THREE.PointLight>(null);
  const violetLight = useRef<THREE.PointLight>(null);
  const cubeSurfaceRef = useRef<THREE.Mesh>(null);
  const mutedColor = dark ? "#c5d0df" : "#344b61";
  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    if (cyanLight.current) cyanLight.current.position.set(Math.cos(t * 0.28) * 2.6, Math.sin(t * 0.34) * 1.5, 2.5);
    if (violetLight.current) violetLight.current.position.set(Math.sin(t * 0.2) * 2.3, Math.cos(t * 0.25) * 1.75, -0.8);
  });

  return (
    <>
      <ResponsiveCamera />
      <ambientLight intensity={dark ? 0.78 : 0.48} />
      <hemisphereLight args={[dark ? "#c8f4ff" : "#eef8fb", dark ? "#17212c" : "#667d91", dark ? 0.82 : 0.42]} />
      <directionalLight position={[2.5, 3.5, 5]} intensity={dark ? 2.1 : 0.72} color={dark ? "#d9faff" : "#e7f4f7"} />
      <pointLight ref={cyanLight} color={dark ? "#59e2d4" : "#279b91"} intensity={dark ? 4.6 : 2.2} distance={9} decay={2} />
      <pointLight ref={violetLight} color={dark ? "#9282ff" : "#665bc7"} intensity={dark ? 2.2 : 1.05} distance={8} decay={2} />

      {orbits.map((orbit) => (
        <OrbitTrack
          key={orbit.id}
          orbit={orbit}
          anchorRef={anchors[orbit.id]}
          active={activeOrbit === orbit.id}
          color={activeOrbit === orbit.id ? stageColor : (dark ? "#68dbd5" : "#236d72")}
          muted={mutedColor}
          dark={dark}
          reducedMotion={reducedMotion}
          coarsePointer={coarsePointer}
        />
      ))}
      <InteractiveCube pointer={pointer} dark={dark} reducedMotion={reducedMotion} cubeSurfaceRef={cubeSurfaceRef} onActivate={onCubeActivate} />
      <LabelProjector anchors={anchors} labels={labels} leaders={leaders} cubeSurfaceRef={cubeSurfaceRef} />
    </>
  );
}

function StaticFallback({ dark }: { dark: boolean }) {
  return (
    <div className={`hero-3d-fallback${dark ? " is-dark" : ""}`} aria-hidden="true">
      <div className="hero-fallback-cube"><span>&lt;/&gt;</span></div>
      <i /><i /><i />
    </div>
  );
}

export default function HeroIdentityExperience() {
  const { theme } = useTheme();
  const [motionEnabled, setMotionEnabled] = useState(true);
  const reducedMotion = !motionEnabled;
  const dark = theme === "dark";
  const stageRef = useRef<HTMLDivElement>(null);
  const pointer = useRef(new THREE.Vector2());
  const [visible, setVisible] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [smallViewport, setSmallViewport] = useState(false);
  const [hoveredOrbit, setHoveredOrbit] = useState<OrbitId | null>(null);
  const [pinnedOrbit, setPinnedOrbit] = useState<OrbitId | null>(null);
  const [activeStage, setActiveStage] = useState<StageId>("signal");
  const interacted = useRef(false);
  const anchors = {
    security: useRef<THREE.Group>(null),
    build: useRef<THREE.Group>(null),
    independent: useRef<THREE.Group>(null),
  } satisfies OrbitAnchorRefs;
  const labelRefs = useRef<Record<OrbitId, HTMLButtonElement | null>>({ security: null, build: null, independent: null });
  const leaderRefs = useRef<Record<OrbitId, SVGLineElement | null>>({ security: null, build: null, independent: null });
  const activeOrbit = hoveredOrbit ?? pinnedOrbit;
  const accent = dark ? "#aaa4ff" : "#414aa8";
  const signal = dark ? "#6ce6d2" : "#176b62";
  const stageColor = activeStage === "threat" ? (dark ? "#b5a3ff" : "#625bbd") : activeStage === "response" ? signal : (dark ? "#83cfff" : "#357da4");

  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    let intersecting = false;
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      setVisible(intersecting && document.visibilityState === "visible");
    }, { threshold: 0.04 });
    observer.observe(element);
    const handleVisibility = () => setVisible(intersecting && document.visibilityState === "visible");
    document.addEventListener("visibilitychange", handleVisibility);
    const pointerMedia = window.matchMedia("(pointer: coarse)");
    const syncPointer = () => setCoarsePointer(pointerMedia.matches);
    const syncViewport = () => setSmallViewport(window.innerWidth <= 600);
    syncPointer();
    syncViewport();
    pointerMedia.addEventListener("change", syncPointer);
    window.addEventListener("resize", syncViewport, { passive: true });
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      pointerMedia.removeEventListener("change", syncPointer);
      window.removeEventListener("resize", syncViewport);
    };
  }, []);

  useEffect(() => {
    const element = stageRef.current;
    if (!element || reducedMotion) return;
    const context = gsap.context(() => {
      gsap.fromTo(element, { autoAlpha: 0, scale: 0.985 }, { autoAlpha: 1, scale: 1, duration: 0.55, ease: "power2.out", clearProps: "all" });
      gsap.fromTo(element.parentElement?.querySelectorAll(".identity-visual-heading, .identity-sequence-button, .identity-visual-index") ?? [], { autoAlpha: 0, y: 5 }, { autoAlpha: 1, y: 0, duration: 0.28, stagger: 0.05, delay: 0.08, ease: "power2.out", clearProps: "all" });
    }, element.parentElement ?? element);
    return () => context.revert();
  }, [reducedMotion]);

  useEffect(() => {
    if (!motionEnabled || !visible) return;
    const timer = window.setInterval(() => {
      if (interacted.current) return;
      setActiveStage((current) => stages[(stages.indexOf(current) + 1) % stages.length]);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [motionEnabled, visible]);

  const handleStagePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointer.current.set(
      THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1),
      THREE.MathUtils.clamp(-((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1),
    );
  };
  const setOrbitLabelRef = useCallback((id: OrbitId, node: HTMLButtonElement | null) => {
    labelRefs.current[id] = node;
  }, []);
  const selectStage = (id: StageId) => {
    interacted.current = true;
    setActiveStage(id);
  };

  return (
    <div className="hero-identity-visual" role="group" aria-label="Interactive three-dimensional digital identity" aria-describedby="hero-identity-help">
      <div className="identity-visual-heading"><span className="identity-status-led" /> ROHAN SINGH <small>SECURITY · SOFTWARE · SYSTEMS</small></div>
      <div ref={stageRef} className="hero-3d-stage" onPointerMove={handleStagePointer} onPointerLeave={() => pointer.current.set(0, 0)}>
        <Canvas
          aria-hidden="true"
          camera={{ position: [0, 0, 6.55], fov: 40 }}
          dpr={coarsePointer || smallViewport ? 1 : [1, 1.45]}
          frameloop={!motionEnabled || !visible ? "demand" : "always"}
          gl={{ alpha: true, antialias: !coarsePointer && !smallViewport, powerPreference: "low-power" }}
          fallback={<StaticFallback dark={dark} />}
        >
          <IdentityScene
            anchors={anchors}
            labels={labelRefs}
            leaders={leaderRefs}
            pointer={pointer}
            activeOrbit={activeOrbit}
            stageColor={stageColor}
            dark={dark}
            reducedMotion={!motionEnabled || !visible}
            coarsePointer={coarsePointer || smallViewport}
            onCubeActivate={() => selectStage(stages[(stages.indexOf(activeStage) + 1) % stages.length])}
          />
        </Canvas>
        <svg className="hero-orbit-leaders" aria-hidden="true">
          {orbits.map((orbit) => <line key={orbit.id} ref={(node) => { leaderRefs.current[orbit.id] = node; }} />)}
        </svg>
        <div className="hero-orbit-labels" aria-label="Focus an orbital system">
          {orbits.map((orbit) => (
            <button
              key={orbit.id}
              ref={(node) => setOrbitLabelRef(orbit.id, node)}
              className={`identity-orbit-label${activeOrbit === orbit.id ? " is-active" : ""}`}
              type="button"
              aria-pressed={pinnedOrbit === orbit.id}
              onPointerEnter={() => setHoveredOrbit(orbit.id)}
              onPointerLeave={() => setHoveredOrbit(null)}
              onFocus={() => setHoveredOrbit(orbit.id)}
              onBlur={() => setHoveredOrbit(null)}
              onClick={() => setPinnedOrbit((current) => current === orbit.id ? null : orbit.id)}
            >
              <i>{orbit.number}</i> {orbit.label}
            </button>
          ))}
        </div>
      </div>
      <div className="identity-visual-footer">
        <div className="identity-threat-sequence" role="group" aria-label="Threat to response sequence">
          {stages.map((stage, index) => (
            <span className="identity-sequence-step" key={stage}>
              <button
                type="button"
                className={`identity-sequence-button${activeStage === stage ? " is-active" : ""}`}
                aria-pressed={activeStage === stage}
                onPointerEnter={() => selectStage(stage)}
                onFocus={() => selectStage(stage)}
                onClick={() => selectStage(stage)}
              >{stage.toUpperCase()}</button>
              {index < stages.length - 1 && <span className="identity-sequence-link" aria-hidden="true">→</span>}
            </span>
          ))}
        </div>
        <button
          className="identity-motion-toggle"
          type="button"
          aria-pressed={motionEnabled}
          aria-label={motionEnabled ? "Pause cube and orbit motion" : "Enable cube and orbit motion"}
          title={motionEnabled ? "Pause cube and orbit motion" : "Enable cube and orbit motion"}
          onClick={() => setMotionEnabled((enabled) => !enabled)}
        >{motionEnabled ? "Ⅱ" : "▶"}<span>{motionEnabled ? "PAUSE" : "MOTION"}</span></button>
        <span className="identity-visual-index">ROHAN / 01</span>
      </div>
      <span className="sr-only" aria-live="polite">{activeStage.toUpperCase()} stage active</span>
      <span id="hero-identity-help" className="sr-only">Drag or touch the cube to rotate it. Use the orbital buttons to highlight a system, choose Threat, Signal, or Response to change the scene lighting, and use the motion button to pause or enable continuous cube and orbit movement.</span>
    </div>
  );
}
