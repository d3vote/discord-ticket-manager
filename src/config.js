import Discord from "discord.js";
const { ButtonStyle, TextInputStyle } = Discord;

export default {
  PREFIX: "!",
  TOKEN: "ODYzNTA4MjA4MDE0MTk2NzM2.G-p42Q.czFpld61IV7MMdZXv9hoveGRy9db50we6UJR80",
  ACTIVITY: { NAME: "", TYPE: "PLAYING" },
  GUILD_ID: "1096872981453615155",
  TICKET: {
    CHANNEL: "1103809953514406048",
    CATEGORY: "1103809776682541076",
    ARCHIVE_CATEGORY: "1103810258503217222",
    MESSAGE: "Хочешь к нам в семью - оставляй заявку!",
    STAFF_ROLES: ["1103697717689077870", "1102944270647828481", "1102944270647828481"],
    BUTTONS: [
      {
        STYLE: ButtonStyle.Success,
        LABEL: "Принять",
        EMOTE: "✅",
        ID: "successTicket",
        DISABLED: false,
      },
      {
        STYLE: ButtonStyle.Secondary,
        LABEL: "Архив",
        EMOTE: "🎫",
        ID: "archiveTicket",
        DISABLED: false,
      },
      {
        STYLE: ButtonStyle.Danger,
        LABEL: "Отклонить",
        EMOTE: "🎟️",
        ID: "deleteTicket",
        DISABLED: false,
      },
    ],
    QUESTIONS: [
      {
        ID: "name",
        LABEL: "О себе (Ваше Имя/Возраст/Игровой нейм)",
        STYLE: TextInputStyle.Short,
        MIN_LENGTH: 0,
        MAX_LENGTH: 100,
        PLACE_HOLDER: "",
        REQUIRED: true,
      },
      {
        ID: "online",
        LABEL: "Ваш онлайн",
        STYLE: TextInputStyle.Short,
        MIN_LENGTH: 0,
        MAX_LENGTH: 100,
        PLACE_HOLDER: "",
        REQUIRED: true,
      },
      {
        ID: "video",
        LABEL: "Откаты стрельбы на 5.56/7.62",
        STYLE: TextInputStyle.Short,
        MIN_LENGTH: 7,
        MAX_LENGTH: 1000,
        PLACE_HOLDER: "",
        REQUIRED: true,
      },
    ],
  },
};
