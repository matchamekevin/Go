DELETE FROM users WHERE email='admin@gosotral.com';
INSERT INTO users (email, name, password, phone, is_verified, created_at)
VALUES (
  'admin@gosotral.com',
  'Admin',
  '$2a$10$FoRobbJ1Re/1c.Tm87GlyeYUTr1LMMhQMKdA3F.g2Uh79cgeVRO9a',
  '0000000000',
  true,
  NOW()
);
