# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

from dis import dis
from tkinter import Button
from typing import Any, Text, Dict, List

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, Restarted, SessionStarted, ActionExecuted, FollowupAction, AllSlotsReset, ReminderScheduled, UserUtteranceReverted
import json
import random
import os



class ActionDefaultFallback(Action):
    """Executes the fallback action and goes back to the previous state
    of the dialogue"""

    def name(self) -> Text:
        return 'default_fallback_action'

    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
                 
        
        dispatcher.utter_message(text="Sorry, I cannot understand what you mean.")
        dispatcher.utter_message(text='For my better performance, could you please rephrase the words?')

        # Revert user message which led to fallback.
        return [UserUtteranceReverted()]


class ActionGreetAndIntro(Action):
    def name(self) -> Text:
        return "greet_and_intro_action"

    def run(self, dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:


        text = "Hi, I have read all the answer posts to be knowledgeable but I cannot be as creative as you with my awkward mind. Let’s contribute something amazing together!"
        buttons = []
        buttons.append({'title': 'Start', 'payload': '/start'})
        dispatcher.utter_message(text=text, buttons=buttons)
        return []


class ActionInitialization(Action):
    def name(self) -> Text:
        return "initialization_action"

    def run(self, dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:


        buttons = []
        buttons.append({"title": 'Write now' , "payload": '/write_now'})
        buttons.append({"title": 'Explore', "payload": '/discuss'})
        buttons.append({"title": 'Not now', "payload": '/no_idea'})
        text = "Already got something in mind? Share with me to clear your concerns!"
        
        dispatcher.utter_message(text=text, buttons=buttons)
        return []

class ActionWriteNow(Action):
    def name(self) -> Text:
        return "answer_writing_action"

    def run(self, dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        dispatcher.utter_message(text='You can now start writing by clicking on the "Write Answer "button!')
        return []


class ActionStanceInqury(Action):
    def name(self) -> Text:
        return "stance_inqury_action"

    def run(self, dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        buttons = []
        buttons.append({"title": 'Positive', "payload": 'Positive'})
        buttons.append({"title": 'Neutral', "payload": 'Neutral'})
        buttons.append({"title": 'Negative', "payload": 'Negative'})
        
        dispatcher.utter_message(text='What’s your attitude on the Bitcoin investment?', buttons=buttons)
        return [SlotSet('ClaimIndex', '0')]

        

class ActionEncouragement(Action):
    def name(self) -> Text:
        return "encouragement_action"

    def run(self, dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        text = "I do understand the difficulties to create something meaningful as my mind is restricted by the algorithms. But together, with your true potential, we can achieve something significant! To take the first step, just tell me your attitude on the Bitcoin investment."
        dispatcher.utter_message(text=text)
        return []


class ActionClaimSuggestion(Action):
    def name(self) -> Text:
        return "claim_center_suggestion_action"

    def run(self, dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        stance = tracker.get_slot("StanceCategory").lower()
        claimIdx = int(tracker.get_slot('ClaimIndex'))

        if(stance not in ["positive", "neutral", "negative"]):
            dispatcher.utter_message(text = "Hmm, I cannot understand your stance. I guess you want to choose stance 'positive'")
            stance = "positive"
        def num_of_claim_center_selector(x):
            return {
                "positive": 2,
                "neutral": 7,
                "negative": 3
            }[x]
        def claim_center_list_selector(x):
            return {
                "positive": ["I would say YES!", "Of course you should"],
                "neutral": ["It’s not too late to invest.", "That’s up to you.", "It depends what your level of disposable income is, how great your assets are, and what other assets you have invested in.", "The significant thing is to do your own research and comprehend the dangers.", "Invest in Bitcoin, only if you are okay to loss all.", "Investing in Bitcoin is viable option especially in a view of current decline of the power of Fiat currencies.", "If you are willing to take the risk, first make sure you understand what you are investing in and have a crypto investment strategy"],
                "negative": ["Bitcoin is pretty useless. But so is gold.", "Cryto currency is an extremely high-hazard venture, and CFDs bought on margin are significantly more hazardous.", "It is almost certainly in a bubble."]
            }[x]
        
        def extreme_claim_center_selector(x):
            return {
                "positive": ["Of course you should", "I would say YES!"],
                "neutral": ["Invest in Bitcoin, only if you are okay to loss all.", "The significant thing is to do your own research and comprehend the dangers."],
                "negative": ["Bitcoin is pretty useless. But so is gold.", "Cryto currency is an extremely high-hazard venture, and CFDs bought on margin are significantly more hazardous."]
            }[x]
        num_of_claim_center = num_of_claim_center_selector(stance)

        claim_center_list = claim_center_list_selector(stance)

        [highest_supported_claim_center, lowest_supported_claim_center] = extreme_claim_center_selector(stance)
        claimThisRound = claim_center_list[claimIdx]

        buttons = []
        buttons.append({"title": "Great!", "payload": '/choose_claim_center{{"ChosenClaimCenter": "claim_{}"}}'.format(claimIdx)})
        buttons.append({"title": "Not interested", "payload": '/not_interested'})

        if(claimIdx == 0):
            text = "In this case, I found **'{}'** claims are not supported sufficiently. Would you like to try this?".format(claimThisRound)
        if(claimIdx == (len(claim_center_list) - 1)):
            text = "Then how about **'{}'** claims?".format(claimThisRound)
            buttons.pop()
            claimIdx = -1
        else:
            text = "Then how about **'{}'** claims?".format(claimThisRound)
        buttons.append({'title': 'Choose stance again', "payload": '/choose_stance_again'})
        # for idx, el in enumerate(claim_center_list):
        #     buttons.append({"title": "claim {}".format(idx), "payload": '/choose_claim_center{{"ChosenClaimCenter": "claim_{}"}}'.format(idx)})
        #     text += "claim {}: {}\n".format(idx, el)
        dispatcher.utter_message(text=text, buttons=buttons)
        return [SlotSet('ClaimIndex', str(claimIdx + 1))]

class ActionKeywordsSelecting(Action):
    def name(self) -> Text:
        return "keywords_selecting_action"

    def run(self, dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        text = "Good job! Ready to write something? Or I can discuss with you, sharing the hints if you want."
        buttons = []
        buttons.append({"title": "Write now!", "payload": "/write_now"})
        buttons.append({"title": "Discuss", "payload": "/discuss"})
        buttons.append({"title": "Hints", "payload": "/no_idea"})
        dispatcher.utter_message(text=text, buttons=buttons)
        return []
class ActionAskingKeywords(Action):
    def name(self) -> Text:
        return "ask_for_keywords_action"

    def run(self, dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        text = "Sure! You can give me some keywords related to the Bitcoin background. Please give the keywords in the form of 'Keywords: <keywords A> <keyword B>......'"
        dispatcher.utter_message(text=text)
        
        
        return []

class ActionKeywordsMatching(Action):
    #  need keywords to be prompted out after praising user's input
    def name(self) -> Text:
        return "keywords_matching_action"

    def run(self, dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        with open('./data/keywords.json', 'r') as f:
            keywordsData = json.load(f)
        stance = tracker.get_slot('StanceCategory').lower()
        chosenClaimCenter = tracker.get_slot('ChosenClaimCenter')

        keywordsList = keywordsData[stance][chosenClaimCenter]

        lowFrequentKeywords = [keywordsList[-1][0], keywordsList[-2][0]]
        highFrequentKeywords = [keywordsList[0][0], keywordsList[1][0]]
        relatedKeywords = [i[0] for i in random.sample(keywordsList[2:-2], 2)]
        
        lowFrequentKeywordsText = '{}, {}'.format(*lowFrequentKeywords)
        highFrequentKeywordsText = '{}, {}'.format(*highFrequentKeywords)
        relatedKeywordsText = '{}, {}'.format(*relatedKeywords)
        keywordsText = lowFrequentKeywordsText + highFrequentKeywordsText + relatedKeywordsText
        text = "I ran a quick search and here are what you may consier:\nNot mentioned before: **{}**.\nMentioned in some posts: **{}**.\nRelated keywords to consider: **{}**.".format(lowFrequentKeywordsText, highFrequentKeywordsText, relatedKeywordsText)
        buttons = []
        buttons.append({"title":'Write now!', "payload": '/write_now'})
        buttons.append({"title": 'Restart', 'payload': '/restart'})
        dispatcher.utter_message(text=text, buttons=buttons)
        return [SlotSet("Keywords", keywordsText)]

class ActionKeywordsPrompting(Action):
    def name(self) -> Text:
        return "keywords_prompting_action"

    def run(self, dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        with open('./data/keywords.json', 'r') as f:
            keywordsData = json.load(f)
        stance = tracker.get_slot('StanceCategory').lower()
        chosenClaimCenter = tracker.get_slot('ChosenClaimCenter')

        keywordsList = keywordsData[stance][chosenClaimCenter]
        sampleKeywords = random.sample(keywordsList, 4)

        keywordsTextList = [i[0] for i in sampleKeywords]
        keywordsText = '{}, {}, {}, {}'.format(*keywordsTextList)
        text = "Here are some topic you can talk about:\n**{}**\nWe can do this again if still clueless. Believe me, I can do this all day with endless energy!".format(keywordsText)
        buttons = []
        buttons.append({"title":'Write now!', "payload": '/write_now'})
        buttons.append({"title": 'Restart', 'payload': '/restart'})
        dispatcher.utter_message(text=text, buttons=buttons)
        return [SlotSet("Keywords", keywordsText)]

class ActionInfoDisplaying(Action):
    def name(self) -> Text:
        return "info_displaying_action"

    def run(self, dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        def claim_center_list_selector(x):
            return {
                "positive": ["I would say YES!", "Of course you should"],
                "neutral": ["It’s not too late to invest.", "That’s up to you.", "It depends what your level of disposable income is, how great your assets are, and what other assets you have invested in.", "The significant thing is to do your own research and comprehend the dangers.", "Invest in Bitcoin, only if you are okay to loss all.", "Investing in Bitcoin is viable option especially in a view of current decline of the power of Fiat currencies.", "If you are willing to take the risk, first make sure you understand what you are investing in and have a crypto investment strategy"],
                "negative": ["Bitcoin is pretty useless. But so is gold.", "Cryto currency is an extremely high-hazard venture, and CFDs bought on margin are significantly more hazardous.", "It is almost certainly in a bubble."]
            }[x]

        stance = tracker.get_slot('StanceCategory').lower()
        if(stance != 'na'):
            chosenClaimCenter = claim_center_list_selector(stance)[int(tracker.get_slot('ChosenClaimCenter')[-1:])]
        else:
            chosenClaimCenter = 'na'
        
        keywords = tracker.get_slot('Keywords')
        text = "Information Data: \nMy attitude towards investing in Bitcoin is {}. For the bitcoin topic, I agree with the view that '{}'. My argument mainly has the following aspects: {}.".format(stance, chosenClaimCenter, keywords)

        dispatcher.utter_message(text=text)
        return []