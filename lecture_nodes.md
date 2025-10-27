so in your front-end assignment, which we released on monday, we're going to encourage you to use agentic coding tools. here I'm using cursor. We know some students...

i've loaded the repo here. I've started the backend. We aren't going to touch the concepts at all. if we were going to, we'd use the Context tool to do it and then come back to cursor.

1. you can see the API here that we generated using eagon's concept tool.
2. now let's start by having cursor explain the API to me.
3. and so far i've pre-vibe coded a small front-end for us. I did this in vue.js, which is the framework we'll be using in this course. Amber is going to give some lectures on vue next week. Now I did this in advance because... So here's what it looks like. 
3a. So we can actually prompt cursor to take on different roles. We can directly do this in the prompt, or we could even define them ourselves. And let's have cursor explain what we have so far.
4. what features are missing here? let's add one. maybe I'd like to be able to decide on the survey scale beforehand. maybe I'd like to be able to look at all of an individual user's responses.
5. so in part of your assignment, your job will be to create a design portfolio and align your website to it. now just to keep things super simple, let's say I really love apple's website design and I want to copy it. let's try that. first, let's brainstorm with the model. then ask it to make a plan. then execute.
6. notice the context is getting long. its automatically cutting it down over time. we can manually point it to files too.
7. now let's ask the model to critique it's work.
8. we can even ask the model to use the website for us.
9. what design changes should we make here?
10. now let's say I want to do some interesting data analysis. first let's vibe code synthetic data. then add analysis code.
11. as we've talked about before, llms are inherently stateless. so what if you've just spend a long time talking to the model, teaching it things about your codebase? / generate cursor rules
12. now we've been working with this codebase for a while, can we ask the model to consider re-factoring it for us?

critique it. is there a way to make this code simpler and shorter? re-factor it.

role: plan out some changes for me.
role: critique and find issues.
role: execute this existing plan.

vibe a file that generates synthetic data. Can ask cursor to use the user_names instead of user ids as the field.

create a survey responder page.
create a view results page.

managing context
/ summarize

as we've talked about before, llms are inherently stateless. so what if you've just spend a long time talking to the model, teaching it things about your codebase?
/ generate cursor rules

how do keep track of changes. be explicit about where I want it to add new features in a new codebase.
consider using cursor's ability
have the model re-factor code.

just axios?