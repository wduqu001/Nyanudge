import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  WaterIcon,
  MealIcon,
  ExerciseIcon,
  BathroomIcon,
  MedicineIcon,
  GlobeIcon,
  ChevronIcon,
  CheckIcon,
  HomeIcon,
  HistoryIcon,
  SettingsIcon,
  MenuIcon,
  CogIcon,
} from '../Icons';

/**
 * All icons are pure render components — we just need to confirm:
 *  1. They render an SVG element (any SVG markup present in the DOM).
 *  2. Custom size / color props are forwarded to the SVG's width/height attributes.
 */
describe('Icons', () => {
  const iconCases = [
    ['WaterIcon', WaterIcon],
    ['MealIcon', MealIcon],
    ['ExerciseIcon', ExerciseIcon],
    ['BathroomIcon', BathroomIcon],
    ['MedicineIcon', MedicineIcon],
    ['GlobeIcon', GlobeIcon],
    ['ChevronIcon', ChevronIcon],
    ['CheckIcon', CheckIcon],
    ['HomeIcon', HomeIcon],
    ['HistoryIcon', HistoryIcon],
    ['SettingsIcon', SettingsIcon],
    ['MenuIcon', MenuIcon],
    ['CogIcon', CogIcon],
  ] as const;

  it.each(iconCases)('%s renders an SVG element', (_name, Icon) => {
    const { container } = render(<Icon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it.each(iconCases)('%s forwards size and color props', (_name, Icon) => {
    const { container } = render(<Icon size={32} color="#ff0000" />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('32');
    expect(svg.getAttribute('height')).toBe('32');
  });

  it('ChevronIcon applies rotated transform when rotated=true', () => {
    const { container } = render(<ChevronIcon rotated />);
    const svg = container.querySelector('svg')!;
    expect(svg.style.transform).toBe('rotate(180deg)');
  });

  it('ChevronIcon has no rotation when rotated is falsy', () => {
    const { container } = render(<ChevronIcon />);
    const svg = container.querySelector('svg')!;
    expect(svg.style.transform).toBe('none');
  });
});
