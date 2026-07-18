/**
 * Work Animal · Menagerie Method
 * Aligned with Talentbank's yourworkanimal.com framework (Kick-Off explicitly
 * asked teams to use this over MBTI / DISC).
 */

import type { WorkAnimalKey } from '@/types';

export interface WorkAnimal {
  key: WorkAnimalKey;
  emoji: string;
  name: string;
  tagline: string;
  description: string;
  strengths: string[];
  careerFit: string[];
  colorVar: string;
}

export const WORK_ANIMALS: Record<WorkAnimalKey, WorkAnimal> = {
  owl: {
    key: 'owl',
    emoji: '🦉',
    name: 'Owl',
    tagline: 'The Strategist',
    description: 'Analytical, deep thinker who plans before acting. Thrives on complex problems and evidence over hunches.',
    strengths: ['Analytical thinking', 'Long-form focus', 'Pattern recognition', 'Written communication'],
    careerFit: ['Research', 'Strategy', 'Data Science', 'Product Analytics', 'Consulting'],
    colorVar: '--sky',
  },
  fox: {
    key: 'fox',
    emoji: '🦊',
    name: 'Fox',
    tagline: 'The Adapter',
    description: 'Resourceful, quick to learn, comfortable with ambiguity. Connects dots across domains.',
    strengths: ['Adaptability', 'Rapid learning', 'Cross-domain synthesis', 'Comfort with ambiguity'],
    careerFit: ['Product Management', 'Entrepreneurship', 'Growth', 'Consulting', 'Innovation'],
    colorVar: '--amber',
  },
  bear: {
    key: 'bear',
    emoji: '🐻',
    name: 'Bear',
    tagline: 'The Steward',
    description: 'Steady, dependable, protective of quality and team wellbeing. Builds durable systems.',
    strengths: ['Reliability', 'Composure under pressure', 'System thinking', 'Team stewardship'],
    careerFit: ['Operations', 'Engineering Leadership', 'People / HR', 'Project Management', 'Reliability'],
    colorVar: '--emerald',
  },
  dolphin: {
    key: 'dolphin',
    emoji: '🐬',
    name: 'Dolphin',
    tagline: 'The Connector',
    description: 'Socially intelligent, empathetic, gets teams aligned. Energizes people and unlocks collaboration.',
    strengths: ['Empathy', 'Group alignment', 'Storytelling', 'Relationship building'],
    careerFit: ['Sales', 'Marketing', 'Community', 'People Leadership', 'Customer Success'],
    colorVar: '--teal',
  },
  eagle: {
    key: 'eagle',
    emoji: '🦅',
    name: 'Eagle',
    tagline: 'The Visionary',
    description: 'Ambitious, decisive, sees the big picture. Sets direction and pushes for outcomes.',
    strengths: ['Vision', 'Decisiveness', 'Bias to action', 'Comfort with high stakes'],
    careerFit: ['Executive Leadership', 'Founder', 'Business Development', 'Strategy', 'Turnaround'],
    colorVar: '--yellow',
  },
  ant: {
    key: 'ant',
    emoji: '🐜',
    name: 'Ant',
    tagline: 'The Craftsperson',
    description: 'Meticulous, systematic, values quality and precision. Steady incremental progress.',
    strengths: ['Attention to detail', 'Process discipline', 'Deep expertise', 'Quality obsession'],
    careerFit: ['Software Engineering', 'Finance', 'Quality Assurance', 'Actuarial', 'Research Engineering'],
    colorVar: '--violet',
  },
};

// 8-question quiz — each option maps to 1–2 animals with weighted points
export interface QuizQuestion {
  q: string;
  options: Array<{ text: string; scores: Partial<Record<WorkAnimalKey, number>> }>;
}

export const WA_QUESTIONS: QuizQuestion[] = [
  { q: 'You start a new project. What comes first?',
    options: [
      { text: '📋 Map the full plan before touching anything', scores: { owl: 2, ant: 1 } },
      { text: '💬 Talk to everyone involved', scores: { dolphin: 2, eagle: 1 } },
      { text: '⚡ Jump in — I learn best by doing', scores: { fox: 2 } },
      { text: '🎯 Set the goal and delegate the steps', scores: { eagle: 2, bear: 1 } }
    ]
  },
  { q: 'A messy, undefined problem lands on your desk. Your instinct?',
    options: [
      { text: '🔍 Break it into components and analyze', scores: { owl: 2, ant: 1 } },
      { text: '🤝 Rally the team to work it out together', scores: { dolphin: 2 } },
      { text: '🧪 Try three quick approaches, keep what works', scores: { fox: 2 } },
      { text: '🧭 Step back, think it through, then decide', scores: { owl: 1, bear: 2 } }
    ]
  },
  { q: 'Which working environment energizes you most?',
    options: [
      { text: '📚 Quiet, focused, deep-work', scores: { owl: 2, ant: 1 } },
      { text: '🎨 Bustling, collaborative, cross-functional', scores: { dolphin: 2, fox: 1 } },
      { text: '🏗️ Structured, predictable, well-run', scores: { bear: 2, ant: 1 } },
      { text: '🚀 Fast-paced, high-stakes, always shipping', scores: { eagle: 2, fox: 1 } }
    ]
  },
  { q: 'Your team is stuck on something important. You…',
    options: [
      { text: '🔬 Diagnose the root cause first', scores: { owl: 2 } },
      { text: '☕ Bring them together to talk it through', scores: { dolphin: 2 } },
      { text: '⚡ Make a decision and drive forward', scores: { eagle: 2 } },
      { text: '🌀 Try a completely different angle', scores: { fox: 2 } },
      { text: '⚓ Keep the ship steady while we figure it out', scores: { bear: 2 } }
    ]
  },
  { q: 'You feel most fulfilled at work when…',
    options: [
      { text: '🎛️ A system you built runs smoothly for years', scores: { bear: 2, ant: 1 } },
      { text: '🧩 You crack a genuinely hard puzzle', scores: { owl: 2 } },
      { text: '🚢 You launch something entirely new', scores: { fox: 1, eagle: 2 } },
      { text: '❤️ People tell you that you helped them', scores: { dolphin: 2 } },
      { text: '🧠 Your work becomes the standard others follow', scores: { eagle: 1, ant: 2 } }
    ]
  },
  { q: 'When you disagree with a group decision, you…',
    options: [
      { text: '📊 Present the evidence and let it argue itself', scores: { owl: 2 } },
      { text: '💬 Talk it through 1-on-1 with people first', scores: { dolphin: 2 } },
      { text: '🧪 Try the alternative in parallel as a proof', scores: { fox: 2 } },
      { text: '🗣️ Push back publicly, clearly', scores: { eagle: 2 } },
      { text: '⚙️ Ask that the process include your view', scores: { bear: 2 } }
    ]
  },
  { q: 'Your best week at work looks like…',
    options: [
      { text: '🧮 Solved a tough analytical problem', scores: { owl: 2 } },
      { text: '🛠️ Built something end-to-end that shipped', scores: { ant: 1, fox: 2 } },
      { text: '🤝 Aligned a team on what happens next', scores: { dolphin: 2, eagle: 1 } },
      { text: '💥 Shipped a bold new thing that mattered', scores: { eagle: 2 } },
      { text: '🛡️ Kept operations stable through a rough patch', scores: { bear: 2 } }
    ]
  },
  { q: 'A wild career pivot to a totally new field. Your reaction?',
    options: [
      { text: '🎢 Exciting — new domain to master', scores: { fox: 2 } },
      { text: '📈 Fine, if it\'s the right strategic move', scores: { eagle: 2 } },
      { text: '🧪 Risky — I prefer depth over breadth', scores: { ant: 2, owl: 1 } },
      { text: '👥 Worth it if my team is coming with me', scores: { dolphin: 2 } },
      { text: '🧭 I want to think it through carefully first', scores: { owl: 1, bear: 2 } }
    ]
  }
];

export function computeWorkAnimalWinner(scores: Record<WorkAnimalKey, number>) {
  const sorted = (Object.entries(scores) as Array<[WorkAnimalKey, number]>).sort(
    (a, b) => b[1] - a[1]
  );
  return {
    winner: sorted[0][0],
    secondary: sorted[1]?.[0],
    scores,
  };
}
