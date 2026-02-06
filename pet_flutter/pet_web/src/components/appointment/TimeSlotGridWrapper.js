import React from 'react';
import TimeSlotGrid from './TimeSlotGrid';

// Simple wrapper component that passes all props to TimeSlotGrid
const TimeSlotGridWrapper = (props) => {
  return <TimeSlotGrid {...props} />;
};

export default TimeSlotGridWrapper; 