import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'

const PRIMARY_GLOW = '#38AAF8'
const SECONDARY_GLOW = '#20D2BA'
const TERTIARY = '#A78BFA'
const LIGHT_BG = '#f5f7fa'
const DARK_BG = '#08091c'
const DARK_SURFACE = '#131e3f'
const LIGHT_SURFACE = '#dde5f2'
const LIGHT_INDIGO_TINT = '#bfcfee'
const RIM_DARK = '#7C3AED'
const RIM_LIGHT = '#6366f1'

/** Fresnel rim highlight */
const fresnelVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`
const fresnelFragment = /* glsl */ `
  uniform vec3 rimColor;
  uniform float rimPower;
  uniform float opacity;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), rimPower);
    gl_FragColor = vec4(rimColor, fresnel * opacity);
  }
`

function FresnelRim({ isLight }: { isLight: boolean }) {
  const uniforms = useMemo(
    () => ({
      rimColor: { value: new THREE.Color(isLight ? RIM_LIGHT : RIM_DARK) },
      rimPower: { value: 2.4 },
      opacity: { value: isLight ? 0.14 : 0.22 },
    }),
    [isLight]
  )
  return (
    <mesh>
      <sphereGeometry args={[0.86, 64, 64]} />
      <shaderMaterial
        vertexShader={fresnelVertex}
        fragmentShader={fresnelFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

/** Double Fresnel for richer edge glow */
function FresnelRimOuter({ isLight }: { isLight: boolean }) {
  const uniforms = useMemo(
    () => ({
      rimColor: { value: new THREE.Color(isLight ? '#a5b4fc' : PRIMARY_GLOW) },
      rimPower: { value: 3.5 },
      opacity: { value: isLight ? 0.07 : 0.12 },
    }),
    [isLight]
  )
  return (
    <mesh>
      <sphereGeometry args={[0.92, 48, 48]} />
      <shaderMaterial
        vertexShader={fresnelVertex}
        fragmentShader={fresnelFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

function InnerCoreGlow({ isLight }: { isLight: boolean }) {
  const mesh = useRef<THREE.Mesh>(null)
  const color = isLight ? LIGHT_INDIGO_TINT : PRIMARY_GLOW
  useFrame((state) => {
    if (!mesh.current?.material || !(mesh.current.material instanceof THREE.MeshBasicMaterial)) return
    const t = state.clock.elapsedTime * 0.28
    const breath = 0.06 + 0.09 * Math.sin(t)
    mesh.current.material.opacity = Math.min(0.18, breath)
  })
  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.28, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.1}
        depthWrite={false}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

function TechGridOverlay({ isLight }: { isLight: boolean }) {
  return (
    <mesh>
      <sphereGeometry args={[0.855, 36, 28]} />
      <meshBasicMaterial
        color={isLight ? '#64748b' : PRIMARY_GLOW}
        transparent
        opacity={isLight ? 0.035 : 0.03}
        wireframe
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function GlassSphere({ isLight, hoverRef }: { isLight: boolean; hoverRef: React.MutableRefObject<number> }) {
  const mesh = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null)

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime
    mesh.current.rotation.y = t * 0.05
    mesh.current.rotation.x = Math.sin(t * 0.11) * 0.035
    mesh.current.rotation.z = Math.sin(t * 0.07) * 0.018
  })

  useFrame(() => {
    if (!materialRef.current) return
    const h = hoverRef.current
    const baseEmissive = isLight ? 0.025 : 0.06
    const baseOpacity = isLight ? 0.42 : 0.16
    materialRef.current.emissiveIntensity = baseEmissive + h * 0.03
    materialRef.current.opacity = Math.min(1, baseOpacity + h * 0.04)
  })

  const baseColor = isLight ? LIGHT_SURFACE : DARK_SURFACE
  const emissiveColor = isLight ? LIGHT_INDIGO_TINT : PRIMARY_GLOW

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.85, 64, 64]} />
      <meshPhysicalMaterial
        ref={materialRef}
        color={baseColor}
        transparent
        opacity={isLight ? 0.42 : 0.16}
        transmission={isLight ? 0.78 : 0.88}
        thickness={0.4}
        roughness={0.06}
        metalness={isLight ? 0.04 : 0.08}
        envMapIntensity={isLight ? 0.7 : 0.6}
        emissive={new THREE.Color(emissiveColor)}
        emissiveIntensity={isLight ? 0.025 : 0.06}
        clearcoat={0.22}
        clearcoatRoughness={0.1}
        ior={1.6}
      />
    </mesh>
  )
}

/** Dual rotating energy rings */
function EnergyRings({ isLight }: { isLight: boolean }) {
  const ring1 = useRef<THREE.Mesh>(null)
  const ring2 = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ring1.current) {
      ring1.current.rotation.z = t * 0.04
      ring1.current.rotation.x = Math.sin(t * 0.15) * 0.15
      const mat = ring1.current.material as THREE.MeshBasicMaterial
      if (mat) mat.opacity = 0.12 + 0.05 * Math.sin(t * 0.38)
    }
    if (ring2.current) {
      ring2.current.rotation.z = -t * 0.035
      ring2.current.rotation.y = t * 0.08
      const mat = ring2.current.material as THREE.MeshBasicMaterial
      if (mat) mat.opacity = 0.08 + 0.04 * Math.sin(t * 0.28 + 1.2)
    }
  })
  return (
    <>
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.04, 0.008, 16, 80]} />
        <meshBasicMaterial
          color={PRIMARY_GLOW}
          transparent
          opacity={isLight ? 0.09 : 0.14}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 3, 0.5, 0]}>
        <torusGeometry args={[1.08, 0.005, 12, 64]} />
        <meshBasicMaterial
          color={SECONDARY_GLOW}
          transparent
          opacity={isLight ? 0.06 : 0.09}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}

function OuterDataLines({ isLight, hoverRef }: { isLight: boolean; hoverRef: React.MutableRefObject<number> }) {
  const lineRef = useRef<THREE.Line>(null)
  const radius = 0.93
  const curves = useMemo(() => {
    const pts: number[] = []
    for (let i = 0; i < 3; i++) {
      const t = (i / 3) * Math.PI * 2
      for (let j = 0; j <= 8; j++) {
        const u = (j / 8) * Math.PI * 2 + t * 0.3
        pts.push(
          Math.cos(u) * radius + (Math.random() - 0.5) * 0.05,
          Math.sin(j * 0.4) * 0.22,
          Math.sin(u) * radius + (Math.random() - 0.5) * 0.05
        )
      }
    }
    return new Float32Array(pts)
  }, [])

  const lineOpacity = isLight ? 0.2 : 0.14
  useFrame((state) => {
    if (lineRef.current?.material && lineRef.current.material instanceof THREE.LineBasicMaterial) {
      const t = state.clock.elapsedTime * 0.3
      const pulse = 0.65 + 0.35 * Math.sin(t)
      const h = hoverRef.current
      lineRef.current.material.opacity = Math.min(0.32, (lineOpacity + h * 0.07) * pulse)
    }
  })

  return (
    <group>
      <line ref={lineRef as any}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={curves.length / 3} array={curves} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color={PRIMARY_GLOW} transparent opacity={lineOpacity} />
      </line>
    </group>
  )
}

function NeuralCore({ isLight }: { isLight: boolean }) {
  const lineRef = useRef<THREE.Line>(null)
  const nodesRef = useRef<THREE.Group>(null)
  const nodeCount = 14
  const nodes = useMemo(() => {
    const seed = 0.5
    return Array.from({ length: nodeCount }, (_, i) => {
      const t = (i / nodeCount) * Math.PI * 2 + seed
      const u = Math.acos(2 * (i / nodeCount) - 1) - Math.PI / 2
      return new THREE.Vector3(
        Math.cos(u) * Math.cos(t) * 0.46,
        Math.sin(u) * 0.46,
        Math.cos(u) * Math.sin(t) * 0.46
      )
    })
  }, [])
  const pairs = useMemo(() => {
    const p: [number, number][] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 0.5) p.push([i, j])
      }
    }
    return p
  }, [nodes])
  const linePositions = useMemo(
    () =>
      new Float32Array(
        pairs.flatMap(([a, b]) => [
          nodes[a].x, nodes[a].y, nodes[a].z,
          nodes[b].x, nodes[b].y, nodes[b].z,
        ])
      ),
    [pairs, nodes]
  )
  const lineOpacity = isLight ? 0.48 : 0.42

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.45
    if (lineRef.current?.material && lineRef.current.material instanceof THREE.LineBasicMaterial) {
      const pulse = 0.45 + 0.5 * Math.sin(t) * Math.sin(t * 0.65)
      lineRef.current.material.opacity = Math.max(0.15, pulse * lineOpacity)
    }
    if (nodesRef.current) {
      nodesRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
          const pulse = 0.42 + 0.52 * Math.sin(t + i * 0.55) ** 2
          child.material.opacity = Math.max(0.18, pulse * (isLight ? 0.62 : 0.58))
          const bright = i % 3 === 0 ? SECONDARY_GLOW : PRIMARY_GLOW
          child.material.color.setStyle(bright)
        }
      })
    }
  })

  return (
    <group>
      <line ref={lineRef as any}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={linePositions.length / 3} array={linePositions} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color={PRIMARY_GLOW} transparent opacity={lineOpacity} />
      </line>
      <group ref={nodesRef}>
        {nodes.map((pos, i) => (
          <mesh key={i} position={[pos.x, pos.y, pos.z]}>
            <sphereGeometry args={[0.025, 10, 10]} />
            <meshBasicMaterial color={i % 3 === 0 ? SECONDARY_GLOW : PRIMARY_GLOW} transparent opacity={isLight ? 0.62 : 0.58} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function ParticleOrbitRing({ isLight, enabled }: { isLight: boolean; enabled: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const count = 100
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3)
    const r = 1.02
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2
      const scatter = (Math.random() - 0.5) * 0.04
      p[i * 3] = Math.cos(t) * r + scatter
      p[i * 3 + 1] = scatter * 0.5
      p[i * 3 + 2] = Math.sin(t) * r + scatter
    }
    return p
  }, [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.018
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.1
      const mat = ref.current.material as THREE.PointsMaterial
      if (mat) mat.opacity = 0.05 + 0.03 * Math.sin(state.clock.elapsedTime * 0.28)
    }
  })

  if (!enabled) return null
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.014}
        color={isLight ? LIGHT_INDIGO_TINT : SECONDARY_GLOW}
        transparent
        opacity={0.06}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

function DataPanel({ chartType, offset }: { chartType: 'line' | 'bar' | 'kpi'; offset: number }) {
  const group = useRef<THREE.Group>(null)
  const { camera } = useThree()
  useFrame((state) => {
    if (group.current) {
      const t = state.clock.elapsedTime * 0.13 + offset
      group.current.position.x = Math.cos(t) * 1.38
      group.current.position.z = Math.sin(t) * 1.38
      group.current.position.y = Math.sin(t * 0.65) * 0.18
      group.current.quaternion.copy(camera.quaternion)
    }
  })
  const linePoints: [number, number, number][] =
    chartType === 'line'
      ? [[0, 0.3, 0], [0.25, 0.12, 0], [0.5, -0.04, 0], [0.75, 0.22, 0], [1, 0.08, 0]]
      : []
  const barSegments: [number, number, number][][] =
    chartType === 'bar'
      ? [
        [[0.1, 0, 0], [0.1, 0.38, 0]],
        [[0.35, 0, 0], [0.35, 0.22, 0]],
        [[0.6, 0, 0], [0.6, 0.34, 0]],
        [[0.85, 0, 0], [0.85, 0.18, 0]],
      ]
      : []

  return (
    <group ref={group}>
      <mesh>
        <planeGeometry args={[0.52, 0.34]} />
        <meshBasicMaterial
          color={DARK_BG}
          transparent
          opacity={0.72}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineLoop position={[0, 0, 0.02]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={4}
            array={new Float32Array([0.26, 0.17, 0, -0.26, 0.17, 0, -0.26, -0.17, 0, 0.26, -0.17, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={PRIMARY_GLOW} transparent opacity={0.3} />
      </lineLoop>
      <group position={[-0.22, 0, 0.01]} scale={[0.2, 0.2, 1]}>
        {chartType === 'line' && <Line points={linePoints} color={PRIMARY_GLOW} lineWidth={1.2} transparent opacity={0.9} />}
        {chartType === 'bar' && barSegments.map((seg, i) => (
          <Line key={i} points={seg} color={i % 2 === 0 ? PRIMARY_GLOW : SECONDARY_GLOW} lineWidth={1} transparent opacity={0.85} />
        ))}
        {chartType === 'kpi' && (
          <group>
            <mesh position={[0.5, 0.1, 0]}><planeGeometry args={[0.15, 0.06]} /><meshBasicMaterial color={SECONDARY_GLOW} transparent opacity={0.9} /></mesh>
            <mesh position={[0.5, -0.05, 0]}><planeGeometry args={[0.08, 0.04]} /><meshBasicMaterial color={PRIMARY_GLOW} transparent opacity={0.7} /></mesh>
          </group>
        )}
      </group>
    </group>
  )
}

function GroundShadow({ isLight }: { isLight: boolean }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.0, 0]}>
      <circleGeometry args={[1.2, 48]} />
      <meshBasicMaterial
        color={isLight ? LIGHT_BG : DARK_BG}
        transparent
        opacity={isLight ? 0.06 : 0.22}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

function ParticleField({ isLight }: { isLight: boolean }) {
  const points = useRef<THREE.Points>(null)
  const count = 200
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 7
      p[i * 3 + 1] = (Math.random() - 0.5) * 7
      p[i * 3 + 2] = (Math.random() - 0.5) * 5
    }
    return p
  }, [])
  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.015
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.03
    }
  })
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        color={PRIMARY_GLOW}
        transparent
        opacity={isLight ? 0.12 : 0.18}
        sizeAttenuation
      />
    </points>
  )
}

function Scene({ theme, isMobile }: { theme: 'dark' | 'light'; isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const pl1 = useRef<THREE.PointLight>(null)
  const pl2 = useRef<THREE.PointLight>(null)
  const pl3 = useRef<THREE.PointLight>(null)
  const pl4 = useRef<THREE.PointLight>(null)
  const { pointer } = useThree()
  const isLight = theme === 'light'
  const fogColor = isLight ? LIGHT_BG : DARK_BG
  const fogNear = 2.5
  const fogFar = isLight ? 5.0 : 5.5

  const pointerRef = useRef(new THREE.Vector2(0, 0))
  const hoverRef = useRef(0)

  useFrame(() => {
    pointerRef.current.lerp(pointer, 0.06)
    const dist = Math.sqrt(pointerRef.current.x ** 2 + pointerRef.current.y ** 2)
    const targetHover = isMobile ? 0 : Math.max(0, 1 - dist * 2.2)
    hoverRef.current += (targetHover - hoverRef.current) * 0.05
    const h = hoverRef.current

    if (pl1.current) pl1.current.intensity = isLight ? 0.32 : 0.42 + h * 0.08
    if (pl2.current) pl2.current.intensity = isLight ? 0.2 : 0.26 + h * 0.05
    if (pl3.current) pl3.current.intensity = isLight ? 0.32 : 0.5 + h * 0.06
    if (pl4.current) pl4.current.intensity = isLight ? 0.1 : 0.18 + h * 0.04

    if (groupRef.current) {
      const targetX = pointer.y * 0.12
      const targetY = pointer.x * 0.12
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.045
      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.045
      const scale = 1 + h * 0.018
      groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.06)
    }
  })

  return (
    <>
      <fog attach="fog" args={[fogColor, fogNear, fogFar]} />
      <ambientLight intensity={isLight ? 0.55 : 0.35} />
      <directionalLight position={[4, 5, 5]} intensity={isLight ? 1.1 : 1.15} />
      <pointLight ref={pl1} position={[-2.5, 2.5, 3.5]} intensity={isLight ? 0.32 : 0.42} color={PRIMARY_GLOW} />
      <pointLight ref={pl2} position={[2.5, -1.5, 2.5]} intensity={isLight ? 0.2 : 0.26} color={SECONDARY_GLOW} />
      <pointLight ref={pl3} position={[-1.2, 0.8, -2]} intensity={isLight ? 0.32 : 0.5} color={TERTIARY} />
      <pointLight ref={pl4} position={[1.5, 2, -1.5]} intensity={isLight ? 0.1 : 0.18} color={SECONDARY_GLOW} />
      <ParticleField isLight={isLight} />
      <group ref={groupRef} position={[0, 0, 0]}>
        <EnergyRings isLight={isLight} />
        <OuterDataLines isLight={isLight} hoverRef={hoverRef} />
        <GroundShadow isLight={isLight} />
        <FresnelRimOuter isLight={isLight} />
        <FresnelRim isLight={isLight} />
        <InnerCoreGlow isLight={isLight} />
        <TechGridOverlay isLight={isLight} />
        <GlassSphere isLight={isLight} hoverRef={hoverRef} />
        <NeuralCore isLight={isLight} />
        <ParticleOrbitRing isLight={isLight} enabled={!isMobile} />
        <DataPanel chartType="line" offset={0} />
        <DataPanel chartType="bar" offset={1.2} />
        <DataPanel chartType="kpi" offset={2.4} />
        <DataPanel chartType="line" offset={3.8} />
        <DataPanel chartType="bar" offset={5.1} />
      </group>
    </>
  )
}

export default function Hero3D({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)')
    const fn = () => setIsMobile(mql.matches)
    fn()
    mql.addEventListener('change', fn)
    return () => mql.removeEventListener('change', fn)
  }, [])

  return (
    <div className="hero-3d-canvas-wrapper absolute inset-0 z-0 overflow-hidden">
      {typeof window !== 'undefined' && (
        <Canvas
          camera={{ position: [0, 0, 3.0], fov: 44 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
        >
          <Scene theme={theme} isMobile={isMobile} />
        </Canvas>
      )}
    </div>
  )
}
