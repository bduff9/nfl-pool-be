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
import axios from 'axios';

import { Game } from '../entity';

import { API_NEWS_KEY } from './constants';
import { getRandomInteger } from './numbers';

export type APINewsArticle = {
	author: null | string;
	content: string;
	description: string;
	publishedAt: string;
	source: {
		id: null | string;
		name: string;
	};
	title: string;
	url: string;
	urlToImage: null | string;
};
type APINewsResults = {
	articles: Array<APINewsArticle>;
	status: string;
	totalResults: number;
};

const getAPINewsURL = (week: number, from: string): string =>
	`https://newsapi.org/v2/everything?q=+nfl week ${week} -fantasy -college -roundup&excludeDomains=engadget.com,androidcentral.com&from=${from}&apiKey=${API_NEWS_KEY}`;

export const getArticlesForWeek = async (week: number): Promise<Array<APINewsArticle>> => {
	const firstGame = await Game.findOneOrFail({ where: { gameNumber: 1, gameWeek: week } });
	const firstGameDate = firstGame.gameKickoff.toISOString().substring(0, 10);
	const url = getAPINewsURL(week, firstGameDate);
	const apiResults = await axios.get<APINewsResults>(url);
	const filteredArticles = apiResults.data.articles.filter(
		article => !!article.author && !!article.urlToImage,
	);
	const articles: Array<APINewsArticle> = [];

	while (articles.length < 3) {
		const index = getRandomInteger(0, filteredArticles.length);

		articles.push(...filteredArticles.splice(index, 1));
	}

	return articles;
};

// type GNewsArticle = {
// 	content: string;
// 	description: string;
// 	image: string;
// 	publishedAt: string;
// 	source: {
// 		name: string;
// 		url: string;
// 	};
// 	title: string;
// 	url: string;
// };
// type GNewsResults = {
// 	articles: Array<GNewsArticle>;
// 	totalArticles: number;
// };

// const getGNewsURL = (week: number, from: string): string =>
// 	`https://gnews.io/api/v4/top-headlines?topic=sports&lang=en&q=nfl week ${week} AND NOT fantasy AND NOT college AND NOT roundup&from=${from}&token=${GNEWS_KEY}`;

// export const getArticlesForWeek = async (week: number): Promise<Array<GNewsArticle>> => {
// 	const firstGame = await Game.findOneOrFail({ where: { gameNumber: 1, gameWeek: week } });
// 	const firstGameDate = `${firstGame.gameKickoff.toISOString().split('.')[0]}Z`;
// 	const url = getGNewsURL(week, firstGameDate);
// 	const apiResults = await axios.get<GNewsResults>(url);
// 	//TODO: unsure on filtering for GNews currently
// 	const filteredArticles = apiResults.data.articles.filter(() => true);
// 	const articles: Array<GNewsArticle> = [];

// 	while (articles.length < 3) {
// 		const index = getRandomInteger(0, filteredArticles.length);

// 		articles.push(...filteredArticles.splice(index, 1));
// 	}

// 	return articles;
// };
