/**
 * UN Sustainable Development Goals mapping.
 * Kick-Off encouraged sustainability alignment. Every audience-facing module
 * is anchored to one or more SDGs.
 */

export interface Sdg {
  num: number;
  name: string;
  short: string;
  color: string;
}

export const SDG_META: Record<number, Sdg> = {
  4:  { num: 4,  name: 'Quality Education',                        short: 'Quality Ed.',    color: '#C5192D' },
  5:  { num: 5,  name: 'Gender Equality',                          short: 'Gender Eq.',     color: '#FF3A21' },
  8:  { num: 8,  name: 'Decent Work & Economic Growth',            short: 'Decent Work',    color: '#A21942' },
  9:  { num: 9,  name: 'Industry, Innovation & Infrastructure',    short: 'Innovation',     color: '#FD6925' },
  10: { num: 10, name: 'Reduced Inequalities',                     short: 'Reduced Ineq.',  color: '#DD1367' },
  17: { num: 17, name: 'Partnerships for the Goals',               short: 'Partnerships',   color: '#19486A' },
};

export const MODULE_SDGS: Record<string, number[]> = {
  path_navigator:       [8, 4, 10],
  ai_coach:             [8, 10, 4],
  fair_pay:             [8, 10, 5],
  talent_matching:      [8, 10, 5],
  retention_signals:    [8, 10],
  onboarding_predictor: [8, 4],
  outcome_loop:         [4, 8],
  curriculum_engine:    [4, 9, 8],
  readiness_profile:    [4, 10, 8],
  feedback:             [17],
  security:             [10, 17],
  analytics:            [17],
  job_listings:         [8, 4, 10],
  company_directory:    [8, 17],
  architecture:         [4, 8, 9, 10, 17],
};
