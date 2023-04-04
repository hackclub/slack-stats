# [Slack Stats](https://slack-stats.hackclub.dev/)

A little web app to collect and visualize weekly stats for the Hack Club Slack. Statistics are fun and help us make the Slack better, but Slack's official stats page kinda sucks!

Stack: Next.js 13 beta with app directory. Airtable for configuration and as a database.

![screenshot of the sprig stats page](https://doggo.ninja/W9haC6.png)

## Maintenance

### Configuration:

Open the [Slack Stats](https://airtable.com/appfewDQPFde2gvcC/) base in the Hack Club airtable. You'll need org access.

If you don't have access to the Hack Club org on Airtable, you can access a read-only copy of the database: [airtable.com/shrchjsMgctNzkEDt](https://airtable.com/shrchjsMgctNzkEDt)

### Deployment and logs:

This is deployed on Vercel to [slack-stats.hackclub.dev](https://slack-stats.hackclub.dev/). The [project](https://vercel.com/hackclub/slack-stats/) is under Hack Club's Vercel org.

### Run locally:

Clone the repo, `cd` into it, and run `yarn` to install dependencies.

Run `yarn dev` to start the development server for the website.

Run `yarn sync` to sync new Slack stats to Airtable.

### Environment variables:

Put these in a `.env` file in the project root using newline-separated `KEY=VALUE` format.

- `AIRTABLE_API_KEY`: Personal access token that should have access to the Airtable base. Create one at the [Airtable developer center](https://airtable.com/create/tokens).
- `SLACK_XOXC`:
	- Load the [official Slack stats page](https://hackclub.slack.com/admin/stats)
	- Open the "Network" tab of Chrome developer tools
	- Click the request that starts with "team.stats.timeSeries"
	- Navigate to the "Payload" tab
	- Use contents of the `token` field
- `SLACK_XOXD`:
	- Load the [official Slack stats page](https://hackclub.slack.com/admin/stats)
	- View cookies with EditThisCookie browser extension or "Application" tab of Chrome devtools
	- Use contents of the `d` cookie
