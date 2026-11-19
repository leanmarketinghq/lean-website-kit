/**
 * The home page's words, section by section, in the order
 * src/pages/index.astro shows them. Every line here is a placeholder until
 * the owner's own copy goes in. Inline HTML (<strong>, <em>, <a>) is allowed
 * in paragraph strings; <strong> renders bold inside `.copy` blocks.
 *
 * Photographs go in src/assets/ and are imported here, so the build sizes
 * them and the tests can check them.
 */
import type { ImageMetadata } from 'astro';
import placeholder from '../assets/placeholder.png';

export const HERO = {
  /** A short line above the headline, or empty for none. */
  eyebrow: 'Who it is for, in a few words',
  headline: 'A headline that says what you do and who it is for.',
  subheadline: 'One or two sentences on the result a customer gets from you. Plain words, no jargon.',
  /** One line under every button, or empty: what happens next, a guarantee, a limit. */
  note: 'What happens after they press the button, in one line.',
};

/** The track record under the hero's button: up to four short facts. An empty list hides the row. */
export const PROOF = [
  { value: '00', label: 'years in business' },
  { value: '000+', label: 'customers served' },
  { value: '0.0/5', label: 'average review' },
  { value: '00 hrs', label: 'typical turnaround' },
];

export const INTRO = {
  title: 'What we do',
  paragraphs: [
    'A short paragraph that says what the business does, for whom, and what is different about the way it does it.',
    'A second paragraph on what a customer gets: the thing itself, and the result it leads to.',
  ],
};

export const PROBLEMS = {
  title: 'Where our customers are when they come to us',
  intro: 'One or two sentences that describe the situation in the customer’s own words, so they recognise themselves.',
  cards: [
    { label: 'Problem one', text: 'What it looks like day to day, and what it costs them.' },
    { label: 'Problem two', text: 'What it looks like day to day, and what it costs them.' },
    { label: 'Problem three', text: 'What it looks like day to day, and what it costs them.' },
    { label: 'Problem four', text: 'What it looks like day to day, and what it costs them.' },
  ],
  outro: 'A closing line that names what all of it adds up to.',
};

export const OUTCOMES = {
  title: 'What they want instead',
  lead: 'The outcome in one line.',
  items: [
    'A result they want, in their words.',
    'A second result, as concrete as the first.',
    'A third result. Numbers and time frames help.',
    'A fourth result. Stop at five or six.',
  ],
};

export const STEPS = {
  title: 'How it works',
  subtitle: 'Three steps',
  /** A photograph beside the steps, or leave both out for the steps alone. */
  image: undefined as ImageMetadata | undefined,
  alt: '',
  items: [
    { label: 'The first step', paragraphs: ['What happens first, what the customer does, and how long it takes.'] },
    { label: 'The second step', paragraphs: ['What happens next, and what they see or receive.'] },
    { label: 'The third step', paragraphs: ['How it finishes, and what they have at the end.'] },
  ],
};

export const STORIES = {
  title: 'What our customers say',
  items: [
    {
      /** The result in a few words, as the card's headline, or empty. */
      headline: 'The result in a few words',
      quote: '“A sentence or two from a real customer, in their own words.”',
      name: 'Customer name',
      role: 'Role, Company',
    },
    {
      headline: 'The result in a few words',
      quote: '“A second customer. Only real ones: never write a testimonial for them.”',
      name: 'Customer name',
      role: 'Role, Company',
    },
  ],
};

export const ABOUT = {
  title: 'Who is behind it',
  image: placeholder,
  alt: 'A placeholder picture: replace it with a photograph of the owner or the team at work',
  /** A line under the photograph, or empty. */
  caption: '',
  paragraphs: [
    'Who runs the business, how long it has been going and what it stands for.',
    'A second paragraph with proof: years in business, customers served, a recognisable name or two.',
  ],
  /** A link under the paragraphs, or an empty label for none. */
  link: { label: 'More about us', href: '/about' },
};

export const OFFER = {
  title: 'What you get',
  rows: [
    { term: 'What’s included', lines: ['The parts of the offer, in plain words.'] },
    { term: 'Who it’s for', lines: ['The customers this is right for, and the ones it is not.'] },
    { term: 'Price', lines: ['The price, or how it is worked out.', 'Any terms worth saying up front.'] },
    { term: 'Guarantee', lines: ['What happens if it isn’t right for them.'] },
  ],
};

export const FAQS = {
  title: 'Questions people ask',
  items: [
    { question: 'A question a customer asks before they buy?', answer: 'A straight answer in two or three sentences.' },
    { question: 'A second question, often about price or time?', answer: 'A straight answer in two or three sentences.' },
    { question: 'A third question, often about what happens if it goes wrong?', answer: 'A straight answer in two or three sentences.' },
  ],
};

export const CONTACT_SECTION = {
  title: 'Get in touch',
  lead: 'Tell us what you need and we will come back to you within one working day.',
};
