const { Scenes, Markup } = require('telegraf');
const pool = require('../db/db');

// Створення сцени
const writeDeveloperScene = new Scenes.WizardScene(
  'write_owner',

  // Крок 1: Введення номеру телефону
  async (ctx) => {
    const keyboard = [
      [
        { text: 'Вийти в головне меню' },  // Кнопка для виходу
      ]
    ];
    // Виведення запиту для введення номеру телефону
    ctx.reply('Будь ласка, напишіть ваше повідомлення', {
      reply_markup: {
        keyboard: keyboard,
        one_time_keyboard: true,  // Клавіатура зникне після вибору
        resize_keyboard: true     // Автоматично змінює розмір клавіатури під екран
      }
    });




    // Перехід до наступного кроку
    ctx.wizard.next();
  },

  // Крок 2: Обробка номеру телефону
  async (ctx) => {
    const messageToOwner = ctx.message.text.trim();
 



    // Збереження номеру телефону в сесії
    ctx.session.userData = { messageToOwner };



    // Створення інлайн клавіатури з трьома кнопками
// Створення інлайн клавіатури з трьома кнопками в одному рядку
await ctx.reply(`Повідомлення: \n\n ${ctx.session.userData.messageToOwner}`, Markup.inlineKeyboard([
  [
    Markup.button.callback('Надіслати', 'save'),
    Markup.button.callback('Перезаписати', 'restart'),

  ]
  
]));

const keyboard = [
  [
    { text: 'Вийти в головне меню' },  // Кнопка для виходу
  ]
];
// Виведення запиту для введення номеру телефону
ctx.reply('Оберіть дію', {
  reply_markup: {
    keyboard: keyboard,
    one_time_keyboard: true,  // Клавіатура зникне після вибору
    resize_keyboard: true     // Автоматично змінює розмір клавіатури під екран
  }
});
    // Перехід до наступного кроку
    // ctx.wizard.next();
  },



);



// Обробник callback для кнопки "Зберегти"
writeDeveloperScene.action('save', async (ctx) => {
  const { messageToOwner } = ctx.session.userData;
  const tg_id = ctx.from.id
  ctx.answerCbQuery();

  if (messageToOwner  && tg_id) {
    try {
      // Ваш код для збереження в базі даних
      const result = await pool.query(
        'INSERT INTO comments_to_developer (comment, tg_id) VALUES ($1, $2) RETURNING *',
        [messageToOwner, tg_id]
      );

      // Підтвердження про успішне збереження
      ctx.reply(`Ваш коментар відправлений розробнику.Очікуйте на відповідь.`);

    } catch (err) {
      console.error('Error saving to PostgreSQL', err.stack);
      ctx.reply('Сталася помилка при збереженні. Спробуйте ще раз.');
    }
  } else {
    ctx.reply('Помилка: відсутні дані для збереження.');
  }

  // Покидаємо сцену
  const keyboard = [
    [
      { text: '✏️ Додати коментар' },  // Кнопка для додавання коментаря
      { text: '🔍 Пошук номеру' }   // Кнопка для пошуку номеру
    ],
    [
      { text: '💖 Підтримати проект' }  // Кнопка для підтримки проекту
    ]
  ];

  // Відправляємо повідомлення з клавіатурою, яка буде під полем вводу
  ctx.reply('Виберіть дію:', {
    reply_markup: {
      keyboard: keyboard,
      one_time_keyboard: true,  // Клавіатура зникне після вибору
      resize_keyboard: true     // Автоматично змінює розмір клавіатури під екран
    }
  });
  ctx.scene.leave();
});

// Обробник callback для кнопки "Почати знову"
writeDeveloperScene.action('restart', (ctx) => {
  ctx.answerCbQuery();

  // Очистимо дані сесії перед початком заново
  ctx.session.userData = {};  // Очистка сесії

  // Запитуємо номер телефону знову
  ctx.reply('Будь ласка, напишіть повідомлення ще раз:');
  
  // Повертаємося до першого кроку сцени
  ctx.wizard.selectStep(1)
});

writeDeveloperScene.command('start',(ctx) =>{
  ctx.scene.leave()
  const keyboard = [
    [
      { text: '✏️ Додати коментар' },  // Кнопка для додавання коментаря
      { text: '🔍 Пошук номеру' }   // Кнопка для пошуку номеру
    ],
    [
      { text: '💖 Підтримати проект' }  // Кнопка для підтримки проекту
    ]
  ];

  // Відправляємо повідомлення з клавіатурою, яка буде під полем вводу
  ctx.reply('Виберіть дію:', {
    reply_markup: {
      keyboard: keyboard,

      resize_keyboard: true     // Автоматично змінює розмір клавіатури під екран
    }
  });
})
writeDeveloperScene.hears('Вийти в головне меню',(ctx) =>{
  ctx.scene.leave()
  const keyboard = [
    [
      { text: '✏️ Додати коментар' },  // Кнопка для додавання коментаря
      { text: '🔍 Пошук номеру' }   // Кнопка для пошуку номеру
    ],
    [
      { text: '💖 Підтримати проект' }  // Кнопка для підтримки проекту
    ]
  ];

  // Відправляємо повідомлення з клавіатурою, яка буде під полем вводу
  ctx.reply('Виберіть дію:', {
    reply_markup: {
      keyboard: keyboard,

      resize_keyboard: true     // Автоматично змінює розмір клавіатури під екран
    }
  });
})
module.exports = writeDeveloperScene;
