import type { Meta, StoryObj } from '@storybook/react';
import { CatSora } from './CatSora';

const meta: Meta<typeof CatSora> = {
  title: 'Shared/Cats/Sora',
  component: CatSora,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px', height: '300px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
