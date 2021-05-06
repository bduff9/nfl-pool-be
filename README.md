# nfl-pool-be

[![Github Actions](https://github.com/bduff9/nfl-pool-be/workflows/Tests%20CI/badge.svg)](https://github.com/bduff9/nfl-pool-be/actions/workflows/tests.yml)
[![BCH compliance](https://bettercodehub.com/edge/badge/bduff9/nfl-pool-be?branch=main)](https://bettercodehub.com/)
[![CodeFactor](https://www.codefactor.io/repository/github/bduff9/nfl-pool-be/badge)](https://www.codefactor.io/repository/github/bduff9/nfl-pool-be)
[![Coverage Status](https://coveralls.io/repos/github/bduff9/nfl-pool-be/badge.svg?branch=main)](https://coveralls.io/github/bduff9/nfl-pool-be?branch=main)
[![Known Vulnerabilities](https://snyk.io/test/github/bduff9/nfl-pool-be/badge.svg)](https://snyk.io/test/github/bduff9/nfl-pool-be)
[![deepcode](https://www.deepcode.ai/api/gh/badge?key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF0Zm9ybTEiOiJnaCIsIm93bmVyMSI6ImJkdWZmOSIsInJlcG8xIjoibmZsLXBvb2wtYmUiLCJpbmNsdWRlTGludCI6ZmFsc2UsImF1dGhvcklkIjoyNjUxMiwiaWF0IjoxNjE0Mzk2MDExfQ.EnZ-xms15PzAFx5sNtf0izQgE4Bh9whXyf-5-z7JV2I)](https://www.deepcode.ai/app/gh/bduff9/nfl-pool-be/_/dashboard?utm_content=gh%2Fbduff9%2Fnfl-pool-be)

This is a backend GraphQL project, written in Typescript with TypeORM and Type-graphql. It connects to a MySQL database to return data.

## Local development

Clone this locally and then run `npm run setup` to install dependencies. Either setup a MySQL database locally or use the `docker-compose up` command to run a containerized version of MySQL. Install vercel globally with `npm i -g vercel`. You will also need to create/pull the .env file. Either sign into vercel with `vercel login` and run `vercel env pull` or copy and rename .env.example to .env and fill in the values. Once this has been done, run `vercel build` to run it locally.

## External Services

[Sentry](https://sentry.io/organizations/aswnn/projects/) - We use this to track uncaught errors at runtime
[Github actions](https://github.com/bduff9/nfl-pool-be/actions) - This is used to run CI/CD on our repos on code changes
[Logflare](https://logflare.app/dashboard) - We are currently evaluating this log collecting tool
[LogDNA](https://app.logdna.com/a59a28eafd/logs/view) - We are currently evaluating this log collecting tool
[Datadog](https://app.datadoghq.com/help/quick_start) - We are currently evaluating this log collecting tool
[Sematext](https://apps.sematext.com/ui/integrations/apps) - We are currently evaluating this log collecting tool
[Heliohost](https://www.heliohost.org/login/) - This provides free web hosting, we are using it currently for our MySQL database

## Monitoring

We use Sentry and Logflare for monitoring. Logflare captures all logging. Sentry captures all errors.

## License

This project is licensed under the terms of the GPL 3.0 license.
