-- Run after 001_tasks_and_docs.sql in Supabase SQL Editor (or via CLI)

-- Team members (stable IDs for seed references)
insert into public.team_members (id, name, avatar, role, status, last_active) values
  ('11111111-1111-1111-1111-111111111101', 'John Doe', 'JD', 'Lead Developer', 'online', null),
  ('11111111-1111-1111-1111-111111111102', 'Sarah Chen', 'SC', 'Game Designer', 'online', null),
  ('11111111-1111-1111-1111-111111111103', 'Mike Ross', 'MR', '3D Artist', 'away', '15m ago'),
  ('11111111-1111-1111-1111-111111111104', 'Emma Wilson', 'EW', 'UI/UX Designer', 'online', null),
  ('11111111-1111-1111-1111-111111111105', 'Alex Turner', 'AT', 'Backend Engineer', 'offline', '2h ago'),
  ('11111111-1111-1111-1111-111111111106', 'Lisa Park', 'LP', 'Sound Designer', 'online', null)
on conflict (id) do nothing;

-- Tasks
insert into public.tasks (id, title, description, status, priority, assignee_id, game_id, due_date, tags, position) values
  ('22222222-2222-2222-2222-222222222201', 'Implement new combat system', 'Design and implement the revamped combat mechanics for Dragon Realm', 'in-progress', 'high', '11111111-1111-1111-1111-111111111101', '1', '2026-02-15', array['gameplay', 'dragon-realm'], 0),
  ('22222222-2222-2222-2222-222222222202', 'Create new enemy models', 'Design 5 new enemy character models for the forest biome', 'in-progress', 'medium', '11111111-1111-1111-1111-111111111103', '1', '2026-02-18', array['art', '3d', 'dragon-realm'], 1),
  ('22222222-2222-2222-2222-222222222203', 'Fix matchmaking bug', 'Players occasionally get stuck in matchmaking queue', 'todo', 'urgent', '11111111-1111-1111-1111-111111111105', '2', '2026-02-10', array['bug', 'tower-defense'], 0),
  ('22222222-2222-2222-2222-222222222204', 'Design new UI kit', 'Create a cohesive UI kit for Space Explorers', 'review', 'medium', '11111111-1111-1111-1111-111111111104', '3', '2026-02-20', array['ui', 'design', 'space-explorers'], 0),
  ('22222222-2222-2222-2222-222222222205', 'Compose battle music', 'Create 3 new battle music tracks for boss fights', 'backlog', 'low', '11111111-1111-1111-1111-111111111106', '1', null, array['audio', 'dragon-realm'], 0),
  ('22222222-2222-2222-2222-222222222206', 'Optimize server performance', 'Reduce server response time by 30%', 'done', 'high', '11111111-1111-1111-1111-111111111105', null, null, array['backend', 'optimization'], 0),
  ('22222222-2222-2222-2222-222222222207', 'Add achievement system', 'Implement player achievements and badges', 'todo', 'medium', '11111111-1111-1111-1111-111111111101', '1', '2026-02-25', array['feature', 'dragon-realm'], 1),
  ('22222222-2222-2222-2222-222222222208', 'Vehicle physics overhaul', 'Improve vehicle handling and physics simulation', 'in-progress', 'high', '11111111-1111-1111-1111-111111111101', '4', '2026-02-12', array['gameplay', 'racing-thunder'], 0)
on conflict (id) do nothing;

-- Doc folders
insert into public.doc_nodes (id, parent_id, title, is_folder, icon, sort_order) values
  ('33333333-3333-3333-3333-333333333301', null, 'Getting Started', true, 'book-open', 0),
  ('33333333-3333-3333-3333-333333333302', null, 'Game Design', true, 'gamepad-2', 1),
  ('33333333-3333-3333-3333-333333333303', null, 'Art & Design', true, 'palette', 2),
  ('33333333-3333-3333-3333-333333333304', null, 'Audio', true, 'volume-2', 3),
  ('33333333-3333-3333-3333-333333333305', null, 'Technical', true, 'code', 4)
on conflict (id) do nothing;

-- Doc pages
insert into public.doc_nodes (id, parent_id, title, is_folder, content, is_favorite, sort_order, last_edited_by) values
  ('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333301', 'Quick Start Guide', false, '# Quick Start Guide

Welcome to the dev dashboard. This guide walks you through local setup and your first contribution.', false, 0, '11111111-1111-1111-1111-111111111101'),
  ('44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333302', 'Combat System', false, '# Combat System Documentation

## Overview

The combat system is designed to be fluid, responsive, and deeply strategic. Players engage in real-time combat using basic attacks, special abilities, and defensive maneuvers.

## Core Mechanics

### Basic Attacks
- **Light Attack**: Quick strikes with low damage but fast recovery
- **Heavy Attack**: Powerful strikes with high damage but slow recovery
- **Combo System**: Chain up to 5 attacks for bonus damage

### Special Abilities
Each character class has access to 4 unique abilities.

### Defense Mechanics
- **Block**: Reduces incoming damage by 50%
- **Dodge Roll**: I-frames for 0.3 seconds
- **Parry**: Timing-based, reflects damage back

## Implementation Notes
- All combat actions should feel responsive (< 100ms input lag)
- Hitboxes are generated dynamically based on weapon type
- Network reconciliation uses server-authoritative model', true, 0, '11111111-1111-1111-1111-111111111101'),
  ('44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333302', 'Character Abilities', false, '# Character Abilities

Document ability trees, cooldowns, and balance notes here.', false, 1, '11111111-1111-1111-1111-111111111102'),
  ('44444444-4444-4444-4444-444444444404', '33333333-3333-3333-3333-333333333305', 'Code Standards', false, '# Code Standards

Linting, naming conventions, and review checklist for the team.', false, 0, '11111111-1111-1111-1111-111111111101')
on conflict (id) do nothing;
