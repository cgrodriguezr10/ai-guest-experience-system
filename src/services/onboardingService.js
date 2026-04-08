class OnboardingService {
  // Pasos del onboarding
  static steps = [
    'ask_name',
    'ask_language',
    'ask_trip_type',
    'ask_companion',
    'ask_dietary',
    'ask_interests',
    'complete'
  ];

  // Estado del onboarding por guest
  static guestProgress = {};

  /**
   * Inicia onboarding para un huésped
   */
  static startOnboarding(guest) {
    this.guestProgress[guest.id] = {
      step: 0,
      data: {
        name: null,
        language: null,
        trip_type: null,
        companion: null,
        dietary: null,
        interests: []
      }
    };

    return this.getStepQuestion(guest);
  }

  /**
   * Obtiene la pregunta actual del onboarding
   */
  static getStepQuestion(guest) {
    const progress = this.guestProgress[guest.id];
    if (!progress) {
      return this.startOnboarding(guest);
    }

    const currentStep = this.steps[progress.step];

    const questions = {
      ask_name: {
        EN: `Welcome to The Plaza Hotel! 🏨\n\nTo personalize your experience, I'd like to know you better.\n\nWhat is your name?`,
        ES: `¡Bienvenido a The Plaza Hotel! 🏨\n\nPara personalizar tu experiencia, me gustaría conocerte mejor.\n\n¿Cuál es tu nombre?`
      },
      ask_language: {
        EN: `Nice to meet you, {name}! 👋\n\nWhich language do you prefer?\n1️⃣ English\n2️⃣ Español`,
        ES: `¡Mucho gusto, {name}! 👋\n\n¿Qué idioma prefieres?\n1️⃣ English\n2️⃣ Español`
      },
      ask_trip_type: {
        EN: `Great! What type of trip is this?\n1️⃣ Business\n2️⃣ Leisure/Vacation\n3️⃣ Family\n4️⃣ Adventure`,
        ES: `¡Excelente! ¿Qué tipo de viaje es este?\n1️⃣ Negocios\n2️⃣ Ocio/Vacaciones\n3️⃣ Familia\n4️⃣ Aventura`
      },
      ask_companion: {
        EN: `Who are you traveling with?\n1️⃣ Solo\n2️⃣ Partner/Spouse\n3️⃣ Family\n4️⃣ Friends\n5️⃣ Group`,
        ES: `¿Con quién viajas?\n1️⃣ Solo\n2️⃣ Pareja\n3️⃣ Familia\n4️⃣ Amigos\n5️⃣ Grupo`
      },
      ask_dietary: {
        EN: `Do you have any dietary preferences?\n1️⃣ None\n2️⃣ Vegetarian\n3️⃣ Vegan\n4️⃣ Gluten-free\n5️⃣ Other`,
        ES: `¿Tienes alguna preferencia dietética?\n1️⃣ Ninguna\n2️⃣ Vegetariano\n3️⃣ Vegano\n4️⃣ Sin gluten\n5️⃣ Otra`
      },
      ask_interests: {
        EN: `What are your interests? (You can mention multiple)\n🏞️ Nature\n🎭 Culture\n⛰️ Adventure\n🍽️ Gastronomy\n🏥 Wellness/Spa\n🛍️ Shopping`,
        ES: `¿Cuáles son tus intereses? (Puedes mencionar varios)\n🏞️ Naturaleza\n🎭 Cultura\n⛰️ Aventura\n🍽️ Gastronomía\n🏥 Bienestar/Spa\n🛍️ Shopping`
      },
      complete: {
        EN: `Perfect, {name}! 🎉\n\nI've created your profile and can now recommend experiences tailored to you.\n\nHow can I help you today?\n1️⃣ Activities\n2️⃣ Restaurants\n3️⃣ Hotel Info\n4️⃣ Something else`,
        ES: `¡Perfecto, {name}! 🎉\n\nHe creado tu perfil y ahora puedo recomendarte experiencias personalizadas.\n\n¿Cómo puedo ayudarte hoy?\n1️⃣ Actividades\n2️⃣ Restaurantes\n3️⃣ Información del hotel\n4️⃣ Otra cosa`
      }
    };

    const question = questions[currentStep][guest.language] || questions[currentStep]['EN'];
    const formattedQuestion = question.replace('{name}', progress.data.name || 'Guest');

    return {
      message: formattedQuestion,
      tokens: 0,
      isOnboarding: true,
      step: currentStep
    };
  }

  /**
   * Procesa la respuesta del huésped durante onboarding
   */
  static processOnboardingResponse(guest, response) {
    const progress = this.guestProgress[guest.id];
    if (!progress) {
      return this.startOnboarding(guest);
    }

    const currentStep = this.steps[progress.step];
    const trimmedResponse = response.trim();

    // Procesar respuesta según el paso
    switch (currentStep) {
      case 'ask_name':
        progress.data.name = trimmedResponse;
        progress.step++;
        break;

      case 'ask_language':
        const langMap = { '1': 'EN', '2': 'ES', 'english': 'EN', 'español': 'ES', 'english': 'EN' };
        progress.data.language = langMap[trimmedResponse.toLowerCase()] || guest.language;
        guest.language = progress.data.language;
        progress.step++;
        break;

      case 'ask_trip_type':
        const tripMap = { '1': 'Negocios', '2': 'Ocio', '3': 'Familia', '4': 'Aventura' };
        progress.data.trip_type = tripMap[trimmedResponse] || 'Ocio';
        progress.step++;
        break;

      case 'ask_companion':
        const companionMap = { '1': 'Solo', '2': 'Pareja', '3': 'Familia', '4': 'Amigos', '5': 'Grupo' };
        progress.data.companion = companionMap[trimmedResponse] || 'Solo';
        progress.step++;
        break;

      case 'ask_dietary':
        const dietaryMap = { '1': 'Ninguna', '2': 'Vegetariano', '3': 'Vegano', '4': 'Sin gluten', '5': 'Otra' };
        progress.data.dietary = dietaryMap[trimmedResponse] || 'Ninguna';
        progress.step++;
        break;

      case 'ask_interests':
        // Extraer intereses del mensaje
        const interests = [];
        if (trimmedResponse.toLowerCase().includes('nature') || trimmedResponse.toLowerCase().includes('naturaleza')) interests.push('nature');
        if (trimmedResponse.toLowerCase().includes('culture') || trimmedResponse.toLowerCase().includes('cultura')) interests.push('culture');
        if (trimmedResponse.toLowerCase().includes('adventure') || trimmedResponse.toLowerCase().includes('aventura')) interests.push('adventure');
        if (trimmedResponse.toLowerCase().includes('gastronomy') || trimmedResponse.toLowerCase().includes('gastronomía')) interests.push('gastronomy');
        if (trimmedResponse.toLowerCase().includes('wellness') || trimmedResponse.toLowerCase().includes('bienestar')) interests.push('wellness');
        if (trimmedResponse.toLowerCase().includes('shopping') || trimmedResponse.toLowerCase().includes('compras')) interests.push('shopping');
        
        progress.data.interests = interests.length > 0 ? interests : ['general'];
        progress.step++;
        break;

      case 'complete':
        // Onboarding completo
        return this.completeOnboarding(guest, progress.data);
    }

    // Retornar siguiente pregunta
    return this.getStepQuestion(guest);
  }

  /**
   * Marca onboarding como completado
   */
  static completeOnboarding(guest, profileData) {
    // Actualizar perfil del guest
    guest.name = profileData.name;
    guest.language = profileData.language;
    guest.trip_type = profileData.trip_type;
    guest.companion = profileData.companion;
    guest.dietary = profileData.dietary;
    guest.interests = profileData.interests;
    guest.onboarding_completed = true;

    // Limpiar progreso
    delete this.guestProgress[guest.id];

    return {
      message: `Perfect! Your profile is ready, ${profileData.name}! 🎉\n\nNow I can recommend personalized experiences for you.\n\nWhat would you like to explore?`,
      tokens: 0,
      isOnboarding: false,
      profileComplete: true
    };
  }

  /**
   * Verifica si un guest ha completado onboarding
   */
  static isOnboardingComplete(guest) {
    return guest.onboarding_completed === true;
  }

  /**
   * Obtiene el progreso del onboarding
   */
  static getProgress(guestId) {
    return this.guestProgress[guestId] || null;
  }
}

module.exports = OnboardingService;