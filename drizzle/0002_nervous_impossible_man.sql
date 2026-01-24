CREATE TABLE `shippingRates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`region` varchar(50) NOT NULL,
	`cepStart` varchar(5) NOT NULL,
	`cepEnd` varchar(5) NOT NULL,
	`rate100g` decimal(10,2) NOT NULL,
	`rate200g` decimal(10,2) NOT NULL,
	`prazo` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shippingRates_id` PRIMARY KEY(`id`),
	CONSTRAINT `shippingRates_region_unique` UNIQUE(`region`)
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `customerCep` varchar(9);--> statement-breakpoint
ALTER TABLE `orders` ADD `subtotal` decimal(10,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `shippingCost` decimal(10,2) DEFAULT '0';