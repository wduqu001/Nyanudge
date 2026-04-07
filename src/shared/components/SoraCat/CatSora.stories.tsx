import type { Meta, StoryObj } from '@storybook/react';
import { CatSora } from './CatSora';

const meta: Meta<typeof CatSora> = {
  title: 'Shared/Cats/Sora',
  component: CatSora,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
