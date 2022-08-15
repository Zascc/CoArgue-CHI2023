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


        text = "Welcome! I am your ArgueMore tutor. Nice to meet you here! I have already gone through all the fascinating posts here and learned much from their sharings. I can't wait to create more valuable posts with you. I'm always ready for you. Let's go! If you **get ready to write something**, please click the button below or directly send 'start' to me."
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
        buttons.append({"title": 'Write now' , "payload": 'Write now'})
        buttons.append({"title": 'Discuss', "payload": 'Discuss'})
        buttons.append({"title": 'Give up', "payload": 'no idea'})
        text = "Bitcoin is a hot and fascinating topic. After seeing other friends’ opinions here, do you want to express your unique and valuable opinion? I am also interested in this topic and looking forward to more novel perspectives. If you are not sure how to share your ideas efficiently in our community, don’t hesitate to talk with me :) "
        
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
        return []

        

class ActionEncouragement(Action):
    def name(self) -> Text:
        return "encouragement_action"

    def run(self, dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        text = "I know sometimes it's hard to start something from scratch. But I am a skillful tutor to help you **convey your opinion step by step**. I am definitely sure that your knowledge and experience will **enrich our community**. So, as the first step, you can tell me your attitude on the Bitcoin investment."
        dispatcher.utter_message(text=text)
        return []


class ActionClaimSuggestion(Action):
    def name(self) -> Text:
        return "claim_center_suggestion_action"

    def run(self, dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        stance = tracker.get_slot("StanceCategory").lower()
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
        # highest_supported_claim_center, lowest_supported_claim_center = "", ""
        text = "Among the answers with a {} view, there is {} leading group of claims. **'{}' claims are relatively well-discussed**. However, **'{}' claims have not been supported by sufficient premise and evidence**. Which claim do you tend to develop more?".format(stance, num_of_claim_center, highest_supported_claim_center, lowest_supported_claim_center)
        dispatcher.utter_message(text=text)
        buttons = []
        text = ""
        for idx, el in enumerate(claim_center_list):
            buttons.append({"title": "claim {}".format(idx), "payload": '/choose_claim_center{{"ChosenClaimCenter": "claim_{}"}}'.format(idx)})
            text += "claim {}: {}\n".format(idx, el)
        dispatcher.utter_message(text=text, buttons=buttons)
        return []

class ActionKeywordsSelecting(Action):
    def name(self) -> Text:
        return "keywords_selecting_action"

    def run(self, dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        text = "Ok, it seems like you already have some initial perspectives. Good job! To smoothly think about the supporting premise and evidence for your argument writing, you could tell me your thoughts, or I can give you some hints. If you are prepared and confident to write down your post now, I will still be with you in the writing panel."
        buttons = []
        buttons.append({"title": "Write now!", "payload": "Write now!"})
        buttons.append({"title": "Discuss about my ideas", "payload": "/discuss"})
        buttons.append({"title": "Have your hints", "payload": "/no_idea"})
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
        text = "Wow, you are so thoughtful! These are promising points to create a good post. **{}** have not been often mentioned before. (**{}** have been mentioned in some posts, and **{}** are some related keywords that you could consider.) I am confident that you can create a novel and fantastic post. I will wait for you in the writing pane!".format(lowFrequentKeywordsText, highFrequentKeywordsText, relatedKeywordsText)
        dispatcher.utter_message(text=text)
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
        text = "Ok, I can share some of my thoughts with you. Regarding to this claim, you could say something about these topics:\n**{}**\nHope that these suggestions will inspire to think more ideas! I will wait you in the writing pane!".format(keywordsText)
        buttons = []
        buttons.append({"title":'Write now!', "payload": 'Write now!'})
        dispatcher.utter_message(text=text)
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