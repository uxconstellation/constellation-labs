import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * The Labs mark in real 3D: a glass test tube with orange liquid, the Constellation
 * star floating inside, and a satin ring orbiting on the diagonal.
 * Tilts toward the cursor. Renders a single still frame when motion is reduced.
 */
export default function GlassMarkScene({ onReady, reduceMotion }: { onReady?: () => void; reduceMotion?: boolean }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    el.appendChild(renderer.domElement);
    // setSize(w, h, false) leaves CSS size alone, so pin it or retina screens show the canvas at 2x.
    Object.assign(renderer.domElement.style, { display: "block", width: "100%", height: "100%" });

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0, 9.5);

    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(3, 4, 5);
    scene.add(key, new THREE.AmbientLight(0xfff6ee, 0.35));

    const mark = new THREE.Group();
    scene.add(mark);

    // Test tube: lathe profile with a rounded bottom and a lip at the open top.
    const R = 0.62, H = 3.1;
    const outer: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const a = (Math.PI / 2) * (i / 24);
      outer.push(new THREE.Vector2(Math.sin(a) * R, -H / 2 + R - Math.cos(a) * R));
    }
    outer.push(new THREE.Vector2(R, H / 2 - 0.12), new THREE.Vector2(R + 0.09, H / 2 - 0.06), new THREE.Vector2(R + 0.09, H / 2), new THREE.Vector2(R - 0.04, H / 2));
    const glass = new THREE.Mesh(
      new THREE.LatheGeometry(outer, 96),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff, transmission: 1, thickness: 0.12, roughness: 0.03, ior: 1.3,
        clearcoat: 1, clearcoatRoughness: 0.05, side: THREE.FrontSide, envMapIntensity: 1.1,
        attenuationColor: new THREE.Color(0xd9ecea), attenuationDistance: 3,
      }),
    );

    // Glass on white is nearly invisible, so give it what real glass shows: bright edges.
    const tubeGeo = glass.geometry;
    const rim = new THREE.Mesh(
      tubeGeo,
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uColor: { value: new THREE.Color(0x173f3f) } },
        vertexShader: `varying vec3 vN; varying vec3 vV;
          void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
        fragmentShader: `uniform vec3 uColor; varying vec3 vN; varying vec3 vV;
          void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.4); gl_FragColor = vec4(uColor, f * 0.75); }`,
      }),
    );
    rim.scale.setScalar(1.002);
    const inner = new THREE.Mesh(tubeGeo, new THREE.MeshBasicMaterial({ color: 0xe9f1ef, transparent: true, opacity: 0.35, side: THREE.BackSide, depthWrite: false }));

    // Liquid: a slightly smaller rounded volume filling the bottom third.
    const fill = -H / 2 + 1.05;
    const lr = R - 0.06;
    const liquidPts: THREE.Vector2[] = [new THREE.Vector2(0, -H / 2 + 0.06)];
    for (let i = 0; i <= 20; i++) {
      const a = (Math.PI / 2) * (i / 20);
      liquidPts.push(new THREE.Vector2(Math.sin(a) * lr, -H / 2 + 0.06 + lr - Math.cos(a) * lr));
    }
    liquidPts.push(new THREE.Vector2(lr, fill), new THREE.Vector2(0, fill));
    const liquidMat = new THREE.MeshPhysicalMaterial({ color: 0xfe6e36, emissive: 0xfe6e36, emissiveIntensity: 0.28, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08, sheen: 0.4, sheenColor: new THREE.Color(0xffb08c) });
    const liquid = new THREE.Mesh(new THREE.LatheGeometry(liquidPts, 64), liquidMat);

    // Bubbles rising through the liquid.
    const bubbleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, transparent: true, opacity: 0.7 });
    const bubbles = Array.from({ length: 7 }, (_, i) => {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.03 + (i % 3) * 0.015, 16, 16), bubbleMat);
      b.userData = { x: (Math.random() - 0.5) * 0.7, z: (Math.random() - 0.5) * 0.5, speed: 0.25 + Math.random() * 0.35, offset: Math.random() };
      return b;
    });

    // The Constellation star: four points with concave sides, extruded and bevelled.
    const s = new THREE.Shape();
    const k = 0.1;
    s.moveTo(0, 1);
    s.bezierCurveTo(k, k, k, k, 1, 0);
    s.bezierCurveTo(k, -k, k, -k, 0, -1);
    s.bezierCurveTo(-k, -k, -k, -k, -1, 0);
    s.bezierCurveTo(-k, k, -k, k, 0, 1);
    const starGeo = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.03, bevelSegments: 4, curveSegments: 24 });
    starGeo.center();
    const star = new THREE.Mesh(starGeo, new THREE.MeshPhysicalMaterial({ color: 0x1d4a4a, roughness: 0.28, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.1 }));
    star.scale.setScalar(0.48);

    const tube = new THREE.Group();
    tube.add(inner, glass, liquid, ...bubbles, rim);
    tube.rotation.z = -Math.PI / 4; // same lean as the Constellation capsule
    mark.add(tube, star);

    // Satin ring orbiting on the diagonal.
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.85, 0.06, 32, 220),
      new THREE.MeshPhysicalMaterial({ color: 0xf6efe3, metalness: 0.25, roughness: 0.38, sheen: 1, sheenColor: new THREE.Color(0xffffff), sheenRoughness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.2, envMapIntensity: 1.4 }),
    );
    const ringPivot = new THREE.Group();
    ringPivot.rotation.set(1.22, 0.0, 0.42);
    ringPivot.add(ring);
    mark.add(ringPivot);
    mark.position.y = 0.05;

    // Size and cursor.
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = w / h < 0.9 ? 11 : 9.5;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    const target = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0, visible = true;
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    io.observe(el);
    const clock = new THREE.Clock();

    const frame = () => {
      const t = clock.getElapsedTime();
      mark.rotation.y += (target.x * 0.35 - mark.rotation.y) * 0.05;
      mark.rotation.x += (target.y * 0.2 - mark.rotation.x) * 0.05;
      ring.rotation.z = t * 0.25;
      ringPivot.rotation.y = Math.sin(t * 0.3) * 0.12;
      star.rotation.y = Math.sin(t * 0.7) * 0.6;
      star.position.y = Math.sin(t * 0.9) * 0.08 + 0.15;
      tube.position.y = Math.sin(t * 0.6) * 0.05;
      bubbles.forEach((b) => {
        const { x, z, speed, offset } = b.userData as { x: number; z: number; speed: number; offset: number };
        const p = (t * speed + offset) % 1;
        b.position.set(x * (1 - p * 0.3), -H / 2 + 0.25 + p * 0.75, z);
        b.visible = p < 0.97;
      });
      renderer.render(scene, camera);
    };

    if (reduceMotion) {
      frame();
      onReady?.();
    } else {
      let first = true;
      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (!visible) return;
        frame();
        if (first) { first = false; onReady?.(); }
      };
      loop();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        }
      });
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [onReady, reduceMotion]);

  return <div ref={host} className="absolute inset-0" aria-hidden="true" />;
}
