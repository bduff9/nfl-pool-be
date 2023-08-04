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
export class CorrectSupportContent1659892207186 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`update SupportContent set SupportContentDescription = REPLACE(SupportContentDescription, 'at the point', 'at that point') where SupportContentDescription like '%at the point%'`,
		);
		await queryRunner.query(
			`update SupportContent set SupportContentDescription2 = 'Fear not. The site is designed so you do not need a password, the only requirement is to have access to your email. Type in your email, and a new email will be sent to you momentarily.  Then, open this email and click the green “Sign In” button within that email.' where SupportContentDescription2 = 'Fear not. The site is designed so you do not need a password, the only requirement is to have access to your email. Type in your email, and a new email will be sent to you momentarily, then click the green “Sign In” button within that email.'`,
		);
		await queryRunner.query(
			`update SupportContent set SupportContentDescription2 = 'Yes, you can always edit this account under the My Account -> Edit My Profile screen.  Please be sure to enter this information accurately as if we cannot pay you using the information you enter, you will not be paid until it is fixed.  All payouts will be done at the end of the season so it is critical you fill out this information accurately to avoid missing any prizes won throughout the season.' where SupportContentDescription2 = 'Yes, you can always edit this account under the My Account -> Edit My Profile screen.  Please be sure to enter this information accurately as if we cannot pay you using the information you enter, you will not be paid until it is fixed.  All payouts will be done at the season so it is critical you fill out this information accurately to avoid missing any prizes won throughout the season.'`,
		);
		await queryRunner.query(
			`update SupportContent set SupportContentDescription2 = 'If a game starts and you have not made your pick for it, any remaining auto picks you have can automatically make the selection for you so you don''t lose out on points.  This can be made based on home, away or random.  Everyone gets 3 total for the entire season and they do not replenish.' where SupportContentDescription2 = 'If a game starts and you have made your pick, any remaining auto picks you have can automatically make the selection for you so you don''t lose out on points.  This can be made based on home, away or random.  Everyone gets 3 total for the entire season and they do not replenish.'`,
		);
		await queryRunner.query(
			`update SupportContent set SupportContentDescription2 = 'This controls how the system makes any auto picks on your behalf.  “Home” selects the team playing at home, “Away” selects the visiting team, and “Random” randomly chooses the home or away team.' where SupportContentDescription2 = 'This controls how the system makes any auto picks on your behalf.  Home selects the team playing at home, Away selects the visiting team, and Random randomly chooses the home or away team.'`,
		);
		await queryRunner.query(
			`update SupportContent set SupportContentDescription2 = 'Red means that this team is currently in the redzone.' where SupportContentDescription2 = 'Red means that this time is currently in the redzone.'`,
		);
		await queryRunner.query(
			`update SupportContent set SupportContentDescription2 = 'The game data comes from a service that updates once every 15 minutes.  When the data is updated, the screen should automatically refresh.  If you think the scores are no longer updating, please try refreshing the page.' where SupportContentDescription2 = 'These games are all updated every minute and the screen should automatically refresh.  If you think the scores are no longer updating, please try refreshing the page.'`,
		);
		await queryRunner.query(
			`update SupportContent set SupportContentDescription2 = 'These are abbreviations for values seen on desktop.  They stand for Points Earned, Games Correct, My Tiebreaker score, and Actual Score.' where SupportContentDescription2 = 'These are abbreviations for values seen on desktop.  They stand for Points Earned, Games Correct, My Tiebreaker Score, and Actual Score.'`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`update SupportContent set SupportContentDescription = REPLACE(SupportContentDescription, 'at that point', 'at the point') where SupportContentDescription like '%at that point%'`,
		);
		await queryRunner.query(
			`update SupportContent set SupportContentDescription2 = 'Fear not. The site is designed so you do not need a password, the only requirement is to have access to your email. Type in your email, and a new email will be sent to you momentarily, then click the green “Sign In” button within that email.' where SupportContentDescription2 = 'Fear not. The site is designed so you do not need a password, the only requirement is to have access to your email. Type in your email, and a new email will be sent to you momentarily.  Then, open this email and click the green “Sign In” button within that email.'`,
		);
		await queryRunner.query(
			`update SupportContent set SupportContentDescription2 = 'Yes, you can always edit this account under the My Account -> Edit My Profile screen.  Please be sure to enter this information accurately as if we cannot pay you using the information you enter, you will not be paid until it is fixed.  All payouts will be done at the season so it is critical you fill out this information accurately to avoid missing any prizes won throughout the season.' where SupportContentDescription2 = 'Yes, you can always edit this account under the My Account -> Edit My Profile screen.  Please be sure to enter this information accurately as if we cannot pay you using the information you enter, you will not be paid until it is fixed.  All payouts will be done at the end of the season so it is critical you fill out this information accurately to avoid missing any prizes won throughout the season.'`,
		);
		await queryRunner.query(
			`update SupportContent set SupportContentDescription2 = 'If a game starts and you have made your pick, any remaining auto picks you have can automatically make the selection for you so you don''t lose out on points.  This can be made based on home, away or random.  Everyone gets 3 total for the entire season and they do not replenish.' where SupportContentDescription2 = 'If a game starts and you have not made your pick for it, any remaining auto picks you have can automatically make the selection for you so you don''t lose out on points.  This can be made based on home, away or random.  Everyone gets 3 total for the entire season and they do not replenish.'`,
		);
		await queryRunner.query(
			`update SupportContent set SupportContentDescription2 = 'This controls how the system makes any auto picks on your behalf.  Home selects the team playing at home, Away selects the visiting team, and Random randomly chooses the home or away team.' where SupportContentDescription2 = 'This controls how the system makes any auto picks on your behalf.  “Home” selects the team playing at home, “Away” selects the visiting team, and “Random” randomly chooses the home or away team.'`,
		);
		await queryRunner.query(
			`update SupportContent set SupportContentDescription2 = 'Red means that this time is currently in the redzone.' where SupportContentDescription2 = 'Red means that this team is currently in the redzone.'`,
		);
		await queryRunner.query(
			`update SupportContent set SupportContentDescription2 = 'These games are all updated every minute and the screen should automatically refresh.  If you think the scores are no longer updating, please try refreshing the page.' where SupportContentDescription2 = 'The game data comes from a service that updates once every 15 minutes.  When the data is updated, the screen should automatically refresh.  If you think the scores are no longer updating, please try refreshing the page.'`,
		);
		await queryRunner.query(
			`update SupportContent set SupportContentDescription2 = 'These are abbreviations for values seen on desktop.  They stand for Points Earned, Games Correct, My Tiebreaker Score, and Actual Score.' where SupportContentDescription2 = 'These are abbreviations for values seen on desktop.  They stand for Points Earned, Games Correct, My Tiebreaker score, and Actual Score.'`,
		);
	}
}
