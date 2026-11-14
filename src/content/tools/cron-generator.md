## Why Client-Side Matters

Cron schedules run the quiet background work of the internet — backups, reports, clean-ups, and reminders — but the five-field syntax is famously easy to get wrong, and one wrong field can mean a job that runs every minute instead of once a month. Many cron tools send your schedule to a server to explain it, which is unnecessary for what is really a small piece of text. This generator builds and explains cron expressions entirely in your browser. Your schedules stay on your device, and the plain-English explanation appears instantly.

## Step-by-Step Guide

Building a schedule takes under a minute. First, choose values from the five dropdowns: minute, hour, day of the month, month, and day of the week. The cron expression forms itself as you choose, and a plain-English sentence explains exactly when the job will run. Second, copy the expression into your crontab, your GitHub Actions workflow, or any other scheduler. To understand an existing schedule instead, paste it into the Explain box and read the human-readable translation that appears below it.

## Feature Deep Dive

A standard cron expression has five fields, separated by spaces: minute from 0 to 59, hour from 0 to 23, day of the month from 1 to 31, month from 1 to 12, and day of the week from 0 to 6, where 0 is Sunday. The asterisk means every value, a step such as */15 means every fifteenth value, a comma list such as 1,15 picks specific values, and a range such as 1-5 covers weekdays Monday to Friday. The builder's dropdowns cover the common choices — every 5, 10, 15, or 30 minutes, midnight, 9 AM, noon, 6 PM, the 1st or 15th of the month, and the last day of the month — so you rarely need to type a field by hand. The explainer reads all of these forms back in plain English, which makes it easy to double-check a schedule someone else wrote before you trust it with a production job.

## Use Cases

Developers schedule nightly database backups, weekly report emails, and hourly cache clean-ups. System administrators automate log rotation and server maintenance. Data teams run regular imports and exports. Content teams schedule social posts and newsletter sends through automation tools. Students learning Linux use the explainer to decode the crontab examples in their course. And anyone who has inherited a server can paste in a mysterious cron line and finally learn what it actually does, and when.

## Frequently Asked Questions

**What does "0 9 * * 1-5" mean?**

It runs at 9 AM, at minute zero, on every day of the month and every month, but only on weekdays Monday to Friday. The 1-5 in the last field is a weekday range.

**Why did my job run at the wrong time?**

The most common cause is the timezone: cron uses the server's local time, not yours. Check which timezone the server is set to, and remember that hours run from 0 to 23, so 18 means 6 PM.

**Can I use this for GitHub Actions schedules?**

Yes. GitHub Actions uses the same five-field cron format, so expressions built here can be pasted into a workflow file. Note that GitHub Actions runs on UTC, so convert your local time first.

**What happens if I set both day of month and day of week?**

In standard cron, setting both means the job runs when either condition matches, not both. To be safe, leave one of them as an asterisk unless you specifically want that behaviour.
