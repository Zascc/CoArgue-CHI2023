# CoArgue: Fostering Lurkers’ Contribution to Collective Arguments in Community-based QA Platforms
This is the source code for the prototype system CoArgue, a tool that supports lurkers on Community-based QA (CQA) Platforms in making contributions. The system is part of a research paperwork with the above name, which is accepted by CHI 2023.

You are welcome to [cite](#cite) the paper if you find it insightful.

## Abstract
In Community-Based Question Answering (CQA) platforms, people
can participate in discussions about non-factoid topics by mark-
ing their stances, providing premises, or arguing for the opinions
they support, which forms “collective arguments”. The sustainable
development of collective arguments relies on a big contributor
base, yet most of the frequent CQA users are lurkers who seldom
speak out. With a formative study, we identified detailed obstacles
preventing lurkers from contributing to collective arguments. We
consequently designed a processing pipeline for extracting and
summarizing augmentative elements from question threads. Based
on this we built CoArgue, a tool with navigation and chatbot fea-
tures to support CQA lurkers’ motivation and ability in making
contributions. Through a within-subject study (N=24), we found
that, compared to a Quora-like baseline, participants perceived
CoArgue as significantly more useful in enhancing their motivation
and ability to join collective arguments and found the experience
to be more engaging and productive.

## Run

### Contribution Evaluation
The contribution after submitting the post is evaluated by serveral NLP models. Refer to this [link](https://github.com/pytorch/serve/blob/master/README.md) to create the evaluation APIs with your own model and update the API URLs at the very beginning of `main.js` in the "frontend" folder.

### Chatbot Widget
The essential code and settings are contained in the "chatbot" folder. 

To train and run a chatbot model, refer to the official Rasa documentation [here](https://rasa.com/docs/rasa/command-line-interface).

To connect the running chatbot model to the frontend chatbot widget, follow the instructions in this [link](https://rasa.com/docs/rasa/connectors/your-own-website/).

### Website
Simply open the `index.html` in the "frontend" folder to run the website.

It contains the augmented information for two question threads. To switch between the two threads, provide the URL param `question=bitcoin` or `question=car`. The system defaults to `bitcoin` if not provided.

It also contains the baseline version, which is no more than a port of plain Quora website, with UI element aligned. To switch to the baseline version, do `git switch baseline`.
## Cite
TODO, not available yet.
