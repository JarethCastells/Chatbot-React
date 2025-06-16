
const chatbotDataset = [
  {
    question: 'hola',
    responses: ['¡Hola! ¿Cómo estás?', '¡Bienvenido! ¿En qué puedo ayudarte?']
  },
  {
    question: 'adiós',
    responses: ['¡Hasta luego!', 'Que tengas un buen día', 'Fue un placer ayudarte']
  },
  {
    question: 'gracias',
    responses: ['De nada', '¡Es un placer!', 'No hay de qué']
  },
  {
    question: 'qué puedes hacer',
    responses: [
      'Puedo responder tus preguntas',
      'Puedo darte información básica',
      'Estoy aquí para conversar contigo'
    ]
  },
  {
    question: 'default',
    responses: [
      'No entendí tu pregunta. ¿Podrías reformularla?',
      'Disculpa, no tengo una respuesta para eso',
      '¿Te importaría preguntarme algo diferente?'
    ]
  }
];

export default chatbotDataset;