import React, { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function OrbitRing({ radius }) {
  const points = useMemo(() => {
    const p = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      p.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return p;
  }, [radius]);

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial attach="material" color="white" transparent opacity={0.2} />
    </line>
  );
}

function Ring({ radius, innerRadius }) {
  const geometry = useMemo(() => new THREE.RingGeometry(innerRadius, radius, 64), [innerRadius, radius]);
  const material = useMemo(() => new THREE.MeshBasicMaterial({
    color: "white",
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
  }), []);

  return (
    <mesh geometry={geometry} material={material} rotation-x={-Math.PI / 2} />
  );
}

function Planet({ onSetPlanet, distance, size, radius, speed, textureUrl, hasRings = false }) {
  const ref = useRef();
  const texture = useMemo(() => new THREE.TextureLoader().load(textureUrl), [textureUrl]);
  const angle = useRef(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    angle.current += delta * speed;
    const x = Math.cos(angle.current) * distance;
    const z = Math.sin(angle.current) * distance;
    ref.current.position.set(x, 0, z);
    ref.current.rotation.y += 0.01;
  });

  return (
    <>
      <OrbitRing radius={distance} />
      <mesh
        onClick={() => onSetPlanet({
          size: radius,
          speed,
          distance,
          name: textureUrl.split('/').pop().split('.')[0].replace('2k_', '')
        })}
        ref={ref}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial map={texture} />
        {hasRings && <Ring radius={2.5} innerRadius={2} />}
      </mesh>
    </>
  );
}

function PlanetDetails({ planet }) {
  if (!planet) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '80px',
      left: '20px',
      backgroundColor: '#1a1a1a',
      padding: '5px 10px',
      borderRadius: '5px',
      zIndex: 1,
    }}>
      <h3 style={{ marginTop: 0, textTransform: 'capitalize' }}>{planet.name}</h3>
      <p><strong>Distance from Sun:</strong> {planet.distance} AU</p>
      <p><strong>Size:</strong> {planet.size} Earth radii</p>
      <p><strong>Orbital Period:</strong> {(1 / planet.speed).toFixed(2)} Earth years</p>
    </div>
  );
}

function Sun() {
  const texture = useMemo(() => new THREE.TextureLoader().load("/textures/2k_sun.jpg"), []);

  return (
    <mesh>
      <sphereGeometry args={[3, 32, 32]} />
      <meshStandardMaterial map={texture} />
      <pointLight intensity={2} />
    </mesh>
  );
}

function App() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState(null);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play();
      audioRef.current.volume = 0.5;
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <button onClick={() => setIsPlaying(!isPlaying)} style={{ position: 'absolute', top: 20, left: 20, zIndex: 1 }}>
        {isPlaying ? "Pause" : "Play" } Theme Song
      </button>
      <audio ref={audioRef} loop>
        <source src="https://ia801208.us.archive.org/0/items/InterstellarMainThemeExtraExtendedSoundtrackByHansZimmer/Interstellar%20Main%20Theme%20-%20Extra%20Extended%20-%20Soundtrack%20by%20Hans%20Zimmer.mp3" type="audio/mp3" />
      </audio>
      <Canvas camera={{ position: [0, 10, 30], fov: 60 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        <OrbitControls enablePan={false} />
        <Sun />
        <Planet onSetPlanet={setSelectedPlanet} radius={0.38} distance={5} speed={2} textureUrl="/textures/2k_mercury.jpg" />
        <Planet onSetPlanet={setSelectedPlanet} radius={0.95} distance={7} speed={1.6} textureUrl="/textures/2k_venus.jpg" />
        <Planet onSetPlanet={setSelectedPlanet} radius={1} distance={10} speed={1} textureUrl="/textures/2k_earth.jpg" />
        <Planet onSetPlanet={setSelectedPlanet} radius={0.53} distance={13} speed={0.8} textureUrl="/textures/2k_mars.jpg" />
        <Planet onSetPlanet={setSelectedPlanet} radius={11.2} distance={17} speed={0.4} textureUrl="/textures/2k_jupiter.jpg" />
        <Planet onSetPlanet={setSelectedPlanet} radius={9.4} distance={21} speed={0.3} textureUrl="/textures/2k_saturn.jpg" hasRings />
        <Planet onSetPlanet={setSelectedPlanet} radius={3.8} distance={29} speed={0.1} textureUrl="/textures/2k_neptune.jpg" />
      </Canvas>
      <PlanetDetails planet={selectedPlanet} />
    </div>
  );
}

export default App;