/**
 * Playground registry — frontier research instruments and computational laboratories.
 * Some are grounded in real shipped apps (isGrounded: true), while others
 * are independent research-grade instruments — numerically rigorous, with full
 * method, equations, and limitations disclosed.
 */

export type PlaygroundStatus = 'live' | 'planned';

export interface PlaygroundEntry {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  /** Key into pillarMeta (trends.ts) — reuses the same 6-pillar vocabulary as gear/trends. */
  pillarHint?: string;
  status: PlaygroundStatus;
  
  isGrounded?: boolean;
  relatedApp?: string;
  relatedAppUrl?: string;
  /** Blog post id in src/content/blog, if one exists yet. */
  relatedFieldNote?: string;
}

// Individual acoustic toolbox tools are listed on the toolbox landing page
// (/playground/multiphysics-dsp-lab), not as top-level playground cards.
export const playground: PlaygroundEntry[] = [
  {
    slug: 'quaternion-euler-converter',
    title: 'Quaternion ↔ Euler Converter',
    tagline: 'The exact head-orientation math running inside MotionLink',
    description:
      'Convert between quaternion attitude and yaw/pitch/roll both directions, with a live orientation preview — the same round-trip-verified formulas (and the gimbal-lock clamp fix) from the CMHeadphoneMotionManager field note.',
    pillarHint: 'ios-craft',
    isGrounded: true,
    relatedApp: 'MotionLink',
    relatedAppUrl: 'https://makersportal.com/apps/motionlink',
    relatedFieldNote: 'motionlink-headphone-motion-api',
    status: 'live',
  },
  {
    slug: 'fourier-epicycles',
    title: 'Draw → Fourier Epicycles',
    tagline: 'Any shape, decomposed into spinning circles',
    description:
      'Draw anything. It gets decomposed into rotating circles (a discrete Fourier series) that trace your exact path — the same frequency-domain math behind spectral analysis, applied to a 2D drawing instead of an audio signal.',
    pillarHint: 'dsp-audio',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'globe',
    title: 'Live Earth',
    tagline: 'Real coastlines, real weather, real ISS orbit',
    description:
      'A rotating globe with three real-data modes: an astronomically accurate day/night terminator, real current weather across 16 cities (refreshed on a schedule), and the ISS tracked live via real orbital mechanics computed client-side from its actual TLE elements.',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'multiphysics-dsp-lab',
    title: 'Audio & Acoustics Toolbox',
    tagline: 'Seven serious engineering tools for audio, acoustics, DSP, and loudspeaker design',
    description:
      'An audio engineering toolbox with room mode analysis, pole-zero filter exploration, loudspeaker enclosure design, nonlinear driver dynamics, thermal compression modeling, cone breakup visualization, and a suite of fast acoustic calculators — built for makers, students, audiophiles, and loudspeaker designers.',
    pillarHint: 'dsp-audio',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'double-pendulum',
    title: 'Double Pendulum + Phase Space',
    tagline: 'Chaotic motion, painted as pure geometry',
    description: 'A double pendulum you can perturb, with a live phase-space plot painting the chaos as geometry alongside it.',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'biquad-filter-designer',
    title: 'Biquad Filter Designer',
    tagline: 'Hear a cascade, not just see a curve',
    description:
      'A multi-stage biquad chain with a live Web Audio preview on real audio, plus the Direct Form II Transposed code running in Biquadia’s DSP core.',
    pillarHint: 'dsp-audio',
    isGrounded: true,
    relatedApp: 'Biquadia',
    relatedAppUrl: 'https://biquadia.makerportal.ai',
    status: 'live',
  },
  {
    slug: 'head-tracked-stereo-pan',
    title: 'Head-Tracked Stereo Pan',
    tagline: 'Rotate a virtual head, hear the pan move',
    description:
      'Combines the quaternion converter’s yaw output with a live StereoPannerNode demo — spatial audio and head tracking in one shareable research instrument, same math as MotionLink.',
    pillarHint: 'dsp-audio',
    isGrounded: true,
    relatedApp: 'MotionLink',
    relatedAppUrl: 'https://makersportal.com/apps/motionlink',
    status: 'live',
  },
  {
    slug: 'coreml-model-size-calculator',
    title: 'CoreML Model Size & Quantization Calculator',
    tagline: 'Exact on-device footprint math, no throughput guesswork',
    description:
      'Deterministic byte-size math across fp32/fp16/int8/int4 quantization — no fabricated latency numbers, just the arithmetic behind an on-device model’s real footprint.',
    pillarHint: 'on-device-ai',
    isGrounded: true,
    relatedApp: 'Notiary',
    relatedAppUrl: 'https://notiary.makerportal.ai',
    status: 'live',
  },
  {
    slug: 'ble-gatt-visualizer',
    title: 'BLE GATT / CSV Frame Visualizer',
    tagline: 'How raw serial bytes become a CSV row',
    description:
      'An interactive look at the HM-10/nRF52 UART bridge structure BLExAR talks to — services, characteristics, and the byte-level framing behind CSV export.',
    pillarHint: 'ios-craft',
    isGrounded: true,
    relatedApp: 'BLExAR',
    relatedAppUrl: 'https://blexar.makerportal.ai',
    status: 'live',
  },
  {
    slug: 'agentic-dsp-pipeline',
    title: 'Agentic DSP Pipeline Step-Through',
    tagline: 'Record → retrieve → generate → verify → iterate',
    description:
      'A clickable walk through AuraLinter’s real multi-agent loop: RAG retrieval over DSP textbooks, LangGraph codegen, and clang++ verification of the generated C++ kernel.',
    pillarHint: 'dsp-audio',
    isGrounded: true,
    relatedApp: 'AuraLinter',
    relatedAppUrl: 'https://auralinter.makerportal.ai',
    status: 'live',
  },
  {
    slug: 'chladni-cymatics',
    title: 'Chladni Cymatics',
    tagline: 'Sound made visible — standing wave sand patterns',
    description:
      'Thousands of sand grains flee the vibrating regions of a driven plate and settle along its nodal lines. Sweep the frequency through real modal resonances, drag the driver anywhere on the plate, and watch classic Chladni figures assemble live.',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'n-body-choreography',
    title: 'N-Body Orbital Choreography',
    tagline: 'Gravity, three bodies, and a stable dance',
    description:
      'Three equal masses chasing each other around the proven figure-eight orbit, integrated with a 4th-order symplectic scheme — plus Lagrange’s unstable triangle, hierarchical systems, and a nudge button that races your perturbed system against an unperturbed ghost.',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'conformal-mapping',
    title: 'Conformal Mapping Explorer',
    tagline: 'Watch a grid warp under a complex function',
    description: 'A grid on the complex plane, warped live under f(z), with a homotopy slider morphing between the two.',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'lattice-boltzmann-tunnel',
    title: 'Lattice Boltzmann Wind Tunnel',
    tagline: 'A Von Kármán vortex street, computed live',
    description:
      'A real-time 2D wind tunnel running a D2Q9 lattice Boltzmann solver. Place a cylinder, plate, or airfoil in the stream, turn up the Reynolds number until the wake sheds a Von Kármán vortex street, and colour the flow by vorticity, speed, or pressure — or paint your own obstacles on the canvas.',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'optics-bench',
    title: 'Ray-Matrix Optics Bench',
    tagline: 'Paraxial rays through lenses, mirrors, and cavities',
    description:
      'Build an optical system from lenses, mirrors, and gaps and trace a fan of paraxial rays straight through it with 2×2 ABCD matrices. Read the system matrix and effective focal length, image an object, and test two-mirror laser resonators against the g₁·g₂ stability criterion.',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'quantum-tunneling',
    title: 'Quantum Tunneling Simulator',
    tagline: 'Watch a wave packet leak through a wall',
    description:
      'Launch a Gaussian wave packet at a potential barrier and watch it split, reflect, and tunnel through in real time. Solves the 1D time-dependent Schrödinger equation with the unitary Crank–Nicolson method, with live transmission and reflection probabilities checked against the exact barrier formula.',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'magnetic-field-tracer',
    title: 'Magnetic Field Line Tracer',
    tagline: 'Biot–Savart field lines, marched by RK4',
    description:
      'Trace magnetic field lines through space from current loops and wires using the Biot–Savart law and a 4th-order Runge–Kutta integrator. Explore Helmholtz pairs, magnetic bottles, solenoids, and dipoles in a live cross-section with the field magnitude read out under your cursor.',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'relativistic-spaceflight',
    title: 'Relativistic Starship Journey',
    tagline: '1g to the stars, drawn on a Minkowski diagram',
    description:
      'Fly a starship at constant proper acceleration and watch special relativity unfold: ship time versus Earth time, Lorentz contraction, the relativistic Doppler shift of the cosmic microwave background, and a live Minkowski spacetime diagram of the hyperbolic worldline. Flip-and-burn trips to real destinations, computed exactly.',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'pid-flight-arena',
    title: 'PID & MPC Flight Arena',
    tagline: 'Tune a quadrotor, watch quaternions keep it alive',
    description:
      'A 3D rigid-body quadrotor simulated with quaternion dynamics and RK4 integration. Tune PID gains and MPC Q/R weightings live, throw wind gusts, trace coordinate paths with force arrows, and hear motor whine mapped to thrust commands. Crash detection shakes the viewport and cuts thrust.',
    pillarHint: 'on-device-ai',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'signal-integrity-lab',
    title: 'Microstrip & Signal Integrity Lab',
    tagline: 'TEM waves, S-parameters, and eye diagrams that bite',
    description:
      'Solve microstrip impedance Z0 via Hammerstad-Jensen, compute propagation delay, S-parameters, and crosstalk. Visualize animated voltage waves, magnetic field vectors, active Smith Chart, and eye diagrams while hearing mismatch hiss modulated by reflection coefficient.',
    pillarHint: 'dsp-audio',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'verilog-live-sculptor',
    title: 'FPGA Verilog Live Sculptor',
    tagline: 'WASM-compiled HDL → LUT map, flashing on violations',
    description:
      'Type Verilog and watch it compile client-side to a gate netlist. Resource mapping animates LUTs, registers, and DSP blocks onto a chip floorplan. Timing visualizer flashes red on setup/hold violations and plays a harmonic tone on timing closure.',
    pillarHint: 'ios-craft',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'webgpu-pinn-studio',
    title: 'WebGPU PINN Training Studio',
    tagline: 'Watch a neural operator learn Navier-Stokes in your GPU',
    description:
      'WebGPU-accelerated gradient descent trains a Physics-Informed Neural Network on your chosen PDE — Heat, Burgers, Navier-Stokes. Real-time 3D loss landscape warps in WebGL, epoch clicks map loss convergence to pitch, and residual field heatmap proves physics loss works.',
    pillarHint: 'on-device-ai',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'slam-odometry-arena',
    title: 'Visual-Inertial SLAM Arena',
    tagline: 'EKF meets pixels: track, map, loop-close, snap',
    description:
      'Drive a robot through a synthetic world, watch an EKF fuse visual features and IMU. Sparse 3D point cloud grows live, uncertainty ellipsoids expand, and loop closure snaps the map with a spatial audio cue and viewport flash.',
    pillarHint: 'on-device-ai',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'antenna-em-sandbox',
    title: 'Antenna Array & EM Propagation Sandbox',
    tagline: 'Steer a beam, shimmer RF wavefronts, hear alignment',
    description:
      'Live FDTD and array-factor solver for patch and Yagi-Uda arrays. Steer beams with phase shift, visualize 3D radiation lobes and near-field wavefronts, and hear spatial audio clear up only when your virtual cursor aligns with the main lobe.',
    pillarHint: 'dsp-audio',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'fea-structural-lab',
    title: 'FEA Structural Dynamics Lab',
    tagline: 'Von Mises, displacements, creaks, fracture snaps',
    description:
      '2D/3D finite element solver deforms a cantilever, plate, or truss with continuous displacement vectors and Von Mises stress tensors. Strain gradients shift live, structure creaks under load, and a fracture snap fires when yield is exceeded.',
    pillarHint: 'metal-ane',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'gan-foc-drive',
    title: 'GaN/SiC Power Electronics & FOC Drive',
    tagline: 'Space Vector PWM, flux rotation, motor whine to 20 kHz',
    description:
      'Simulate GaN/SiC buck/boost inverter with SVPWM, thermal rise, and Field-Oriented Control. Stator flux rotates, three-phase currents morph, dead-time distortion visualized, and motor whine pitch-tracks torque from 5 to 20 kHz.',
    pillarHint: 'metal-ane',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'rtos-scheduler',
    title: 'RTOS Scheduler Visualizer',
    tagline: 'Tasks, mutexes, ISRs, and deadline tension you can hear',
    description:
      'Execute preemptive RMS/EDF scheduling with mutex priority inheritance and nested ISRs. Gantt timeline paints task states, blocking and jitter highlighted, and dissonant audio tension builds with deadline misses and lock-ups.',
    pillarHint: 'ios-craft',
    isGrounded: false,
    status: 'live',
  },
  {
    slug: 'rf-microwave-bench',
    title: 'RF & Microwave Circuit Bench',
    tagline: 'S-parameters live on a Smith Chart, hum to pure tone at 50Ω',
    description:
      'Match stubs, L-networks, and filters with live S-parameter curves plotted on a Smith Chart. Adjust stub length, position, L/C values to watch S11 spiral to center. Multi-frequency noise hum resolves to clean tone at exactly 50Ω match.',
    pillarHint: 'dsp-audio',
    isGrounded: false,
    status: 'live',
  },
];

export function livePlayground(): PlaygroundEntry[] {
  return playground.filter((p) => p.status === 'live');
}

export function plannedPlayground(): PlaygroundEntry[] {
  return playground.filter((p) => p.status === 'planned');
}
