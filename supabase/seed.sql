-- ============================================================================
-- OPTIONAL: sample events and gallery photos
--
-- Run this after schema.sql if you want the site to start with the same
-- sample events and photos you saw in the preview, then replace them from the
-- dashboards. Skip this file to start with an empty events list and gallery.
-- It only inserts when the tables are empty, so running it twice is harmless.
--
-- (Homepage text needs no seeding: the editor starts from the built-in
-- content, and saving a section stores your version.)
-- ============================================================================

insert into public.events (title, location, start_date, end_date, description, image_url)
select * from (values
  ('National Moot Court Competition 2026', 'New Delhi', date '2026-08-14', date '2026-08-16', '64 teams from 22 states argued a constitutional problem on digital privacy before benches of senior advocates and retired judges.', '/images/event-moot-court.svg'),
  ('Rural Legal Aid Camp', 'Alwar, Rajasthan', date '2026-07-02', null::date, '120 volunteers offered free consultations on land, pension and domestic-violence matters to over 900 villagers.', '/images/event-legal-aid.svg'),
  ('Constitution Day Seminar', 'Lucknow', date '2025-11-26', null::date, 'A day-long reading and panel discussion on the Preamble, fundamental duties and 75 years of the Republic.', '/images/event-constitution-day.svg'),
  ('Legal Career Conclave', 'Mumbai', date '2026-01-18', null::date, 'Partners, in-house counsel and judiciary toppers on building a career in law — beyond the usual paths.', '/images/event-career-conclave.svg'),
  ('Women & the Law Workshop', 'Bengaluru', date '2026-03-08', null::date, 'Hands-on sessions on POSH compliance, maintenance law and courtroom confidence for young women advocates.', '/images/event-womens-rights.svg'),
  ('Legal Writing Bootcamp', 'Online', date '2026-05-22', date '2026-05-24', 'Three days on drafting, citation and persuasive writing, with personalised feedback on every submission.', '/images/event-legal-writing.svg')
) as v(title, location, start_date, end_date, description, image_url)
where not exists (select 1 from public.events);

insert into public.gallery_items (title, category, image_url, width, height, created_at)
select * from (values
  ('Final round, National Moot Court', 'Moot Court', '/images/gallery-01.svg', 900, 1200, now() - interval '0 minutes'),
  ('Volunteers at the Alwar legal-aid camp', 'Legal Aid', '/images/gallery-02.svg', 1200, 800, now() - interval '1 minutes'),
  ('Keynote at the Career Conclave', 'Seminars', '/images/gallery-03.svg', 1000, 1000, now() - interval '2 minutes'),
  ('Felicitation of scholarship awardees', 'Events', '/images/gallery-04.svg', 900, 1200, now() - interval '3 minutes'),
  ('Library visit, Supreme Court of India', 'Community', '/images/gallery-05.svg', 1200, 800, now() - interval '4 minutes'),
  ('Legal writing bootcamp', 'Seminars', '/images/gallery-06.svg', 1000, 1000, now() - interval '5 minutes'),
  ('MoU signing with partner universities', 'Events', '/images/gallery-07.svg', 1200, 800, now() - interval '6 minutes'),
  ('Constitution Day reading circle', 'Seminars', '/images/gallery-08.svg', 900, 1200, now() - interval '7 minutes'),
  ('Best Speaker award ceremony', 'Moot Court', '/images/gallery-09.svg', 1000, 1000, now() - interval '8 minutes'),
  ('Rights awareness at a village school', 'Legal Aid', '/images/gallery-10.svg', 1200, 800, now() - interval '9 minutes'),
  ('Annual national meet', 'Community', '/images/gallery-11.svg', 900, 1200, now() - interval '10 minutes'),
  ('Women & the Law workshop', 'Events', '/images/gallery-12.svg', 1200, 800, now() - interval '11 minutes')
) as v(title, category, image_url, width, height, created_at)
where not exists (select 1 from public.gallery_items);
