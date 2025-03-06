const { Scenes, Markup } = require("telegraf");
const pool = require("../db/db"); // Імпортуємо пул з'єднань
const moment = require('./../helpers/Date/momentConfig')
// Об'єкт для зберігання даних користувачів
const userData = {}; // Мапа, де ключем буде user ID, а значенням об'єкт з даними
const isPremiumUser = false; // Замінити на перевірку чи є користувач преміум, наприклад, з бази даних
// Створення Wizard-сцени
const searchNumberScene = new Scenes.WizardScene(
  "search_number", // Ім'я сцени
  async (ctx) => {
    // Етап 1: Запитуємо номер телефону для пошуку
    const keyboard = [
      [
        { text: 'Вийти в головне меню' },  // Кнопка для виходу
      ]
    ];
    await ctx.reply("Введіть номер для пошуку:\nУ форматі 0998887766", {
      reply_markup: {
        keyboard: keyboard,
        one_time_keyboard: true,  // Клавіатура зникне після вибору
        resize_keyboard: true     // Автоматично змінює розмір клавіатури під екран
      }
    });

    return ctx.wizard.next(); // Переходимо до наступного етапу
  },
  async (ctx) => {
    // Етап 2: Обробка введеного номеру
    const number = ctx.message.text.trim();

    // Перевірка на правильний формат номеру телефону
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(number)) {
      return ctx.reply("Невірний формат номеру телефону. Спробуйте ще раз.");
    }

    // Зберігаємо номер телефону в об'єкті користувача
    const userId = ctx.from.id; // Унікальний ID користувача
    userData[userId] = { phoneNumber: number, page: 1 };  // Зберігаємо номер і початкову сторінку для цього користувача

    try {
      // Логіка для пошуку номера в базі даних через пул
      const result = await pool.query(
        "SELECT * FROM phone_comments WHERE phone = $1",
        [number]
      );

      if (result.rows.length > 0) {
        await ctx.reply(`Знайдено ${result.rows.length} коментарі до номеру "${number}"`, {
          reply_markup: {
            keyboard: [[{ text: "👁️ коментарі" }, { text: "Вийти в головне меню" }]],
            resize_keyboard: true,
          },
        });
      } else {
        ctx.reply(`Цей номер поки що не має коментарів.\nБудьте першим, хто поділиться своєю думкою! 😊`, {
          reply_markup: {
            keyboard: [[{ text: "✏️ Додати коментар" }, { text: "Вийти в головне меню" }]],
            resize_keyboard: true,
          },
        });
      }
    } catch (err) {
      console.error("Помилка при запиті до бази даних:", err);
      await ctx.reply("Сталася помилка при пошуку. Спробуйте ще раз пізніше.");
    }

    return ctx.wizard.next(); // Переходимо до наступного етапу
  },
  async (ctx) => {
    // Етап 3: Обробка натискання кнопок
    const messageText = ctx.message.text;

    if (messageText === '👁️ коментарі') {
      // Отримуємо збережений номер телефону та сторінку з об'єкта
      const userId = ctx.from.id;
      const number = userData[userId]?.phoneNumber;
      let page = userData[userId]?.page || 1;

      if (!number) {
        return ctx.reply("Будь ласка, спочатку введіть номер для пошуку.");
      }

      // Перевіряємо, чи є користувач преміум
   

      // Отримуємо список коментарів з пагінацією
      const pageSize = 5;  // Кількість коментарів на одній сторінці

      const fetchComments = async (page) => {
        const offset = (page - 1) * pageSize;
        try {
          const result = await pool.query(
            "SELECT * FROM phone_comments WHERE phone = $1 LIMIT $2 OFFSET $3",
            [number, pageSize, offset]
          );


          const comments = result.rows.map(comment => {
            const commentDate = moment(comment.created_at).format('LLL') // Форматуємо дату
            const author = isPremiumUser ? comment.comment_owner === undefined ? "Premium******" :"Roman" : "Необхідно отримати Premium"; // Якщо преміум користувач, показуємо автора, інакше зірочки
            console.log(author);
            return `Написано : ${commentDate}\n\n${comment.comment}\n\n\nАвтор: ${author}`;
          }).join("\n\n___________\n\n"); // Розділяємо коментарі підкресленням

          // Показуємо коментарі
          await ctx.reply(comments || "Немає коментарів для цього номера.");
          
          // Виводимо кнопки для навігації по пагінації
          const keyboard = [
            [
              { text: "Наступні коментарі" },
              { text: "Вийти в головне меню" }
            ]
          ];

          await ctx.reply("+", {
            reply_markup: {
              keyboard: keyboard,
              resize_keyboard: true,
            },
          });

          // Оновлюємо поточну сторінку
          userData[userId].page = page;
        } catch (err) {
          console.error("Помилка при запиті до бази даних:", err);
          await ctx.reply("Сталася помилка при завантаженні коментарів.");
        }
      };

      await fetchComments(page);  // Завантажуємо коментарі для поточної сторінки

    } else if (messageText === 'Вийти в головне меню') {
      ctx.scene.leave();
      const keyboard = [
        [
          { text: '✏️ Додати коментар' },
          { text: '🔍 Пошук номеру' }
        ],
        [
          { text: '💖 Підтримати проект' }
        ]
      ];

      await ctx.reply('Виберіть дію:', {
        reply_markup: {
          keyboard: keyboard,
          resize_keyboard: true
        }
      });
    }else if (messageText === '✏️ Додати коментар') {
      ctx.scene.leave();
      ctx.scene.enter('add_comment')
    }

    // Обробка натискання кнопки "Наступні коментарі"
    if (messageText === "Наступні коментарі") {
      // Отримуємо поточну сторінку і збільшуємо її
      const userId = ctx.from.id;
      let page = userData[userId]?.page || 1;
      page++;

      // Отримуємо збережений номер телефону з об'єкта
      const number = userData[userId]?.phoneNumber;

      if (!number) {
        return ctx.reply("Будь ласка, спочатку введіть номер для пошуку.");
      }

      // Отримуємо наступні коментарі з бази даних
      const pageSize = 5;  // Кількість коментарів на одній сторінці

      const fetchComments = async (page) => {
        const offset = (page - 1) * pageSize;
        try {
          const result = await pool.query(
            "SELECT * FROM phone_comments  WHERE phone = $1 LIMIT $2 OFFSET $3",
            [number, pageSize, offset]
          );

          const comments = result.rows.map(comment => {
            const commentDate = new Date(comment.created_at).toLocaleString(); // Форматуємо дату
            const author = isPremiumUser ? comment.comment_owner === undefined ? "Premium******" :"Roman" : "Необхідно отримати Premium"; // Якщо преміум користувач, показуємо автора, інакше зірочки

            return `${commentDate}\nАвтор: ${author}\n\n${comment.comment}`;
          }).join("\n\n___________\n\n"); // Розділяємо коментарі підкресленням

          // Показуємо коментарі
          await ctx.reply(comments || "Це усі коментарі до цього номеру телефону");
          
          // Виводимо кнопки для навігації по пагінації
          const keyboard = [
            [
              { text: "Наступні коментарі" },
              { text: "Вийти в головне меню" }
            ]
          ];

          await ctx.reply(`${result.rows.length <= 0 ? '😒' : '😊'}`, {
            reply_markup: {
              keyboard: keyboard,
              resize_keyboard: true,
            },
          });

          // Оновлюємо поточну сторінку
          userData[userId].page = page;
        } catch (err) {
          console.error("Помилка при запиті до бази даних:", err);
          await ctx.reply("Сталася помилка при завантаженні коментарів.");
        }
      };

      await fetchComments(page);  // Завантажуємо наступні коментарі

    }
  }
);

searchNumberScene.command('start',async (ctx) =>{
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
searchNumberScene.hears('Вийти в головне меню',async (ctx) =>{
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
module.exports = searchNumberScene;
