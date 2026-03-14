-- Add 'improve' to prompts.generation_mode CHECK constraint
ALTER TABLE public.prompts
  DROP CONSTRAINT IF EXISTS prompts_generation_mode_check;

ALTER TABLE public.prompts
  ADD CONSTRAINT prompts_generation_mode_check
  CHECK (generation_mode IN ('quick', 'hearing', 'template', 'improve'));
