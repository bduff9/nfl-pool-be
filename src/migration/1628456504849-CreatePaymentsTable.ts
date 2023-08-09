/*******************************************************************************
 * NFL Confidence Pool BE - the backend implementation of an NFL confidence pool.
 * Copyright (C) 2015-present Brian Duffey
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see {http://www.gnu.org/licenses/}.
 * Home: https://asitewithnoname.com/
 */
import type { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class CreatePaymentsTable1628456504849 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table Payments (
            PaymentID int not null primary key auto_increment,
            UserID int not null,
            PaymentType enum('Fee', 'Paid', 'Prize', 'Payout') not null,
            PaymentDescription varchar(99) not null,
            PaymentWeek int default null,
            PaymentAmount decimal (5,2) not null,
            PaymentAdded timestamp default CURRENT_TIMESTAMP not null,
            PaymentAddedBy varchar(50) not null,
            PaymentUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
            PaymentUpdatedBy varchar(50) not null,
            PaymentDeleted timestamp null,
            PaymentDeletedBy varchar(50) null,
            constraint fk_PaymentUserID
                foreign key (UserID) references Users (UserID)
                    on update cascade on delete cascade
        ) charset=utf8mb4`);
		await queryRunner.query(`insert into Payments (UserID, PaymentType, PaymentDescription, PaymentWeek, PaymentAmount, PaymentAddedBy, PaymentUpdatedBy)
        select UserID, 'Fee', 'Confidence Pool Entry Fee', null, -40.00, 'Admin', 'Admin' from Users where UserDoneRegistering = true
        union
        select UserID, 'Fee', 'Survivor Pool Entry Fee', null, -5.00, 'Admin', 'Admin' from Users where UserPlaysSurvivor = true`);
		await queryRunner.query(`insert into Payments (UserID, PaymentType, PaymentDescription, PaymentWeek, PaymentAmount, PaymentAddedBy, PaymentUpdatedBy)
        select UserID, 'Paid', 'User Paid', null, sum(PaymentAmount) * -1, 'Admin', 'Admin' from Payments group by UserID`);
		await queryRunner.query(`insert into Payments (UserID, PaymentType, PaymentDescription, PaymentWeek, PaymentAmount, PaymentAddedBy, PaymentUpdatedBy)
        select UserID, 'Prize', case when \`Rank\` = 1 then '1st Place' when \`Rank\` = 2 then '2nd Place' else null end, Week, case when \`Rank\` = 1 then 25.00 when \`Rank\` = 2 then 10.00 else 0 end, 'Admin', 'Admin' from WeeklyMV where \`Rank\` < 3
        union
        select UserID, 'Prize', case when \`Rank\` = 1 then '1st Place Overall' when \`Rank\` = 2 then '2nd Place Overall' when \`Rank\` = 3 then '3rd Place Overall' else null end, null, case when \`Rank\` = 1 then 210.00 when \`Rank\` = 2 then 125.00 when \`Rank\` = 3 then 75.00 else 0 end, 'Admin', 'Admin' from OverallMV where \`Rank\` < 4
        union
        (select UserID, 'Prize', 'Last Place Overall', null, 40.00, 'Admin', 'Admin' from OverallMV where GamesMissed = 0 order by \`Rank\` desc limit 1)
        union
        select UserID, 'Prize', case when \`Rank\` = 1 then '1st Place Survivor Pool' when \`Rank\` = 2 then '2nd Place Survivor Pool' else null end, null, 40.00, 'Admin', 'Admin' from SurvivorMV where \`Rank\` < 3`);
		await queryRunner.query(`insert into Payments (UserID, PaymentType, PaymentDescription, PaymentWeek, PaymentAmount, PaymentAddedBy, PaymentUpdatedBy)
        select UserID, 'Payout', 'User Payout', null, sum(PaymentAmount) * -1, 'Admin', 'Admin' from Payments where PaymentType = 'Prize' group by UserID`);
		await queryRunner.query(`alter table Users drop column UserPaid`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`alter table Users add column UserPaid decimal(5,2) not null default 0 after UserPaymentAccount`,
		);
		await queryRunner.query(
			`update Users U set U.UserPaid = coalesce((select -1 * sum(P.PaymentAmount) from Payments P where P.UserID = U.UserID and P.PaymentType = 'Fee'), 0)`,
		);
		await queryRunner.query(`drop table Payments`);
	}
}
