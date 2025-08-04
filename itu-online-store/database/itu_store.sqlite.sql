BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "booking_submissions" (
	"id"	INTEGER,
	"date"	TEXT NOT NULL,
	"time"	TEXT NOT NULL,
	"submitted_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "contact_submissions" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL,
	"email"	TEXT NOT NULL,
	"message"	TEXT NOT NULL,
	"submitted_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "products" (
	"id"	INTEGER,
	"name"	TEXT,
	"price"	REAL,
	"category"	TEXT,
	"image"	TEXT,
	PRIMARY KEY("id")
);
INSERT INTO "products" VALUES (1,'Gaming Laptop',1200.0,'Laptops','laptop1.jpg');
INSERT INTO "products" VALUES (2,'Ultrabook',900.0,'Laptops','laptop2.jpg');
INSERT INTO "products" VALUES (3,'Mechanical Keyboard',150.0,'Accessories','keyboard1.jpg');
INSERT INTO "products" VALUES (4,'Gaming Mouse',80.0,'Accessories','mouse1.jpg');
INSERT INTO "products" VALUES (5,'4K Monitor',300.0,'Monitors','monitor1.jpg');
INSERT INTO "products" VALUES (6,'1080p Monitor',150.0,'Monitors','monitor2.jpg');
INSERT INTO "products" VALUES (7,'Gaming Chair',250.0,'Furniture','chair1.jpg');
INSERT INTO "products" VALUES (8,'Office Chair',200.0,'Furniture','chair2.jpg');
INSERT INTO "products" VALUES (9,'External SSD',100.0,'Storage','ssd1.jpg');
INSERT INTO "products" VALUES (10,'External HDD',80.0,'Storage','hdd1.jpg');
COMMIT;
