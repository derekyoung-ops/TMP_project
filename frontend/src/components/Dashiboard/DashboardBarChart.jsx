import * as React from 'react';
import { BarChart as MuiBarChart, barElementClasses } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts/ChartsAxis';

const labels = ['Group A', 'Group B', 'Group C', 'Group D', 'Group E'];
const lData = [42, 24, 56, 45, 3];
const rData = [57, 7, 19, 16, 22];
const colors = ['#006BD6', '#EC407A'];

export default function DashboardBarChart() {
  return (
    <MuiBarChart
      sx={(theme) => ({
        [`.${barElementClasses.root}`]: {
          fill: (theme.vars || theme).palette.background.paper,
          strokeWidth: 2,
        },
        [`.MuiBarElement-series-l_id`]: {
          stroke: colors[0],
        },
        [`.MuiBarElement-series-r_id`]: {
          stroke: colors[1],
        },
        [`.${axisClasses.root}`]: {
          [`.${axisClasses.tick}, .${axisClasses.line}`]: {
            stroke: '#006BD6',
            strokeWidth: 3,
          },
          [`.${axisClasses.tickLabel}`]: {
            fill: '#006BD6',
          },
        },
      })}
      xAxis={[{ data: labels }]}
      series={[
        { data: lData, label: 'l', id: 'l_id' },
        { data: rData, label: 'r', id: 'r_id' },
      ]}
      colors={colors}
      height={300}
    />
  );
}
