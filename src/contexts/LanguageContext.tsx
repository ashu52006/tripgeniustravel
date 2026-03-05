import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'fr' | 'es' | 'de' | 'ja' | 'zh' | 'ar' | 'pt' | 'ko';

const translations: Record<Language, Record<string, string>> = {
  en: {
    appName: 'TripGenius',
    heroTitle: 'Plan Smarter, Travel Better',
    heroSubtitle: 'AI-powered day-by-day itinerary with honest budget analysis. We tell you what you actually need.',
    destination: 'Where do you want to go?',
    destinationPlaceholder: 'e.g. Paris, Tokyo, Dubai...',
    tripDuration: 'Trip Duration',
    startDate: 'Start Date',
    travelers: 'Travelers',
    yourBudget: 'Your Budget',
    travelStyle: 'Travel Style',
    travelPace: 'Travel Pace',
    planMyTrip: 'Plan My Trip',
    dashboard: 'Dashboard',
    itinerary: 'Itinerary',
    budget: 'Budget',
    days: 'days',
    budget_label: 'Budget',
    balanced: 'Balanced',
    luxury: 'Luxury',
    adventure: 'Adventure',
    cultural: 'Cultural',
    relaxed: 'Relaxed',
    normal: 'Normal',
    fast: 'Fast',
    relaxedDesc: '3-4 places/day',
    normalDesc: '5-6 places/day',
    fastDesc: '7+ places/day',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    signInWithGoogle: 'Continue with Google',
    welcome: 'Welcome',
    selectLanguage: 'Language',
    loading: 'Creating your perfect trip...',
    checkBudget: 'Check Budget',
    budgetHelper: 'Not sure? We\'ll suggest a realistic budget',
    estimatedBudget: 'Estimated budget for this trip',
    useThisBudget: 'Use This Budget',
    enterCustomBudget: 'Or enter your own',
  },
  hi: {
    appName: 'TripGenius',
    heroTitle: 'स्मार्ट प्लानिंग, बेहतर यात्रा',
    heroSubtitle: 'AI-संचालित दिन-प्रतिदिन यात्रा कार्यक्रम। हम आपको बताते हैं कि वास्तव में क्या चाहिए।',
    destination: 'आप कहाँ जाना चाहते हैं?',
    destinationPlaceholder: 'जैसे पेरिस, टोक्यो, दुबई...',
    tripDuration: 'यात्रा अवधि',
    startDate: 'आरंभ तिथि',
    travelers: 'यात्री',
    yourBudget: 'आपका बजट',
    travelStyle: 'यात्रा शैली',
    travelPace: 'यात्रा गति',
    planMyTrip: 'मेरी यात्रा की योजना बनाएं',
    dashboard: 'डैशबोर्ड',
    itinerary: 'यात्रा कार्यक्रम',
    budget: 'बजट',
    days: 'दिन',
    budget_label: 'बजट',
    balanced: 'संतुलित',
    luxury: 'लक्जरी',
    adventure: 'साहसिक',
    cultural: 'सांस्कृतिक',
    relaxed: 'आरामदायक',
    normal: 'सामान्य',
    fast: 'तेज़',
    relaxedDesc: '3-4 स्थान/दिन',
    normalDesc: '5-6 स्थान/दिन',
    fastDesc: '7+ स्थान/दिन',
    signIn: 'साइन इन',
    signOut: 'साइन आउट',
    signInWithGoogle: 'Google से जारी रखें',
    welcome: 'स्वागत है',
    selectLanguage: 'भाषा',
    loading: 'आपकी परफेक्ट ट्रिप बनाई जा रही है...',
    checkBudget: 'बजट जांचें',
    budgetHelper: 'निश्चित नहीं? हम एक यथार्थवादी बजट सुझाएंगे',
    estimatedBudget: 'इस यात्रा का अनुमानित बजट',
    useThisBudget: 'यह बजट उपयोग करें',
    enterCustomBudget: 'या अपना बजट दर्ज करें',
  },
  fr: {
    appName: 'TripGenius',
    heroTitle: 'Planifiez plus intelligemment, voyagez mieux',
    heroSubtitle: 'Itinéraire jour par jour alimenté par l\'IA avec analyse budgétaire honnête.',
    destination: 'Où voulez-vous aller ?',
    destinationPlaceholder: 'ex. Paris, Tokyo, Dubaï...',
    tripDuration: 'Durée du voyage',
    startDate: 'Date de début',
    travelers: 'Voyageurs',
    yourBudget: 'Votre budget',
    travelStyle: 'Style de voyage',
    travelPace: 'Rythme de voyage',
    planMyTrip: 'Planifier mon voyage',
    dashboard: 'Tableau de bord',
    itinerary: 'Itinéraire',
    budget: 'Budget',
    days: 'jours',
    budget_label: 'Économique',
    balanced: 'Équilibré',
    luxury: 'Luxe',
    adventure: 'Aventure',
    cultural: 'Culturel',
    relaxed: 'Détendu',
    normal: 'Normal',
    fast: 'Rapide',
    relaxedDesc: '3-4 lieux/jour',
    normalDesc: '5-6 lieux/jour',
    fastDesc: '7+ lieux/jour',
    signIn: 'Connexion',
    signOut: 'Déconnexion',
    signInWithGoogle: 'Continuer avec Google',
    welcome: 'Bienvenue',
    selectLanguage: 'Langue',
    loading: 'Création de votre voyage parfait...',
    checkBudget: 'Vérifier le budget',
    budgetHelper: 'Pas sûr ? Nous suggérerons un budget réaliste',
    estimatedBudget: 'Budget estimé pour ce voyage',
    useThisBudget: 'Utiliser ce budget',
    enterCustomBudget: 'Ou entrez le vôtre',
  },
  es: {
    appName: 'TripGenius',
    heroTitle: 'Planifica mejor, viaja mejor',
    heroSubtitle: 'Itinerario día a día con análisis presupuestario honesto impulsado por IA.',
    destination: '¿A dónde quieres ir?',
    destinationPlaceholder: 'ej. París, Tokio, Dubái...',
    tripDuration: 'Duración del viaje',
    startDate: 'Fecha de inicio',
    travelers: 'Viajeros',
    yourBudget: 'Tu presupuesto',
    travelStyle: 'Estilo de viaje',
    travelPace: 'Ritmo de viaje',
    planMyTrip: 'Planificar mi viaje',
    dashboard: 'Panel',
    itinerary: 'Itinerario',
    budget: 'Presupuesto',
    days: 'días',
    budget_label: 'Económico',
    balanced: 'Equilibrado',
    luxury: 'Lujo',
    adventure: 'Aventura',
    cultural: 'Cultural',
    relaxed: 'Relajado',
    normal: 'Normal',
    fast: 'Rápido',
    relaxedDesc: '3-4 lugares/día',
    normalDesc: '5-6 lugares/día',
    fastDesc: '7+ lugares/día',
    signIn: 'Iniciar sesión',
    signOut: 'Cerrar sesión',
    signInWithGoogle: 'Continuar con Google',
    welcome: 'Bienvenido',
    selectLanguage: 'Idioma',
    loading: 'Creando tu viaje perfecto...',
    checkBudget: 'Verificar presupuesto',
    budgetHelper: '¿No estás seguro? Sugeriremos un presupuesto realista',
    estimatedBudget: 'Presupuesto estimado para este viaje',
    useThisBudget: 'Usar este presupuesto',
    enterCustomBudget: 'O ingresa el tuyo',
  },
  de: {
    appName: 'TripGenius', heroTitle: 'Klüger planen, besser reisen', heroSubtitle: 'KI-gestützter Tagesplan mit ehrlicher Budgetanalyse.',
    destination: 'Wohin möchten Sie?', destinationPlaceholder: 'z.B. Paris, Tokio, Dubai...', tripDuration: 'Reisedauer', startDate: 'Startdatum', travelers: 'Reisende', yourBudget: 'Ihr Budget', travelStyle: 'Reisestil', travelPace: 'Reisetempo', planMyTrip: 'Meine Reise planen', dashboard: 'Dashboard', itinerary: 'Reiseplan', budget: 'Budget', days: 'Tage', budget_label: 'Budget', balanced: 'Ausgewogen', luxury: 'Luxus', adventure: 'Abenteuer', cultural: 'Kulturell', relaxed: 'Entspannt', normal: 'Normal', fast: 'Schnell', relaxedDesc: '3-4 Orte/Tag', normalDesc: '5-6 Orte/Tag', fastDesc: '7+ Orte/Tag', signIn: 'Anmelden', signOut: 'Abmelden', signInWithGoogle: 'Weiter mit Google', welcome: 'Willkommen', selectLanguage: 'Sprache', loading: 'Erstelle deine perfekte Reise...', checkBudget: 'Budget prüfen', budgetHelper: 'Nicht sicher? Wir schlagen ein realistisches Budget vor', estimatedBudget: 'Geschätztes Budget', useThisBudget: 'Dieses Budget verwenden', enterCustomBudget: 'Oder eigenes eingeben',
  },
  ja: {
    appName: 'TripGenius', heroTitle: 'もっと賢く計画、もっと良い旅を', heroSubtitle: 'AIによる日別旅程と正直な予算分析。',
    destination: 'どこに行きたいですか？', destinationPlaceholder: '例: パリ、東京、ドバイ...', tripDuration: '旅行期間', startDate: '開始日', travelers: '旅行者', yourBudget: '予算', travelStyle: '旅行スタイル', travelPace: '旅行ペース', planMyTrip: '旅行を計画する', dashboard: 'ダッシュボード', itinerary: '旅程', budget: '予算', days: '日', budget_label: 'バジェット', balanced: 'バランス', luxury: 'ラグジュアリー', adventure: 'アドベンチャー', cultural: '文化', relaxed: 'ゆったり', normal: '普通', fast: '速い', relaxedDesc: '3-4箇所/日', normalDesc: '5-6箇所/日', fastDesc: '7+箇所/日', signIn: 'ログイン', signOut: 'ログアウト', signInWithGoogle: 'Googleで続ける', welcome: 'ようこそ', selectLanguage: '言語', loading: '完璧な旅を作成中...', checkBudget: '予算を確認', budgetHelper: '不明な場合は現実的な予算を提案します', estimatedBudget: 'この旅行の推定予算', useThisBudget: 'この予算を使用', enterCustomBudget: 'または自分で入力',
  },
  zh: {
    appName: 'TripGenius', heroTitle: '更聪明地规划，更好地旅行', heroSubtitle: 'AI驱动的逐日行程和诚实的预算分析。',
    destination: '你想去哪里？', destinationPlaceholder: '如：巴黎、东京、迪拜...', tripDuration: '旅行时长', startDate: '开始日期', travelers: '旅行者', yourBudget: '你的预算', travelStyle: '旅行风格', travelPace: '旅行节奏', planMyTrip: '规划我的旅行', dashboard: '仪表板', itinerary: '行程', budget: '预算', days: '天', budget_label: '经济', balanced: '均衡', luxury: '豪华', adventure: '冒险', cultural: '文化', relaxed: '轻松', normal: '正常', fast: '快速', relaxedDesc: '3-4个地方/天', normalDesc: '5-6个地方/天', fastDesc: '7+个地方/天', signIn: '登录', signOut: '退出', signInWithGoogle: '使用Google继续', welcome: '欢迎', selectLanguage: '语言', loading: '正在创建您的完美旅程...', checkBudget: '检查预算', budgetHelper: '不确定？我们会建议一个现实的预算', estimatedBudget: '此行程的预估预算', useThisBudget: '使用此预算', enterCustomBudget: '或输入自己的',
  },
  ar: {
    appName: 'TripGenius', heroTitle: 'خطط بذكاء، سافر بشكل أفضل', heroSubtitle: 'جدول يومي مدعوم بالذكاء الاصطناعي مع تحليل ميزانية صادق.',
    destination: 'أين تريد أن تذهب؟', destinationPlaceholder: 'مثل: باريس، طوكيو، دبي...', tripDuration: 'مدة الرحلة', startDate: 'تاريخ البدء', travelers: 'المسافرون', yourBudget: 'ميزانيتك', travelStyle: 'نمط السفر', travelPace: 'وتيرة السفر', planMyTrip: 'خطط رحلتي', dashboard: 'لوحة القيادة', itinerary: 'جدول الرحلة', budget: 'الميزانية', days: 'أيام', budget_label: 'اقتصادي', balanced: 'متوازن', luxury: 'فاخر', adventure: 'مغامرة', cultural: 'ثقافي', relaxed: 'مريح', normal: 'عادي', fast: 'سريع', relaxedDesc: '3-4 أماكن/يوم', normalDesc: '5-6 أماكن/يوم', fastDesc: '7+ أماكن/يوم', signIn: 'تسجيل الدخول', signOut: 'تسجيل الخروج', signInWithGoogle: 'المتابعة مع Google', welcome: 'مرحبا', selectLanguage: 'اللغة', loading: 'جاري إنشاء رحلتك المثالية...', checkBudget: 'تحقق من الميزانية', budgetHelper: 'غير متأكد؟ سنقترح ميزانية واقعية', estimatedBudget: 'الميزانية المقدرة لهذه الرحلة', useThisBudget: 'استخدم هذه الميزانية', enterCustomBudget: 'أو أدخل ميزانيتك',
  },
  pt: {
    appName: 'TripGenius', heroTitle: 'Planeje melhor, viaje melhor', heroSubtitle: 'Roteiro diário com IA e análise orçamentária honesta.',
    destination: 'Para onde você quer ir?', destinationPlaceholder: 'ex. Paris, Tóquio, Dubai...', tripDuration: 'Duração da viagem', startDate: 'Data de início', travelers: 'Viajantes', yourBudget: 'Seu orçamento', travelStyle: 'Estilo de viagem', travelPace: 'Ritmo de viagem', planMyTrip: 'Planejar minha viagem', dashboard: 'Painel', itinerary: 'Roteiro', budget: 'Orçamento', days: 'dias', budget_label: 'Econômico', balanced: 'Equilibrado', luxury: 'Luxo', adventure: 'Aventura', cultural: 'Cultural', relaxed: 'Relaxado', normal: 'Normal', fast: 'Rápido', relaxedDesc: '3-4 lugares/dia', normalDesc: '5-6 lugares/dia', fastDesc: '7+ lugares/dia', signIn: 'Entrar', signOut: 'Sair', signInWithGoogle: 'Continuar com Google', welcome: 'Bem-vindo', selectLanguage: 'Idioma', loading: 'Criando sua viagem perfeita...', checkBudget: 'Verificar orçamento', budgetHelper: 'Não tem certeza? Sugeriremos um orçamento realista', estimatedBudget: 'Orçamento estimado para esta viagem', useThisBudget: 'Usar este orçamento', enterCustomBudget: 'Ou insira o seu',
  },
  ko: {
    appName: 'TripGenius', heroTitle: '더 똑똑하게 계획하고, 더 잘 여행하세요', heroSubtitle: 'AI 기반 일별 여행 일정과 정직한 예산 분석.',
    destination: '어디로 가고 싶으세요?', destinationPlaceholder: '예: 파리, 도쿄, 두바이...', tripDuration: '여행 기간', startDate: '시작 날짜', travelers: '여행자', yourBudget: '예산', travelStyle: '여행 스타일', travelPace: '여행 페이스', planMyTrip: '여행 계획하기', dashboard: '대시보드', itinerary: '여행 일정', budget: '예산', days: '일', budget_label: '저예산', balanced: '균형', luxury: '럭셔리', adventure: '모험', cultural: '문화', relaxed: '여유로운', normal: '보통', fast: '빠른', relaxedDesc: '3-4곳/일', normalDesc: '5-6곳/일', fastDesc: '7+곳/일', signIn: '로그인', signOut: '로그아웃', signInWithGoogle: 'Google로 계속', welcome: '환영합니다', selectLanguage: '언어', loading: '완벽한 여행을 만들고 있습니다...', checkBudget: '예산 확인', budgetHelper: '확실하지 않으세요? 현실적인 예산을 제안합니다', estimatedBudget: '이 여행의 예상 예산', useThisBudget: '이 예산 사용', enterCustomBudget: '또는 직접 입력',
  },
};

const languageNames: Record<Language, string> = {
  en: 'English', hi: 'हिन्दी', fr: 'Français', es: 'Español',
  de: 'Deutsch', ja: '日本語', zh: '中文', ar: 'العربية', pt: 'Português', ko: '한국어',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languageNames: Record<Language, string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => translations[language]?.[key] || translations.en[key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languageNames }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
