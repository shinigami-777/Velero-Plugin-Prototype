import Chip from '@mui/material/Chip';
import React from 'react';
import { getPhaseColor } from '../../utils/phaseColors';

interface StatusChipProps {
  phase: string | undefined;
}

const SEVERITY_COLORS: Record<string, { bg: string; color: string }> = {
  success: { bg: '#1b5e20', color: '#a5d6a7' },
  info: { bg: '#0d47a1', color: '#90caf9' },
  warning: { bg: '#e65100', color: '#ffe0b2' },
  error: { bg: '#b71c1c', color: '#ef9a9a' },
  default: { bg: '#424242', color: '#e0e0e0' },
};

/**
 * Renders a Velero resource phase as a colored MUI Chip.
 */
export default function StatusChip({ phase }: StatusChipProps) {
  const severity = getPhaseColor(phase);
  const colors = SEVERITY_COLORS[severity] || SEVERITY_COLORS.default;

  return (
    <Chip
      label={phase || 'Unknown'}
      size="small"
      style={{
        backgroundColor: colors.bg,
        color: colors.color,
        fontWeight: 600,
        fontSize: '0.7rem',
      }}
    />
  );
}
