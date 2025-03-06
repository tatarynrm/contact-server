const keyboard = [
    [
      { text: '✏️ Додати коментар' },  // Кнопка для додавання коментаря
      { text: '🔍 Пошук номеру' }   // Кнопка для пошуку номеру
    ],
    [
      { text: '💖 Підтримати проект' }  // Кнопка для підтримки проекту
    ]
  ];

  const createMainMenuKeyboard = (ctx)=>{
  // Відправляємо повідомлення з клавіатурою, яка буде під полем вводу
  ctx.reply('Виберіть дію:', {
    reply_markup: {
      keyboard: keyboard,
      one_time_keyboard: true,  // Клавіатура зникне після вибору
      resize_keyboard: true     // Автоматично змінює розмір клавіатури під екран
    }
  });
  }

  module.exports = createMainMenuKeyboard;
