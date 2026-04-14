import type { Meta, StoryObj } from '@storybook/react';
import { HeatmapCalendar } from './HeatmapCalendar';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../core/i18n';

const meta: Meta<typeof HeatmapCalendar> = {
  title: 'Features/History/HeatmapCalendar',
  component: HeatmapCalendar,
  decorators: [
    (Story) => (
      <I18nextProvider i18n={i18n}>
        <div style={{ padding: '20px', maxWidth: '400px', background: 'var(--surface-bg)' }}>
          <Story />
        </div>
      </I18nextProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper to generate some fake completion data for the current month
const generateCompletions = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const data = [];
  
  // Add some random completions throughout the month
  for (let i = 1; i <= 28; i += 2) {
    const count = Math.floor(Math.random() * 6); // 0 to 5
    for (let j = 0; j < count; j++) {
      data.push({ completedAt: new Date(year, month, i, 10, 0, 0).getTime() });
    }
  }
  return data;
};

export const Default: Story = {
  args: {
    completions: generateCompletions(),
    title: 'Activity Map',
  },
};

export const WithoutTitle: Story = {
  args: {
    completions: generateCompletions(),
  },
};

export const Empty: Story = {
  args: {
    completions: [],
    title: 'No Activity Yet',
  },
};
