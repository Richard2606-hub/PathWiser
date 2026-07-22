export interface ModelledCandidate {
  id: string;
  display_name: string;
  current_role: string;
  state: string;
  skills: string[];
}

/** Disclosed synthetic profiles used only when consented community profiles are unavailable. */
export const MODELLED_CANDIDATES: ModelledCandidate[] = [
  { id: 'modelled-01', display_name: 'Modelled profile 01', current_role: 'Senior Data Analyst', state: 'Kuala Lumpur', skills: ['Python', 'SQL', 'Tableau', 'Statistics', 'Stakeholder Mgmt'] },
  { id: 'modelled-02', display_name: 'Modelled profile 02', current_role: 'Data Engineer', state: 'Selangor', skills: ['Python', 'SQL', 'Airflow', 'AWS', 'Spark'] },
  { id: 'modelled-03', display_name: 'Modelled profile 03', current_role: 'Machine Learning Engineer', state: 'Penang', skills: ['Python', 'MLOps', 'TensorFlow', 'Statistics', 'AWS'] },
  { id: 'modelled-04', display_name: 'Modelled profile 04', current_role: 'BI Analyst', state: 'Johor', skills: ['SQL', 'Power BI', 'Excel', 'Forecasting', 'Presentations'] },
  { id: 'modelled-05', display_name: 'Modelled profile 05', current_role: 'Software Engineer', state: 'Kuala Lumpur', skills: ['Python', 'REST', 'TypeScript', 'AWS', 'Git'] },
  { id: 'modelled-06', display_name: 'Modelled profile 06', current_role: 'Analytics Lead', state: 'Selangor', skills: ['SQL', 'Python', 'Team Leadership', 'Strategy', 'Statistics'] },
];
