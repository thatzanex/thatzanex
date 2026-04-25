import { useMemo } from 'react';
import stylesData from '../data/styleStats.json';
import matchupDataRaw from '../data/matchupData.json';
import { StyleData, MatchupData } from '../types';

const styles = stylesData as unknown as StyleData[];
const matchupData = matchupDataRaw as MatchupData;

export function useStyles() {
  const allStyles = useMemo(() => styles, []);
  
  const getStyleByName = (name: string) => {
    return allStyles.find(s => s.name === name);
  };

  const getMatchup = (style1: string, style2: string) => {
    return matchupData[style1]?.[style2];
  };

  return {
    allStyles,
    matchupData,
    getStyleByName,
    getMatchup
  };
}
