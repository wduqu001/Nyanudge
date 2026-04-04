import type { Meta, StoryObj } from '@storybook/react';
import { StatsCard } from './StatsCard';
import { Flame, Trophy, CheckCircle } from 'lucide-react';

const meta: Meta<typeof StatsCard> = {
  title: 'Features/History/StatsCard',
  component: StatsCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
    value: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Weekly Completion',
    value: '85%',
    color: '#3B8BD4',
    icon: <CheckCircle size={20} color="#3B8BD4" />,
  },
};

export const Streak: Story = {
  args: {
    label: 'Current Streak',
    value: '5 Days',
    color: '#E97B22',
    icon: <Flame size={20} color="#E97B22" />,
    subtitle: 'Personal Record: 12 Days',
  },
};

export const Record: Story = {
  args: {
    label: 'Longest Streak',
    value: '14 Days',
    color: '#FAC896',
    icon: <Trophy size={20} color="#FAC896" />,
  },
};
