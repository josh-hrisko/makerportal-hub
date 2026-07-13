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
};

export const team: TeamMember[] = [
  {
    id: 'principal-engineer',
    title: 'Principal Engineer',
    role: 'Engineering · Product · Design',
    location: 'San Francisco, CA',
    bio: 'Leads architecture and shipping for MakerPortal’s privacy-first iOS apps — on-device ML (CoreML, ANE), Metal, and SwiftUI craft. Small surface area, deliberate releases, zero telemetry by default.',
    focus: ['On-device AI', 'CoreML / ANE', 'SwiftUI', 'Metal', 'Privacy architecture'],
    image: principalHeadshot,
    imageAlt: 'MakerPortal Principal Engineer portrait',
  },
];
