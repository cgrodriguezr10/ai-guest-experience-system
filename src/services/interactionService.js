class InteractionService {
  static interactions = [];
  static interactionCounter = 0;

  static saveInteraction(data) {
    this.interactionCounter++;
    const interaction = {
      id: this.interactionCounter,
      guest_id: data.guest_id,
      incoming_message: data.incoming_message,
      outgoing_message: data.outgoing_message,
      message_type: data.message_type || 'user_question',
      sentiment: data.sentiment || 'neutral',
      tokens_used: data.tokens_used || 0,
      created_at: new Date()
    };
    this.interactions.push(interaction);
    console.log(`📝 Interaction saved: ${interaction.id}`);
    return interaction;
  }

  static getInteractionsByGuest(guest_id) {
    return this.interactions.filter(i => i.guest_id === guest_id);
  }

  static getAllInteractions() {
    return this.interactions;
  }

  static getInteractionById(id) {
    return this.interactions.find(i => i.id === id) || null;
  }
}

module.exports = InteractionService;