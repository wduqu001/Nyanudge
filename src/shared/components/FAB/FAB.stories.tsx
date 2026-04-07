import type { Meta, StoryObj } from '@storybook/react';
import { FAB } from './FAB';
import { PlusIcon, TrashIcon, MapPinIcon } from 'lucide-react';

const meta: Meta<typeof FAB> = {
  title: 'Shared/FAB',
  component: FAB,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: <PlusIcon size={24} />,
  },
};

export const Delete: Story = {
  args: {
    icon: <TrashIcon size={24} />,
    style: { backgroundColor: '#D65B5B' },
  },
};

export const Custom: Story = {
  args: {
    icon: <MapPinIcon size={24} />,
    style: { backgroundColor: '#3B8BD4' },
  },
};
