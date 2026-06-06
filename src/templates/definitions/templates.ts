// Template definitions for all 25+ event types
// Each event has templates for each channel and language
// Format: { channel: { locale: templateString } }

export const TEMPLATES: Record<string, Record<string, Record<string, string>>> = {
  // TRANSACTION EVENTS
  'TXNX-001': {
    sms: {
      en: '{{stock_name}} BUY executed: {{qty}} shares @{{inr price}}. Total: {{inr total}}. -WealthBridge',
      hi: '{{stock_name}} खरीद: {{qty}} शेयर @{{inr price}}. कुल: {{inr total}}. -WealthBridge',
      mr: '{{stock_name}} खरेदी: {{qty}} शेअर @{{inr price}}. एकूण: {{inr total}}. -WealthBridge',
      ta: '{{stock_name}} வாங்கல்: {{qty}} பங்குகள் @{{inr price}}. மொத்தம்: {{inr total}}. -WealthBridge',
      te: '{{stock_name}} కొనుగోలు: {{qty}} షేర్లు @{{inr price}}. మొత్తం: {{inr total}}. -WealthBridge',
    },
    push: {
      en: 'Buy Order Executed: {{qty}} {{stock_name}} @ {{inr price}}',
      hi: 'खरीद आदेश: {{qty}} {{stock_name}} @ {{inr price}}',
      mr: 'खरेदी आदेश: {{qty}} {{stock_name}} @ {{inr price}}',
      ta: 'வாங்கல் ஆர்டர்: {{qty}} {{stock_name}} @ {{inr price}}',
      te: 'కొనుగోలు ఆర్డర్: {{qty}} {{stock_name}} @ {{inr price}}',
    },
    email: {
      en: 'Your buy order for {{qty}} shares of {{stock_name}} at {{inr price}} has been executed. Total value: {{inr total}}.',
      hi: '{{stock_name}} के {{qty}} शेयर {{inr price}} पर खरीदे गए। कुल मूल्य: {{inr total}}।',
      mr: '{{stock_name}} चे {{qty}} शेअर {{inr price}} ला खरेदी झाले. एकूण: {{inr total}}.',
      ta: '{{stock_name}} இன் {{qty}} பங்குகள் {{inr price}} ல் வாங்கப்பட்டது. மொத்தம்: {{inr total}}.',
      te: '{{stock_name}} యొక్క {{qty}} షేర్లు {{inr price}} కి కొనుగోలు చేయబడ్డాయి. మొత్తం: {{inr total}}.',
    },
  },

  'TXNX-002': {
    sms: {
      en: '{{stock_name}} SELL executed: {{qty}} shares @{{inr price}}. P&L: {{inr pnl}}. -WealthBridge',
      hi: '{{stock_name}} बिक्री: {{qty}} शेयर @{{inr price}}. लाभ/हानि: {{inr pnl}}. -WealthBridge',
      mr: '{{stock_name}} विक्री: {{qty}} शेअर @{{inr price}}. नफा/तोटा: {{inr pnl}}. -WealthBridge',
      ta: '{{stock_name}} விற்பனை: {{qty}} பங்குகள் @{{inr price}}. லாபம்/நஷ்டம்: {{inr pnl}}. -WealthBridge',
      te: '{{stock_name}} అమ్మకం: {{qty}} షేర్లు @{{inr price}}. లాభ/నష్టం: {{inr pnl}}. -WealthBridge',
    },
    push: {
      en: 'Sell Order Executed: {{qty}} {{stock_name}} @ {{inr price}}',
      hi: 'बिक्री आदेश: {{qty}} {{stock_name}} @ {{inr price}}',
      mr: 'विक्री आदेश: {{qty}} {{stock_name}} @ {{inr price}}',
      ta: 'விற்பனை ஆர்டர்: {{qty}} {{stock_name}} @ {{inr price}}',
      te: 'అమ్మకం ఆర్డర్: {{qty}} {{stock_name}} @ {{inr price}}',
    },
    email: {
      en: 'Your sell order for {{qty}} shares of {{stock_name}} at {{inr price}} has been executed. P&L: {{inr pnl}}.',
      hi: '{{stock_name}} के {{qty}} शेयर {{inr price}} पर बेचे गए। लाभ/हानि: {{inr pnl}}।',
      mr: '{{stock_name}} चे {{qty}} शेअर {{inr price}} ला विकले. नफा/तोटा: {{inr pnl}}.',
      ta: '{{stock_name}} இன் {{qty}} பங்குகள் {{inr price}} ல் விற்கப்பட்டது. லாபம்: {{inr pnl}}.',
      te: '{{stock_name}} యొక్క {{qty}} షేర్లు {{inr price}} కి అమ్మబడ్డాయి. లాభం: {{inr pnl}}.',
    },
  },

  // RISK EVENTS - most critical
  'RISK-001': {
    sms: {
      en: 'MARGIN CALL: Shortfall {{inr shortfall_amount}}. Deadline: {{formatDate deadline}}. Add funds now! -WealthBridge',
      hi: 'मार्जिन कॉल: कमी {{inr shortfall_amount}}। समयसीमा: {{formatDate deadline}}। अभी फंड जोड़ें! -WealthBridge',
      mr: 'मार्जिन कॉल: कमतरता {{inr shortfall_amount}}. अंतिम मुदत: {{formatDate deadline}}. आता फंड जोडा! -WealthBridge',
      ta: 'மார்ஜின் கால்: குறைபாடு {{inr shortfall_amount}}. கடைசி நேரம்: {{formatDate deadline}}. இப்போது நிதி சேர்க்கவும்! -WealthBridge',
      te: 'మార్జిన్ కాల్: లోటు {{inr shortfall_amount}}. గడువు: {{formatDate deadline}}. ఇప్పుడు నిధులు జోడించండి! -WealthBridge',
    },
    push: {
      en: '⚠️ MARGIN CALL: Add {{inr shortfall_amount}} by {{formatDate deadline}}',
      hi: '⚠️ मार्जिन कॉल: {{formatDate deadline}} तक {{inr shortfall_amount}} जोड़ें',
      mr: '⚠️ मार्जिन कॉल: {{formatDate deadline}} पर्यंत {{inr shortfall_amount}} जोडा',
      ta: '⚠️ மார்ஜின் கால்: {{formatDate deadline}} க்குள் {{inr shortfall_amount}} சேர்க்கவும்',
      te: '⚠️ మార్జిన్ కాల్: {{formatDate deadline}} లోపు {{inr shortfall_amount}} జోడించండి',
    },
    email: {
      en: 'URGENT: Your account has a margin shortfall of {{inr shortfall_amount}}. Please add funds before {{formatDate deadline}} to avoid auto square-off at {{formatDate auto_square_off_time}}.',
      hi: 'अत्यावश्यक: आपके खाते में {{inr shortfall_amount}} की मार्जिन कमी है। {{formatDate deadline}} से पहले फंड जोड़ें।',
      mr: 'तातडीचे: आपल्या खात्यात {{inr shortfall_amount}} ची मार्जिन कमतरता आहे. {{formatDate deadline}} पूर्वी फंड जोडा.',
      ta: 'அவசரம்: உங்கள் கணக்கில் {{inr shortfall_amount}} மார்ஜின் குறைபாடு உள்ளது. {{formatDate deadline}} க்குள் நிதி சேர்க்கவும்.',
      te: 'అత్యవసరం: మీ ఖాతాలో {{inr shortfall_amount}} మార్జిన్ లోటు ఉంది. {{formatDate deadline}} లోపు నిధులు జోడించండి.',
    },
  },

  'RISK-002': {
    sms: {
      en: 'MARGIN SHORTFALL: {{inr shortfall_amount}} required immediately. Auto square-off at {{formatDate auto_square_off_time}}. -WealthBridge',
      hi: 'मार्जिन शॉर्टफॉल: {{inr shortfall_amount}} तुरंत आवश्यक। ऑटो स्क्वायर-ऑफ: {{formatDate auto_square_off_time}}। -WealthBridge',
      mr: 'मार्जिन शॉर्टफॉल: {{inr shortfall_amount}} ताबडतोब आवश्यक. ऑटो स्क्वेअर-ऑफ: {{formatDate auto_square_off_time}}. -WealthBridge',
      ta: 'மார்ஜின் குறைபாடு: {{inr shortfall_amount}} உடனடியாக தேவை. ஆட்டோ ஸ்கொயர்-ஆஃப்: {{formatDate auto_square_off_time}}. -WealthBridge',
      te: 'మార్జిన్ షార్ట్‌ఫాల్: {{inr shortfall_amount}} వెంటనే అవసరం. ఆటో స్క్వేర్-ఆఫ్: {{formatDate auto_square_off_time}}. -WealthBridge',
    },
    push: {
      en: '🚨 CRITICAL: Margin shortfall {{inr shortfall_amount}} - immediate action required',
      hi: '🚨 अत्यावश्यक: मार्जिन कमी {{inr shortfall_amount}} - तुरंत कार्रवाई करें',
      mr: '🚨 तातडीचे: मार्जिन कमतरता {{inr shortfall_amount}} - ताबडतोब कारवाई करा',
      ta: '🚨 அவசரம்: மார்ஜின் குறைபாடு {{inr shortfall_amount}} - உடனடி நடவடிக்கை தேவை',
      te: '🚨 అత్యవసరం: మార్జిన్ లోటు {{inr shortfall_amount}} - తక్షణ చర్య అవసరం',
    },
    email: {
      en: 'CRITICAL ALERT: Your margin shortfall of {{inr shortfall_amount}} requires immediate action. Auto square-off will occur at {{formatDate auto_square_off_time}}.',
      hi: 'गंभीर चेतावनी: {{inr shortfall_amount}} की मार्जिन कमी के लिए तुरंत कार्रवाई आवश्यक है।',
      mr: 'गंभीर इशारा: {{inr shortfall_amount}} च्या मार्जिन कमतरतेसाठी ताबडतोब कारवाई आवश्यक आहे.',
      ta: 'முக்கியமான எச்சரிக்கை: {{inr shortfall_amount}} மார்ஜின் குறைபாட்டிற்கு உடனடி நடவடிக்கை தேவை.',
      te: 'క్రిటికల్ హెచ్చరిక: {{inr shortfall_amount}} మార్జిన్ లోటుకు తక్షణ చర్య అవసరం.',
    },
  },

  // SIP EVENTS
  'SIPX-001': {
    sms: {
      en: 'SIP Reminder: {{inr amount}} due on {{formatDate due_date}} for {{fund_name}}. -WealthBridge',
      hi: 'SIP अनुस्मारक: {{fund_name}} के लिए {{formatDate due_date}} को {{inr amount}} देय। -WealthBridge',
      mr: 'SIP स्मरणपत्र: {{fund_name}} साठी {{formatDate due_date}} रोजी {{inr amount}} देय. -WealthBridge',
      ta: 'SIP நினைவூட்டல்: {{fund_name}} க்கு {{formatDate due_date}} அன்று {{inr amount}} செலுத்த வேண்டும். -WealthBridge',
      te: 'SIP రిమైండర్: {{fund_name}} కోసం {{formatDate due_date}} న {{inr amount}} చెల్లించాలి. -WealthBridge',
    },
    push: {
      en: 'SIP Due: {{inr amount}} for {{fund_name}} on {{formatDate due_date}}',
      hi: 'SIP देय: {{fund_name}} के लिए {{inr amount}}',
      mr: 'SIP देय: {{fund_name}} साठी {{inr amount}}',
      ta: 'SIP செலுத்த வேண்டும்: {{fund_name}} க்கு {{inr amount}}',
      te: 'SIP చెల్లించాలి: {{fund_name}} కోసం {{inr amount}}',
    },
    email: {
      en: 'Your SIP of {{inr amount}} for {{fund_name}} is due on {{formatDate due_date}}. Please ensure sufficient balance in your bank account.',
      hi: '{{fund_name}} के लिए आपका {{inr amount}} का SIP {{formatDate due_date}} को देय है।',
      mr: '{{fund_name}} साठी तुमचा {{inr amount}} चा SIP {{formatDate due_date}} रोजी देय आहे.',
      ta: '{{fund_name}} க்கான உங்கள் {{inr amount}} SIP {{formatDate due_date}} அன்று செலுத்த வேண்டும்.',
      te: '{{fund_name}} కోసం మీ {{inr amount}} SIP {{formatDate due_date}} న చెల్లించాలి.',
    },
  },

  // MARKET EVENTS
  'MKTX-001': {
    sms: {
      en: 'Price Alert: {{stock_name}} {{direction}} target {{inr target_price}}. Current: {{inr current_price}}. -WealthBridge',
      hi: 'मूल्य अलर्ट: {{stock_name}} {{direction}} लक्ष्य {{inr target_price}}। वर्तमान: {{inr current_price}}। -WealthBridge',
      mr: 'किंमत सूचना: {{stock_name}} {{direction}} लक्ष्य {{inr target_price}}. सध्याची: {{inr current_price}}. -WealthBridge',
      ta: 'விலை எச்சரிக்கை: {{stock_name}} {{direction}} இலக்கு {{inr target_price}}. தற்போது: {{inr current_price}}. -WealthBridge',
      te: 'ధర హెచ్చరిక: {{stock_name}} {{direction}} లక్ష్యం {{inr target_price}}. ప్రస్తుతం: {{inr current_price}}. -WealthBridge',
    },
    push: {
      en: '📈 {{stock_name}} hit your {{direction}} target of {{inr target_price}}',
      hi: '📈 {{stock_name}} ने आपका {{direction}} लक्ष्य {{inr target_price}} छुआ',
      mr: '📈 {{stock_name}} ने तुमचे {{direction}} लक्ष्य {{inr target_price}} गाठले',
      ta: '📈 {{stock_name}} உங்கள் {{direction}} இலக்கு {{inr target_price}} அடைந்தது',
      te: '📈 {{stock_name}} మీ {{direction}} లక్ష్యం {{inr target_price}} చేరుకుంది',
    },
    email: {
      en: 'Your price alert for {{stock_name}} has been triggered. The stock has moved {{direction}} to {{inr current_price}}, reaching your target of {{inr target_price}}.',
      hi: '{{stock_name}} के लिए आपका मूल्य अलर्ट सक्रिय हो गया है।',
      mr: '{{stock_name}} साठी तुमची किंमत सूचना सक्रिय झाली आहे.',
      ta: '{{stock_name}} க்கான உங்கள் விலை எச்சரிக்கை செயல்படுத்தப்பட்டது.',
      te: '{{stock_name}} కోసం మీ ధర హెచ్చరిక ట్రిగ్గర్ అయింది.',
    },
  },

  // REGULATORY EVENTS
  'REGX-001': {
    sms: {
      en: 'KYC Expiry Alert: Your KYC expires on {{formatDate expiry_date}}. {{days_remaining}} days left. Update now: {{submission_link}} -WealthBridge',
      hi: 'KYC समाप्ति: {{formatDate expiry_date}} को समाप्त। {{days_remaining}} दिन शेष। अपडेट करें। -WealthBridge',
      mr: 'KYC समाप्ती: {{formatDate expiry_date}} रोजी संपते. {{days_remaining}} दिवस शिल्लक. अपडेट करा. -WealthBridge',
      ta: 'KYC காலாவதி: {{formatDate expiry_date}} அன்று காலாவதியாகும். {{days_remaining}} நாட்கள் உள்ளன. புதுப்பிக்கவும். -WealthBridge',
      te: 'KYC గడువు: {{formatDate expiry_date}} న ముగుస్తుంది. {{days_remaining}} రోజులు మిగిలాయి. నవీకరించండి. -WealthBridge',
    },
    push: {
      en: '⚠️ KYC expires in {{days_remaining}} days - Update now',
      hi: '⚠️ KYC {{days_remaining}} दिनों में समाप्त - अभी अपडेट करें',
      mr: '⚠️ KYC {{days_remaining}} दिवसांत संपते - आता अपडेट करा',
      ta: '⚠️ KYC {{days_remaining}} நாட்களில் காலாவதியாகும் - இப்போது புதுப்பிக்கவும்',
      te: '⚠️ KYC {{days_remaining}} రోజుల్లో ముగుస్తుంది - ఇప்போడు నవీకరించండి',
    },
    email: {
      en: 'Your KYC documents are expiring on {{formatDate expiry_date}}. You have {{days_remaining}} days remaining. Please update your KYC at {{submission_link}} to avoid account restrictions.',
      hi: 'आपके KYC दस्तावेज {{formatDate expiry_date}} को समाप्त हो रहे हैं। {{days_remaining}} दिन शेष हैं।',
      mr: 'तुमचे KYC दस्तऐवज {{formatDate expiry_date}} रोजी संपत आहेत. {{days_remaining}} दिवस शिल्लक.',
      ta: 'உங்கள் KYC ஆவணங்கள் {{formatDate expiry_date}} அன்று காலாவதியாகும். {{days_remaining}} நாட்கள் உள்ளன.',
      te: 'మీ KYC పత్రాలు {{formatDate expiry_date}} న ముగుస్తాయి. {{days_remaining}} రోజులు మిగిలాయి.',
    },
  },
};

// Gets a template for a specific event, channel, and locale
// Falls back to English if locale not found
export function getTemplate(
  eventType: string,
  channel: string,
  locale: string
): string | null {
  const eventTemplates = TEMPLATES[eventType];
  if (!eventTemplates) return null;

  const channelTemplates = eventTemplates[channel];
  if (!channelTemplates) return null;

  // Try requested locale first, fall back to English
  return channelTemplates[locale] || channelTemplates['en'] || null;
}