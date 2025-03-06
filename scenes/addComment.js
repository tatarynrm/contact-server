const { Scenes, Markup } = require('telegraf');
const pool = require('../db/db');

// Створення сцени
const addCommentScene = new Scenes.WizardScene(
  'add_comment',

  // Крок 1: Введення номеру телефону
  async (ctx) => {
    const keyboard = [
      [
        { text: 'Вийти в головне меню' },  // Кнопка для виходу
      ]
    ];
    // Виведення запиту для введення номеру телефону
    ctx.reply('Будь ласка, введіть номер телефону у форматі 0989578520:', {
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
    const phone = ctx.message.text.trim();
    console.log('Введений номер телефону:', phone);

    // Перевірка на правильний формат номера телефону
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
      ctx.reply('Невірний формат номеру телефону. Спробуйте ще раз.');
      return;
    }

    // Збереження номеру телефону в сесії
    ctx.session.userData = { phone };

    // Запит на введення коментаря
    ctx.reply('Тепер введіть ваш коментар:', {
      reply_markup: {
        remove_keyboard: true, // Відключити клавіатуру після введення номеру телефону
      }
    });


    // Перехід до наступного кроку
    ctx.wizard.next();
  },

  // Крок 3: Обробка коментаря
  async (ctx) => {
    const comment = ctx.message.text.trim();

    // Зберігаємо коментар в сесії
    ctx.session.userData.comment = comment;

    // Створення інлайн клавіатури з трьома кнопками
// Створення інлайн клавіатури з трьома кнопками в одному рядку
await ctx.reply(`Результат: \n\n Номер телефону: ${ctx.session.userData.phone} \n\nКоментар: ${ctx.session.userData.comment} `, Markup.inlineKeyboard([
  [
    Markup.button.callback('Зберегти', 'save'),
    Markup.button.callback('Почати знову', 'restart'),

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
  }
);



// Обробник callback для кнопки "Зберегти"
addCommentScene.action('save', async (ctx) => {
  const { phone, comment } = ctx.session.userData;
  const tg_id = ctx.from.id
  ctx.answerCbQuery();

  if (phone && comment) {
    try {
      // Ваш код для збереження в базі даних
      const result = await pool.query(
        'INSERT INTO phone_comments (phone, comment,comment_owner) VALUES ($1, $2,$3) RETURNING *',
        [phone, comment,tg_id]
      );

      // Підтвердження про успішне збереження
      ctx.reply(`Ваш коментар: "${comment}" з номером: ${phone} збережено в базі даних.`);

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
addCommentScene.action('restart', (ctx) => {
  ctx.answerCbQuery();

  // Очистимо дані сесії перед початком заново
  ctx.session.userData = {};  // Очистка сесії

  // Запитуємо номер телефону знову
  ctx.reply('Будь ласка, введіть номер телефону ще раз:');
  
  // Повертаємося до першого кроку сцени
  ctx.wizard.selectStep(1)
});

addCommentScene.command('start',(ctx) =>{
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
addCommentScene.hears('Вийти в головне меню',(ctx) =>{
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
module.exports = addCommentScene;
