-- Script pour insérer les comptes utilisateurs récupérés de Render dans la base locale
-- Date: 29 septembre 2025
-- Total: 15 comptes

-- Note: Les mots de passe sont déjà hashés avec bcrypt, ils peuvent être utilisés directement

INSERT INTO users (id, email, name, password, phone, is_verified, created_at, updated_at, is_suspended) VALUES
(17, 'nigiel.kucera@allfreemail.net', 'Kevin', '$2a$10$jZO6NDkWujNXoXDnld4/x.0Q3qSKSBL7v4L2MtWx8blf6zxWOSuC6', '+22870472436', true, '2025-09-16 18:57:20.025608', '2025-09-25 08:38:19.648467', false),
(16, 'caydince.sullens@allfreemail.net', 'Kevin', '$2a$10$U4fbSMC5okfmcVHtTjygpeAK4pEeywZ6slQpZhZdVX4OsmE0PX.8e', '+22870472436', true, '2025-09-16 17:17:30.840465', '2025-09-23 15:08:49.49949', false),
(15, 'elbonie.alden@fusioninbox.com', 'Lill', '$2a$10$PDnnhwBTv1XEVoiYVC2Lx.MLwkkP81bfCl1GCsKu0XpWeu1.ww5hC', '+22870472436', false, '2025-09-16 11:34:56.653271', '2025-09-24 14:35:57.2037', false),
(14, 'cabella.big@fusioninbox.com', 'Lee', '$2a$10$1eOvgF7JsljndcBiD3IDuOUcWvpb8YVAqvCOoNjSlX2DIz/xAzGAG', '+22870472436', true, '2025-09-16 11:15:18.55679', '2025-09-23 15:08:49.49949', false),
(12, 'avid.richeson@fusioninbox.com', 'lol', '$2a$10$Hx.6ErDS5EKzShjZQBpYZ.un3f4xq6QVpXWkjqp4wJt1L3XQoJWtS', '+22870442436', false, '2025-09-16 11:11:03.349', '2025-09-23 15:08:49.49949', false),
(11, 'ganza.chun@fusioninbox.com', 'Zek', '$2a$10$Pn56hNZOQUtAcEYWjC0iFODaLCCJOAnoV2qsMSCM7Z.liZCqKgLra', '+22870472436', true, '2025-09-16 08:56:46.775109', '2025-09-23 15:08:49.49949', false),
(10, 'rixon.blomgren@allfreemail.net', 'Zeez', '$2a$10$83yoFkYSdt6Yj58cBp8cIOq7BLVLeZZm9Ltzg50DwOMTBh/4giuuC', '+22870472436', true, '2025-09-11 18:10:39.939533', '2025-09-23 16:52:01.095461', false),
(9, 'jannifer.dunklin@allfreemail.net', 'Ux', '$2a$10$p3nInENuzKwz2yza6m5DueKmS1QlkTbJZNBgr4..1MkiJTXt67V3q', '+22870472436', true, '2025-09-11 17:34:53.796713', '2025-09-24 16:56:13.025226', false),
(8, 'connye.youngblood@allfreemail.net', 'Hello', '$2a$10$EycJJswcw.7A9qf76WHFDe893twiIqyiH/4MNEHuf.a4sXBbFbhja', '+22890099090', false, '2025-09-11 16:11:33.400193', '2025-09-23 15:08:49.49949', false),
(7, 'opaline.waterman@allfreemail.net', 'Zee', '$2a$10$MZ4umZOisswrmX4OY3h6tugVY1FS.BS4CnJrsvzYKbjar2fs2xazO', '+22870472436', false, '2025-09-11 12:50:22.775619', '2025-09-23 15:08:49.49949', false),
(6, 'avarielle.reuter@allfreemail.net', 'Zee', '$2a$10$CiorU.QqF2i3UqXC6wt3DukzmE09DMhgocSJHeDP8VG9r5ORICEki', '+22870472436', false, '2025-09-11 12:45:50.773685', '2025-09-23 15:08:49.49949', false),
(5, 'alexzander.myers@allfreemail.net', 'Haf', '$2a$10$GHrTJc1rJizlMIIIA93mPOTplRn1mVP998sGoRt4PYUCHlw5o.P12', '+22870472436', false, '2025-09-11 12:32:54.267006', '2025-09-23 15:08:49.49949', false),
(4, 'glenndora.calvi@allfreemail.net', 'Zée', '$2a$10$P4AFRCkdQ648LVG2tkyE0.UvwmI94pcsS2U3IhR0da7vDSm7F4lGa', '+22870472436', false, '2025-09-11 12:25:49.176882', '2025-09-23 15:08:49.49949', false),
(3, 'elya.neblett@allfreemail.net', 'Kev', '$2a$10$jbnHtrQsZjNp1Ydjg7mhE.WelYyY01GRku4t8XiJCI6yUtpvtoA..', '+22870472436', false, '2025-09-11 12:20:04.47136', '2025-09-23 15:08:49.49949', false),
(1, 'matchamegnatikevin894@gmail.com', 'Kev', '$2a$10$g5si.QlUKd8BHkke8nRGF.dpRPNz4QYQ6PNfj76xkp/wOh4nf/Paq', '+22870472436', false, '2025-09-11 12:04:27.970611', '2025-09-23 15:08:49.49949', false)
ON CONFLICT (id) DO NOTHING;

-- Vérification: compter les utilisateurs après insertion
SELECT COUNT(*) as total_users FROM users;