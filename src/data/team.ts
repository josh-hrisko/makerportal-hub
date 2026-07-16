import type { ImageMetadata } from 'astro';
import principalHeadshot from '../assets/team/principal-engineer.jpg';

export type TeamMember = {
  id: string;
  /** Public-facing label — role-first; no personal legal name on the hub. */
  title: string;
  role: string;
  location: string;
  bio: string;
  focus: string[];
  image: ImageMetadata;
  imageAlt: string;
  /**
   * Optional personal name — scoped exception to the role-first rule above, only for
   * the specific person who explicitly asked to be named. See DECISIONS.md D-004.
   */
  name?: string;
  linkedin?: string;
};

export const team: TeamMember[] = [
  {
    id: 'principal-engineer',
    title: 'Principal Engineer',
    role: 'Engineering · Product · Design',
    location: 'San Francisco, CA',
    bio: 'Leads architecture and shipping for MakerPortal’s iOS apps — on-device ML where possible (CoreML, ANE), Metal, SwiftUI craft, and transparent hybrid for agentic DSP. Small surface area, deliberate releases, no dark patterns.',
    focus: ['On-device AI', 'CoreML / ANE', 'SwiftUI', 'Metal', 'Transparent architecture'],
    image: principalHeadshot,
    imageAlt: 'MakerPortal Principal Engineer portrait',
    name: 'Josh',
    linkedin: 'https://www.linkedin.com/in/joshua-hrisko/',
  },
];
