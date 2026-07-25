-- Extend durable workspace records to the full Final Kit challenge library.

alter table public.workspace_records
  drop constraint if exists workspace_records_module_check;

alter table public.workspace_records
  add constraint workspace_records_module_check check (module in (
    'living_portfolio',
    'life_chapter_designer',
    'retention_signals',
    'talent_reengagement',
    'onboarding_predictor',
    'workforce_resilience',
    'outcome_loop',
    'live_internship_marketplace',
    'curriculum_engine',
    'readiness_profile',
    'lifelong_learning_wallet'
  ));
