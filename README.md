# nfl-be

This is a backend GraphQL project, written in Typescript with TypeORM and Type-graphql. It connects to a MySQL database to return data.

## Local development

Clone this locally and then run `npm run setup` to install dependencies. Either setup a MySQL database locally or use the `docker-compose up` command to run a containerized version of MySQL. Install vercel globally with `npm i -g vercel`. You will also need to create/pull the .env file. Either sign into vercel with `vercel login` and run `vercel env pull` or copy and rename .env.example to .env and fill in the values. Once this has been done, run `vercel build` to run it locally.

## External Services

[Sentry](https://sentry.io/organizations/aswnn/projects/) - We use this to track uncaught errors at runtime
[Github actions]() - This is used to run CI/CD on our repos on code changes
[Logflare](https://logflare.app/dashboard) - We are currently evaluating this log collecting tool
[LogDNA](https://app.logdna.com/a59a28eafd/logs/view) - We are currently evaluating this log collecting tool
[Datadog](https://app.datadoghq.com/help/quick_start) - We are currently evaluating this log collecting tool
[Sematext](https://apps.sematext.com/ui/integrations/apps) - We are currently evaluating this log collecting tool
[Heliohost](https://www.heliohost.org/login/) - This provides free web hosting, we are using it currently for our MySQL database
