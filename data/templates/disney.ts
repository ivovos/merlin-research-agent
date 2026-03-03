import type { TemplateConfig } from './index'
import type { QuestionType } from '@/types'

export const disneyTemplates: TemplateConfig[] = [
  {
    key: 'disney-key-art',
    label: 'Key Art Questionnaire',
    icon: 'Image',
    surveyType: 'creative',
    category: 'marketing',
    creatorLabel: 'Created by Disney UK',
    questions: [
      // S5. Likeability Key Art
      { text: 'How much do you like or dislike the image you have just seen?', type: 'single_select' as QuestionType, options: ['Like it a lot', 'Like it somewhat', 'Neither like nor dislike it', 'Dislike it somewhat', "Don't like it at all"] },
      // S5 follow-up — Reason why
      { text: 'Why did you rate the artwork this way? Please be specific and include details.', type: 'open_text' as QuestionType },
      // S6. Intent to view
      { text: 'Based on this image, how interested are you in watching Alice & Steve?', type: 'single_select' as QuestionType, options: ['Definitely interested', 'Probably interested', 'Might / might not be interested', 'Probably not interested', 'Definitely not interested'] },
      // S7. Talent recognition
      { text: 'Please list any actors or actresses you recall seeing.', type: 'open_text' as QuestionType },
      // S8. Talent Impact (matrix: Nicola Walker, Jemaine Clement, Yali Topol Margalith, Joel Fry)
      { text: 'How does a TV series featuring each of the following impact your interest in watching?', type: 'matrix' as QuestionType, options: ['Makes me much more interested in watching', 'Makes me somewhat more interested in watching', 'Has no effect on my interest in watching', 'Makes me somewhat less interested in watching', 'Makes me much less interested in watching', "I don't know this actor or actress well enough to say"] },
      // S9. Perceived plot
      { text: 'Having seen the artwork for Alice & Steve, what do you think it will be about?', type: 'open_text' as QuestionType },
      // S10. Series or Film
      { text: 'Do you think Alice & Steve is a TV series or a film?', type: 'single_select' as QuestionType, options: ['Series', 'Film'] },
      // S11. Service Attribution
      { text: 'Which broadcaster or streaming service do you think will offer Alice & Steve?', type: 'single_select' as QuestionType, options: ['Prime Video', 'Netflix', 'Apple TV+', 'Disney+', 'Paramount+', 'Sky/Now', 'ITV', 'BBC', 'Channel 4', 'Other'] },
      // S12. Attributes
      { text: 'Which of these attributes would you associate with this image for Alice & Steve?', type: 'multi_select' as QuestionType, options: ['Entertaining', 'Great story', 'Not my type of series', 'Dramatic', 'High-quality', 'Boring', 'British', 'Romantic', 'Risqué', 'Interesting characters', 'Original', 'Adult', 'Distinctive/unique', 'Funny', 'Great cast', 'Gross/inappropriate', 'Cheesy/cliché', 'Edgy', 'Emotional', 'Warm'] },
      // S13. Elements (matrix: people/actors, setting, tagline, tone, title, colours, humour, Baby Reindeer)
      { text: 'How interested are you in each of the following elements based on the image?', type: 'matrix' as QuestionType, options: ['Very interested', 'Somewhat interested', 'Not very interested', 'Not at all interested'] },
      // S14. Genre
      { text: 'Based on the image, what type of show would you say Alice & Steve is?', type: 'single_select' as QuestionType, options: ['Reality', 'Drama', 'Comedy', 'Docu-series, documentary', 'Thriller, Crime drama', 'Sci-Fi, Fantasy', 'Dark Comedy', 'Rom-com'] },
      // S15. Gender appeal
      { text: 'Do you think Alice & Steve is mostly for males, mostly for females or for both equally?', type: 'single_select' as QuestionType, options: ['Mostly for males', 'Mostly for females', 'For males and females equally'] },
      // S16. Age appeal
      { text: 'What ages do you think would enjoy Alice & Steve? People in their:', type: 'multi_select' as QuestionType, options: ['Teens', '20s', '30s', '40s', '50s', '60s'] },
      // C1. Synopsis (informational prompt — presented as open text for reaction)
      { text: "Please read the following description of Alice & Steve.\n\nLifelong best friends, Alice and Steve, see their world implode when Steve sleeps with Alice's daughter. Their once rock-solid friendship turns to sh*t - threatening their families, futures and everything in between.", type: 'open_text' as QuestionType },
      // C2. Artwork preference
      { text: 'Based on this synopsis, which of the following artwork options for Alice & Steve do you like best?', type: 'single_select' as QuestionType, options: ['Option 1', 'Option 2', 'Option 3'] },
      // D1. Impact on interest to subscribe
      { text: 'Alice & Steve will be released on Disney+. Knowing this, how much does it impact your interest to subscribe or continue to subscribe to Disney+?', type: 'single_select' as QuestionType, options: ['Makes me much more interested', 'Makes me somewhat more interested', 'Has no impact on my interest', 'Makes me less interested'] },
    ],
  },
  {
    key: 'disney-trailer-cut',
    label: 'Trailer Cut Evaluation',
    icon: 'LayoutGrid',
    surveyType: 'creative',
    category: 'marketing',
    creatorLabel: 'Created by Disney UK',
    questions: [
      { text: 'How engaging was this trailer overall?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not engaging', maxLabel: 'Very engaging' } },
      { text: 'How well did the trailer convey the story?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very poorly', maxLabel: 'Very well' } },
      { text: 'How appealing were the visuals and production quality?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not appealing', maxLabel: 'Very appealing' } },
      { text: 'Did the trailer make you want to watch the full title?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not at all', maxLabel: 'Definitely' } },
      { text: 'How effective was the music and sound design?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not effective', maxLabel: 'Very effective' } },
      { text: 'Was the pacing of the trailer appropriate?', type: 'single_select' as QuestionType, options: ['Too slow', 'Slightly slow', 'Just right', 'Slightly fast', 'Too fast'] },
      { text: 'How well does the trailer represent the Disney+ brand?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not well', maxLabel: 'Very well' } },
      { text: 'Which moments stood out to you the most?', type: 'open_text' as QuestionType },
      { text: 'What emotions did the trailer evoke?', type: 'multi_select' as QuestionType, options: ['Excitement', 'Curiosity', 'Joy', 'Surprise', 'Nostalgia', 'Indifference', 'Confusion'] },
      { text: 'How likely are you to share this trailer with others?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very unlikely', maxLabel: 'Very likely' } },
      { text: 'Was the length of the trailer appropriate?', type: 'single_select' as QuestionType, options: ['Too short', 'Just right', 'Too long'] },
      { text: 'How likely are you to watch this title on launch day?', type: 'nps' as QuestionType, scale: { min: 0, max: 10 } },
    ],
  },
  {
    key: 'disney-message-test',
    label: 'Message Test Survey',
    icon: 'AlignLeft',
    surveyType: 'message',
    category: 'marketing',
    creatorLabel: 'Created by Disney UK',
    questions: [
      { text: 'How clear is the main message?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very unclear', maxLabel: 'Very clear' } },
      { text: 'How appealing is this message to you?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not appealing', maxLabel: 'Very appealing' } },
      { text: 'How relevant is this message to your interests?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not relevant', maxLabel: 'Highly relevant' } },
      { text: 'Does this message make you more likely to engage with Disney+?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Much less likely', maxLabel: 'Much more likely' } },
      { text: 'How trustworthy does this message feel?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not trustworthy', maxLabel: 'Very trustworthy' } },
      { text: 'What emotions does this message evoke?', type: 'multi_select' as QuestionType, options: ['Excited', 'Curious', 'Reassured', 'Inspired', 'Indifferent', 'Confused', 'Sceptical'] },
      { text: 'How well does this message fit the Disney+ brand?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not at all', maxLabel: 'Perfectly' } },
      { text: 'Who do you think this message is aimed at?', type: 'single_select' as QuestionType, options: ['Families', 'Young adults', 'Existing subscribers', 'New customers', 'All audiences'] },
      { text: 'How does this compare to messaging from other streaming services?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Much worse', maxLabel: 'Much better' } },
      { text: 'In your own words, what is the main takeaway from this message?', type: 'open_text' as QuestionType },
    ],
  },
  {
    key: 'disney-media-mix',
    label: 'Media Mix Optimiser',
    icon: 'MonitorPlay',
    surveyType: 'simple',
    category: 'marketing',
    creatorLabel: 'Created by Disney UK',
    questions: [
      { text: 'Where did you first hear about this Disney+ title?', type: 'single_select' as QuestionType, options: ['TV advert', 'Social media', 'YouTube', 'In-app notification', 'Word of mouth', 'Online article', 'Outdoor billboard', 'Other'] },
      { text: 'Which advertising channels have you seen Disney+ content on recently?', type: 'multi_select' as QuestionType, options: ['TV', 'Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter/X', 'Outdoor', 'Cinema', 'Podcasts'] },
      { text: 'Which channel had the most impact on your interest?', type: 'single_select' as QuestionType, options: ['TV advert', 'Social media ad', 'YouTube pre-roll', 'Influencer content', 'In-app banner', 'Outdoor billboard', 'None had impact'] },
      { text: 'How frequently do you recall seeing Disney+ advertising in the past month?', type: 'single_select' as QuestionType, options: ['Not at all', 'Once or twice', 'A few times', 'Frequently', 'Very frequently'] },
      { text: 'How relevant were the ads you saw to your interests?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not relevant', maxLabel: 'Very relevant' } },
      { text: 'Did any advertising prompt you to open Disney+ or search for a title?', type: 'single_select' as QuestionType, options: ['Yes, immediately', 'Yes, later that day', 'Yes, within the week', 'No'] },
      { text: 'How effective was social media advertising compared to TV?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'TV much better', maxLabel: 'Social much better' } },
      { text: 'How likely are you to subscribe or re-subscribe based on recent advertising?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very unlikely', maxLabel: 'Very likely' } },
      { text: 'What would make Disney+ advertising more appealing to you?', type: 'open_text' as QuestionType },
      { text: 'Which ad format do you find most engaging?', type: 'single_select' as QuestionType, options: ['Short-form video (under 15s)', 'Long-form trailer', 'Static image', 'Interactive/carousel', 'Influencer content', 'Behind-the-scenes'] },
    ],
  },
  {
    key: 'disney-concept-screening',
    label: 'Concept Screening',
    icon: 'Lightbulb',
    surveyType: 'concept',
    category: 'product',
    creatorLabel: 'Created by Disney UK',
    questions: [
      { text: 'How appealing is this concept to you overall?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not at all', maxLabel: 'Extremely' } },
      { text: 'How unique or different does this concept feel?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not unique', maxLabel: 'Very unique' } },
      { text: 'How relevant is this concept to your entertainment needs?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not relevant', maxLabel: 'Very relevant' } },
      { text: 'How likely are you to engage with this if it were available on Disney+?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very unlikely', maxLabel: 'Very likely' } },
      { text: 'Does this concept feel like a good fit for the Disney+ brand?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Poor fit', maxLabel: 'Perfect fit' } },
      { text: 'Who do you think this concept is aimed at?', type: 'single_select' as QuestionType, options: ['Children', 'Teens', 'Young adults', 'Families', 'All ages', 'Adult audiences'] },
      { text: 'What emotions does this concept evoke?', type: 'multi_select' as QuestionType, options: ['Excitement', 'Curiosity', 'Nostalgia', 'Wonder', 'Warmth', 'Indifference', 'Confusion'] },
      { text: 'How does this concept compare to similar offerings from other streaming services?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Much worse', maxLabel: 'Much better' } },
      { text: 'Would you recommend this concept to friends or family?', type: 'nps' as QuestionType, scale: { min: 0, max: 10 } },
      { text: 'What would you change or improve about this concept?', type: 'open_text' as QuestionType },
    ],
  },
  {
    key: 'disney-audience-segmentation',
    label: 'Audience Segmentation',
    icon: 'UsersRound',
    surveyType: 'audience_exploration',
    category: 'audience',
    creatorLabel: 'Created by Disney UK',
    questions: [
      { text: 'How often do you use streaming services?', type: 'single_select' as QuestionType, options: ['Daily', 'Several times a week', 'Weekly', 'A few times a month', 'Rarely'] },
      { text: 'Which streaming services do you currently subscribe to?', type: 'multi_select' as QuestionType, options: ['Disney+', 'Netflix', 'Amazon Prime Video', 'Apple TV+', 'NOW', 'Paramount+', 'ITVX Premium', 'Other'] },
      { text: 'What type of content do you watch most frequently?', type: 'multi_select' as QuestionType, options: ['Feature films', 'TV series', 'Documentaries', 'Animation', 'Reality/Unscripted', 'Sport', 'Short-form content'] },
      { text: 'Who do you typically watch with?', type: 'multi_select' as QuestionType, options: ['Alone', 'With partner', 'With children', 'With family', 'With friends'] },
      { text: 'What time of day do you typically watch?', type: 'multi_select' as QuestionType, options: ['Morning', 'Lunchtime', 'Afternoon', 'Early evening', 'Late evening', 'Night'] },
      { text: 'Which Disney+ content brands are you most interested in?', type: 'ranking' as QuestionType, options: ['Disney', 'Pixar', 'Marvel', 'Star Wars', 'National Geographic', 'Star'] },
      { text: 'How important is family-friendly content in your choice of streaming service?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not important', maxLabel: 'Essential' } },
      { text: 'What is the main reason you subscribe to Disney+?', type: 'single_select' as QuestionType, options: ['Exclusive Disney content', 'Marvel/Star Wars', 'Family content', 'New releases', 'Bundled with other services', 'Price/Value'] },
      { text: 'How do you decide what to watch next?', type: 'multi_select' as QuestionType, options: ['Browse the homepage', 'Search for specific titles', 'Follow recommendations', 'Social media buzz', 'Friends/family suggestions', 'Continue watching'] },
      { text: 'How satisfied are you with the variety of content on Disney+?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Very dissatisfied', maxLabel: 'Very satisfied' } },
      { text: 'How likely are you to recommend Disney+ to someone like you?', type: 'nps' as QuestionType, scale: { min: 0, max: 10 } },
      { text: 'What genres would you like to see more of on Disney+?', type: 'multi_select' as QuestionType, options: ['Action/Adventure', 'Comedy', 'Drama', 'Sci-Fi', 'Horror/Thriller', 'Romance', 'Documentary', 'Animation', 'Musical'] },
      { text: 'How important is being able to download content for offline viewing?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not important', maxLabel: 'Essential' } },
      { text: 'Do you use the GroupWatch or SharePlay features?', type: 'single_select' as QuestionType, options: ['Regularly', 'Occasionally', 'Tried it once', 'Never', 'Didn\'t know about it'] },
      { text: 'How do you feel about ads on streaming services?', type: 'single_select' as QuestionType, options: ['Strongly prefer ad-free', 'Don\'t mind some ads for lower price', 'Ads are fine', 'No strong opinion'] },
      { text: 'What devices do you most often use to watch Disney+?', type: 'multi_select' as QuestionType, options: ['Smart TV', 'Laptop/Desktop', 'Tablet', 'Smartphone', 'Games console', 'Streaming stick/box'] },
      { text: 'How often do you engage with Disney+ related content on social media?', type: 'single_select' as QuestionType, options: ['Daily', 'Weekly', 'Occasionally', 'Rarely', 'Never'] },
      { text: 'Which of these best describes your household?', type: 'single_select' as QuestionType, options: ['Single, no children', 'Couple, no children', 'Family with young children (under 6)', 'Family with children (6-12)', 'Family with teens', 'Empty nester', 'Multi-generational'] },
      { text: 'How price-sensitive are you when it comes to streaming subscriptions?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Price is key factor', maxLabel: 'Price doesn\'t matter' } },
      { text: 'What would most improve your Disney+ experience?', type: 'open_text' as QuestionType },
      { text: 'How do you feel about exclusive theatrical-to-streaming windows?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Prefer cinema first', maxLabel: 'Prefer same-day streaming' } },
      { text: 'Are there any franchises or IPs you wish were on Disney+?', type: 'open_text' as QuestionType },
      { text: 'How important are behind-the-scenes and bonus content to you?', type: 'scale' as QuestionType, scale: { min: 1, max: 5, minLabel: 'Not important', maxLabel: 'Very important' } },
      { text: 'Would you attend Disney+ branded events or experiences if available?', type: 'single_select' as QuestionType, options: ['Definitely', 'Probably', 'Not sure', 'Probably not', 'Definitely not'] },
    ],
  },
]
