DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS subforums;
DROP TABLE IF EXISTS threads;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS contacts;

CREATE TABLE users(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name VARCHAR,
	city VARCHAR,
	region VARCHAR,
	img VARCHAR
);

CREATE TABLE subforums(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	topics VARCHAR,
	img VARCHAR
);

CREATE TABLE threads(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	subforum_id INTEGER,
	title VARCHAR,
	likes INTEGER,
	counter INTEGER
);

CREATE TABLE comments(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER,
	threads_id INTEGER,
	comment VARCHAR
);
CREATE TABLE contacts(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name VARCHAR,
	email VARCHAR,
	comment VARCHAR
);

-- Creating subforums
INSERT INTO subforums (topics, img) VALUES ('Action', 'http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons/3d-glossy-blue-orbs-icons-sports-hobbies/041821-3d-glossy-blue-orb-icon-sports-hobbies-gameboy.png'); -- id 1
INSERT INTO subforums (topics, img) VALUES ('Adventure', 'https://cdn4.iconfinder.com/data/icons/game-design-flat-icons-2/512/18_gamepad_console_game_design_flat_icon-512.png');     -- id 2
INSERT INTO subforums (topics, img) VALUES ('MMOs', 'http://www.fordesigner.com/imguploads/Image/cjbc/zcool/png20080526/1211793345.png');        -- id 3
INSERT INTO subforums (topics, img) VALUES ('Role Playing Games', 'http://icons.iconarchive.com/icons/jonas-rask/pry-system/256/Games-icon.png');     -- id 4
INSERT INTO subforums (topics, img) VALUES ('Simulation', 'http://icons.iconarchive.com/icons/prepaidgamecards/gaming-gadgets/256/PS4-Controller-icon.png');     -- id 5
INSERT INTO subforums (topics, img) VALUES ('Strategy', 'https://cdn2.iconfinder.com/data/icons/classic-development-circle/512/game_controller-512.png');
INSERT INTO subforums (topics, img) VALUES ('Vehicle Simulation', 'https://cdn4.iconfinder.com/data/icons/PERSPECTIVE/general/256/games.png');
INSERT INTO subforums (topics, img) VALUES ('Xbox/Xbox360/Xbox1', 'http://icons.iconarchive.com/icons/capital18/ethereal-2/128/Misc-Games-icon.png');
INSERT INTO subforums (topics, img) VALUES ('PS/PS2/PS3/PS4', 'http://png-4.findicons.com/files/icons/387/gaming/300/sony_playstation_dual_shock.png');
INSERT INTO subforums (topics, img) VALUES ('SNES/N64/GameCube/Wii', 'http://www.fordesigner.com/imguploads/Image/cjbc/zcool/png20080526/1211793342.png');











