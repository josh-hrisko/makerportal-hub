/**
 * Playground registry — math/physics toys built for shareability and visual payoff,
 * NOT for the "grounded in a shipped app" claim the Lab (src/data/tools.ts) makes.
 * Deliberately separate from the Lab, both in this data file and in the site IA
 * (/playground, not /tools) — see docs/DECISIONS.md for why this line exists and
 * why it's honest to keep the two apart rather than blending them.
 */

export type PlaygroundStatus = 'live' | 'planned';

export interface PlaygroundEntry {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  /** Loose thematic tie for a pillar chip — not a "grounded in this app" claim like tools.ts. */
  pillarHint?: string;
  status: PlaygroundStatus;
}

export const playground: PlaygroundEntry[] = [
  {
    slug: 'fourier-epicycles',
    title: 'Draw → Fourier Epicycles',
    tagline: 'Any shape, decomposed into spinning circles',
    description:
      'Draw anything. It gets decomposed into rotating circles (a discrete Fourier series) that trace your exact path — the same frequency-domain math behind spectral analysis, applied to a 2D drawing instead of an audio signal.',
    pillarHint: 'dsp-audio',
    status: 'live',
  },
  {
    slug: 'double-pendulum',
    title: 'Double Pendulum + Phase Space',
    tagline: 'Chaotic motion, painted as pure geometry',
    description: 'A double pendulum you can perturb, with a live phase-space plot painting the chaos as geometry alongside it.',
    status: 'planned',
  },
  {
    slug: 'chladni-cymatics',
    title: 'Chladni Cymatics',
    tagline: 'Sound made visible — standing wave sand patterns',
    description: 'A virtual plate of particles that collect along the nodal lines of 2D standing waves as you sweep frequency.',
    status: 'planned',
  },
  {
    slug: 'n-body-choreography',
    title: 'N-Body Orbital Choreography',
    tagline: 'Gravity, three bodies, and a stable dance',
    description: 'A gravity sandbox with known stable choreographies (figure-eight orbits) you can nudge into chaos.',
    status: 'planned',
  },
  {
    slug: 'conformal-mapping',
    title: 'Conformal Mapping Explorer',
    tagline: 'Watch a grid warp under a complex function',
    description: 'A grid on the complex plane, warped live under f(z), with a homotopy slider morphing between the two.',
    status: 'planned',
  },
];

export function livePlayground(): PlaygroundEntry[] {
  return playground.filter((p) => p.status === 'live');
}
