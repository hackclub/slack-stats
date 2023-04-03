# Slack Stats

A little web app to collect and visualize weekly stats for the Hack Club Slack for community manager people. Uses Airtable for configuration and as a database.

## Maintenance

### Configuration:

Open the [Slack Stats](https://airtable.com/appfewDQPFde2gvcC/) base in the Hack Club airtable. You'll need org access.

### Deployment and logs:

This is deployed on Vercel to [slack-stats.hackclub.dev](https://slack-stats.hackclub.dev/). Password protection is configured on the Vercel side. The [project](https://vercel.com/hackclub/slack-stats/) is under Hack Club's Vercel org.

### Run locally:

Clone the repo, `cd` into it, and run `yarn` to install dependencies.

Run `yarn dev` to start the development server for the website.

Run `yarn sync` to sync new Slack stats to Airtable.

### Environment variables:

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
