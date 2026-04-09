class OnboardingService {
  // Pasos del onboarding
  static steps = [
    'ask_language',
    'ask_name',
    'confirm_name',
    'ask_room_number',
    'confirm_room_number',
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
        language: null,
        name: null,
        room_number: null,
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
      ask_language: {
        EN: `Welcome to The Plaza Hotel! 🏨\n\nWhich language do you prefer?\n1️⃣ English\n2️⃣ Español`,
        ES: `¡Bienvenido a The Plaza Hotel! 🏨\n\n¿Qué idioma prefieres?\n1️⃣ English\n2️⃣ Español`
      },
      ask_name: {
        EN: `Nice to meet you! 👋\n\nWhat is your name?`,
        ES: `¡Mucho gusto! 👋\n\n¿Cuál es tu nombre?`
      },
      confirm_name: {
        EN: `Just to confirm, your name is: {name}\n\nIs this correct?\n1️⃣ Yes\n2️⃣ No, let me correct it`,
        ES: `Solo para confirmar, tu nombre es: {name}\n\n¿Es correcto?\n1️⃣ Sí\n2️⃣ No, déjame corregirlo`
      },
      ask_room_number: {
        EN: `Perfect! 👍\n\nWhich room are you staying in? (101-110)`,
        ES: `¡Perfecto! 👍\n\n¿En qué habitación estás? (101-110)`
      },
      confirm_room_number: {
        EN: `Just to confirm, your room number is: {room}\n\nIs this correct?\n1️⃣ Yes\n2️⃣ No, let me correct it`,
        ES: `Solo para confirmar, tu habitación es: {room}\n\n¿Es correcto?\n1️⃣ Sí\n2️⃣ No, déjame corregirlo`
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
        EN: `Perfect, {name}! 🎉\n\nYour profile is complete. Room: {room}\n\nHow can I help you today?`,
        ES: `¡Perfecto, {name}! 🎉\n\nTu perfil está completo. Habitación: {room}\n\n¿Cómo puedo ayudarte hoy?`
      }
    };

    let question;
    if (currentStep === 'ask_language') {
      question = questions[currentStep][guest.language] || questions[currentStep]['EN'];
    } else {
      question = questions[currentStep][guest.language] || questions[currentStep]['EN'];
      question = question.replace('{name}', progress.data.name || 'Guest');
      question = question.replace('{room}', progress.data.room_number || 'N/A');
    }

    return {
      message: question,
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
    const trimmedResponse = response.trim().toLowerCase();

    // Procesar respuesta según el paso
    switch (currentStep) {
      case 'ask_language':
        const langMap = { '1': 'EN', '2': 'ES', 'english': 'EN', 'español': 'ES', 'es': 'ES', 'en': 'EN' };
        const selectedLang = langMap[trimmedResponse];
        
        if (!selectedLang) {
          const invalidLangMessage = {
            EN: `Please select a valid option:\n1️⃣ English\n2️⃣ Español`,
            ES: `Por favor selecciona una opción válida:\n1️⃣ English\n2️⃣ Español`
          };
          return {
            message: invalidLangMessage[guest.language] || invalidLangMessage['EN'],
            tokens: 0,
            isOnboarding: true,
            step: currentStep
          };
        }
        
        progress.data.language = selectedLang;
        guest.language = selectedLang;
        progress.step++;
        break;

      case 'ask_name':
        progress.data.name = response.trim();
        progress.step++;
        break;

      case 'confirm_name':
        if (trimmedResponse === '1' || trimmedResponse === 'yes' || trimmedResponse === 'sí' || trimmedResponse === 'si') {
          // Nombre confirmado
          progress.step++;
        } else if (trimmedResponse === '2' || trimmedResponse === 'no') {
          // Volver a pedir nombre
          progress.step = 1; // Volver a ask_name
          return this.getStepQuestion(guest);
        } else {
          const invalidConfirmMessage = {
            EN: `Please select a valid option:\n1️⃣ Yes\n2️⃣ No, let me correct it`,
            ES: `Por favor selecciona una opción válida:\n1️⃣ Sí\n2️⃣ No, déjame corregirlo`
          };
          return {
            message: invalidConfirmMessage[guest.language] || invalidConfirmMessage['EN'],
            tokens: 0,
            isOnboarding: true,
            step: currentStep
          };
        }
        break;

      case 'ask_room_number':
        const roomNum = trimmedResponse;
        const roomRegex = /^(10[1-9]|110)$/;
        
        if (!roomRegex.test(roomNum)) {
          const invalidRoomMessage = {
            EN: `Please enter a valid room number (101-110)`,
            ES: `Por favor ingresa un número de habitación válido (101-110)`
          };
          return {
            message: invalidRoomMessage[guest.language] || invalidRoomMessage['EN'],
            tokens: 0,
            isOnboarding: true,
            step: currentStep
          };
        }
        
        progress.data.room_number = roomNum;
        progress.step++;
        break;

      case 'confirm_room_number':
        if (trimmedResponse === '1' || trimmedResponse === 'yes' || trimmedResponse === 'sí' || trimmedResponse === 'si') {
          // Habitación confirmada
          progress.step++;
        } else if (trimmedResponse === '2' || trimmedResponse === 'no') {
          // Volver a pedir habitación
          progress.step = 3; // Volver a ask_room_number
          return this.getStepQuestion(guest);
        } else {
          const invalidConfirmMessage = {
            EN: `Please select a valid option:\n1️⃣ Yes\n2️⃣ No, let me correct it`,
            ES: `Por favor selecciona una opción válida:\n1️⃣ Sí\n2️⃣ No, déjame corregirlo`
          };
          return {
            message: invalidConfirmMessage[guest.language] || invalidConfirmMessage['EN'],
            tokens: 0,
            isOnboarding: true,
            step: currentStep
          };
        }
        break;

      case 'ask_trip_type':
        const tripMap = { '1': 'Negocios', '2': 'Ocio', '3': 'Familia', '4': 'Aventura' };
        const selectedTrip = tripMap[trimmedResponse];
        
        if (!selectedTrip) {
          const invalidTripMessage = {
            EN: `Please select a valid option:\n1️⃣ Business\n2️⃣ Leisure/Vacation\n3️⃣ Family\n4️⃣ Adventure`,
            ES: `Por favor selecciona una opción válida:\n1️⃣ Negocios\n2️⃣ Ocio/Vacaciones\n3️⃣ Familia\n4️⃣ Aventura`
          };
          return {
            message: invalidTripMessage[guest.language] || invalidTripMessage['EN'],
            tokens: 0,
            isOnboarding: true,
            step: currentStep
          };
        }
        
        progress.data.trip_type = selectedTrip;
        progress.step++;
        break;

      case 'ask_companion':
        const companionMap = { '1': 'Solo', '2': 'Pareja', '3': 'Familia', '4': 'Amigos', '5': 'Grupo' };
        const selectedCompanion = companionMap[trimmedResponse];
        
        if (!selectedCompanion) {
          const invalidCompanionMessage = {
            EN: `Please select a valid option:\n1️⃣ Solo\n2️⃣ Partner/Spouse\n3️⃣ Family\n4️⃣ Friends\n5️⃣ Group`,
            ES: `Por favor selecciona una opción válida:\n1️⃣ Solo\n2️⃣ Pareja\n3️⃣ Familia\n4️⃣ Amigos\n5️⃣ Grupo`
          };
          return {
            message: invalidCompanionMessage[guest.language] || invalidCompanionMessage['EN'],
            tokens: 0,
            isOnboarding: true,
            step: currentStep
          };
        }
        
        progress.data.companion = selectedCompanion;
        progress.step++;
        break;

      case 'ask_dietary':
        const dietaryMap = { '1': 'Ninguna', '2': 'Vegetariano', '3': 'Vegano', '4': 'Sin gluten', '5': 'Otra' };
        const selectedDietary = dietaryMap[trimmedResponse];
        
        if (!selectedDietary) {
          const invalidDietaryMessage = {
            EN: `Please select a valid option:\n1️⃣ None\n2️⃣ Vegetarian\n3️⃣ Vegan\n4️⃣ Gluten-free\n5️⃣ Other`,
            ES: `Por favor selecciona una opción válida:\n1️⃣ Ninguna\n2️⃣ Vegetariano\n3️⃣ Vegano\n4️⃣ Sin gluten\n5️⃣ Otra`
          };
          return {
            message: invalidDietaryMessage[guest.language] || invalidDietaryMessage['EN'],
            tokens: 0,
            isOnboarding: true,
            step: currentStep
          };
        }
        
        progress.data.dietary = selectedDietary;
        progress.step++;
        break;

      case 'ask_interests':
        const interests = [];
        if (trimmedResponse.includes('nature') || trimmedResponse.includes('naturaleza') || trimmedResponse.includes('🏞️')) interests.push('nature');
        if (trimmedResponse.includes('culture') || trimmedResponse.includes('cultura') || trimmedResponse.includes('🎭')) interests.push('culture');
        if (trimmedResponse.includes('adventure') || trimmedResponse.includes('aventura') || trimmedResponse.includes('⛰️')) interests.push('adventure');
        if (trimmedResponse.includes('gastronomy') || trimmedResponse.includes('gastronomía') || trimmedResponse.includes('🍽️')) interests.push('gastronomy');
        if (trimmedResponse.includes('wellness') || trimmedResponse.includes('bienestar') || trimmedResponse.includes('🏥')) interests.push('wellness');
        if (trimmedResponse.includes('shopping') || trimmedResponse.includes('compras') || trimmedResponse.includes('🛍️')) interests.push('shopping');
        
        progress.data.interests = interests.length > 0 ? interests : ['general'];
        progress.step++;
        break;

      case 'complete':
        return this.completeOnboarding(guest, progress.data);
    }

    // Retornar siguiente pregunta
    return this.getStepQuestion(guest);
  }

  /**
   * Marca onboarding como completado
   */
  static completeOnboarding(guest, profileData) {
    guest.name = profileData.name;
    guest.language = profileData.language;
    guest.room_number = profileData.room_number;
    guest.trip_type = profileData.trip_type;
    guest.companion = profileData.companion;
    guest.dietary = profileData.dietary;
    guest.interests = profileData.interests;
    guest.onboarding_completed = true;

    delete this.guestProgress[guest.id];

    const message = guest.language === 'ES' 
      ? `¡Perfecto, ${profileData.name}! 🎉\n\nTu perfil está completo. Habitación: ${profileData.room_number}\n\n¿Cómo puedo ayudarte hoy?`
      : `Perfect, ${profileData.name}! 🎉\n\nYour profile is complete. Room: ${profileData.room_number}\n\nHow can I help you today?`;

    return {
      message: message,
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