DROP SCHEMA IF EXISTS `NFL`;
CREATE SCHEMA `NFL`;
USE `NFL`;
ALTER DATABASE `NFL` CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE `UsersRaw` (
  `UserID` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `UserEmail` VARCHAR(100) NOT NULL,
  `UserPhone` VARCHAR(20) DEFAULT NULL,
  `UserFirstName` VARCHAR(50) NOT NULL,
  `UserLastName` VARCHAR(50) NOT NULL,
  `UserTeamName` VARCHAR(100) DEFAULT NULL,
  `UserReferredByRaw` VARCHAR(100) DEFAULT NULL,
  `UserReferredBy` INTEGER DEFAULT NULL,
  `UserVerified` BOOLEAN NOT NULL DEFAULT FALSE,
  `UserTrusted` BOOLEAN DEFAULT NULL,
  `UserDoneRegistering` BOOLEAN NOT NULL DEFAULT FALSE,
  `UserIsAdmin` BOOLEAN NOT NULL DEFAULT FALSE,
  `UserPlaysSurvivor` BOOLEAN NOT NULL DEFAULT FALSE,
  `UserPaymentType` ENUM('Cash', 'PayPal', 'Zelle', 'Venmo') NOT NULL DEFAULT 'Cash',
  `UserPaymentAccount` VARCHAR(100) DEFAULT NULL,
  `UserPaid` NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  `UserSelectedWeek` INTEGER NOT NULL,
  `UserAutoPicksLeft` INTEGER NOT NULL DEFAULT 3,
  `UserAutoPickStrategy` ENUM('Away', 'Home', 'Random') DEFAULT NULL,
  `UserAdded` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UserAddedBy` VARCHAR(50) NOT NULL,
  `UserUpdated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `UserUpdatedBy` VARCHAR(50) NOT NULL,
  `UserDeleted` TIMESTAMP NULL DEFAULT NULL,
  `UserDeletedBy` VARCHAR(50) DEFAULT NULL,
  FOREIGN KEY `fk_UserReferredBy` (`UserReferredBy`) REFERENCES `UsersRaw` (`UserID`),
  UNIQUE KEY `uk_UserEmail` (`UserEmail`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;
CREATE VIEW `Users` AS SELECT `UserID`, `UserEmail`, `UserPhone`,
`UserFirstName`, `UserLastName`, `UserTeamName`, `UserReferredByRaw`, `UserReferredBy`, `UserVerified`, `UserTrusted`, `UserDoneRegistering`,
`UserIsAdmin`, `UserPlaysSurvivor`, `UserPaymentType`, `UserPaymentAccount`, `UserPaid`, `UserSelectedWeek`, `UserAutoPicksLeft`, `UserAutoPickStrategy` FROM `UsersRaw`
WHERE `UserDeleted` IS NULL;

CREATE TABLE `NotificationsRaw` (
  `NotificationID` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `UserID` INTEGER NOT NULL,
  `NotificationType` ENUM('Email', 'QuickPickEmail', 'SMS') NOT NULL,
  `NotificationHoursBefore` INTEGER NOT NULL,
  `NotificationAdded` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `NotificationAddedBy` VARCHAR(50) NOT NULL,
  `NotificationUpdated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `NotificationUpdatedBy` VARCHAR(50) NOT NULL,
  `NotificationDeleted` TIMESTAMP NULL DEFAULT NULL,
  `NotificationDeletedBy` VARCHAR(50) DEFAULT NULL,
  FOREIGN KEY `fk_UserID` (`UserID`) REFERENCES `UsersRaw` (`UserID`),
  UNIQUE KEY `uk_UserNotification` (`UserID`, `NotificationType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;
CREATE VIEW `Notifications` AS SELECT `NotificationID`, `UserID`, `NotificationType`, `NotificationHoursBefore` FROM `NotificationsRaw` WHERE `NotificationDeleted` IS NULL;

CREATE TABLE `LeaguesRaw` (
  `LeagueID` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `LeagueName` VARCHAR(100) NOT NULL,
  `LeagueAdmin` INTEGER NOT NULL,
  `LeagueAdded` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `LeagueAddedBy` VARCHAR(50) NOT NULL,
  `LeagueUpdated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `LeagueUpdatedBy` VARCHAR(50) NOT NULL,
  `LeagueDeleted` TIMESTAMP NULL DEFAULT NULL,
  `LeagueDeletedBy` VARCHAR(50) DEFAULT NULL,
  FOREIGN KEY `fk_LeagueAdmin` (`LeagueAdmin`) REFERENCES `UsersRaw` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;
CREATE VIEW `Leagues` AS SELECT `LeagueID`, `LeagueName`, `LeagueAdmin` FROM `LeaguesRaw` WHERE `LeagueDeleted` IS NULL;

CREATE TABLE `UserLeaguesRaw` (
  `UserLeagueID` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `UserID` INTEGER NOT NULL,
  `LeagueID` INTEGER NOT NULL,
  `UserLeagueAdded` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UserLeagueAddedBy` VARCHAR(50) NOT NULL,
  `UserLeagueUpdated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `UserLeagueUpdatedBy` VARCHAR(50) NOT NULL,
  `UserLeagueDeleted` TIMESTAMP NULL DEFAULT NULL,
  `UserLeagueDeletedBy` VARCHAR(50) DEFAULT NULL,
  FOREIGN KEY `fk_UserID` (`UserID`) REFERENCES `UsersRaw` (`UserID`),
  FOREIGN KEY `fk_LeagueID` (`LeagueID`) REFERENCES `LeaguesRaw` (`LeagueID`),
  UNIQUE KEY `uk_UserLeague` (`UserID`, `LeagueID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;
CREATE VIEW `UserLeagues` AS SELECT `UserLeagueID`, `UserID`, `LeagueID` FROM `UserLeaguesRaw` WHERE `UserLeagueDeleted` IS NULL;

CREATE TABLE `LogsRaw` (
  `LogID` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `LogAction` ENUM('404', 'CHAT', 'CHAT_HIDDEN', 'CHAT_OPENED', 'LOGIN', 'LOGOUT', 'MESSAGE', 'PAID', 'REGISTER', 'SLACK', 'SUBMIT_PICKS', 'SURVIVOR_PICK') NOT NULL,
  `LogDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `LogMessage` VARCHAR(500) DEFAULT NULL,
  `UserID` INTEGER DEFAULT NULL,
  `LeagueID` INTEGER DEFAULT NULL,
  `LogIsRead` BOOLEAN DEFAULT NULL,
  `LogIsDeleted` BOOLEAN DEFAULT NULL,
  `ToUserID` INTEGER DEFAULT NULL,
  `LogAdded` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `LogAddedBy` VARCHAR(50) NOT NULL,
  `LogUpdated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `LogUpdatedBy` VARCHAR(50) NOT NULL,
  `LogDeleted` TIMESTAMP NULL DEFAULT NULL,
  `LogDeletedBy` VARCHAR(50) DEFAULT NULL,
  FOREIGN KEY `fk_UserID` (`UserID`) REFERENCES `UsersRaw` (`UserID`),
  FOREIGN KEY `fk_LeagueID` (`LeagueID`) REFERENCES `LeaguesRaw` (`LeagueID`),
  FOREIGN KEY `fk_ToUserID` (`ToUserID`) REFERENCES `UsersRaw` (`UserID`),
  UNIQUE KEY `uk_LogMessage` (`LogAction`, `LogDate`, `UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;
CREATE VIEW `Logs` AS SELECT `LogID`, `LogAction`, `LogDate`, `LogMessage`, `UserID`, `LeagueID`, `LogIsRead`, `LogIsDeleted`, `ToUserID` FROM `LogsRaw` WHERE `LogDeleted` IS NULL;

CREATE TABLE `TiebreakersRaw` (
  `TiebreakerID` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `UserID` INTEGER NOT NULL,
  `LeagueID` INTEGER NOT NULL,
  `TiebreakerWeek` INTEGER NOT NULL,
  `TiebreakerLastScore` INTEGER DEFAULT NULL,
  `TiebreakerHasSubmitted` BOOLEAN DEFAULT FALSE,
  `TiebreakerAdded` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `TiebreakerAddedBy` VARCHAR(50) NOT NULL,
  `TiebreakerUpdated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `TiebreakerUpdatedBy` VARCHAR(50) NOT NULL,
  `TiebreakerDeleted` TIMESTAMP NULL DEFAULT NULL,
  `TiebreakerDeletedBy` VARCHAR(50) DEFAULT NULL,
  FOREIGN KEY `fk_UserID` (`UserID`) REFERENCES `UsersRaw` (`UserID`),
  FOREIGN KEY `fk_LeagueID` (`LeagueID`) REFERENCES `LeaguesRaw` (`LeagueID`),
  UNIQUE KEY `uk_Tiebreaker` (`UserID`, `LeagueID`, `TiebreakerWeek`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;
CREATE VIEW `Tiebreakers` AS SELECT `TiebreakerID`, `UserID`, `LeagueID`, `TiebreakerWeek`, `TiebreakerLastScore`, `TiebreakerHasSubmitted` FROM `TiebreakersRaw` WHERE `TiebreakerDeleted` IS NULL;

CREATE TABLE `TeamsRaw` (
  `TeamID` INTEGER NOT NULL PRIMARY KEY,
  `TeamCity` VARCHAR(50) NOT NULL,
  `TeamName` VARCHAR(50) NOT NULL,
  `TeamShortName` CHAR(3) NOT NULL,
  `TeamAltShortName` CHAR(3) NOT NULL,
  `TeamConference` ENUM('AFC', 'NFC') NOT NULL,
  `TeamDivision` ENUM('East', 'North', 'South', 'West') NOT NULL,
  `TeamLogo` VARCHAR(100) NOT NULL,
  `TeamLogoSmall` VARCHAR(100) NOT NULL,
  `TeamPrimaryColor` CHAR(7) NOT NULL,
  `TeamSecondaryColor` CHAR(7) NOT NULL,
  `TeamRushDefenseRank` INTEGER DEFAULT NULL,
  `TeamPassDefenseRank` INTEGER DEFAULT NULL,
  `TeamRushOffenseRank` INTEGER DEFAULT NULL,
  `TeamPassOffenseRank` INTEGER DEFAULT NULL,
  `TeamByeWeek` INTEGER NOT NULL,
  `TeamAdded` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `TeamAddedBy` VARCHAR(50) NOT NULL,
  `TeamUpdated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `TeamUpdatedBy` VARCHAR(50) NOT NULL,
  `TeamDeleted` TIMESTAMP NULL DEFAULT NULL,
  `TeamDeletedBy` VARCHAR(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;
CREATE VIEW `Teams` AS SELECT `TeamID`, `TeamCity`, `TeamName`, `TeamShortName`, `TeamAltShortName`, `TeamConference`, `TeamDivision`, `TeamLogo`, `TeamLogoSmall`, `TeamPrimaryColor`, `TeamSecondaryColor`, `TeamRushDefenseRank`, `TeamPassDefenseRank`, `TeamRushOffenseRank`, `TeamPassOffenseRank`, `TeamByeWeek` FROM `TeamsRaw` WHERE `TeamDeleted` IS NULL;

CREATE TABLE `GamesRaw` (
  `GameID` INTEGER NOT NULL PRIMARY KEY,
  `GameWeek` INTEGER NOT NULL,
  `GameNumber` INTEGER NOT NULL,
  `HomeTeamID` INTEGER NOT NULL,
  `GameHomeSpread` NUMERIC(4, 2) DEFAULT NULL,
  `VisitorTeamID` INTEGER NOT NULL,
  `GameVisitorSpread` NUMERIC(4, 2) DEFAULT NULL,
  `WinnerTeamID` INTEGER DEFAULT NULL,
  `GameStatus` ENUM('P', 'I', '1', '2', 'H', '3', '4', 'C') DEFAULT 'P',
  `GameKickoff` TIMESTAMP NOT NULL,
  `GameTimeLeftInSeconds` INTEGER NOT NULL DEFAULT 3600,
  `GameHasPossession` INTEGER DEFAULT NULL,
  `GameInRedzone` INTEGER DEFAULT NULL,
  `GameAdded` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `GameAddedBy` VARCHAR(50) NOT NULL,
  `GameUpdated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `GameUpdatedBy` VARCHAR(50) NOT NULL,
  `GameDeleted` TIMESTAMP NULL DEFAULT NULL,
  `GameDeletedBy` VARCHAR(50) DEFAULT NULL,
  FOREIGN KEY `fk_HomeTeamID` (`HomeTeamID`) REFERENCES `TeamsRaw` (`TeamID`),
  FOREIGN KEY `fk_VisitorTeamID` (`VisitorTeamID`) REFERENCES `TeamsRaw` (`TeamID`),
  FOREIGN KEY `fk_WinnerTeamID` (`WinnerTeamID`) REFERENCES `TeamsRaw` (`TeamID`),
  FOREIGN KEY `fk_GameHasPossession` (`GameHasPossession`) REFERENCES `TeamsRaw` (`TeamID`),
  FOREIGN KEY `fk_GameInRedzone` (`GameInRedzone`) REFERENCES `TeamsRaw` (`TeamID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;
CREATE VIEW `Games` AS SELECT `GameID`, `GameWeek`, `GameNumber`, `HomeTeamID`, `GameHomeSpread`, `VisitorTeamID`, `GameVisitorSpread`, `WinnerTeamID`, `GameStatus`, `GameKickoff`, `GameTimeLeftInSeconds`, `GameHasPossession`, `GameInRedzone` FROM `GamesRaw` WHERE `GameDeleted` IS NULL;

CREATE TABLE `PicksRaw` (
  `PickID` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `UserID` INTEGER NOT NULL,
  `LeagueID` INTEGER NOT NULL,
  `GameID` INTEGER NOT NULL,
  `TeamID` INTEGER DEFAULT NULL,
  `PickPoints` INTEGER DEFAULT NULL,
  `PickAdded` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `PickAddedBy` VARCHAR(50) NOT NULL,
  `PickUpdated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `PickUpdatedBy` VARCHAR(50) NOT NULL,
  `PickDeleted` TIMESTAMP NULL DEFAULT NULL,
  `PickDeletedBy` VARCHAR(50) DEFAULT NULL,
  FOREIGN KEY `fk_UserID` (`UserID`) REFERENCES `UsersRaw` (`UserID`),
  FOREIGN KEY `fk_LeagueID` (`LeagueID`) REFERENCES `LeaguesRaw` (`LeagueID`),
  FOREIGN KEY `fk_GameID` (`GameID`) REFERENCES `GamesRaw` (`GameID`),
  FOREIGN KEY `fk_TeamID` (`TeamID`) REFERENCES `TeamsRaw` (`TeamID`),
  UNIQUE KEY `uk_UserPick` (`UserID`, `LeagueID`, `GameID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;
CREATE VIEW `Picks` AS SELECT `PickID`, `UserID`, `LeagueID`, `GameID`, `TeamID`, `PickPoints` FROM `PicksRaw` WHERE `PickDeleted` IS NULL;

CREATE TABLE `SurvivorPicksRaw` (
  `SurvivorPickID` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `UserID` INTEGER NOT NULL,
  `LeagueID` INTEGER NOT NULL,
  `SurvivorPickWeek` INTEGER NOT NULL,
  `GameID` INTEGER DEFAULT NULL,
  `TeamID` INTEGER DEFAULT NULL,
  `SurvivorPickAdded` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `SurvivorPickAddedBy` VARCHAR(50) NOT NULL,
  `SurvivorPickUpdated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `SurvivorPickUpdatedBy` VARCHAR(50) NOT NULL,
  `SurvivorPickDeleted` TIMESTAMP NULL DEFAULT NULL,
  `SurvivorPickDeletedBy` VARCHAR(50) DEFAULT NULL,
  FOREIGN KEY `fk_UserID` (`UserID`) REFERENCES `UsersRaw` (`UserID`),
  FOREIGN KEY `fk_LeagueID` (`LeagueID`) REFERENCES `LeaguesRaw` (`LeagueID`),
  FOREIGN KEY `fk_GameID` (`GameID`) REFERENCES `GamesRaw` (`GameID`),
  FOREIGN KEY `fk_TeamID` (`TeamID`) REFERENCES `TeamsRaw` (`TeamID`),
  UNIQUE KEY `uk_SurvivorWeek` (`UserID`, `LeagueID`, `SurvivorPickWeek`),
  UNIQUE KEY `uk_SurvivorPick` (`UserID`, `LeagueID`, `TeamID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;
CREATE VIEW `SurvivorPicks` AS SELECT `SurvivorPickID`, `UserID`, `LeagueID`, `SurvivorPickWeek`, `GameID`, `TeamID` FROM `SurvivorPicksRaw` WHERE `SurvivorPickDeleted` IS NULL;

CREATE TABLE `APICallsRaw` (
  `APICallID` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `APICallDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `APICallError` VARCHAR(250) DEFAULT NULL,
  `APICallResponse` TEXT,
  `APICallURL` VARCHAR(250) NOT NULL,
  `APICallWeek` INTEGER NOT NULL,
  `APICallYear` INTEGER NOT NULL,
  `APICallAdded` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `APICallAddedBy` VARCHAR(50) NOT NULL,
  `APICallUpdated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `APICallUpdatedBy` VARCHAR(50) NOT NULL,
  `APICallDeleted` TIMESTAMP NULL DEFAULT NULL,
  `APICallDeletedBy` VARCHAR(50) DEFAULT NULL,
  UNIQUE KEY `uk_APICall` (`APICallDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;
CREATE VIEW `APICalls` AS SELECT `APICallID`, `APICallDate`, `APICallError`, `APICallResponse`, `APICallURL`, `APICallWeek`, `APICallYear` FROM `APICallsRaw` WHERE `APICallDeleted` IS NULL;

CREATE TABLE `HistoryRaw` (
  `HistoryID` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `UserID` INTEGER NOT NULL,
  `HistoryYear` INTEGER NOT NULL,
  `LeagueID` INTEGER NOT NULL,
  `HistoryType` ENUM('Overall', 'Survivor', 'Weekly') NOT NULL,
  `HistoryWeek` INTEGER DEFAULT NULL,
  `HistoryPlace` INTEGER DEFAULT NULL,
  `HistoryAdded` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `HistoryAddedBy` VARCHAR(50) NOT NULL,
  `HistoryUpdated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `HistoryUpdatedBy` VARCHAR(50) NOT NULL,
  `HistoryDeleted` TIMESTAMP NULL DEFAULT NULL,
  `HistoryDeletedBy` VARCHAR(50) DEFAULT NULL,
  FOREIGN KEY `fk_UserID` (`UserID`) REFERENCES `UsersRaw` (`UserID`),
  FOREIGN KEY `fk_LeagueID` (`LeagueID`) REFERENCES `LeaguesRaw` (`LeagueID`),
  UNIQUE KEY `uk_History` (`HistoryYear`, `HistoryType`, `HistoryWeek`, `UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;
CREATE VIEW `History` AS SELECT `HistoryID`, `UserID`, `HistoryYear`, `LeagueID`, `HistoryType`, `HistoryWeek`, `HistoryPlace` FROM `HistoryRaw` WHERE `HistoryDeleted` IS NULL;

CREATE TABLE `SystemValuesRaw` (
  `SystemValueID` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `SystemValueName` VARCHAR(20) NOT NULL,
  `SystemValueValue` VARCHAR(99) DEFAULT NULL,
  `SystemValueAdded` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `SystemValueAddedBy` VARCHAR(50) NOT NULL,
  `SystemValueUpdated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `SystemValueUpdatedBy` VARCHAR(50) NOT NULL,
  `SystemValueDeleted` TIMESTAMP NULL DEFAULT NULL,
  `SystemValueDeletedBy` VARCHAR(50) DEFAULT NULL,
  UNIQUE KEY `uk_SystemValue` (`SystemValueName`, `SystemValueValue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;
CREATE VIEW `SystemValues` AS SELECT `SystemValueID`, `SystemValueName`, `SystemValueValue` FROM `SystemValuesRaw` WHERE `SystemValueDeleted` IS NULL;
